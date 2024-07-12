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

        if (selectionStart !== undefined && selectionEnd !== undefined) {
            const newSelection = new vscode.Selection(newPosition.line + 1 + selectionStart[0], newPosition.character + selectionStart[1], newPosition.line + 1 + selectionEnd[0], newPosition.character + selectionEnd[1]);
            editor.selection = newSelection;
        }
    }
}

async function add_at_position(text: string, line: number, character: number) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const newPosition = new vscode.Position(line, character);
        await editor.edit(editBuilder => {
            editBuilder.insert(newPosition, text);
        });
        // select the inserted text
        const startPosition = new vscode.Position(line, character);
        let endLine = line;
        let endCharacter = character;

        // Calculate the end position
        const textLines = text.split('\n');
        if (textLines.length === 1) {
            // If the text is on the same line
            endCharacter += text.length;
        } else {
            // If the text contains new lines
            endLine += textLines.length - 1;
            endCharacter = textLines[textLines.length - 1].length;
        }

        const endPosition = new vscode.Position(endLine, endCharacter);
        // Create a new selection from start to end position
        const newSelection = new vscode.Selection(startPosition, endPosition);
        editor.selection = newSelection;

    }
}
const pyObjectToFunction: { [key: string]: () => Promise<void> } = {
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
        await add_new_string(pythonClassTemplate);

    },

    "OBJECT": async () => {
        await add_new_string(`my_object = MyClass()`);
    },

    "FUNCTION": async () => {
        await add_new_string(`def my_function():
    # Function definition
    pass`);
    },
    "METHOD": async () => {
        await add_new_string(`def my_method(self):
    # Method definition
    pass`);
    },
    "RETURN": async () => {
        await add_new_string(`return value`);
    },
    "PARAMETER": async () => {
        const currentLine = vscode.window.activeTextEditor?.selection.active.line;
        const currentColumn = vscode.window.activeTextEditor?.selection.active.character;
        if (currentLine !== undefined && currentColumn !== undefined) {
            try {
                const result = await callFindParameterLocationInPython(currentLine, currentColumn);
                if (result){
                    add_at_position("parameter",result[0], result[1]);
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
    "TOUPLE": async () => {
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

    "IF": async () => {
        await add_new_string(`if condition:
    # Code block
    pass`);
    },
    "ELSE": async () => {
        await add_new_string(`else:
    # Code block
    pass`);
    },

    "WHILE": async () => {
        await add_new_string(`while (condition):
    # Code block
    pass`);
    },
    "FOR_EACH": async () => {
        await add_new_string(`for key, value in my_dict.items():
    # Code block
    pass`);
    },
    "FOR": async () => {
        await add_new_string(`for i in range(len(my_list)):
    # Code block
    pass`);
    },
    "RANGE": async () => {
        await add_new_string(`for i in range(start, end)
    # Code block
    pass`);
    },

    "PRINT": async () => {
        await add_new_string(`print("Hello, World!")`);
    },
    "INPUT": async () => {
        await add_new_string(`user_input = input("Enter a value: ")`);
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
        await add_new_string(`my_string = "Hello, World!"`);
    },
    "BOOLEAN": async () => {
        await add_new_string(`my_boolean = True`);
    },
    "NONE": async () => {
        await add_new_string(`my_none = None`);
    }


};

const pyObjWithNameToFunction: { [key: string]: (name: string) => Promise<void> } = {
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
        await add_new_string(pythonClassTemplate);
    },
    "OBJECT": async (name: string) => {
        const snakeCaseName = name.split(' ').join('_').toLowerCase();
        await add_new_string(`${snakeCaseName} = MyClass()`);
    },
    "FUNCTION": async (name: string) => {
        const snakeCaseName = name.split(' ').join('_').toLowerCase();
        await add_new_string(`def ${snakeCaseName}():
    # Function definition
    pass`);
    },
    "METHOD": async (name: string) => {
        const snakeCaseName = name.split(' ').join('_').toLowerCase();
        await add_new_string(`def ${snakeCaseName}(self):
    # Method definition
    pass`);
    },

    "DICTIONARY": async (name: string) => {
        const snakeCaseName = name.split(' ').join('_').toLowerCase();
        await add_new_string(`${snakeCaseName} = {}`);
    },
    "LIST": async (name: string) => {
        const snakeCaseName = name.split(' ').join('_').toLowerCase();
        await add_new_string(`${snakeCaseName} = []`);
    },
    "VARIABLE": async (name: string) => {
        const snakeCaseName = name.split(' ').join('_').toLowerCase();
        await add_new_string(`${snakeCaseName} = None`);
    },

};

const pyObjWithNameAndParamToFunction: { [key: string]: (name: string, param: string) => Promise<void> } = {
    "FUNCTION": async (name: string, param: string) => {
        const snakeCaseName = name.split(' ').join('_').toLowerCase();
        const snakeCaseParam = param.split(' ').join('_').toLowerCase();
        await add_new_string(`def ${snakeCaseName}(${snakeCaseParam}):
    # Function definition
    pass`);
    },
    "METHOD": async (name: string, param: string) => {
        const snakeCaseName = name.split(' ').join('_').toLowerCase();
        const snakeCaseParam = param.split(' ').join('_').toLowerCase();
        await add_new_string(`def ${snakeCaseName}(self, ${snakeCaseParam}):
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

async function executeOneToken(kT: tokenType, args: any[]): Promise<dictationMode | any[]> {
    if (kT === tokenType.pyObj) {
        if (pyObjectToFunction[args[0]]) {
            await pyObjectToFunction[args[0]]();
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

async function executeTwoTokens(kT0: tokenType, kT1: tokenType, args: any[]): Promise<dictationMode | any[]> {
    if (kT0 === tokenType.pyObj && kT1 === tokenType.none) {
        if (pyObjWithNameToFunction[args[0]]) {
            console.log(`Adding ${args[0]} with name ${args[1]}`);
            await pyObjWithNameToFunction[args[0]](args[1]);
            args = args.slice(2);
            return args;
        } else {
            console.log(`Invalid argument: ${args[0]}`);
            return dictationMode.invalid_arguments;
        }
    } else if (kT0 === tokenType.none && kT1 === tokenType.pyObj) {
        if (pyObjWithNameToFunction[args[1]]) {
            await pyObjWithNameToFunction[args[1]](args[0]);
            args = args.slice(2);
            return args;
        } else {
            console.log(`Invalid argument: ${args[1]}`);
            return dictationMode.invalid_arguments;
        }
    } else {
        return await executeOneToken(kT0, args);
    }

}

async function executeFourTokens(kT0: tokenType, kT1: tokenType, kT2: tokenType, kT3: tokenType, args: any[]): Promise<dictationMode | any[]> {
    if(kT0 === tokenType.pyObj && kT1 === tokenType.none && kT2 === tokenType.pyObj && kT3 === tokenType.none) {
        if(args[2] === "PARAMETER" && pyObjWithNameAndParamToFunction[args[0]]) {
            await pyObjWithNameAndParamToFunction[args[0]](args[1], args[3]);
            args = args.slice(3);
            return args;
        }else if(args[0] === "PARAMETER" && pyObjWithNameAndParamToFunction[args[2]]) {
            await pyObjWithNameAndParamToFunction[args[2]](args[3], args[1]);
            args = args.slice(3);
            return args;
        }
        else {
            console.log(`Invalid argument: ${args[0]}`);
            return dictationMode.invalid_arguments;
        }
    } else if (kT0 === tokenType.none && kT1 === tokenType.pyObj && kT2 === tokenType.none && kT3 === tokenType.pyObj) {
        if(args[3] === "PARAMETER" && pyObjWithNameAndParamToFunction[args[1]]) {
            await pyObjWithNameAndParamToFunction[args[1]](args[0], args[2]);
            args = args.slice(4);
            return args;
        }else if(args[1] === "PARAMETER" && pyObjWithNameAndParamToFunction[args[3]]) {
            await pyObjWithNameAndParamToFunction[args[3]](args[2], args[0]);
            args = args.slice(4);
            return args;
        } 
        else {
            console.log(`Invalid argument: ${args[1]}`);
            return dictationMode.invalid_arguments;
        }
    } else if (kT0 === tokenType.none && kT1 === tokenType.pyObj && kT2 === tokenType.pyObj && kT3 === tokenType.none) {
        if(args[2] === "PARAMETER" && pyObjWithNameAndParamToFunction[args[1]]) {
            await pyObjWithNameAndParamToFunction[args[1]](args[0], args[3]);
            args = args.slice(3);
            return args;
        } else if (args[1] === "PARAMETER" && pyObjWithNameAndParamToFunction[args[2]]) {
            await pyObjWithNameAndParamToFunction[args[2]](args[3], args[0]);
            args = args.slice(3);
            return args;
        }
        else {
            console.log(`Invalid argument: ${args[1]}`);
            return dictationMode.invalid_arguments;
        }
    }
    else {
        return await executeTwoTokens(kT0, kT1, args);
    }
}

export default async function NEW(args: any[]): Promise<dictationMode> {
    while (args.length > 0) {
        const kT0 = findTokenType(args[0]);
        if (args.length === 1) {
            
            const result = await executeOneToken(kT0, args);
            if (result instanceof Array) {
                args = result;
                continue;
            } else {
                return result;
            }
        }
        const kT1 = findTokenType(args[1]);
        if (args.length === 2 || args.length === 3) {
            const result = await executeTwoTokens(kT0, kT1, args);
            if (result instanceof Array) {
                args = result;
                continue;
            } else {
                return result;
            }
        }
        const kT2 = findTokenType(args[2]);
        const kT3 = findTokenType(args[3]);
        const result = await executeFourTokens(kT0, kT1, kT2, kT3, args);
        if (result instanceof Array) {
            args = result;
            continue;
        } else {
            return result;
        }
    }
    return dictationMode.other;
}