# -*- coding: utf-8 -*-
"""Install or check the review kit in a project. The kit is the same in every project:
the files are copied byte for byte from this folder and never edited in a project.

  python install.py --mockups docs/design/mockups --round 2026-12-01-billing     install / update
  python install.py --mockups docs/design/mockups --where docs/qa/runs --round 2026-12-20-r2-qa
                                                                                 the round lives elsewhere (a QA run)
  python install.py --mockups docs/design/mockups [--where docs/qa/runs] --check report drift, exit 1 if any

Install copies  comment.js, review_server.py, VERSION  ->  <mockups>/_review/
                cases.html                             ->  <mockups>/<round>/cases.html
and writes a starter <round>/cases/manifest.json when there is none.

Check compares every installed copy (all rounds that have a cases.html) with this folder, and lists
pages the checklist links to that do not load the comment tool. What may differ per project is data only:
cases/manifest.json, cases/base.json, cases/<part>.json, and the page's own :root colour tokens.
"""
import argparse
import hashlib
import io
import json
import os
import re
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SHARED = ('comment.js', 'review_server.py', 'VERSION')
TAG = re.compile(r'<script[^>]+src="\.\./_review/comment\.js"')


def sha(path):
    with open(path, 'rb') as f:
        return hashlib.sha256(f.read().replace(b'\r\n', b'\n')).hexdigest()


def version():
    return io.open(os.path.join(HERE, 'VERSION'), encoding='utf-8').read().strip()


def rounds(mockups):
    for name in sorted(os.listdir(mockups)):
        d = os.path.join(mockups, name)
        if os.path.isdir(d) and not name.startswith(('_', '.')) and os.path.isfile(os.path.join(d, 'cases.html')):
            yield name, d


def pages(folder):
    """The pages the checklist links to (cases/*.json rows) - those must carry the comment tool."""
    out = set()
    cdir = os.path.join(folder, 'cases')
    for name in sorted(os.listdir(cdir)) if os.path.isdir(cdir) else []:
        if not name.endswith('.json') or name == 'manifest.json':
            continue
        try:
            rows = json.load(io.open(os.path.join(cdir, name), encoding='utf-8'))
        except ValueError:
            continue
        for row in rows if isinstance(rows, list) else []:
            for link in (row.get('links') or []) if isinstance(row, dict) else []:
                page = re.split(r'[?#]', str(link.get('href', '')))[0]
                if page.endswith('.html') and os.path.isfile(os.path.join(folder, page)):
                    out.add(page)
    return sorted(out)


def install(mockups, rnd, where=None):
    dst = os.path.join(mockups, '_review')
    os.makedirs(dst, exist_ok=True)
    for f in SHARED:
        shutil.copyfile(os.path.join(HERE, f), os.path.join(dst, f))
    folder = os.path.join(where or mockups, rnd)
    os.makedirs(os.path.join(folder, 'cases'), exist_ok=True)
    shutil.copyfile(os.path.join(HERE, 'cases.html'), os.path.join(folder, 'cases.html'))
    man = os.path.join(folder, 'cases', 'manifest.json')
    if not os.path.exists(man):
        with io.open(man, 'w', encoding='utf-8', newline='\n') as f:
            json.dump({'title': 'รายการตรวจ', 'storageKey': rnd + '.cases', 'base': 'base.json', 'parts': [], 'links': []},
                      f, ensure_ascii=False, indent=1)
    print('review kit %s installed: %s/_review + %s/cases.html' % (version(), mockups, folder.replace(os.sep, '/')))


def check(mockups, where=None):
    bad = []
    for f in SHARED:
        p = os.path.join(mockups, '_review', f)
        if not os.path.isfile(p):
            bad.append('missing   _review/' + f)
        elif sha(p) != sha(os.path.join(HERE, f)):
            bad.append('differs   _review/' + f)
    n = 0
    for name, folder in list(rounds(mockups)) + (list(rounds(where)) if where and os.path.isdir(where) else []):
        n += 1
        if sha(os.path.join(folder, 'cases.html')) != sha(os.path.join(HERE, 'cases.html')):
            bad.append('differs   %s/cases.html' % name)
        if not os.path.isfile(os.path.join(folder, 'cases', 'manifest.json')):
            bad.append('missing   %s/cases/manifest.json' % name)
        for pg in pages(folder):
            if not TAG.search(io.open(os.path.join(folder, pg), encoding='utf-8', errors='replace').read()):
                bad.append('no comment tool   %s/%s' % (name, pg))
    for b in bad:
        print(b)
    print('review kit %s · rounds with a checklist: %d · problems: %d' % (version(), n, len(bad)))
    return 1 if bad else 0


def main():
    ap = argparse.ArgumentParser(description='Install or check the review kit (same files in every project).')
    ap.add_argument('--mockups', default='docs/design/mockups')
    ap.add_argument('--round', help='round folder name (install)')
    ap.add_argument('--where', help='folder that holds the round when it is not under --mockups, e.g. docs/qa/runs')
    ap.add_argument('--check', action='store_true')
    a = ap.parse_args()
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass
    if not os.path.isdir(a.mockups):
        sys.exit('no such folder: ' + a.mockups)
    if a.check:
        sys.exit(check(a.mockups, a.where))
    if not a.round or not re.match(r'^[A-Za-z0-9][A-Za-z0-9._-]*$', a.round):
        sys.exit('--round <folder name> is required to install')
    install(a.mockups, a.round, a.where)


if __name__ == '__main__':
    main()
