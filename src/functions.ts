import * as vscode from 'vscode';
import GO from './func_with_arg/go';
import TERMINAL from './func_with_arg/terminal';
import SELECT from './func_with_arg/select';
import DELETE from './func_with_arg/delete';
import NEW from './func_with_arg/new';
import ADD from './func_with_arg/add';
import SUGGESTION from './func_with_arg/suggestion';
import { CAMEL_CASE, SNAKE_CASE, CAPS_LOCK } from './func_with_arg/case';


export const enum dictationMode {
    dictate,
    dictate_without_special_characters,
    spell,
    spell_uppercase,
    stop,
    other,
    no_command_found,
    function_not_found,
    execution_failed,
    invalid_arguments,
    no_active_editor,
    stop_dictating
}


/**
 * /change keys with values so that it prioritizes longer keys (for example 'enojni narekovaj' before 'narekovaj')
 * 
 * @param text - the text in which we want to change the keys with values
 * @param obj - object with keys and values that we want to change in text
 * @param allowedKeywords - array of allowed values that we want to change in text
 * @returns text with changed keys with values
 */
export const changeKeyWithObjectValue = (text: string, obj: { [key: string]: string }, allowedKeywords?: string[]): string => {
    if (allowedKeywords !== undefined) {
        obj = Object.fromEntries(Object.entries(obj).filter(([key, value]) => allowedKeywords.includes(value)));
    }
    // Change keys with values so that it prioritizes longer keys (for example 'enojni narekovaj' before 'narekovaj')
    const keysSortedByLengthDesc = Object.keys(obj).sort((a, b) => b.length - a.length);
    // Adjusted regex to manually specify word boundaries for non-ASCII characters
    const regex = new RegExp(`(?<=\\s|^)(${keysSortedByLengthDesc.join('|')})(?=\\s|$)`, 'g');
    return text.replace(regex, match => obj[match]); // Replace method returns new string
};

export const changeFirstOccurence = (text: string, obj: { [key: string]: string }, allowedKeywords?: string[], multipleOccurence?: string[]): string => {
    if (allowedKeywords !== undefined) {
        obj = Object.fromEntries(Object.entries(obj).filter(([key, value]) => allowedKeywords.includes(value)));
    }
    // Change keys with values so that it prioritizes longer keys (for example 'enojni narekovaj' before 'narekovaj')
    // Find and change key with value only for the first occurrence of the key except for key that has value in multipleOccurrence
    const keysSortedByLengthDesc = Object.keys(obj).sort((a, b) => b.length - a.length);
    // Adjusted regex to manually specify word boundaries for non-ASCII characters
    const regex = new RegExp(`(?<=\\s|^)(${keysSortedByLengthDesc.join('|')})(?=\\s|$)`, 'g');
    let usedValue: Set<string> = new Set();
    return text.replace(regex, match => {
        if (multipleOccurence && multipleOccurence.includes(obj[match])) {
            return obj[match];
        }
        if (!usedValue.has(obj[match])) {
            usedValue.add(obj[match]);
            return obj[match];
        }
        return match;
    });
};

export const changeSpecialCharacters = (text: string): string => {
    const special_characters = vscode.workspace.getConfiguration('slo-handsfree-coding').get('specialCharactersName') as { [key: string]: string };
    return changeKeyWithObjectValue(text, special_characters);
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

//TODO check in every function that needs editor if the editor is active
export const functions = {
    /**
     * function that inserts plain text into the editor
     * @param args - array of single element - text that we want to insert
     * @returns dictate_without_special_characters if the function was successful, no_active_editor if there is no active editor, invalid_arguments if the arguments are invalid
     */
    insert_plain_text: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 1 || typeof args[0] !== 'string') {
            console.error('Invalid arguments for insert_plain_text. Expected 1 argument of type string.');
            return dictationMode.invalid_arguments;
        }
        const text = args[0];
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            await editor.edit(editBuilder => {
                editBuilder.insert(editor.selection.active, text);
            });
            return dictationMode.dictate_without_special_characters;
        } else {
            return dictationMode.no_active_editor;
        }

    },
    insert: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 1 || typeof args[0] !== 'string') {
            console.error('Invalid arguments for insert. Expected 1 argument of type string.');
            return dictationMode.invalid_arguments;
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
            return dictationMode.dictate;
        } else {
            return dictationMode.no_active_editor;
        }

    },
    /**
     * function that turns every word in text into its first letter and removes spaces
     * @example spelling("Hello world") // Hw
     * @example spelling("testo indija most energija") // time
     */
    spelling: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 2 || typeof args[0] !== 'boolean' || typeof args[1] !== 'string') {
            console.error('Invalid arguments for spelling. Expected 1 argument of type string.');
            return dictationMode.invalid_arguments;
        }
        const text: string = args[1];
        const matches = text.match(/\b\w/g);
        let formattedText = matches ? matches.join('') : '';
        if (args[0]) {
            formattedText = formattedText.toUpperCase();
        }
        const success = await functions.insert_plain_text([formattedText]);
        return (success === dictationMode.dictate_without_special_characters) ? dictationMode.spell : success;
    },
    DICTATE_WITHOUT_SPECIAL_CHARACTERS: (args: any[]): dictationMode => {
        if (args.length !== 0) {
            console.error('Invalid arguments for DICTATE_WITHOUT_SPECIAL_CHARACTERS. Expected 0 arguments');
            return dictationMode.invalid_arguments;
        } else {
            return dictationMode.dictate_without_special_characters;
        }
    },
    DICTATE: (args: any[]): dictationMode => {
        if (args.length !== 0) {
            console.error('Invalid arguments for DICTATE. Expected 0 arguments');
            return dictationMode.invalid_arguments;
        } else {
            return dictationMode.dictate;
        }
    },
    SPELL: (args: any[]): dictationMode => {
        if (args.length !== 0) {
            console.error('Invalid arguments for SPELL. Expected 0 arguments');
            return dictationMode.invalid_arguments;
        } else {
            return dictationMode.spell;
        }
    },
    SPELL_UPPERCASE: (args: any[]): dictationMode => {
        if (args.length !== 0) {
            console.error('Invalid arguments for SPELL_UPPERCASE. Expected 0 arguments');
            return dictationMode.invalid_arguments;
        } else {
            return dictationMode.spell_uppercase;
        }
    },

    STOP: (args: any[]): dictationMode => {
        if (args.length !== 0) {
            console.error('Invalid arguments for STOP. Expected 0 arguments');
            return dictationMode.invalid_arguments;
        } else {
            return dictationMode.stop;
        }
    },

    SETTINGS: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for SETTINGS. Expected 0 arguments');
            return dictationMode.invalid_arguments;
        } else {
            // Open settings with search bar filled with 'slo-handsfree-coding' so that it opens the extension settings
            await vscode.commands.executeCommand('workbench.action.openSettings', 'slo-handsfree-coding');
            return dictationMode.other;
        }
    },
    // close tab like Ctrl + W
    CLOSE_TAB: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for SETTINGS. Expected 0 arguments');
            return dictationMode.invalid_arguments;
        } else {
            await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
            return dictationMode.other;
        }
    },
    CLOSE_WINDOW: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for CLOSE_WINDOW. Expected 0 arguments');
            return dictationMode.invalid_arguments;
        } else {
            await vscode.commands.executeCommand('workbench.action.closeWindow');
            return dictationMode.other;
        }
    },
    NEW_WINDOW: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for NEW_WINDOW. Expected 0 arguments');
            return dictationMode.invalid_arguments;
        } else {
            await vscode.commands.executeCommand('workbench.action.newWindow');
            return dictationMode.other;
        }
    },
    NEW_FILE: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for NEW_FILE. Expected 0 arguments');
            return dictationMode.invalid_arguments;
        } else {
            await vscode.commands.executeCommand('workbench.action.files.newUntitledFile');
            return dictationMode.other;
        }
    },
    // Save file like Ctrl + S
    SAVE_FILE: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for SAVE_FILE. Expected 0 arguments');
            return dictationMode.invalid_arguments;
        } else {
            await vscode.commands.executeCommand('workbench.action.files.save');
            return dictationMode.other;
        }
    },
    // Save file as like Ctrl + Shift + S
    SAVE_FILE_AS: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for SAVE_FILE_AS. Expected 0 arguments');
            return dictationMode.invalid_arguments;
        } else {
            await vscode.commands.executeCommand('workbench.action.files.saveAs');
            return dictationMode.other;
        }
    },
    // Copy like Ctrl + C
    COPY: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for COPY. Expected 0 arguments');
            return dictationMode.invalid_arguments;
        } else {
            await vscode.commands.executeCommand('editor.action.clipboardCopyAction');
            return dictationMode.other;
        }
    },
    // Cut like Ctrl + X
    CUT: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for CUT. Expected 0 arguments');
            return dictationMode.invalid_arguments;
        } else {
            await vscode.commands.executeCommand('editor.action.clipboardCutAction');
            return dictationMode.other;
        }
    },
    // Paste like Ctrl + V
    PASTE: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for PASTE. Expected 0 arguments');
            return dictationMode.invalid_arguments;
        } else {
            await vscode.commands.executeCommand('editor.action.clipboardPasteAction');
            return dictationMode.other;
        }
    },
    // Undo like Ctrl + Z
    UNDO: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for UNDO. Expected 0 arguments');
            return dictationMode.invalid_arguments;
        } else {
            await vscode.commands.executeCommand('undo');
            return dictationMode.other;
        }
    },
    // Redo like Ctrl + Y
    REDO: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for REDO. Expected 0 arguments');
            return dictationMode.invalid_arguments;
        } else {
            await vscode.commands.executeCommand('redo');
            return dictationMode.other;
        }
    },
    // format document like Ctrl + Shift + I
    FORMAT: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for FORMAT. Expected 0 arguments');
            return dictationMode.invalid_arguments;
        } else {
            await vscode.commands.executeCommand('editor.action.formatDocument');
            return dictationMode.other;
        }
    },

    SHIFT: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for SHIFT. Expected 0 arguments');
            return dictationMode.invalid_arguments;
        }
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return dictationMode.no_active_editor;
        }
        if (!editor.selection.isEmpty) {
            const document = editor.document;
            const selection = editor.selection;
            const selectedText = document.getText(selection);

            // Determine tab replacement (tab character or spaces)
            const useSpaces = editor.options.insertSpaces as boolean;
            const tabSize = editor.options.tabSize as number;
            const tabReplacement = useSpaces ? ' '.repeat(tabSize) : '\t';

            // Prepend tab or spaces to each line of the selected text
            const shiftedText = selectedText.split('\n').map(line => tabReplacement + line).join('\n');

            // Replace the selected text with the shifted text
            await editor.edit(editBuilder => {
                editBuilder.replace(selection, shiftedText);
            });
        }
        return dictationMode.other;
    },
    SHIFT_LEFT: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for SHIFT_LEFT. Expected 0 arguments');
            return dictationMode.invalid_arguments;
        }
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return dictationMode.no_active_editor;
        }
        if (!editor.selection.isEmpty) {
            const document = editor.document;
            const selection = editor.selection;
            const selectedText = document.getText(selection);

            // Determine tab replacement (tab character or spaces)
            const useSpaces = editor.options.insertSpaces as boolean;
            const tabSize = editor.options.tabSize as number;
            const tabReplacement = useSpaces ? ' '.repeat(tabSize) : '\t';

            // Remove tab or spaces from the beginning of each line of the selected text
            const shiftedText = selectedText.split('\n').map(line => line.replace(new RegExp(`^${tabReplacement}`), '')).join('\n');

            // Replace the selected text with the shifted text
            await editor.edit(editBuilder => {
                editBuilder.replace(selection, shiftedText);
            });
        }
        return dictationMode.other;
    },


    OPEN: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for OPEN. Expected 0 arguments');
            return dictationMode.invalid_arguments;
        } else {
            await vscode.commands.executeCommand('workbench.action.files.openFile');
            return dictationMode.other;
        }
    },

    SHOW_OUTPUT_CHANNEL: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 1) {
            console.error('Invalid arguments for SHOW_OUTPUT_CHANNEL. Expected 1 argument');
            return dictationMode.invalid_arguments;
        } else {
            const outputChannel:vscode.OutputChannel = args[0];
            outputChannel.show();
            return dictationMode.other;
        }
    },

    HIDE_OUTPUT_CHANNEL: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for HIDE_OUTPUT_CHANNEL. Expected 0 arguments');
            return dictationMode.invalid_arguments;
        } else {
            await vscode.commands.executeCommand('workbench.action.closePanel');
            return dictationMode.other;
        }
    },

    ///////////////////////////////////////////////
    // debug related functions
    ///////////////////////////////////////////////
    DEBUGGER_BREAKPOINT: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for BREAKPOINT. Expected 0 arguments');
            return dictationMode.invalid_arguments;
        } else {
            await vscode.commands.executeCommand('editor.debug.action.toggleBreakpoint');
            return dictationMode.other;
        }
    },

    DEBUGGER_CONTINUE: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for BREAKPOINT. Expected 0 arguments');
            return dictationMode.invalid_arguments;
        } else {
            await vscode.commands.executeCommand("workbench.action.debug.continue");
            return dictationMode.other;
        }
    },

    DEBUGGER_INLINE_BREAKPOINT: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for DEBUGGER_INLINE_BREAKPOINT. Expected 0 arguments');
            return dictationMode.invalid_arguments;
        } else {
            await vscode.commands.executeCommand("editor.debug.action.toggleInlineBreakpoint");
            return dictationMode.other;
        }
    },

    DEBUGGER_PAUSE: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for DEBUGGER_PAUSE. Expected 0 arguments');
            return dictationMode.invalid_arguments;
        } else {
            await vscode.commands.executeCommand("workbench.action.debug.pause");
            return dictationMode.other;
        }
    },

    DEBUGGER_SHOW_HOVER: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for DEBUGGER_SHOW_HOVER. Expected 0 arguments');
            return dictationMode.invalid_arguments;
        } else {
            await vscode.commands.executeCommand("editor.debug.action.showDebugHover");
            return dictationMode.other;
        }
    },

    DEBUGGER_START: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for DEBUGGER_START. Expected 0 arguments');
            return dictationMode.invalid_arguments;
        } else {
            await vscode.commands.executeCommand("workbench.action.debug.start");
            return dictationMode.other;
        }
    },
    DEBUGGER_STEP_INTO: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for DEBUGGER_STEP_INTO. Expected 0 arguments');
            return dictationMode.invalid_arguments;
        } else {
            await vscode.commands.executeCommand("workbench.action.debug.stepInto");
            return dictationMode.other;
        }
    },

    DEBUGGER_STEP_OUT: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for DEBUGGER_STEP_OUT. Expected 0 arguments');
            return dictationMode.invalid_arguments;
        } else {
            await vscode.commands.executeCommand("workbench.action.debug.stepOut");
            return dictationMode.other;
        }
    },

    DEBUGGER_STEP_OVER: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for DEBUGGER_STEP_OVER. Expected 0 arguments');
            return dictationMode.invalid_arguments;
        } else {
            await vscode.commands.executeCommand("workbench.action.debug.stepOver");
            return dictationMode.other;
        }
    },

    DEBUGGER_STOP: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for DEBUGGER_STOP. Expected 0 arguments');
            return dictationMode.invalid_arguments;
        } else {
            await vscode.commands.executeCommand("workbench.action.debug.stop");
            return dictationMode.other;
        }
    },

    ///////////////////////////////////////////////////////
    // from here on are terminal related functions
    ///////////////////////////////////////////////////////
    EXECUTE_TEXT_IN_EDITOR: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for EXECUTE. Expected 0 arguments');
            return dictationMode.invalid_arguments;
        }
        //execute whats written in editor
        const terminal = vscode.window.activeTerminal || vscode.window.createTerminal();
        terminal.show();
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const text = editor.document.getText();
            terminal.sendText(text + '\n');
            return dictationMode.other;
        } else {
            return dictationMode.no_active_editor;
        }

    },
    EXECUTE_SELECTED_TEXT_IN_EDITOR: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for EXECUTE_SELECTED_TEXT_IN_EDITOR. Expected 0 arguments');
            return dictationMode.invalid_arguments;
        }
        //execute selected text in editor
        const terminal = vscode.window.activeTerminal || vscode.window.createTerminal();
        terminal.show();
        vscode.commands.executeCommand('workbench.action.terminal.runSelectedText');
        return dictationMode.other;
    },


    ///////////////////////////////////////////////////////
    // from here on are functions with arguments
    ///////////////////////////////////////////////////////

    EXECUTE: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 1 || typeof args[0] !== 'string') {
            console.error('Invalid arguments for EXECUTE. Expected 1 argument of type string.');
            return dictationMode.invalid_arguments;
        }
        const command = args[0];
        const terminal = vscode.window.activeTerminal || vscode.window.createTerminal();
        terminal.show();
        terminal.sendText(command);
        return dictationMode.other;
    },

    ADD_SELECTED_TEXT_AS_TERMINAL_ACTION: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 1) {
            console.error('Invalid arguments for ADD_SELECTED_TEXT_AS_TERMINAL_ACTION. Expected 1 argument');
            return dictationMode.invalid_arguments;
        }
        //add selected text as terminal action
        //get selected text from editor
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const text = editor.document.getText(editor.selection);
            //add selected text to settings terminalOperationName as value with key from args
            const config = vscode.workspace.getConfiguration('slo-handsfree-coding');
            const terminalOperations = config.get<{ [key: string]: string }>('terminalOperationName', {});
            const updatedOperations = { ...terminalOperations };
            updatedOperations[args[0]] = text;
            console.log(`selected text ${text} added as terminal action with key ${args[0]}`);
            await config.update('terminalOperationName', updatedOperations, vscode.ConfigurationTarget.Global);
            console.log(config.get<{ [key: string]: string }>('terminalOperationName', {}));
            return dictationMode.other;
        } else {
            return dictationMode.no_active_editor;
        }
    },

    COMMAND: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 1) {
            console.error('Invalid arguments for COMMAND. Expected 1 argument');
            return dictationMode.invalid_arguments;
        }
        //execute command from args
        await vscode.commands.executeCommand(args[0]);
        return dictationMode.other;
    },

    ADD_SELECTED_TEXT_AS_VSCODE_COMMAND: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 1) {
            console.error('Invalid arguments for ADD_SELECTED_TEXT_AS_VSCODE_COMMAND. Expected 1 argument');
            return dictationMode.invalid_arguments;
        }
        //add selected text as vscode command
        //get selected text from editor
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const text = editor.document.getText(editor.selection);
            //add selected text to settings vscodeCommands as value with key from args
            const config = vscode.workspace.getConfiguration('slo-handsfree-coding');
            const vscodeCommands = config.get<{ [key: string]: string }>('vscodeCommandsName', {});
            const updatedCommands = { ...vscodeCommands };
            updatedCommands[args[0]] = text;
            console.log(`selected text ${text} added as vscode command with key ${args[0]}`);
            await config.update('vscodeCommandsName', updatedCommands, vscode.ConfigurationTarget.Global);
            console.log(config.get<{ [key: string]: string }>('vscodeCommandsName', {}));

            return dictationMode.other;
        } else {
            return dictationMode.no_active_editor;
        }
    },

    GO: GO, //imported at the top of document
    TERMINAL: TERMINAL, //imported at the top of document
    SELECT: SELECT, //imported at the top of document
    DELETE: DELETE, //imported at the top of document
    SNAKE_CASE: SNAKE_CASE, //imported at the top of document
    CAMEL_CASE: CAMEL_CASE, //imported at the top of document
    CAPS_LOCK: CAPS_LOCK, //imported at the top of document
    NEW: NEW, //imported at the top of document
    ADD: ADD, //imported at the top of document
    SUGGESTION: SUGGESTION, //imported at the top of document

};
