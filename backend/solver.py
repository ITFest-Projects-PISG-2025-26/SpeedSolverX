import kociemba

def solve(cube_string):
    try:
        return kociemba.solve(cube_string)
    except Exception as e:
        return f"Invalid input: {e}"
