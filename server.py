"""
Marvel Universe Archive - Local Development Server
Provides clean MIME type handling, UTF-8 encoding, and CORS headers.
"""

import http.server
import socketserver
import os
import sys

PORT = 8000

class MarvelArchiveHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and caching headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def guess_type(self, path):
        # Ensure proper MIME types
        if path.endswith('.json'):
            return 'application/json; charset=utf-8'
        if path.endswith('.js'):
            return 'application/javascript; charset=utf-8'
        if path.endswith('.css'):
            return 'text/css; charset=utf-8'
        if path.endswith('.glb'):
            return 'model/gltf-binary'
        if path.endswith('.gltf'):
            return 'model/gltf+json'
        if path.endswith('.svg'):
            return 'image/svg+xml'
        return super().guess_type(path)

def run_server(port=PORT):
    # Change cwd to directory of this script
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    handler = MarvelArchiveHTTPRequestHandler
    
    # Try port, fallback to next port if in use
    for p in range(port, port + 10):
        try:
            with socketserver.TCPServer(("", p), handler) as httpd:
                print(f"[MARVEL ARCHIVE SERVER] Serving at http://127.0.0.1:{p}/")
                print(f"[MARVEL ARCHIVE SERVER] Press Ctrl+C to stop.")
                sys.stdout.flush()
                httpd.serve_forever()
                break
        except OSError:
            print(f"[PORT WARNING] Port {p} in use, trying {p + 1}...")
            continue

if __name__ == '__main__':
    run_server()
