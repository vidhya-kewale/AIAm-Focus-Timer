#!/usr/bin/env python3
"""
focus_timer.py

Simple launcher for the AIAm Focus Timer React app.

Usage:
    python focus_timer.py
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path

PORT = 8000


def build_dir() -> Path:
    # We assume the React app lives in ./ui and is built to ./ui/build
    repo_root = Path(__file__).resolve().parent
    build_path = repo_root / "ui" / "build"
    return build_path


def run():
    root = build_dir()

    if not root.exists():
        print(
            "⚠️  React build not found at ./ui/build.\n"
            "Make sure you run:\n"
            "    cd ui\n"
            "    npm install\n"
            "    npm run build\n"
        )
        sys.exit(1)

    os.chdir(root)

    # Python 3.7+ allows specifying the directory for SimpleHTTPRequestHandler
    handler_class = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), handler_class) as httpd:
        url = f"http://localhost:{PORT}"
        print(f"🌱 AIAm Focus Timer running at {url}")
        print("Press Ctrl+C to stop.")

        # Open in default browser
        try:
            webbrowser.open(url)
        except Exception as e:
            print(f"Could not open browser automatically: {e}")

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 Shutting down server...")
            httpd.server_close()


if __name__ == "__main__":
    run()
