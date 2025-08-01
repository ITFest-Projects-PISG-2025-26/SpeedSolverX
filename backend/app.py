import os
from flask import Flask, render_template, redirect, url_for, request
from flask_login import LoginManager, login_required, current_user
from auth import auth_bp, init_login
from solver import solve
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, template_folder='../frontend', static_folder='../frontend/static')
app.secret_key = os.environ.get('JWT_SECRET', 'default-secret-key')

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'auth.login'

# Initialize auth
init_login(app, login_manager)

# Register blueprints
app.register_blueprint(auth_bp)

@app.route('/health')
def health():
    return {'status': 'healthy'}, 200

@app.route('/')
@login_required
def home():
    return render_template('home.html')

@app.route('/solve', methods=['POST'])
@login_required
def solve_cube():
    cube = request.form.get('cube')
    solution = solve(cube)
    return render_template('home.html', solution=solution)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("DEBUG", "False").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
