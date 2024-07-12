import ast
import sys

class ParameterLocationFinder(ast.NodeVisitor):
    def __init__(self, target_line, target_column):
        self.target_line = target_line
        self.target_column = target_column
        self.location = None

    def visit_FunctionDef(self, node):
        if node.lineno <= self.target_line <= node.end_lineno:
            self.process_parameters(node)

    def visit_AsyncFunctionDef(self, node):
        if node.lineno <= self.target_line <= node.end_lineno:
            self.process_parameters(node)

    def visit_ClassDef(self, node):
        if node.lineno <= self.target_line <= node.end_lineno:
            for item in node.body:
                if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)) and item.lineno <= self.target_line <= getattr(item, 'end_lineno', item.lineno):
                    self.process_parameters(item)

    def process_parameters(self, node):
        if not node.args.args:
            self.location = (node.lineno, node.col_offset + len("def " + node.name + "("))
        else:
            last_param = node.args.args[-1]
            self.location = (last_param.lineno, last_param.col_offset)

    def find_location(self, tree):
        self.visit(tree)
        return self.location

def find_parameter_location(target_line, target_column):
    code_content = sys.stdin.read()  # Read code content from stdin
    tree = ast.parse(code_content)
    finder = ParameterLocationFinder(target_line, target_column)
    location = finder.find_location(tree)
    return location

if __name__ == "__main__":
    target_line = int(sys.argv[1])
    target_column = int(sys.argv[2])  # Assuming column information is also provided
    location = find_parameter_location(target_line, target_column)
    print(location)