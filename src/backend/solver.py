import kociemba
import random

def solve(cube_string):
    try:
        # Basic validation
        if not cube_string or len(cube_string) != 54:
            return "Invalid cube string. Must be 54 characters representing the cube state."
        
        print(f"Received cube string: {cube_string}")
        print(f"Length: {len(cube_string)}")
        
        # Count each color to help debug
        color_counts = {}
        for char in cube_string:
            color_counts[char] = color_counts.get(char, 0) + 1
        print(f"Color counts: {color_counts}")
        
        # Check if it's a solved cube first
        if cube_string == 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB':
            return "Cube is already solved!"
        
        # Try to solve with Kociemba - let it handle validation
        solution = kociemba.solve(cube_string)
        print(f"Solution: {solution}")
        
        if solution and solution.strip():
            return solution
        else:
            return "Cube is already solved!"
        
    except ValueError as e:
        print(f"ValueError: {e}")
        return "This cube configuration is not solvable. For a valid scramble, try using the 'Generate Scramble' feature below, then input that scrambled pattern into the solver."
    except Exception as e:
        print(f"Exception: {e}")
        return "Invalid cube state. Please ensure you're entering a valid scrambled cube configuration. Random color patterns won't work - the cube must follow real Rubik's cube mechanics."

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
