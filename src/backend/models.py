class UserModel:
    def __init__(self, username, password_hash):
        self.username = username
        self.password_hash = password_hash
        self.solves = []  # Stores solve times or history

    def add_solve(self, time, scramble):
        self.solves.append({
            'time': time,
            'scramble': scramble
        })

    def get_solves(self):
        return self.solves
