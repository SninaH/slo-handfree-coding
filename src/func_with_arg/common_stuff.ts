import { Options, PythonShell } from 'python-shell';
import * as vscode from 'vscode';
import { dictationMode } from '../functions';


export enum tokenType {
    dir = "dir",
    pyObj = "pyObj",
    vsObj = "vsObj",
    none = "none",
    number = "number",
    selection = "selection"
}

/**
 * Array of directions.
 */
export const directions = ["UP", "DOWN", "LEFT", "RIGHT", "START", "END", "NEXT", "PREVIOUS"];

/**
 * Array of Python objects.
 */
export const pythonOjects = [
    "FROM",
    "IMPORT",

    "CONSTANT",

    "CLASS",
    "OBJECT",
    "METHOD",
    "FUNCTION",
    "RETURN",
    "PARAMETER",
    "ARGUMENT",	

    "LIST",
    "TUPLE",
    "DICTIONARY",
    "SET",
    "KEY",
    "VALUE",

    "IF",
    "ELSE",

    "WHILE",
    "FOR_EACH",
    "FOR",
    "IN",
    "RANGE",

    "PRINT",
    "INPUT",
    "OPEN",
    "TRY",
    "EXCEPT",

    "VARIABLE",

    "TYPE",

    "INTEGER",
    "LONG",
    "FLOAT",
    "COMPLEX",
    "STRING",
    "BOOLEAN",
    "NONE",
];

/**
 * Array of VSCode objects.
 */
export const vscodeObjects = ["LINE", "FILE", "VIEW_PORT", "BLANK_LINE", "TAB", "DEFINITION", "PAGE"];

export const selection = ["ALL", "MORE", "LESS", "FROM", "TO", "TO_START", "TO_END"];

export function findTokenType(arg: any): tokenType {

    if (typeof arg === 'number') {
        return tokenType.number;
    } else if (typeof arg === 'string') {
        if (directions.includes(arg)) {
            return tokenType.dir;
        } else if (vscodeObjects.includes(arg)) {
            return tokenType.vsObj;
        } else if (pythonOjects.includes(arg)) {
            return tokenType.pyObj;
        } else if (selection.includes(arg)) {
            return tokenType.selection;
        }
    }
    return tokenType.none;

}




export async function callFindParameterLocationInPython(context: vscode.ExtensionContext, targetLine: number, targetColumn: number): Promise<[number,number]|false> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor');
        return false;
    }

    const filePath = editor.document.fileName;
    if (!filePath.endsWith('.py')) {
        vscode.window.showErrorMessage('The active editor is not a Python script');
        return false;
    }
    
    const content = editor.document.getText();

    let options: Options = {
        mode: 'text',
        pythonOptions: ['-u'], // unbuffered stdout and stderr
        args: [targetLine.toString(), targetColumn.toString()]
    };

    return new Promise((resolve, reject) => {
        // the path to the python script using extension's context
        const url = context.asAbsolutePath('src/func_with_arg/find_parameter_location.py');
        let pyShell = new PythonShell(url, options);

        pyShell.on('message', function (message) {
            // Attempt to parse the message assuming it's in the format "(line, column)"
            const locationMatch = message.match(/\((\d+), (\d+)\)/);
            if (locationMatch) {
                // If the message matches the expected format, resolve with the location [line, column]
                resolve([locationMatch[1], locationMatch[2]]);
            } else if (message.trim() === '') {
                // If the message is empty, indicate no location was found
                console.log('No parameter location found.');
                resolve(false);
            } else {
                // If the message does not match the expected format, treat it as an error
                reject(new Error(`Failed to find parameter location: ${message}`));
            }
        });

        pyShell.end(function (err, code, signal) {
            if (err) {
                reject(new Error(`Script execution error: ${err.message})`));
            } else if (code !== 0) {
                reject(new Error(`The script exited with a non-zero code: ${code}, signal: ${signal}`));
            } else {
                console.log('Script execution finished successfully.');
            }
        });

        // Send the content of the active editor to the Python script
        pyShell.send(content);
    });
}
