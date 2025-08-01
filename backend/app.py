from flask import Flask, render_template, redirect, url_for, request
from flask_login import LoginManager, login_required, current_user
from auth import auth_bp, init_login
from solver import solve
app = Flask(__name__)
app.secret_key = 'secret-key'
app.register_blueprint(auth_bp)
login_manager = LoginManager()
init_login(app, login_manager)

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

if __name__ == '__main__':
    app.run(debug=True)
