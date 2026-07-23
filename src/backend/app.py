import os
import sys
from datetime import datetime
from typing import Any, Dict, List, TypedDict

from flask import Flask, render_template, request, jsonify
from flask_login import LoginManager, login_required, current_user  # type: ignore[reportMissingTypeStubs]

# Add current directory to path for local imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from auth import auth_bp, init_login
from solver import solve, generate_scramble, convert_to_kociemba_format
from dotenv import load_dotenv
import statistics


class SolveRecord(TypedDict, total=False):
    time: float
    scramble: str
    timestamp: str
    dnf: bool
    plus2: bool


user_solves: Dict[str, List[SolveRecord]] = {}

# Load environment variables
load_dotenv()

app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/static')
app.secret_key = os.environ.get('JWT_SECRET', 'default-secret-key')

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'auth.login'

# Initialize auth
init_login(app, login_manager)

# Register blueprints
app.register_blueprint(auth_bp)

# Simple in-memory storage for solves (in production, use a database)
# `user_solves` is typed above to improve static analysis

@app.route('/health')
def health():
    return {'status': 'healthy'}, 200

@app.route('/')
@login_required
def home():
    return render_template('home.html')

@app.route('/timer')
@login_required
def timer():
    return render_template('timer.html')

@app.route('/solver')
@login_required
def solver():
    return render_template('solver.html')

@app.route('/stats')
@login_required
def stats() -> str:
    user_id = current_user.id
    solves = user_solves.get(user_id, [])

    stats_data = calculate_stats(solves)
    return render_template('stats.html', stats=stats_data, solves=solves)


@app.route('/settings')
@login_required
def settings() -> str:
    return render_template('settings.html')

@app.route('/api/scramble')
@login_required
def get_scramble() -> Any:
    return jsonify({'scramble': generate_scramble()})


@app.route('/solve', methods=['POST'])
@login_required
def solve_cube() -> Any:
    try:
        data = request.get_json(silent=True)
        if not isinstance(data, dict) or 'cube_state' not in data:
            return jsonify({'success': False, 'error': 'No cube state provided'}), 400

        cube_state = data['cube_state']
        if not isinstance(cube_state, dict):
            return jsonify({'success': False, 'error': 'Invalid cube state format'}), 400

        # Convert cube state to kociemba format
        kociemba_string = convert_to_kociemba_format(cube_state)

        # Solve the cube using existing solver function
        solution = solve(kociemba_string)

        # Check if solution is an error message
        if any(keyword in solution for keyword in ('Invalid', 'not solvable', 'Error')):
            return jsonify({'success': False, 'error': solution}), 400

        # Count moves
        moves = solution.strip().split()
        move_count = len(moves)

        return jsonify({
            'success': True,
            'solution': solution,
            'move_count': move_count
        })

    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': 'An internal error occurred'}), 500

@app.route('/api/solve', methods=['POST'])
@login_required
def add_solve() -> Any:
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({'success': False, 'error': 'Invalid request payload'}), 400

    user_id = current_user.id

    if user_id not in user_solves:
        user_solves[user_id] = []

    try:
        time_value = float(data['time'])
    except (TypeError, KeyError, ValueError):
        return jsonify({'success': False, 'error': 'Invalid or missing time value'}), 400

    solve_data: SolveRecord = {
        'time': time_value,
        'scramble': str(data.get('scramble', '')),
        'timestamp': datetime.now().isoformat(),
        'dnf': bool(data.get('dnf', False)),
        'plus2': bool(data.get('plus2', False))
    }

    user_solves[user_id].append(solve_data)

    # Keep only last 1000 solves per user
    if len(user_solves[user_id]) > 1000:
        user_solves[user_id] = user_solves[user_id][-1000:]

    return jsonify({'success': True})

@app.route('/api/delete_solve/<int:index>', methods=['DELETE'])
@login_required
def delete_solve(index: int) -> Any:
    user_id = current_user.id
    solves = user_solves.get(user_id, [])

    if 0 <= index < len(solves):
        del solves[index]
        return jsonify({'success': True})

    return jsonify({'success': False}), 400

@app.route('/api/delete_selected', methods=['DELETE'])
@login_required
def delete_selected_solves() -> Any:
    try:
        data = request.get_json(silent=True)
        if not isinstance(data, dict):
            return jsonify({'success': False, 'error': 'Invalid request payload'}), 400

        indices = data.get('indices', [])
        if not isinstance(indices, list) or not indices:
            return jsonify({'success': False, 'error': 'No indices provided'}), 400

        user_id = current_user.id
        solves = user_solves.get(user_id, [])

        # Sort indices in descending order to delete from the end first
        # This prevents index shifting issues
        try:
            indices_sorted = sorted({int(index) for index in indices}, reverse=True)
        except (TypeError, ValueError):
            return jsonify({'success': False, 'error': 'Invalid indices provided'}), 400

        # Validate all indices are within bounds
        for index in indices_sorted:
            if index < 0 or index >= len(solves):
                return jsonify({'success': False, 'error': f'Invalid index: {index}'}), 400

        # Delete solves
        for index in indices_sorted:
            del solves[index]

        return jsonify({'success': True, 'deleted_count': len(indices_sorted)})

    except Exception:
        return jsonify({'success': False, 'error': 'An internal error occurred'}), 500

@app.route('/api/delete_all', methods=['DELETE'])
@login_required
def delete_all_solves() -> Any:
    try:
        user_id = current_user.id
        user_solves[user_id] = []
        return jsonify({'success': True})

    except Exception:
        return jsonify({'success': False, 'error': 'An internal error occurred'}), 500

def calculate_stats(solves: List[SolveRecord]) -> Dict[str, Any]:
    if not solves:
        return {
            'total_solves': 0,
            'best_single': 'N/A',
            'worst_single': 'N/A',
            'mo3': 'N/A',
            'ao5': 'N/A',
            'ao12': 'N/A',
            'ao50': 'N/A',
            'ao100': 'N/A',
            'ao1000': 'N/A',
            'session_mean': 'N/A'
        }
    
    # Filter out DNF times for calculations
    times = []
    for solve in solves:
        if not solve.get('dnf', False):
            time = solve['time']
            if solve.get('plus2', False):
                time += 2
            times.append(time)
    
    if not times:
        return {
            'total_solves': len(solves),
            'best_single': 'N/A',
            'worst_single': 'N/A',
            'mo3': 'N/A',
            'ao5': 'N/A',
            'ao12': 'N/A',
            'ao50': 'N/A',
            'ao100': 'N/A',
            'ao1000': 'N/A',
            'session_mean': 'N/A'
        }
    
    def format_time(time_val):
        if time_val is None or time_val == 'N/A':
            return 'N/A'
        return f"{time_val:.2f}s"
    
    def calculate_average(times_list, count):
        if len(times_list) < count:
            return None
        recent_times = times_list[-count:]
        if count >= 5:
            # Remove best and worst for ao5+
            sorted_times = sorted(recent_times)
            trimmed_times = sorted_times[1:-1]
            return statistics.mean(trimmed_times) if trimmed_times else None
        else:
            return statistics.mean(recent_times)
    
    stats = {
        'total_solves': len(solves),
        'best_single': format_time(min(times)),
        'worst_single': format_time(max(times)),
        'session_mean': format_time(statistics.mean(times)),
        'mo3': format_time(calculate_average(times, 3)),
        'ao5': format_time(calculate_average(times, 5)),
        'ao12': format_time(calculate_average(times, 12)),
        'ao50': format_time(calculate_average(times, 50)),
        'ao100': format_time(calculate_average(times, 100)),
        'ao1000': format_time(calculate_average(times, 1000))
    }
    
    return stats

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("DEBUG", "False").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
