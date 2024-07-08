import * as vscode from 'vscode';
import { dictationMode } from '../functions';

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
        await vscode.commands.executeCommand('editor.action.insertCursorBelow');
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
            selectLine(editor.selection.active.line, true);
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

export default async function SELECT(args: any[]): Promise<dictationMode> {
    console.log("Select");
    console.log(args);

    if (args.length === 0) {
        console.log("zero arguments");
        await vscode.commands.executeCommand('editor.action.smartSelect.grow');
        console.log("selection growed");
        return dictationMode.other;
    }


    return dictationMode.other;
}
