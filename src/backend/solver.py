import kociemba
import random

def solve(cube_string):
    try:
        # Basic validation
        if not cube_string or len(cube_string) != 54:
            return "Invalid cube string. Must be 54 characters representing the cube state."
        
        # For Kociemba, we only need to check if it's a valid cube string
        # The algorithm will validate the cube configuration internally
        print(f"Received cube string: {cube_string}")
        print(f"Length: {len(cube_string)}")
        
        # Try to solve with Kociemba directly - it handles validation
        solution = kociemba.solve(cube_string)
        print(f"Solution: {solution}")
        return solution if solution else "No solution found"
        
    except ValueError as e:
        print(f"ValueError: {e}")
        return f"Invalid cube configuration: {e}"
    except Exception as e:
        print(f"Exception: {e}")
        # Return a more user-friendly error
        return "Unable to solve cube. Please check that all colors are placed correctly and the cube is solvable."

def generate_scramble():
    """Generate a random scramble sequence"""
    moves = ['R', 'L', 'U', 'D', 'F', 'B']
    modifiers = ['', "'", '2']
    
    scramble = []
    last_move = None
    
    for _ in range(20):  # Generate 20 moves
        move = random.choice(moves)
        # Avoid consecutive moves on the same face
        while move == last_move:
            move = random.choice(moves)
        
        modifier = random.choice(modifiers)
        scramble.append(move + modifier)
        last_move = move
    
    return ' '.join(scramble)
