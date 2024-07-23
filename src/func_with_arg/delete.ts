import * as vscode from 'vscode';
import { dictationMode } from '../functions';

// Function to delete the current selection in the active editor
async function deleteCurrentSelection() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const selection = editor.selection;
        await editor.edit(editBuilder => {
            editBuilder.delete(selection);
        });
    }
}

// Function to delete the current selection or the character at the cursor position if there is no selection
async function deleteSelectionOrCharacter() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const selection = editor.selection;
        const document = editor.document;
        // Check if the selection is empty (cursor position with no selection)
        if (selection.isEmpty) {
            // delete the character before the cursor
            // Cursor is at the beginning of the document
            if (selection.active.character === 0 && selection.active.line === 0) {
                return;
            }
            // Cursor is at the beginning of the line but not the first line of the document
            if (selection.active.character === 0 && selection.active.line > 0) {
                const currentLine = selection.active.line;
                const endOfPreviousLine = document.lineAt(currentLine - 1).range.end;
                const rangeToDelete = new vscode.Range(endOfPreviousLine, selection.active);

                await editor.edit(editBuilder => {
                    editBuilder.delete(rangeToDelete);
                });
            }
            // if the cursor is not at the beginning of the line
            else if (selection.active.character > 0) {
                // Calculate the position for the previous character to delete
                const prevCharPosition = selection.active.translate(0, -1);
                const prevCharRange = new vscode.Range(prevCharPosition, selection.active);
                // Delete the previous character
                await editor.edit(editBuilder => {
                    editBuilder.delete(prevCharRange);
                });
            }
            
        } else {
            // Delete the current selection
            await editor.edit(editBuilder => {
                editBuilder.delete(selection);
            });
        }
    }
}

export default async function DELETE(args: any[]): Promise<dictationMode> {
    try {
        deleteSelectionOrCharacter();
        return dictationMode.other;
    } catch (err) {
        console.log(err);
        return dictationMode.execution_failed;
    }

}
