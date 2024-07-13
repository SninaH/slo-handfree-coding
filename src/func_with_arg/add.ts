import * as vscode from 'vscode';
import { dictationMode } from '../functions';
import { tokenType, findTokenType } from './common_stuff';

/**
 * add string into the selection or at the cursor position.
 * @param text string to be added.
 * @param cursorMove cursor movement after adding the string. [line, character]
 * example: [1, 0] means move to the next line., [0, -1] means move to the left.
 */
async function add_string(text: string, cursorMove?: [number, number]): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const selection = editor.selection;

        // Check if the selection is empty and the character before the cursor is not a space
        if (selection.isEmpty) {
            const positionBeforeCursor = selection.active.translate(0, -1);
            const rangeBeforeCursor = new vscode.Range(positionBeforeCursor, selection.active);
            const textBeforeCursor = editor.document.getText(rangeBeforeCursor);
            
            // Use a regular expression to check for any kind of whitespace character
            if (!/\s/.test(textBeforeCursor)) {
                text = " " + text;
            }
        }

        await editor.edit(editBuilder => {
            editBuilder.replace(selection, text);
        });
        if (cursorMove) {
            const newPosition = selection.active.translate(cursorMove[0], cursorMove[1]);
            editor.selection = new vscode.Selection(newPosition, newPosition);
        }
    }
}

const vsObjectToFunction: { [key: string]: () => Promise<void> } = {
    "LINE": async () => {
        await add_string(`\n`);
    },
    "BLANK_LINE": async () => {
        await add_string(`\n\n`);
    }
};

const pyObjectToFunction: { [key: string]: () => Promise<void> } = {
    "FROM": async () => {
        await add_string(`from`);
    },
    "IMPORT": async () => {
        await add_string(`import`);
    },

    "RETURN": async () => {
        await add_string(`return`);
    },

    "LIST": async () => {
        await add_string(`[]`, [0, -1]);
    },
    "TUPLE": async () => {
        await add_string(`()`, [0, -1]);
    },
    "DICTIONARY": async () => {
        await add_string(`{}`, [0, -1]);
    },
    "SET": async () => {
        await add_string(`{}`, [0, -1]);
    },

    "IF": async () => {
        await add_string(`if`);
    },
    "ELIF": async () => {
        await add_string(`elif`);
    },
    "ELSE": async () => {
        await add_string(`else`);
    },

    "WHILE": async () => {
        await add_string(`while`);
    },
    "FOR_EACH": async () => {
        await add_string(`for element in iterable:`);
    },
    "FOR": async () => {
        await add_string(`for`);
    },
    "IN": async () => {
        await add_string(`in`);
    },
    "RANGE": async () => {
        await add_string(`range()`, [0, -1]);
    },
    "PRINT": async () => {
        await add_string(`print()`, [0, -1]);
    },
    "INPUT": async () => {
        await add_string(`input()`, [0, -1]);
    },
    "OPEN": async () => {
        await add_string(`open()`, [0, -1]);
    },
    "TRY": async () => {
        await add_string(`try:`);
    },
    "EXCEPT": async () => {
        await add_string(`except:`);
    },

    "VARIABLE": async () => {
        await add_string(`variable`);
    },

    "TYPE": async () => {
        await add_string(`type()`, [0, -1]);
    },

    "INTEGER": async () => {
        await add_string(`int`);
    },
    "LONG": async () => {
        await add_string(`long`);
    },
    "FLOAT": async () => {
        await add_string(`float`);
    },
    "COMPLEX": async () => {
        await add_string(`complex`);
    },
    "STRING": async () => {
        await add_string(`str`);
    },
    "BOOLEAN": async () => {
        await add_string(`bool`);
    },
    "NONE": async () => {
        await add_string(`None`);
    }
};

const pyObjWithNameToFunction: { [key: string]: (name: string) => Promise<void> } = {
    "CONSTANT": async (name: string) => {
        const full_cap_snake_name = name.toUpperCase().split(" ").join("_");
        await add_string(`${full_cap_snake_name}`);
    },
    "CLASS": async (name: string) => {
        const camelCaseName = name.split(" ").map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)).join("");
        await add_string(`${camelCaseName}`);
    },
    "OBJECT": async (name: string) => {
        const full_cap_snake_name = name.toUpperCase().split(" ").join("_");
        await add_string(`${full_cap_snake_name}`);
    },
    "METHOD": async (name: string) => {
        const snake_name = name.split(" ").join("_");
        await add_string(`${snake_name}()`, [0, -1]);
    },
    "FUNCTION": async (name: string) => {
        const snake_name = name.split(" ").join("_");
        await add_string(`${snake_name}()`, [0, -1]);
    },
    "PARAMETER": async (name: string) => {
        const snake_name = name.split(" ").join("_");
        await add_string(`${snake_name}`);
    },
    "ARGUMENT": async (name: string) => {
        const snake_name = name.split(" ").join("_");
        await add_string(`${snake_name}`);
    },
    "LIST": async (name: string) => {
        const snake_name = name.split(" ").join("_");
        await add_string(`${snake_name}[]`, [0, -1]);
    },
    "TUPLE": async (name: string) => {
        const snake_name = name.split(" ").join("_");
        await add_string(`${snake_name}[]`, [0, -1]);
    },
    "DICTIONARY": async (name: string) => {
        const snake_name = name.split(" ").join("_");
        await add_string(`${snake_name}[]`, [0, -1]);
    },
    "SET": async (name: string) => {
        const snake_name = name.split(" ").join("_");
        await add_string(`${snake_name}[]`, [0, -1]);
    },
    "KEY": async (name: string) => {
        const snake_name = name.split(" ").join("_");
        await add_string(`${snake_name}`);
    },
    "VALUE": async (name: string) => {
        const snake_name = name.split(" ").join("_");
        await add_string(`${snake_name}`);
    },

    "VARIABLE": async (name: string) => {
        const snake_name = name.split(" ").join("_");
        await add_string(`${snake_name}`);
    }
};

async function executeOneToken(context: vscode.ExtensionContext, kT0: tokenType, args: any[]): Promise<dictationMode | any[]> {
    if (kT0 === tokenType.vsObj) {
        const vsObj = args[0];
        if (vsObj in vsObjectToFunction) {
            await vsObjectToFunction[vsObj]();
            return args.slice(1);
        }
    }
    else if (kT0 === tokenType.pyObj) {
        const pyObj = args[0];
        if (pyObj in pyObjectToFunction) {
            await pyObjectToFunction[pyObj]();
            return args.slice(1);
        }
    }
    return dictationMode.invalid_arguments;
}

async function executeTwoTokens(context: vscode.ExtensionContext, kT0: tokenType, kT1: tokenType, args: any[]): Promise<dictationMode | any[]> {
    if (kT0 === tokenType.pyObj && kT1 === tokenType.none) {
        const pyObj = args[0];
        if (pyObj in pyObjWithNameToFunction) {
            const name = args[1];
            await pyObjWithNameToFunction[pyObj](name);
            return args.slice(2);
        }
    } else if (kT0 === tokenType.none && kT1 === tokenType.pyObj) {
        const pyObj = args[1];
        if (pyObj in pyObjWithNameToFunction) {
            const name = args[0];
            await pyObjWithNameToFunction[pyObj](name);
            return args.slice(2);
        }
    }

    return dictationMode.invalid_arguments;
}

export default async function ADD(args: any[]): Promise<dictationMode> {
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

        const result = await executeTwoTokens(context, kT0, kT1, args);
        if (result instanceof Array) {
            args = result;
            continue;
        } else {
            return result;
        }


    }
    return dictationMode.other;
}