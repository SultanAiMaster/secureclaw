#!/usr/bin/env python3
from http.server import HTTPServer, BaseHTTPRequestHandler
import re
import logging
import os
from threading import Thread

# Configure logging
logging.basicConfig(level=logging.INFO)
log = logging.getLogger("PrivacyRouter")

# Block telemetry endpoints
BLOCKED = [
    'telemetry', 'analytics', 'tracking',
    'sentry.io', 'datadog', 'mixpanel',
    'segment.com', 'amplitude.com'
]

class PrivacyRouter(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length > 0:
                body = self.rfile.read(content_length).decode('utf-8', errors='ignore')

                # Check for blocked patterns
                for pattern in BLOCKED:
                    if re.search(pattern, body, re.IGNORECASE):
                        log.warning(f"🛑 BLOCKED: {pattern} in request to {self.path}")
                        self.send_response(403)
                        self.end_headers()
                        return

            # Allow request through
            log.info(f"✓ Allowed: {self.method} {self.path}")
            self.send_response(200)
            self.end_headers()
        except Exception as e:
            log.error(f"Error: {e}")
            self.send_response(500)
            self.end_headers()

    def log_message(self, format, *args):
        """Suppress default server logging"""
        pass

def run_server():
    """Run privacy router in background thread"""
    port = int(os.getenv('PRIVACY_PORT', 8090))
    server = HTTPServer(('0.0.0.0', port), PrivacyRouter)
    log.info(f"🛡️ NemoClaw Privacy Router listening on 0.0.0.0:{port}")

    # Run in daemon thread
    def serve():
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass

    thread = Thread(target=serve, daemon=True)
    thread.start()
    return server

if __name__ == "__main__":
    server = run_server()

    # Keep alive signal
    try:
        while True:
            import time
            time.sleep(10)
    except KeyboardInterrupt:
        log.info("Shutting down...")