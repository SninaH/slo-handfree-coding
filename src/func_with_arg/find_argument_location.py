import ast
import sys

class ArgumentLocationFinder(ast.NodeVisitor):
    def __init__(self, target_line, target_column):
        self.target_line = target_line
        self.target_column = target_column
        self.location = None

    def visit_Call(self, node):
        # Check if the call is on the target line and has arguments
        if node.lineno == self.target_line and node.args:
            last_arg = node.args[-1]
            # Location right after the last argument
            self.location = (last_arg.end_lineno, last_arg.end_col_offset)
        elif node.lineno == self.target_line and not node.args:
            # Location right after the opening parenthesis if there are no arguments
            self.location = (node.lineno, node.col_offset + len(node.func.id) + 1)

    def find_location(self, tree):
        self.visit(tree)
        return self.location

def find_argument_location(target_line, target_column):
    code_content = sys.stdin.read()  # Read code content from stdin
    tree = ast.parse(code_content)
    finder = ArgumentLocationFinder(target_line, target_column)
    location = finder.find_location(tree)
    return location

if __name__ == "__main__":
    target_line = int(sys.argv[1])
    target_column = int(sys.argv[2])
    location = find_argument_location(target_line, target_column)
    print(location)