import * as vscode from 'vscode';

export const enum dictationMode {
    dictate,
    dictate_without_special_characters,
    stop,
    other,
    no_command_found,
    function_not_found,
    execution_failed,
    stop_dictating
}

export const changeSpecialCharacters = (text: string): string => {
    const special_characters = vscode.workspace.getConfiguration('slo-handsfree-coding').get('specialCharactersName') as { [key: string]: string };
    const keysSortedByLengthDesc = Object.keys(special_characters).sort((a, b) => b.length - a.length);
    const regex = new RegExp(keysSortedByLengthDesc.join('|'), 'g');
    text = text.replace(regex, match => special_characters[match]);
    return text;
};

export const changeNumbers = (text: string): string => {
    // Get numbers object from settings
    const numbersObj = vscode.workspace.getConfiguration('slo-handsfree-coding').get('numbersName') as { [key: string]: string };
    // Replace keys with values
    let replacedText = text;
    for (const key in numbersObj) {
        const value = numbersObj[key];
        // Use Unicode property escapes to match whole words, including those with UTF-8 characters
        const regex = new RegExp(`(?<=\\P{L}|^)${key}(?=\\P{L}|$)`, 'gu'); // Adjusted to handle UTF-8 characters
        replacedText = replacedText.replace(regex, value);
    }

    // Remove spaces between numbers
    replacedText = replacedText.replace(/(\d)\s+(?=\d)/g, "$1");

    return replacedText;
};

export const functions = {
    insert_plain_text: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 1 || typeof args[0] !== 'string') {
            console.error('Invalid arguments for insert_plain_text. Expected 1 argument of type string.');
            return dictationMode.execution_failed;
        }
        const text = args[0];
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            await editor.edit(editBuilder => {
                editBuilder.insert(editor.selection.active, text);
            });
        }
        return dictationMode.dictate_without_special_characters;
    },
    insert: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 1 || typeof args[0] !== 'string') {
            console.error('Invalid arguments for insert. Expected 1 argument of type string.');
            return dictationMode.execution_failed;
        }

        let text = args[0];
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            //check all special characters and numbers
            text = changeNumbers(text);
            text = changeSpecialCharacters(text);

            await editor.edit(editBuilder => {
                editBuilder.insert(editor.selection.active, text);
            });
        }
        return dictationMode.dictate;
    },
    DICTATE_WITHOUT_SPECIAL_CHARACTERS: (args: any[]): dictationMode => {
        if (args.length !== 0) {
            console.error('Invalid arguments for DICTATE_WITHOUT_SPECIAL_CHARACTERS. Expected 0 arguments');
            return dictationMode.execution_failed;
        } else {
            return dictationMode.dictate_without_special_characters;
        }
    },
    DICTATE: (args: any[]): dictationMode => {
        if (args.length !== 0) {
            console.error('Invalid arguments for DICTATE. Expected 0 arguments');
            return dictationMode.execution_failed;
        } else {
            return dictationMode.dictate;
        }
    },
    STOP: (args: any[]): dictationMode => {
        if (args.length !== 0) {
            console.error('Invalid arguments for STOP. Expected 0 arguments');
            return dictationMode.execution_failed;
        } else {
            return dictationMode.stop;
        }
    },

    SETTINGS: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for SETTINGS. Expected 0 arguments');
            return dictationMode.execution_failed;
        } else {
            // Open settings with search bar filled with 'slo-handsfree-coding' so that it opens the extension settings
            await vscode.commands.executeCommand('workbench.action.openSettings', 'slo-handsfree-coding');
            return dictationMode.other;
        }
    },
    CLOSE_TAB: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for SETTINGS. Expected 0 arguments');
            return dictationMode.execution_failed;
        } else {
            await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
            return dictationMode.other;
        }
    },
    CLOSE_WINDOW: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for CLOSE_WINDOW. Expected 0 arguments');
            return dictationMode.execution_failed;
        } else {
            await vscode.commands.executeCommand('workbench.action.closeWindow');
            return dictationMode.other;
        }
    },
    NEW_WINDOW: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for NEW_WINDOW. Expected 0 arguments');
            return dictationMode.execution_failed;
        } else {
            await vscode.commands.executeCommand('workbench.action.newWindow');
            return dictationMode.other;
        }
    },
    NEW_FILE: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for NEW_FILE. Expected 0 arguments');
            return dictationMode.execution_failed;
        } else {
            await vscode.commands.executeCommand('workbench.action.files.newUntitledFile');
            return dictationMode.other;
        }
    },
    // Save file like Ctrl + S
    SAVE_FILE: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for SAVE_FILE. Expected 0 arguments');
            return dictationMode.execution_failed;
        } else {
            await vscode.commands.executeCommand('workbench.action.files.save');
            return dictationMode.other;
        }
    },
    // Save file as like Ctrl + Shift + S
    SAVE_FILE_AS: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for SAVE_FILE_AS. Expected 0 arguments');
            return dictationMode.execution_failed;
        } else {
            await vscode.commands.executeCommand('workbench.action.files.saveAs');
            return dictationMode.other;
        }
    },
    // Copy like Ctrl + C
    COPY: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for COPY. Expected 0 arguments');
            return dictationMode.execution_failed;
        } else {
            await vscode.commands.executeCommand('editor.action.clipboardCopyAction');
            return dictationMode.other;
        }
    },
    // Cut like Ctrl + X
    CUT: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for CUT. Expected 0 arguments');
            return dictationMode.execution_failed;
        } else {
            await vscode.commands.executeCommand('editor.action.clipboardCutAction');
            return dictationMode.other;
        }
    },
    // Paste like Ctrl + V
    PASTE: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for PASTE. Expected 0 arguments');
            return dictationMode.execution_failed;
        } else {
            await vscode.commands.executeCommand('editor.action.clipboardPasteAction');
            return dictationMode.other;
        }
    },
    // Undo like Ctrl + Z
    UNDO: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for UNDO. Expected 0 arguments');
            return dictationMode.execution_failed;
        } else {
            await vscode.commands.executeCommand('undo');
            return dictationMode.other;
        }
    },
    // Redo like Ctrl + Y
    REDO: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for REDO. Expected 0 arguments');
            return dictationMode.execution_failed;
        } else {
            await vscode.commands.executeCommand('redo');
            return dictationMode.other;
        }
    },
};
