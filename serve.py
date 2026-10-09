import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Timer
import webbrowser

parser = argparse.ArgumentParser(description='Local interactive gallery')
parser.add_argument('--port', type=int, default=8780)
parser.add_argument('--no-browser', action='store_true')
args = parser.parse_args()
root = Path(__file__).resolve().parent
handler = partial(SimpleHTTPRequestHandler, directory=str(root))
server = None
for port in range(args.port, min(args.port + 20, 65536)):
    try:
        server = ThreadingHTTPServer(('127.0.0.1', port), handler)
        break
    except OSError:
        continue
if server is None:
    raise SystemExit('No available local port. Use --port to specify another port.')
url = f'http://127.0.0.1:{server.server_port}/rack.html'
print(f'Gallery: {url}\nPress Ctrl+C to stop.', flush=True)
if not args.no_browser:
    Timer(0.6, lambda: webbrowser.open(url)).start()
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()
