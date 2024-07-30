import * as vscode from 'vscode';
import { dictationMode, functions } from '../functions';
import { tokenType, findTokenType, callFindParameterLocationInPython } from './common_stuff';

async function add_new_string(text: string, selectionStart?: [number, number], selectionEnd?: [number, number]) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const currentPosition = editor.selection.active;
        const newPosition = currentPosition.with(currentPosition.line + 1, 0);
        await editor.edit(editBuilder => {
            editBuilder.insert(newPosition, `\n${text}`);
        });

        // If selectionStart and selectionEnd are provided, select the text that was added
        if (selectionStart !== undefined && selectionEnd !== undefined) {
            const newSelection = new vscode.Selection(newPosition.line + 1 + selectionStart[0], newPosition.character + selectionStart[1], newPosition.line + 1 + selectionEnd[0], newPosition.character + selectionEnd[1]);
            editor.selection = newSelection;
        }
    }
}

async function add_at_position(text: string, line: number, character: number) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        // add text in editor at line and character
        const position = new vscode.Position(line, character);
        console.log("position:");
        console.log(position);
        await editor.edit(editBuilder => {
            editBuilder.insert(position, text);
        });

    }
}

async function addIndentedString(template: string) {
    const insertSpaces: boolean = vscode.workspace.getConfiguration('editor').get('insertSpaces', true);
    const tabSize: number = vscode.workspace.getConfiguration('editor').get('tabSize', 4);
    const indentation = insertSpaces ? ' '.repeat(tabSize) : '\t';

    // Replace hard-coded indentation with user's indentation setting
    const indentedTemplate = template.replace(/^    /gm, indentation);
    await add_new_string(indentedTemplate);
}

// Define a helper type for the functions
type PyFunc = (() => Promise<void>) | ((context: vscode.ExtensionContext) => Promise<void>);

const pyObjectToFunction: { [key: string]: PyFunc } = {
    "IMPORT": async () => {
        await add_new_string(`import module_name`);
    },
    "FROM": async () => {
        await add_new_string(`from module_name import function_name`);
    },

    "CONSTANT": async () => {
        await add_new_string(`MY_CONSTANT = None`);
    },

    "CLASS": async () => {
        const pythonClassTemplate = `class MyClass:
    def __init__(self):
        # Constructor method
        pass

    def method1(self):
        # Example method
        pass

    # Add more methods as needed
`;
        await addIndentedString(pythonClassTemplate);

    },

    "OBJECT": async () => {
        await add_new_string(`my_object = MyClass()`);
    },

    "FUNCTION": async () => {
        const functionTemplate = `def my_function():
    # Function definition
    pass`;
        await addIndentedString(functionTemplate);
    },
    "METHOD": async () => {
        const methodTemplate = `def my_method(self):
    # Method definition
    pass`;
        await addIndentedString(methodTemplate);
    },
    "RETURN": async () => {
        await add_new_string(`return value`);
    },
    "PARAMETER": async (context: vscode.ExtensionContext) => {
        const currentLine = vscode.window.activeTextEditor?.selection.active.line;
        const currentColumn = vscode.window.activeTextEditor?.selection.active.character;
        if (currentLine !== undefined && currentColumn !== undefined) {
            try {
                const result = await callFindParameterLocationInPython(context, currentLine, currentColumn);
                if (result) {
                    const line = result[0] - 1; // line is 0-indexed in vscode
                    const character = result[1];
                    console.log(`line: ${line}, character: ${character}`);
                    if (result[2]) {
                        await add_at_position(", parameter", line, character);
                    } else {
                        await add_at_position("parameter", line, character);
                    }
                }
            } catch (e) {
                console.log(e);
            }
        }
    },
    // TODO: argument
    //////////////////////

    "LIST": async () => {
        await add_new_string(`my_list = []`);
    },
    "TUPLE": async () => {
        await add_new_string(`my_tuple = (value1, value2)`);
    },
    "DICTIONARY": async () => {
        await add_new_string(`my_dict = {}`);
    },
    "KEY": async () => {
        await add_new_string(`key: value,`);
    },
    "VALUE": async () => {
        await add_new_string(`my_dict[key] = 'value'`);
    },
    "SET": async () => {
        await add_new_string(`my_set = {value1, value2}`);
    },
    "IF": async () => {
        await addIndentedString(`if condition:
    # Code block
    pass`);
    },
    "ELIF": async () => {
        await addIndentedString(`elif condition:
    # Code block
    pass`);
    },
    "ELSE": async () => {
        await addIndentedString(`else:
    # Code block
    pass`);
    },

    "WHILE": async () => {
        await addIndentedString(`while (condition):
    # Code block
    pass`);
    },
    "FOR_EACH": async () => {
        await addIndentedString(`for key, value in my_dict.items():
    # Code block
    pass`);
    },
    "FOR": async () => {
        await addIndentedString(`for i in range(len(my_list)):
    # Code block
    pass`);
    },
    "RANGE": async () => {
        await addIndentedString(`for i in range(start, end)
    # Code block
    pass`);
    },

    "PRINT": async () => {
        await add_new_string(`print()`);
    },
    "INPUT": async () => {
        await add_new_string(`user_input = input("Enter a value: ")`);
    },
    "OPEN": async () => {
        await addIndentedString(`with open('file_name', 'r') as file:
    # Code block
    pass`);
    },
    "TRY": async () => {
        await addIndentedString(`try:
    # Code block
    pass
except Exception as e:
    # Code block
    pass`);
    },
    "EXCEPT": async () => {
        await addIndentedString(`except Exception as e:
    # Code block
    pass`);
    },

    "VARIABLE": async () => {
        await add_new_string(`my_variable = None`);
    },
    "TYPE": async () => {
        await add_new_string(`type(my_variable)`);
    },

    "INTEGER": async () => {
        await add_new_string(`my_integer = 0`);
    },
    "FLOAT": async () => {
        await add_new_string(`my_float = 0.0`);
    },
    "COMPLEX": async () => {
        await add_new_string(`my_complex = 0 + 0j`);
    },
    "STRING": async () => {
        await add_new_string(`my_string = ""`);
    },
    "BOOLEAN": async () => {
        await add_new_string(`my_boolean = True`);
    },
    "NONE": async () => {
        await add_new_string(`my_none = None`);
    }


};

// Define a helper type for the functions
type PyFuncWithName = ((name: string) => Promise<void>) | ((name: string, context: vscode.ExtensionContext) => Promise<void>);

const pyObjWithNameToFunction: { [key: string]: PyFuncWithName } = {
    "CONSTANT": async (name: string) => {
        const snakeCaseName = name.split(' ').join('_').toUpperCase();
        await add_new_string(`${snakeCaseName} = None`);
    },

    "CLASS": async (name: string) => {
        const camelCaseName = name.replace(/(?:^\w|[A-Z]|\b\w|\s+\w)/g, (match, index) => index === 0 ? match.toLowerCase() : match.toUpperCase()).replace(/\s+/g, '');
        const pythonClassTemplate = `class ${camelCaseName}:
    def __init__(self):
        # Constructor method
        pass

    def method1(self):
        # Example method
        pass

    # Add more methods as needed
`;
        await addIndentedString(pythonClassTemplate);
    },
    "OBJECT": async (name: string) => {
        const snakeCaseName = name.split(' ').join('_').toLowerCase();
        await add_new_string(`${snakeCaseName} = MyClass()`);
    },
    "FUNCTION": async (name: string) => {
        const snakeCaseName = name.split(' ').join('_').toLowerCase();
        await addIndentedString(`def ${snakeCaseName}():
    # Function definition
    pass`);
    },
    "METHOD": async (name: string) => {
        const snakeCaseName = name.split(' ').join('_').toLowerCase();
        await addIndentedString(`def ${snakeCaseName}(self):
    # Method definition
    pass`);
    },

    "DICTIONARY": async (name: string) => {
        const snakeCaseName = name.split(' ').join('_').toLowerCase();
        await addIndentedString(`${snakeCaseName} = {}`);
    },
    "LIST": async (name: string) => {
        const snakeCaseName = name.split(' ').join('_').toLowerCase();
        await addIndentedString(`${snakeCaseName} = []`);
    },
    "VARIABLE": async (name: string) => {
        const snakeCaseName = name.split(' ').join('_').toLowerCase();
        await addIndentedString(`${snakeCaseName} = None`);
    },
    "PARAMETER": async (name: string, context: vscode.ExtensionContext) => {
        const currentLine = vscode.window.activeTextEditor?.selection.active.line;
        const currentColumn = vscode.window.activeTextEditor?.selection.active.character;
        if (currentLine !== undefined && currentColumn !== undefined) {
            try {
                const result = await callFindParameterLocationInPython(context, currentLine, currentColumn);
                if (result) {
                    const line = result[0] - 1; // line is 0-indexed in vscode
                    const character = result[1];
                    console.log(`line: ${line}, character: ${character}`);
                    const snakeCaseName = name.split(' ').join('_').toLowerCase();
                    if (result[2]) {
                        await add_at_position(", " + snakeCaseName, line, character);
                    } else {
                        await add_at_position(snakeCaseName, line, character);
                    }
                }
            } catch (e) {
                console.log(e);
            }
        }
    },
};

//TODO: multiple parameters
const pyObjWithNameAndParamToFunction: { [key: string]: (name: string, param: string) => Promise<void> } = {
    "FUNCTION": async (name: string, param: string) => {
        const snakeCaseName = name.split(' ').join('_').toLowerCase();
        const snakeCaseParam = param.split(' ').join('_').toLowerCase();
        await addIndentedString(`def ${snakeCaseName}(${snakeCaseParam}):
    # Function definition
    pass`);
    },
    "METHOD": async (name: string, param: string) => {
        const snakeCaseName = name.split(' ').join('_').toLowerCase();
        const snakeCaseParam = param.split(' ').join('_').toLowerCase();
        await addIndentedString(`def ${snakeCaseName}(self, ${snakeCaseParam}):
    # Method definition
    pass`);
    },
};

const vsObjectToFunction: { [key: string]: () => Promise<void> } = {
    "LINE": async () => {
        await add_new_string(``);
    },
    "BLANK_LINE": async () => {
        await add_new_string(``);
    },
    "FILE": async () => {
        await functions.NEW_FILE([]);
    },
    "TAB": async () => {
        await functions.NEW_FILE([]);
    }

};

// Example type guard function to determine if PyFunc takes no arguments
// without this functon TypeScript does not know that func takes no arguments and throws an error smh-.-
function isWithoutParameter(func: PyFunc): func is (() => Promise<void>) {
    return func.length === 0;
}

function isWithoutContextParameter(func: PyFuncWithName): func is ((name: string) => Promise<void>) {
    return func.length === 1;
}

async function executeOneToken(context: vscode.ExtensionContext, kT: tokenType, args: any[]): Promise<dictationMode | any[]> {
    console.log(`executeOneToken: ${kT}, ${args}`);
    if (kT === tokenType.pyObj) {
        const func: PyFunc = pyObjectToFunction[args[0]];
        if (func) {
            if (isWithoutParameter(func)) {
                // TypeScript now knows func must take no arguments
                await func();
            } else {
                // TypeScript is assured this function takes a context argument
                await func(context);
            }
            args = args.slice(1);
            return args;
        } else {
            console.log(`Invalid argument: ${args[0]}`);
            return dictationMode.invalid_arguments;
        }
    } else if (kT === tokenType.vsObj) {
        if (vsObjectToFunction[args[0]]) {
            await vsObjectToFunction[args[0]]();
            args = args.slice(1);
            return args;
        } else {
            console.log(`Invalid argument: ${args[0]}`);
            return dictationMode.invalid_arguments;
        }

    } else {
        console.log(`Invalid argument: ${args[0]}`);
        return dictationMode.invalid_arguments;

    }
}

async function executeTwoTokens(context: vscode.ExtensionContext, kT0: tokenType, kT1: tokenType, args: any[]): Promise<dictationMode | any[]> {
    if (kT0 === tokenType.pyObj && kT1 === tokenType.none) {
        const func: PyFuncWithName = pyObjWithNameToFunction[args[0]];
        if (func) {
            if (isWithoutContextParameter(func)) {
                console.log(`Adding new ${args[0]} with name ${args[1]}`);
                await func(args[1]);
            } else {
                console.log(`Adding new ${args[0]} with name ${args[1]}`);
                await func(args[1], context);
            }
            args = args.slice(2);
            return args;
        } else {
            return await executeOneToken(context, kT0, args);
        }
    } else if (kT0 === tokenType.none && kT1 === tokenType.pyObj) {
        const func: PyFuncWithName = pyObjWithNameToFunction[args[1]];
        if (func) {
            if (isWithoutContextParameter(func)) {
                console.log(`Adding new ${args[1]} with name ${args[0]}`);
                await func(args[0]);
            } else {
                console.log(`Adding new ${args[1]} with name ${args[0]}`);
                await func(args[0], context);
            }
            args = args.slice(2);
            return args;
        }
        else {
            return await executeOneToken(context, kT1, args);
        }
    } else {
        return await executeOneToken(context, kT0, args);
    }

}

async function executeFourTokens(context: vscode.ExtensionContext, kT0: tokenType, kT1: tokenType, kT2: tokenType, kT3: tokenType, args: any[]): Promise<dictationMode | any[]> {
    if (kT0 === tokenType.pyObj && kT1 === tokenType.none && kT2 === tokenType.pyObj && kT3 === tokenType.none) {
        console.log("pyObj, none, pyObj, none");
        if (args[2] === "PARAMETER" && pyObjWithNameAndParamToFunction[args[0]]) {
            console.log(`Adding new ${args[0]} with name ${args[1]} and parameter ${args[3]}`);
            await pyObjWithNameAndParamToFunction[args[0]](args[1], args[3]);
            args = args.slice(3);
            return args;
        } else if (args[0] === "PARAMETER" && pyObjWithNameAndParamToFunction[args[2]]) {
            console.log(`Adding new ${args[2]} with name ${args[3]} and parameter ${args[1]}`);
            await pyObjWithNameAndParamToFunction[args[2]](args[3], args[1]);
            args = args.slice(3);
            return args;
        }

    } else if (kT0 === tokenType.none && kT1 === tokenType.pyObj && kT2 === tokenType.none && kT3 === tokenType.pyObj) {
        if (args[3] === "PARAMETER" && pyObjWithNameAndParamToFunction[args[1]]) {
            await pyObjWithNameAndParamToFunction[args[1]](args[0], args[2]);
            args = args.slice(4);
            return args;
        } else if (args[1] === "PARAMETER" && pyObjWithNameAndParamToFunction[args[3]]) {
            await pyObjWithNameAndParamToFunction[args[3]](args[2], args[0]);
            args = args.slice(4);
            return args;
        }

    } else if (kT0 === tokenType.none && kT1 === tokenType.pyObj && kT2 === tokenType.pyObj && kT3 === tokenType.none) {
        if (args[2] === "PARAMETER" && pyObjWithNameAndParamToFunction[args[1]]) {
            await pyObjWithNameAndParamToFunction[args[1]](args[0], args[3]);
            args = args.slice(3);
            return args;
        } else if (args[1] === "PARAMETER" && pyObjWithNameAndParamToFunction[args[2]]) {
            await pyObjWithNameAndParamToFunction[args[2]](args[3], args[0]);
            args = args.slice(3);
            return args;
        }

    }

    return await executeTwoTokens(context, kT0, kT1, args);

}

export default async function NEW(args: any[]): Promise<dictationMode> {
    let context: vscode.ExtensionContext;
    try { context = args[0]; args = args.slice(1); }
    catch (e) {
        console.log(e);
        console.log(`args[0] for NEW should be context.`);
        return dictationMode.invalid_arguments;
    }
    while (args.length > 0) {
        const kT0 = findTokenType(args[0]);
        if (args.length === 1) {

            const result = await executeOneToken(context, kT0, args);
            if (result instanceof Array) {
                args = result;
                continue;
            } else {
                return result;
            }
        }
        const kT1 = findTokenType(args[1]);
        if (args.length === 2 || args.length === 3) {
            const result = await executeTwoTokens(context, kT0, kT1, args);
            if (result instanceof Array) {
                args = result;
                continue;
            } else {
                return result;
            }
        }
        const kT2 = findTokenType(args[2]);
        const kT3 = findTokenType(args[3]);
        const result = await executeFourTokens(context, kT0, kT1, kT2, kT3, args);
        if (result instanceof Array) {
            args = result;
            continue;
        } else {
            return result;
        }
    }
    return dictationMode.other;
}
