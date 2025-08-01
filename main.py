#!/usr/bin/env python3
"""
Render.com deployment entry point
This file ensures the application starts correctly on Render.com
"""

import os
import sys

# Add the src and src/backend directories to the Python path
src_path = os.path.join(os.path.dirname(__file__), 'src')
backend_path = os.path.join(src_path, 'backend')
sys.path.insert(0, src_path)
sys.path.insert(0, backend_path)

# Import and run the Flask app
from app import app

if __name__ == '__main__':
    # Get port from environment variable (Render sets this)
    port = int(os.environ.get("PORT", 3000))
    debug = os.environ.get("DEBUG", "False").lower() == "true"
    
    # Run the app
    app.run(host="0.0.0.0", port=port, debug=debug)
