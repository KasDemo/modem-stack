# -*- coding: utf-8 -*-
"""Mockup review server: static files + an inbox the review pages write to.

  py review_server.py --root docs/design/mockups [--root docs/qa/runs] --port 8766

Several --root folders are served as one site: /<round>/... comes from the first root that has that
round folder (design rounds and QA runs side by side); /_review/ comes from the first root.

  GET  /__review/<round>   -> the round's inbox as JSON
  POST /__review/<round>   -> body {"kind": "comments" | "cases", "data": ...}
                              stored in <root>/<round>/review/inbox.json

The inbox file is what the agent reads: the owner's comments on the mockup pages
(kind "comments", from comment.js) and the pass / fix verdicts of the checklist page
(kind "cases", from cases.html). The agent may add "status" and "reply" to a comment in
the file; a later POST from the browser keeps them.

Binds to 127.0.0.1 only. Stdlib only.
"""
import argparse
import datetime
import json
import os
import re
import sys
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROUND_RE = re.compile(r'^/__review/([A-Za-z0-9][A-Za-z0-9._-]{0,80})/?$')
LOCAL_ORIGIN = re.compile(r'^https?://(127\.0\.0\.1|localhost)(:\d+)?$')
KINDS = ('comments', 'cases')
MAX_BODY = 2 * 1024 * 1024
LOCK = threading.Lock()


class Handler(SimpleHTTPRequestHandler):
    root = '.'
    roots = ['.']

    def translate_path(self, path):
        first = path.split('?', 1)[0].split('#', 1)[0].lstrip('/').split('/', 1)[0]
        base = self.roots[0]
        for r in self.roots:
            if first and os.path.exists(os.path.join(r, first)):
                base = r
                break
        self.directory = base
        return super().translate_path(path)

    def log_message(self, fmt, *args):  # keep the console quiet; errors still print
        if args and str(args[1] if len(args) > 1 else '').startswith(('4', '5')):
            sys.stderr.write('%s %s\n' % (self.address_string(), fmt % args))

    def end_headers(self):
        origin = self.headers.get('Origin') or ''
        if LOCAL_ORIGIN.match(origin):
            self.send_header('Access-Control-Allow-Origin', origin)
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.send_header('Vary', 'Origin')
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def _inbox_path(self):
        m = ROUND_RE.match(self.path.split('?', 1)[0])
        if not m:
            return None, None
        rnd = m.group(1)
        folder = next((os.path.join(r, rnd) for r in self.roots if os.path.isdir(os.path.join(r, rnd))), None)
        if rnd.startswith(('.', '_')) or not folder:
            return rnd, None
        return rnd, os.path.join(folder, 'review', 'inbox.json')

    def _read(self, path, rnd):
        try:
            with open(path, encoding='utf-8') as f:
                box = json.load(f)
        except (OSError, ValueError):
            box = {}
        box.setdefault('round', rnd)
        box.setdefault('comments', [])
        box.setdefault('cases', {})
        return box

    def _json(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Content-Length', '0')
        self.end_headers()

    def do_GET(self):
        rnd, path = self._inbox_path()
        if rnd is None:
            return super().do_GET()
        if path is None:
            return self._json(404, {'error': 'no such round'})
        with LOCK:
            box = self._read(path, rnd)
        box['review'] = 1
        self._json(200, box)

    def do_POST(self):
        rnd, path = self._inbox_path()
        if rnd is None or path is None:
            return self._json(404, {'error': 'no such round'})
        try:
            n = int(self.headers.get('Content-Length') or 0)
            if n <= 0 or n > MAX_BODY:
                return self._json(413, {'error': 'body size'})
            msg = json.loads(self.rfile.read(n).decode('utf-8'))
            kind, data = msg['kind'], msg['data']
            if kind not in KINDS:
                raise ValueError(kind)
            if kind == 'comments' and not isinstance(data, list):
                raise ValueError('comments must be a list')
            if kind == 'cases' and not isinstance(data, dict):
                raise ValueError('cases must be an object')
        except (ValueError, KeyError, TypeError) as e:
            return self._json(400, {'error': 'bad body: %s' % e})
        with LOCK:
            box = self._read(path, rnd)
            if kind == 'comments':
                # what the agent wrote on a comment survives a browser that has not seen it yet
                kept = {c.get('id'): c for c in box['comments'] if isinstance(c, dict)}
                for c in data:
                    old = kept.get(c.get('id')) if isinstance(c, dict) else None
                    if old:
                        for k in ('status', 'reply'):
                            if k in old and k not in c:
                                c[k] = old[k]
            box[kind] = data
            box['updated'] = datetime.datetime.now().isoformat(timespec='seconds')
            box.pop('review', None)
            os.makedirs(os.path.dirname(path), exist_ok=True)
            tmp = path + '.tmp'
            with open(tmp, 'w', encoding='utf-8', newline='\n') as f:
                json.dump(box, f, ensure_ascii=False, indent=1)
            os.replace(tmp, path)
        box['review'] = 1
        self._json(200, box)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--root', action='append', help='folder that holds one sub-folder per round; repeat for more (default docs/design/mockups)')
    ap.add_argument('--port', type=int, default=8766)
    a = ap.parse_args()
    roots = [os.path.abspath(r) for r in (a.root or ['docs/design/mockups'])]
    for r in roots:
        if not os.path.isdir(r):
            sys.exit('no such folder: ' + r)
    root = roots[0]
    Handler.root = root
    Handler.roots = roots
    handler = lambda *x, **k: Handler(*x, directory=root, **k)  # noqa: E731
    srv = ThreadingHTTPServer(('127.0.0.1', a.port), handler)
    print('review server: http://127.0.0.1:%d/  roots=%s' % (a.port, ' | '.join(roots)), flush=True)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == '__main__':
    main()
