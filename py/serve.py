import argparse
import http.server
import mimetypes
import socketserver
import sys

DEFAULT_PORT = 8000

mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("text/css", ".css")

class ResilientTCPServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True

    def handle_error(self, request, client_address):
        exc_type, exc, _ = sys.exc_info()
        if exc_type in (BrokenPipeError, ConnectionResetError):
            return
        super().handle_error(request, client_address)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Static file server")
    parser.add_argument(
        "--port",
        type=int,
        default=DEFAULT_PORT,
        help=f"Port to serve on (default: {DEFAULT_PORT})",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    handler = http.server.SimpleHTTPRequestHandler
    with ResilientTCPServer(("", args.port), handler) as httpd:
        print(f"Serving on http://localhost:{args.port}")
        httpd.serve_forever()