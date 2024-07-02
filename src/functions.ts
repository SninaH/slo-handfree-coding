import * as vscode from 'vscode';

/**
 * Enum representing the dictation mode.
 */
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

/**
 * Enum representing the keyword.
 */
enum keyword {
    dir,
    pyObj,
    vsObj,
    none,
    number
}

/**
 * Enum representing the function type.
 */
enum functionType {
    go,
    select
}

/**
 * Array of directions.
 */
const directions = ["UP", "DOWN", "LEFT", "RIGHT", "START", "END", "NEXT", "PREVIOUS"];

/**
 * Array of Python objects.
 */
const pythonOjects = [
    "CLASS",
    "CONSTANT",
    "DICTIONARY",
    "ELSE",
    "FLOAT",
    "FROM",
    "FUNCTION",
    "IF",
    "IMPORT",
    "INPUT",
    "INTEGER",
    "KEY",
    "LIST",
    "METHOD",
    "PRINT",
    "STRING",
    "VALUE",
    "VARIABLE",
    "WHILE",
    "TYPE"
];

/**
 * Array of VSCode objects.
 */
const vscodeObjects = ["LINE", "FILE", "VIEW_PORT", "BLANK_LINE", "TAB", "DEFINITION", "PAGE"];

/**
 * Moves the cursor in the specified direction.
 * @param direction The direction to move the cursor.
 * @returns A promise that resolves to a boolean indicating if the cursor was moved successfully.
 */
async function goInDirection(direction: string): Promise<boolean> {
    switch (direction) {
        case "UP":
        case "DOWN":
            await vscode.commands.executeCommand('cursorMove', {
                to: direction.toLowerCase(),
                by: 'line',
                value: 1,
            });
            return true;
        case "LEFT":
        case "RIGHT":
            await vscode.commands.executeCommand('cursorMove', {
                to: direction.toLowerCase(),
                by: 'character',
                value: 1,
            });
            return true;
        case "START":
            await vscode.commands.executeCommand('cursorMove', {
                to: 'wrappedLineStart',
            });
            return true;
        case "END":
            await vscode.commands.executeCommand('cursorMove', {
                to: 'wrappedLineEnd',
            });
            return true;
        case "NEXT":
            await vscode.commands.executeCommand('workbench.action.navigateForward');
            return true;
        case "PREVIOUS":
            await vscode.commands.executeCommand('workbench.action.navigateBack');
            return true;
        default:
            return false;
    }
}

/**
 * Moves the cursor in the specified direction for a specified number of times.
 * @param direction The direction to move the cursor.
 * @param num The number of times to move the cursor.
 * @returns A promise that resolves to a boolean indicating if the cursor was moved successfully.
 */
async function goInDirectionFor(direction: string, num: number): Promise<boolean> {
    switch (direction) {
        case "UP":
        case "DOWN":
            await vscode.commands.executeCommand('cursorMove', {
                to: direction.toLowerCase(),
                by: 'line',
                value: num,
            });
            return true;
        case "LEFT":
        case "RIGHT":
            await vscode.commands.executeCommand('cursorMove', {
                to: direction.toLowerCase(),
                by: 'character',
                value: num,
            });
            return true;
        default:
            return false;
    }
}

/**
 * Moves the cursor to the specified line number.
 * @param lineNumber The line number to move the cursor to.
 * @returns A promise that resolves when the cursor is moved successfully.
 */
async function moveToLine(lineNumber: number): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const position = new vscode.Position(lineNumber - 1, 0); // Lines are zero-indexed
        if (position.isAfterOrEqual(editor.document.lineAt(editor.document.lineCount - 1).range.end)) {
            // Position is beyond the last line of the document
            return;
        }
        editor.selection = new vscode.Selection(position, position);
        editor.revealRange(new vscode.Range(position, position)); // Scrolls to the position
    } else {
        console.error('No active editor');
    }
}

/**
 * Moves the specified object in the specified direction.
 * @param obj The object to move.
 * @param dir The direction to move the object.
 * @returns A promise that resolves to a boolean indicating if the object was moved successfully.
 */
async function moveObjDir(obj: string, dir: string) {
    switch (obj + "|" + dir) {
        case "LINE|START":
            await vscode.commands.executeCommand('cursorMove', {
                to: 'wrappedLineFirstNonWhitespaceCharacter',
            });
            return true;
        case "LINE|END":
            await vscode.commands.executeCommand('cursorMove', {
                to: 'wrappedLineLastNonWhitespaceCharacter',
            });
            return true;
        case "LINE|UP":
        case "LINE|PREVIOUS":
            await vscode.commands.executeCommand('cursorMove', {
                to: 'up',
                by: 'line',
            });
            return true;
        case "LINE|NEXT":
        case "LINE|DOWN":
            await vscode.commands.executeCommand('cursorMove', {
                to: 'down',
                by: 'line',
            });
            return true;
        case "FILE|START":
            await vscode.commands.executeCommand('cursorMove', {
                to: 'viewPortTop',
            });
            return true;
        case "FILE|END":
            await vscode.commands.executeCommand('cursorMove', {
                to: 'viewPortBottom',
            });
            return true;
        case "VIEW_PORT|START":
            await vscode.commands.executeCommand('cursorMove', {
                to: 'viewPortTop',
            });
            return true;
        case "VIEW_PORT|END":
            await vscode.commands.executeCommand('cursorMove', {
                to: 'viewPortBottom',
            });
            return true;
        case "PAGE|UP":
        case "PAGE|PREVIOUS":
            await vscode.commands.executeCommand('editorScroll', {
                to: 'up',
                by: 'page',
                revealCursor: true
            });
        case "PAGE|NEXT":
        case "PAGE|DOWN":
            await vscode.commands.executeCommand('editorScroll', {
                to: 'down',
                by: 'page',
                revealCursor: true
            });
        case "BLANK_LINE|UP":
        case "BLANK_LINE|PREVIOUS":
            await vscode.commands.executeCommand('cursorMove', {
                to: 'prevBlankLine',
            });
            return true;
        case "BLANK_LINE|DOWN":
        case "BLANK_LINE|NEXT":
            await vscode.commands.executeCommand('cursorMove', {
                to: 'nextBlankLine',
            });
            return true;
        case "TAB|RIGHT":
        case "TAB|NEXT":
            await vscode.commands.executeCommand('workbench.action.nextEditor');
            return true;
        case "TAB|LEFT":
        case "TAB|PREVIOUS":
            await vscode.commands.executeCommand('workbench.action.previousEditor');
            return true;
        default:
            return false;
    }
}

/**
 * Moves the specified object.
 * @param obj The object to move.
 * @returns A promise that resolves to a boolean indicating if the object was moved successfully.
 */
async function moveObj(obj: string): Promise<boolean> {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        switch (obj) {
            // Add cases for moving specific objects
            default:
                return false;
        }
    } else {
        console.error('No active editor');
        return false;
    }
}

/**
 * Moves the specified number in the specified direction.
 * @param num The number to move.
 * @param dir The direction to move the number.
 */
async function moveNumDir(num: number, dir: string) {
    // Implement moving number in the specified direction
}



enum unneededArgs {
    num,
    obj,
    dir,
    none,
    noEditor,
    other
}
/**
 * Moves by specified number by object in direction.
 * @param num The number to move.
 * @param obj The object to move.
 * @param dir The direction to move the number and object.
 * @returns A promise that resolves to an enum indicating if any arguments are unneeded.
 */
async function moveNumObjDir(num: number, obj: string, dir: string): Promise<unneededArgs> {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        switch (dir) {
            case "START":
            case "END":
            case "PREVIOUS":
            case "NEXT":
                return unneededArgs.num;
        }
        switch (obj) {
            case "FILE":
                return unneededArgs.obj;
        }
        switch (obj + "|" + dir) {
            case "LINE|UP":
                await vscode.commands.executeCommand('cursorMove', {
                    to: 'up',
                    by: 'line',
                    value: num,
                });
                return unneededArgs.none;
            case "LINE|DOWN":
                await vscode.commands.executeCommand('cursorMove', {
                    to: 'down',
                    by: 'line',
                    value: num,
                });
                return unneededArgs.none;
            case "PAGE|UP":
                if (num < 9) {
                    await vscode.commands.executeCommand('editorScroll', {
                        to: 'up',
                        by: 'page',
                        revealCursor: true
                    });
                    return unneededArgs.none;
                } else {
                    return unneededArgs.num;
                }
            case "PAGE|DOWN":
                await vscode.commands.executeCommand('editorScroll', {
                    to: 'down',
                    by: 'page',
                    revealCursor: true
                });
                return unneededArgs.none;
            case "BLANK_LINE|UP":
                if (num < 9) {
                    await vscode.commands.executeCommand('cursorMove', {
                        to: 'prevBlankLine',
                    });
                    return unneededArgs.none;
                } else {
                    return unneededArgs.num;
                }
            case "BLANK_LINE|DOWN":
                if (num < 9) {
                    await vscode.commands.executeCommand('cursorMove', {
                        to: 'nextBlankLine',
                    });
                    return unneededArgs.none;
                } else {
                    return unneededArgs.num;
                }
            case "TAB|RIGHT":
                if (num < 9) {
                    await vscode.commands.executeCommand('workbench.action.nextEditor');
                    return unneededArgs.none;
                } else {
                    return unneededArgs.num;
                }
            case "TAB|LEFT":
                if (num < 9) {
                    await vscode.commands.executeCommand('workbench.action.previousEditor');
                    return unneededArgs.none;
                } else {
                    return unneededArgs.num;
                }
            case "LINE|RIGHT":
            case "LINE|LEFT":
                return unneededArgs.dir;
            default:
                return unneededArgs.other;

        }

    } else {
        console.error('No active editor');
        return unneededArgs.noEditor;
    }
}



/**
 * Selects the specified line number.
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


async function selectLineRange(startLine: number, endLine: number, wholeLine: boolean = false) {
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

/**
 * Finds the keyword type based on the provided argument.
 * 
 * @param arg - The argument to determine the keyword type for.
 * @returns The keyword type based on the argument. Possible values are: 'number', 'dir', 'vsObj', 'pyObj', 'none'.
 */
function findKeywordType(arg: any) {

    if (typeof arg === 'number') {
        return keyword.number;
    } else if (typeof arg === 'string') {
        if (directions.includes(arg)) {
            return keyword.dir;
        } else if (vscodeObjects.includes(arg)) {
            return keyword.vsObj;
        } else if (pythonOjects.includes(arg)) {
            return keyword.pyObj;
        }
    }
    return keyword.none;

}

function findKeywordIdx(args: any[], funcType: functionType, startIdx: number = 0): [keyword, number] {
    let foundKeyword: keyword = keyword.none;
    let keywordIdx = -1;
    if (funcType === functionType.go) {
        for (let i = startIdx; i < args.length; i++) {
            const arg = args[i];
            if (directions.includes(arg)) {
                foundKeyword = keyword.dir;
                keywordIdx = i;
                break;
            } else if (vscodeObjects.includes(arg)) {
                foundKeyword = keyword.vsObj;
                keywordIdx = i;
                break;
            }
        }
    } else {
        for (let i = startIdx; i < args.length; i++) {
            const arg = args[i];
            if (directions.includes(arg)) {
                foundKeyword = keyword.dir;
                keywordIdx = i;
                break;
            } else if (pythonOjects.includes(arg)) {
                foundKeyword = keyword.pyObj;
                keywordIdx = i;
                break;
            } else if (vscodeObjects.includes(arg)) {
                foundKeyword = keyword.vsObj;
                keywordIdx = i;
                break;
            }
        }
    }
    return [foundKeyword, keywordIdx];
}

function findNumberIdx(args: any[], startIdx: number = 0): number {
    for (let i = startIdx; i < args.length; i++) {
        if (typeof args[i] === 'number') {
            return i;
        }
    }
    return -1;
}

export const changeKeyWithObjectValue = (text: string, obj: { [key: string]: string }, allowedKeywords?: string[]): string => {
    if (allowedKeywords !== undefined) {
        obj = Object.fromEntries(Object.entries(obj).filter(([key, value]) => allowedKeywords.includes(value)));
    }
    //change keys with values so that it prioritizes longer keys (for example 'enojni narekovaj' before 'narekovaj')
    const keysSortedByLengthDesc = Object.keys(obj).sort((a, b) => b.length - a.length);
    const regex = new RegExp(keysSortedByLengthDesc.join('|'), 'g');
    return text.replace(regex, match => obj[match]); //replace method returns new string
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
    // close tab like Ctrl + W
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
    // format document like Ctrl + Shift + I
    FORMAT: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for FORMAT. Expected 0 arguments');
            return dictationMode.execution_failed;
        } else {
            await vscode.commands.executeCommand('editor.action.formatDocument');
            return dictationMode.other;
        }
    },

    OPEN: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for OPEN. Expected 0 arguments');
            return dictationMode.execution_failed;
        } else {
            await vscode.commands.executeCommand('workbench.action.files.openFile');
            return dictationMode.other;
        }
    },

    BREAKPOINT: async (args: any[]): Promise<dictationMode> => {
        if (args.length !== 0) {
            console.error('Invalid arguments for BREAKPOINT. Expected 0 arguments');
            return dictationMode.execution_failed;
        } else {
            await vscode.commands.executeCommand('editor.debug.action.toggleBreakpoint');
            return dictationMode.other;
        }
    },


    ///////////////////////////////////////////////////////
    // from here on are functions with arguments
    ///////////////////////////////////////////////////////
    // TODO: when adding python object jump feature fix also getNameAndArgs in find-command-offline.ts
    // GO must get only arguments that are numbers, directions or vscode objects
    GO: async (args: any[]): Promise<dictationMode> => {
        console.log("GO");
        console.log(args);

        if (args.length < 1) {
            console.error('Invalid arguments for GO. Expected at least 1 argument');
            return dictationMode.execution_failed;
        } else {
            while (args.length > 0) {
                const arg = args[0];
                const argType = findKeywordType(arg);
                if (argType === keyword.number) {
                    if (args.length === 1) {
                        moveToLine(arg);
                        break;
                    }
                    const num = arg;
                    const k = findKeywordType(args[1]);
                    if (k === keyword.number) {
                        //n n
                        moveToLine(arg);
                        args = args.slice(1);
                        continue;
                    }
                    else if (k === keyword.vsObj) {
                        const obj = args[1];
                        // we also need a direction
                        const k2 = findKeywordType(args[2]);
                        if (k2 === keyword.none) {
                            if (obj === "LINE") {
                                // GO n LINE 
                                moveToLine(arg);
                                args = args.slice(2);
                                break;
                            } else {
                                // GO n vsObj
                                moveToLine(arg);
                                args.slice(1);
                            }
                        } else if (k2 === keyword.dir) {
                            // num vsObj dir
                            const dir = args[2];

                            const unneeded = await moveNumObjDir(num, obj, dir); //move object in direction
                            if (unneeded === unneededArgs.num || unneeded === unneededArgs.obj) {
                                moveToLine(num);
                                args = args.slice(1);
                            } else if (unneeded === unneededArgs.dir) {
                                //GO 3 LINE LEFT LEFT
                                moveToLine(num);
                                if (obj === "LINE") {
                                    args = args.slice(2);
                                } else {
                                    args = args.slice(1);
                                }
                                console.log(`There are weird arguments for GO if I say so myself. ${num} ${obj} ${dir}`);
                            }
                        } else if (k2 === keyword.vsObj) {
                            //n obj obj
                            if (obj === "LINE") {
                                moveToLine(arg);
                                args = args.slice(2);
                            } else {
                                moveToLine(arg);
                                args = args.slice(1);
                            }
                        } else if (k2 === keyword.number) {
                            //n obj n
                            moveToLine(arg);
                            if (obj === "LINE") {
                                args = args.slice(2);
                            } else {
                                args = args.slice(1);
                            }
                        } else {
                            console.error(`something strange happening with GO ${args}`);
                            moveToLine(arg);
                            args = args.slice(1);
                        }

                    } else if (k === keyword.dir) {
                        // num dir
                        const dir = args[1];
                        const k2: keyword = findKeywordType(args[2]);
                        if (k2 === keyword.vsObj) {
                            //num dir vsObj

                        } else {
                            //num dir num
                            //num dir dir
                            //num dir pyobj
                            //num dir none
                            goInDirectionFor(dir, num);
                            args = args.slice(2);
                        }
                    } else {
                        //go to line with number arg
                        moveToLine(arg);
                        args = args.slice(1);
                        console.log(`There are weird arguments for GO if I say so myself so i shall jump to line ${num}: ${args}`);
                    }


                } else if (argType === keyword.dir) {
                    // dir ...
                    const dir = arg;

                    if (args.length === 1) {
                        await goInDirection(arg);
                        break;
                    }
                    //TODO
                    args = args.slice(1);
                } else if (argType === keyword.vsObj) {
                    if (args.length === 1) {
                        if (arg === "DEFINITION") {
                            await vscode.commands.executeCommand('editor.action.revealDefinition');
                        }
                        break;
                    }
                    //TODO
                    args = args.slice(1);

                } else if (argType === keyword.pyObj) {
                    args = args.slice(1);
                    //TODO when we add python objects support
                } else {
                    args = args.slice(1);
                }
            }

            ///////////////////////////
            /*
            let nums: [string, number][] = [];
            let dirs: [string, number][] = [];
            let pyObjs: [string, number][] = [];
            let vsObjs: [string, number][] = [];
            let keywordIdxs: number[] = [];
 
            for (let i = 0; i < args.length; i++) {
                const arg = args[i];
                if (typeof arg === 'number') {
                    nums.push([arg.toString(), i]);
                } else if (directions.includes(arg)) {
                    dirs.push([arg, i]);
                    keywordIdxs.push(i);
                } else if (pythonOjects.includes(arg)) {
                    pyObjs.push([arg, i]);
                    keywordIdxs.push(i);
                } else if (vscodeObjects.includes(arg)) {
                    vsObjs.push([arg, i]);
                    keywordIdxs.push(i);
                }
            }
 
            if (dirs.length > 0 && pyObjs.length === 0 && vsObjs.length === 0) {
                //go in direction
                //because there is no vscode object or python object, we assume that we always move by character if left right and line if up down
                if (nums.length === 0) {
                    for (let dir of dirs) {
                        await goInDirection(dir[0]);
                    }
                }
                else {
                    let mergedArray: [string, number][] = dirs.concat(nums);
                    mergedArray.sort((a, b) => a[1] - b[1]);
                    while(mergedArray.length > 0){
                        if(dirs.includes(mergedArray[0])){
                            if(dirs.includes(mergedArray[1])){
                                goInDirection(mergedArray[0][0]);
                                mergedArray = mergedArray.slice(1); //remove first element we just used
                            } else {
                                //we have direction and number
                                let num:number = Number(mergedArray[1][0]);
                                let succeeded = await goInDirectionFor(mergedArray[0][0], num);
                                if(succeeded){
                                    mergedArray = mergedArray.slice(2); //remove first two elements we just used
                                }else if(dirs.includes(mergedArray[2])){
                                    goInDirection(mergedArray[0][0]);
                                    mergedArray = mergedArray.slice(1); //remove first element we just used
                                }else{
                                    console.error(`Invalid arguments for GO. ${mergedArray[0][0]} ${num} is not a valid direction.`);
                                    mergedArray = mergedArray.slice(2);
                                }
 
                            }
                        }else{
                            //we have number and direction
                            let num:number = Number(mergedArray[0][0]);
                            if(dirs.includes(mergedArray[1])){
                                let succeeded = await goInDirectionFor(mergedArray[1][0], num);
                                if(succeeded){
                                    mergedArray = mergedArray.slice(2); //remove first two elements we just used
                                }else{
                                    console.error(`Invalid arguments for GO. ${num} ${mergedArray[1][0]} is not a valid direction.`);
                                    mergedArray = mergedArray.slice(2);
                                }
                            }else{
                                console.error(`Invalid arguments for GO. ${num} ${mergedArray[1][0]} is not a valid direction.`);
                                mergedArray = mergedArray.slice(2);
                            }
                        }
                    }   
                }
 
                return dictationMode.other;
 
            } else if (pyObjs.length === 0 && dirs.length === 0 && vsObjs.length === 0) {
                console.error('Invalid arguments for GO. Expected at least one direction or object.');
                return dictationMode.execution_failed;
            } else {
 
            }
            */
            ////////////////////////////

            return dictationMode.other;
        }

        //TODO select from to
        // await vscode.commands.executeCommand('cursorMove', {
        //     to: 'down',
        //     by: 'line',
        //     value: 3,
        //     select: true
        // });
    },


    /*
    SELECT: async (args: any[]): Promise<dictationMode> => {
        console.log("SELECT");
        console.log(args);
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            console.error('No active editor');
            return dictationMode.execution_failed;
        }
        if (args.length < 1) {
            console.error('Invalid arguments for SELECT. Expected at least 1 argument');
            return dictationMode.execution_failed;
        } else {
            while (args.length > 0) {
                let [k, idx] = findKeywordIdx(args);
                let [k2, idx2] = findKeywordIdx(args, idx + 1);
                let numIdx = findNumberIdx(args);
                if (k === keyword.none) {
                    console.error('Invalid arguments for SELECT. Expected at least one direction or object.');
                    return dictationMode.execution_failed;
                }
                if (k === keyword.vsObj) {
                    switch (args[idx]) {
                        case "LINE":
                            if (numIdx !== -1) {
                                if (numIdx < idx2) {
                                    let numIdx2 = findNumberIdx(args, numIdx + 1);
                                    if (numIdx2 !== -1) {
                                        selectLine(args[numIdx], true);
                                    }
                                }
                            } else {
                                selectLine(editor.selection.active.line);
                            }
                            break;
                        case "FILE":
                            await vscode.commands.executeCommand('editor.action.selectAll');
                            break;

                    }
                    //TODO
                    args = args.slice(idx + 1);
                } else {
                    args = args.slice(idx + 1);
                }
            }
            return dictationMode.other;
        }
    }
    */

};
