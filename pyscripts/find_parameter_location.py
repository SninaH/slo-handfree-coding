import ast
import sys

#for testing
##########################################################
from io import StringIO

# Step 1: Convert the code to a multi-line string
# code_as_string = """def function1():
#     # Example function
#     pass

# class MyClass:
#     def __init__(self):
#         # Constructor method
#         pass

#     def method1(self):
#         # Example method
#         pass

#     # Add more methods as needed

# function1()
# def my_function():
#     # Function definition
#     pass

# def moja_funkcija():
#     # Function definition
#     pass
# """

# # Step 2: Simulate sys.stdin input
# sys.stdin = StringIO(code_as_string)

######################################################33333

class ParameterLocationFinder(ast.NodeVisitor):
    def __init__(self, target_line, target_column):
        self.target_line = target_line
        self.target_column = target_column
        self.location = None
        self.found_function_or_method = False
        self.stop_parsing = False

    def generic_visit(self, node):
        if self.stop_parsing:
            return  # Stop visiting if the flag is set
        super().generic_visit(node)

    def visit_FunctionDef(self, node):
        if self.stop_parsing:
            return
        # Check if the target line is within the start and end lines of the function definition
        if node.lineno <= self.target_line <= getattr(node, 'end_lineno', node.lineno):
            self.found_function_or_method = True
            self.process_parameters(node, within_body=True)

    def visit_AsyncFunctionDef(self, node):
        if self.stop_parsing:
            return
        # Check if the target line is within the start and end lines of the async function definition
        if node.lineno <= self.target_line <= getattr(node, 'end_lineno', node.lineno):
            self.found_function_or_method = True
            self.process_parameters(node, within_body=True)

    def visit_ClassDef(self, node):
        if self.stop_parsing:
            return
        # search for methods within the class definition if the target line is within the class definition
        if node.lineno <= self.target_line <= node.end_lineno:
            for item in node.body:
                if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)) and item.lineno <= self.target_line <= getattr(item, 'end_lineno', item.lineno):
                    self.found_function_or_method = True
                    self.process_parameters(item, within_body=True)
                    return

    def process_parameters(self, node, within_body=False):
        if not node.args.args:
            def_len = len("def ")
            self.location = "no. line: {}, column: {}.".format(node.lineno, node.col_offset + len(node.name) + def_len + 1)
            self.stop_parsing = True
        else:
            last_param = node.args.args[-1]
            self.location = "after. line: {}, column: {}.".format(last_param.lineno, last_param.col_offset + len(last_param.arg))
            self.stop_parsing = True

    def find_location(self, tree):
        self.visit(tree) # Visit the AST nodes and call the corresponding visit_* methods (from NodeVisitor)
        if not self.found_function_or_method:
            return "No function or method found at the specified location."
        return self.location

def find_parameter_location(target_line, target_column):
    try:
        code_content = sys.stdin.read()  # Read code content from stdin
        # return "Received {} lines".format(len(code_content.splitlines()))
        tree = ast.parse(code_content)
    except SyntaxError as e:
        return "AST parsing issue: {}".format(e)

    finder = ParameterLocationFinder(target_line, target_column)
    location = finder.find_location(tree)
    return location

if __name__ == "__main__":
    try:
        target_line = int(sys.argv[1])
        target_column = int(sys.argv[2])  # Assuming column information is also provided
        # target_line = 22
        # target_column = 10
    except ValueError:
        print("Invalid input: Line and column numbers must be integers.")
        sys.exit(1)

    location = find_parameter_location(target_line, target_column)
    print(location)