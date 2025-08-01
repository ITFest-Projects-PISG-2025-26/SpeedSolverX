from flask import Blueprint, render_template, redirect, request, url_for
from flask_login import login_user, logout_user, login_required, UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
auth_bp = Blueprint('auth', __name__)
users_db = {}

class User(UserMixin):
    def __init__(self, username):
        self.id = username

def init_login(app, login_manager):
    @login_manager.user_loader
    def load_user(user_id):
        return User(user_id)

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user = users_db.get(request.form['username'])
        if user and check_password_hash(user['password'], request.form['password']):
            login_user(User(request.form['username']))
            return redirect(url_for('home'))
    return render_template('login.html')

@auth_bp.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form['username']
        password = generate_password_hash(request.form['password'])
        users_db[username] = {'password': password}
        return redirect(url_for('auth.login'))
    return render_template('signup.html')

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth.login'))
