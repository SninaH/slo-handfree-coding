import * as vscode from 'vscode';
import { dictationMode } from '../functions';
import { tokenType, findTokenType } from './common_stuff';
import GO from './go';

/**
 * Selects the specified line number. By default selects from the first non-whitespace character to the end of the line.
 * @param lineNumber The line number to select.
 * @param wholeLine Optional. If true, selects the whole line. Default is false.
 */
async function selectLine(lineNumber: number, wholeLine: boolean = false) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        let start = 0;
        if (wholeLine) {
            start = editor.document.lineAt(lineNumber).firstNonWhitespaceCharacterIndex;
        }
        const position = new vscode.Position(lineNumber, start); // Position at the start of the line
        const lineEndCharacter = editor.document.lineAt(lineNumber).text.length;
        const newPosition = new vscode.Position(lineNumber, lineEndCharacter); // Position at the end of the line
        const newSelection = new vscode.Selection(position, newPosition);
        editor.selection = newSelection; // Set the new selection
        editor.revealRange(newSelection, vscode.TextEditorRevealType.InCenter); // Optionally scroll to the selection
    }
}

function selectLineRange(startLine: number, endLine: number, wholeLine: boolean = false) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        let start = 0;
        if (wholeLine) {
            start = editor.document.lineAt(startLine).firstNonWhitespaceCharacterIndex;
        }
        const position = new vscode.Position(startLine, start); // Position at the start of the line
        const lineEndCharacter = editor.document.lineAt(endLine).text.length;
        const newPosition = new vscode.Position(endLine, lineEndCharacter); // Position at the end of the line
        const newSelection = new vscode.Selection(position, newPosition);
        editor.selection = newSelection; // Set the new selection
        editor.revealRange(newSelection, vscode.TextEditorRevealType.InCenter); // Optionally scroll to the selection
    }
}

const selectTokenToFunction: { [key: string]: () => Promise<void> } = {
    "ALL": async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const start = new vscode.Position(0, 0);
            const end = new vscode.Position(editor.document.lineCount - 1, editor.document.lineAt(editor.document.lineCount - 1).text.length);
            const newSelection = new vscode.Selection(start, end);
            editor.selection = newSelection;
            editor.revealRange(newSelection, vscode.TextEditorRevealType.InCenter);
        }
    },
    "MORE": async () => {
        await vscode.commands.executeCommand('editor.action.smartSelect.grow');
    },
    "LESS": async () => {
        await vscode.commands.executeCommand('editor.action.smartSelect.shrink');
    },
    "TO_START": async () => {
        await vscode.commands.executeCommand('cursorHomeSelect');
    },
    "TO_END": async () => {
        await vscode.commands.executeCommand('cursorEndSelect');
    },

};

const VSobjectToFunction: { [key: string]: () => Promise<void> } = {
    "LINE": async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            await selectLine(editor.selection.active.line);
        }
    },

};



const selectTokenVSobjectToFunction: { [key: string]: () => Promise<void> } = {
    "ALL|LINE": async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            await selectLine(editor.selection.active.line, true);
        }
    },
    "TO_START|LINE": async () => {
        await vscode.commands.executeCommand('cursorHomeSelect');
    },
    "TO_END|LINE": async () => {
        await vscode.commands.executeCommand('cursorEndSelect');
    },
    "TO_START|FILE": async () => {
        await vscode.commands.executeCommand('cursorTopSelect');
    },
    "TO_END|FILE": async () => {
        await vscode.commands.executeCommand('cursorBottomSelect');
    }

};

async function executeOneToken(kT: tokenType, args: any[]): Promise<dictationMode | any[]> {
    if (kT === tokenType.selection) {
        if (selectTokenToFunction[args[0]]) {
            await selectTokenToFunction[args[0]]();
            args = args.slice(1);
            return args;
        } else {
            console.log(`Invalid argument: ${args[0]}`)
            return dictationMode.invalid_arguments;
        }
    } else if (kT === tokenType.vsObj) {
        if (VSobjectToFunction[args[0]]) {
            await VSobjectToFunction[args[0]]();
            args = args.slice(1);
            return args;
        } else {
            console.log(`Invalid argument: ${args[0]}`)
            return dictationMode.invalid_arguments;
        }
    }
    return dictationMode.other;
}

async function executeTwoTokens(kT0: tokenType, kT1: tokenType, args: any[]): Promise<dictationMode | any[]> {
    if (kT0 === tokenType.selection && kT1 === tokenType.vsObj) {
        const key = args[0] + "|" + args[1];
        if (selectTokenVSobjectToFunction[key]) {
            await selectTokenVSobjectToFunction[key]();
            args = args.slice(2);
            return args;
        } else {
            return await executeOneToken(kT0, args);
        }
    } else if (kT0 === tokenType.vsObj && kT1 === tokenType.selection) {
        const key = args[1] + "|" + args[0];
        if (selectTokenVSobjectToFunction[key]) {
            await selectTokenVSobjectToFunction[key]();
            args = args.slice(2);
            return args;
        } else {
            return await executeOneToken(kT1, args);
        }
    } else {
        return await executeOneToken(kT0, args);
    }
}

export default async function SELECT(args: any[]): Promise<dictationMode> {
    console.log("Select");
    console.log(args);
    let context: vscode.ExtensionContext;
    try { context = args[0]; args = args.slice(1); }
    catch (e) {
        console.log(e);
        console.log(`args[0] for GO should be context.`);
        return dictationMode.invalid_arguments;
    }

    if (args.length === 0) {
        console.log("zero arguments");
        await vscode.commands.executeCommand('editor.action.smartSelect.grow');
        console.log("selection growed");
        return dictationMode.other;
    }
    

    while (args.length > 0) {

        if (args[0] === "FROM") {
            // get current selection
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return dictationMode.no_active_editor;
            }
            const selection = editor.selection;
            args = args.slice(1);
            // get all arguments until "TO" for GO command
            let start = 0;
            let end = 0;
            let i = 0;
            while (i < args.length) {
                if (args[i] === "TO") {
                    end = i;
                    break;
                }
                i++;
            }
            //check if there was a TO, otherwise all arguments are for GO
            const isTO = end !== 0;
            if (end === 0) {
                end = args.length;
            }
            const goArgs = args.slice(0, end);
            console.log(goArgs);
            const result = await GO([context, ...goArgs]);
            if (result !== dictationMode.other) {
                return result;
            }
            const start_pos = editor.selection.active;
            let end_pos = selection.end;
            if(isTO){
                args = args.slice(end + 1);
                const goArgs = args;
                console.log(goArgs);
                const result = await GO([context, ...goArgs]);
                if (result !== dictationMode.other) {
                    return result;
                }
                end_pos = editor.selection.active;
            } 
            const newSelection = new vscode.Selection(start_pos, end_pos);
            editor.selection = newSelection;
            editor.revealRange(newSelection, vscode.TextEditorRevealType.InCenter);
            return dictationMode.other;
        }
        if (args[0] === "TO") {
            // get current selection
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return dictationMode.no_active_editor;
            }
            const selection = editor.selection;
            args = args.slice(1);
            const start_pos = selection.start;
            // all arguments are for GO command
            const goArgs = args;
            console.log(goArgs);
            const result = await GO([context, ...goArgs]);
            if (result !== dictationMode.other) {
                return result;
            }
            const end_pos = editor.selection.active;
            const newSelection = new vscode.Selection(start_pos, end_pos);
            editor.selection = newSelection;
            editor.revealRange(newSelection, vscode.TextEditorRevealType.InCenter);
            return dictationMode.other;
        }

        const kT0 = findTokenType(args[0]);
        if (args.length === 1) {
            console.log("one argument");
            const result = await executeOneToken(kT0, args);
            if (result instanceof Array) {
                args = result;
                console.log(args);
                continue;
            } else {
                return result;
            }
        }
        const kT1 = findTokenType(args[1]);
        const result = await executeTwoTokens(kT0, kT1, args);
        if (result instanceof Array) {
            args = result;
            continue;
        } else {
            return result;
        }
    }



    return dictationMode.other;
}
