#!/usr/bin/env python3
"""
SpeedSolverX Main Application Entry Point
Run this file to start the SpeedSolverX web application.
"""

import sys
import os

# Add the src and src/backend directories to the Python path
src_path = os.path.join(os.path.dirname(__file__), 'src')
backend_path = os.path.join(src_path, 'backend')
sys.path.insert(0, src_path)
sys.path.insert(0, backend_path)

# Import and run the Flask app
from app import app

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)
