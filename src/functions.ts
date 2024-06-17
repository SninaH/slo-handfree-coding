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
    const numbers = vscode.workspace.getConfiguration('slo-handsfree-coding').get('numbersName') as { [key: string]: string };
    const keyPairs = [];
    for (let key1 in numbers) {
        for (let key2 in numbers) {
            if (key1 !== key2) {
                keyPairs.push(`${key1}\\s+${key2}`);
            }
        }
    }
    const regex = new RegExp(keyPairs.join('|'), 'g');
    text = text.replace(regex, match => {
        const [key1, key2] = match.split(/\s+/);
        return `${numbers[key1]}${key2}`;
    });
    text = text.replace(new RegExp(Object.keys(numbers).join('|'), 'g'), match => numbers[match]);
    return text;
};

export const functions = {
    insert_plain_text: (args: any[]): dictationMode => {
        if (args.length !== 1 || typeof args[0] !== 'string') {
            console.error('Invalid arguments for insert_plain_text. Expected 1 argument of type string.');
            return dictationMode.execution_failed;
        }
        const text = args[0];
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            editor.edit(editBuilder => {
                editBuilder.insert(editor.selection.active, text);
            });
        }
        return dictationMode.dictate_without_special_characters;
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
    insert: (args: any[]): dictationMode => {
        if (args.length !== 1 || typeof args[0] !== 'string') {
            console.error('Invalid arguments for insert. Expected 1 argument of type string.');
            return dictationMode.execution_failed;
        }


        let text = args[0];
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            //TODO: check all special characters and numbers
            text = changeSpecialCharacters(text);
            text = changeNumbers(text);

            editor.edit(editBuilder => {
                editBuilder.insert(editor.selection.active, text);
            });
        }
        return dictationMode.dictate;
    },
    SETTINGS: (args: any[]): dictationMode => {
        if (args.length !== 0) {
            console.error('Invalid arguments for SETTINGS. Expected 0 arguments');
            return dictationMode.execution_failed;
        } else {
            vscode.commands.executeCommand('workbench.action.openSettings');
            return dictationMode.other;
        }
    }

};