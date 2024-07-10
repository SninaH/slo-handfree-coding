import * as vscode from 'vscode';
import { dictationMode, functions } from '../functions';
import { tokenType, findTokenType } from './common_stuff';

async function add_new_string(text: string) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const currentPosition = editor.selection.active;
        const newPosition = currentPosition.with(currentPosition.line + 1, 0);
        await editor.edit(editBuilder => {
            editBuilder.insert(newPosition, `\n${text}`);
        });
    }
}

const pyObjectToFunction: { [key: string]: () => Promise<void> } = {
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
    "CONSTANT": async () => {
        await add_new_string(`MY_CONSTANT = None`);
    },
    "DICTIONARY": async () => {
        await add_new_string(`my_dict = {}`);
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
    "IMPORT": async () => {
        await add_new_string(`import module_name`);
    },
    "FROM": async () => {
        await add_new_string(`from module_name import function_name`);
    },
    "KEY": async () => {
        await add_new_string(`my_dict['key'] = value`);
    },
    "VALUE": async () => {
        await add_new_string(`my_dict[key] = 'value'`);
    },
    "LIST": async () => {
        await add_new_string(`my_list = []`);
    },
    "PRINT": async () => {
        await add_new_string(`print("Hello, World!")`);
    },
    "INPUT": async () => {
        await add_new_string(`user_input = input("Enter a value: ")`);
    },
    "RETURN": async () => {
        await add_new_string(`return value`);
    },
    "VARIABLE": async () => {
        await add_new_string(`my_variable = None`);
    },
    "WHILE": async () => {
        await add_new_string(`while condition:
    # Code block
    pass`);
    },
    "FOR": async () => {
        await add_new_string(`for i in range(len(my_list)):
    # Code block
    pass`);
    },
    "FOR_EACH": async () => {
        await add_new_string(`for key, value in my_dict.items():
    # Code block
    pass`);
    }


};

const pyObjWithNameToFunction: { [key: string]: (name: string) => Promise<void> } = {
    "VARIABLE": async (name: string) => {
        const snakeCaseName = name.split(' ').join('_').toLowerCase();
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
    "CONSTANT": async (name: string) => {
        const snakeCaseName = name.split(' ').join('_').toUpperCase();
        await add_new_string(`${snakeCaseName} = None`);
    },
    "DICTIONARY": async (name: string) => {
        const snakeCaseName = name.split(' ').join('_').toLowerCase();
        await add_new_string(`${snakeCaseName} = {}`);
    },
    "LIST": async (name: string) => {
        const snakeCaseName = name.split(' ').join('_').toLowerCase();
        await add_new_string(`${snakeCaseName} = []`);
    },

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

export default async function NEW(args: any[]): Promise<dictationMode> {
    while (args.length > 0) {
        if (args.length > 1) {
            const kT0 = findTokenType(args[0]);
            const kT1 = findTokenType(args[1]);
            const result = await executeTwoTokens(kT0, kT1, args);
            if (result instanceof Array) {
                args = result;
                continue;
            } else {
                return result;
            }
        }
        const kT = findTokenType(args[0]);
        const result = await executeOneToken(kT, args);
        if (result instanceof Array) {
            args = result;
        } else {
            return result;
        }
    }
    return dictationMode.other;
}