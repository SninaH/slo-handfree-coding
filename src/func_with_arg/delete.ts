import * as vscode from 'vscode';

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
        // Check if the selection is empty (cursor position with no selection)
        if (selection.isEmpty) {
            // Calculate the position for the next character to delete
            const nextCharPosition = selection.active.translate(0, 1);
            const nextCharRange = new vscode.Range(selection.active, nextCharPosition);
            // Delete the next character
            await editor.edit(editBuilder => {
                editBuilder.delete(nextCharRange);
            });
        } else {
            // Delete the current selection
            await editor.edit(editBuilder => {
                editBuilder.delete(selection);
            });
        }
    }
}