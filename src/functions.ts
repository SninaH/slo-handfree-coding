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
enum keyword {
    dir,
    pyObj,
    vsObj,
    none
}

const directions = ["UP", "DOWN", "LEFT", "RIGHT", "START", "END", "NEXT", "PREVIOUS"];
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
const vscodeObjects = ["LINE", "FILE", "VIEW_PORT", "BLANK_LINE", "TAB"];

// function removeElementsByIndexes<T>(array: T[], indexes: number[]): T[] {
//     // Sort indexes in descending order
//     const sortedIndexes = indexes.sort((a, b) => b - a);

//     // Remove elements at each index
//     for (const index of sortedIndexes) {
//         array.splice(index, 1);
//     }

//     return array;
// }

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
            await vscode.commands.executeCommand('cursorMove', {
                to: 'nextBlankLine',
            });
            return true;
        case "PREVIOUS":
            await vscode.commands.executeCommand('cursorMove', {
                to: 'prevBlankLine',
            });
            return true;
        default:
            return false;
    }
}

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


async function selectLine(lineNumber: number, wholeLine: boolean = false) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        let start = 0;
        if(wholeLine){
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
        if(wholeLine){
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



function findKeywordIdx(args: any[], startIdx: number = 0): [keyword, number] {
    let foundKeyword: keyword = keyword.none;
    let keywordIdx = -1;
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

export const changeKeyWithObjectValue = (text: string, obj: { [key: string]: string }): string => {
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

    // from here on are functions with arguments

    GO: async (args: any[]): Promise<dictationMode> => {
        console.log("GO");
        console.log(args);
        if (args.length < 1) {
            console.error('Invalid arguments for GO. Expected at least 1 argument');
            return dictationMode.execution_failed;
        } else {
            // while (args.length > 0) {
            //     const arg = args[0];
            //     if (typeof arg === 'number') {
            //         let [k, idx] = findKeywordIdx(args);
            //         if (k === keyword.pyObj){
            //             // we cannot move by number of python objects
            //             console.error(`Invalid arguments for GO: ${arg} ${args[idx]}.`);
            //             // TODO: fix when we implement moving to python objects
            //             args = args.slice(idx + 1);
            //             continue;
            //         } else if (k === keyword.vsObj){
            //             // we also need a direction
            //             let [k2, idx2] = findKeywordIdx(args, idx + 1);

            //         }


            //     } else if (directions.includes(arg)) {
            //         // Remove the direction from the arguments
            //         args = removeElementsByIndexes(args, [0]);
            //     } else if (pythonOjects.includes(arg)) {
            //         // Remove the python object from the arguments
            //         args = removeElementsByIndexes(args, [0]);
            //     } else if (vscodeObjects.includes(arg)) {
            //         // Remove the vscode object from the arguments
            //         args = removeElementsByIndexes(args, [0]);
            //     } else {

            //     }
            // }

            ///////////////////////////
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
    SELECT: async (args: any[]): Promise<dictationMode> => {
        console.log("SELECT");
        console.log(args);
        const editor = vscode.window.activeTextEditor;
        if(!editor){
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
                if(k === keyword.none){
                    console.error('Invalid arguments for SELECT. Expected at least one direction or object.');
                    return dictationMode.execution_failed;
                }
                if (k === keyword.vsObj){
                    switch(args[idx]){
                        case "LINE":
                            if(numIdx !== -1){
                                if(numIdx < idx2){
                                    let numIdx2 = findNumberIdx(args, numIdx + 1);
                                    if(numIdx2 !== -1){
                                        selectLine(args[numIdx], true);
                                    }
                                }
                            }else{
                            selectLine(editor.selection.active.line);
                            }
                            break;
                        case "FILE":
                            await vscode.commands.executeCommand('editor.action.selectAll');
                            break;
                        
                    }
                    //TODO
                    args = args.slice(idx + 1);
                }else{
                    args = args.slice(idx + 1);
                }
            }
            return dictationMode.other;
        }
    }

};
