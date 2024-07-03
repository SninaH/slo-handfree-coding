import * as vscode from 'vscode';
import { dictationMode } from '../functions';
import { directions, vscodeObjects, pythonOjects, keywordType, findKeywordType } from './common_stuff';

enum moveSuccess {
    success,
    invalid_arg,
    no_editor,
    error
}
/**
 * Moves the cursor to the specified line number.
 * @param lineNumber The line number to move the cursor to.
 * @returns A promise that resolves when the cursor is moved successfully.
 */
function moveToLine(lineNumber: number): moveSuccess {
    try {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const position = new vscode.Position(lineNumber - 1, 0); // Lines are zero-indexed
            if (position.isAfterOrEqual(editor.document.lineAt(editor.document.lineCount - 1).range.end)) {
                // Position is beyond the last line of the document
                return moveSuccess.invalid_arg;
            }
            editor.selection = new vscode.Selection(position, position);
            editor.revealRange(new vscode.Range(position, position)); // Scrolls to the position
            return moveSuccess.success;
        } else {
            console.error('No active editor');
            return moveSuccess.no_editor;
        }
    } catch (error) {
        console.error(`Error moving to line: ${error}`);
        return moveSuccess.error;
    }
}

/**
 * Moves the cursor in the specified direction.
 * @param direction The direction to move the cursor.
 * @returns A promise that resolves to a boolean indicating if the cursor was moved successfully.
 */

async function moveDir(direction: string): Promise<moveSuccess> {
    try {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            console.error('No active editor');
            return moveSuccess.no_editor;
        }
        switch (direction) {
            case "UP":
            case "DOWN":
                await vscode.commands.executeCommand('cursorMove', {
                    to: direction.toLowerCase(),
                    by: 'line',
                    value: 1,
                });
                return moveSuccess.success;
            case "LEFT":
            case "RIGHT":
                await vscode.commands.executeCommand('cursorMove', {
                    to: direction.toLowerCase(),
                    by: 'character',
                    value: 1,
                });
                return moveSuccess.success;
            case "START":
                await vscode.commands.executeCommand('cursorMove', {
                    to: 'wrappedLineStart',
                });
                return moveSuccess.success;
            case "END":
                await vscode.commands.executeCommand('cursorMove', {
                    to: 'wrappedLineEnd',
                });
                return moveSuccess.success;
            case "NEXT":
                await vscode.commands.executeCommand('workbench.action.navigateForward');
                return moveSuccess.success;
            case "PREVIOUS":
                await vscode.commands.executeCommand('workbench.action.navigateBack');
                return moveSuccess.success;
            default:
                return moveSuccess.invalid_arg;
        }
    } catch (error) {
        console.error(`Error moving in direction: ${error}`);
        return moveSuccess.error;
    }
}

/**
 * Moves to the specified object.
 * @param obj The object to move to.
 * @returns A promise that resolves to a boolean indicating if the object was moved successfully.
 */
async function moveObj(obj: string): Promise<moveSuccess> {
    try {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            switch (obj) {
                case "DEFINITION":
                    return moveSuccess.success;
                default:
                    return moveSuccess.invalid_arg;
            }
        } else {
            console.error('No active editor');
            return moveSuccess.no_editor;
        }
    } catch (error) {
        console.error(`Error moving to object: ${error}`);
        return moveSuccess.error;
    }
}

/**
 * Moves the cursor in the specified direction for a specified number of times.
 * @param direction The direction to move the cursor.
 * @param num The number of times to move the cursor.
 * @returns A promise that resolves to a boolean indicating if the cursor was moved successfully.
 */
async function moveNumDir(num: number, direction: string): Promise<moveSuccess> {
    try {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            console.error('No active editor');
            return moveSuccess.no_editor;
        }
        switch (direction) {
            case "UP":
            case "DOWN":
                await vscode.commands.executeCommand('cursorMove', {
                    to: direction.toLowerCase(),
                    by: 'line',
                    value: num,
                });
                return moveSuccess.success;
            case "LEFT":
            case "RIGHT":
                await vscode.commands.executeCommand('cursorMove', {
                    to: direction.toLowerCase(),
                    by: 'character',
                    value: num,
                });
                return moveSuccess.success;
            default:
                return moveSuccess.invalid_arg;
        }
    } catch (error) {
        console.error(`Error moving in direction by number: ${error}`);
        return moveSuccess.error;
    }
}

async function moveNumObj(num: number, obj: string): Promise<moveSuccess> {
    try {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            console.error('No active editor');
            return moveSuccess.no_editor;
        }
        switch (obj) {
            case "LINE":
                return moveToLine(num);
            default:
                return moveSuccess.invalid_arg;
        }
    } catch (error) {
        console.error(`Error moving to object by number: ${error}`);
        return moveSuccess.error;
    }
}

/**
 * Moves the specified object in the specified direction.
 * @param obj The object to move.
 * @param dir The direction to move the object.
 * @returns A promise that resolves to a boolean indicating if the object was moved successfully.
 */
async function moveObjDir(obj: string, dir: string): Promise<moveSuccess> {
    try {
        switch (obj + "|" + dir) {
            case "LINE|START":
                await vscode.commands.executeCommand('cursorMove', {
                    to: 'wrappedLineFirstNonWhitespaceCharacter',
                });
                return moveSuccess.success;
            case "LINE|END":
                await vscode.commands.executeCommand('cursorMove', {
                    to: 'wrappedLineLastNonWhitespaceCharacter',
                });
                return moveSuccess.success;
            case "LINE|UP":
            case "LINE|PREVIOUS":
                await vscode.commands.executeCommand('cursorMove', {
                    to: 'up',
                    by: 'line',
                });
                return moveSuccess.success;
            case "LINE|NEXT":
            case "LINE|DOWN":
                await vscode.commands.executeCommand('cursorMove', {
                    to: 'down',
                    by: 'line',
                });
                return moveSuccess.success;
            case "FILE|START":
                await vscode.commands.executeCommand('cursorMove', {
                    to: 'viewPortTop',
                });
                return moveSuccess.success;
            case "FILE|END":
                await vscode.commands.executeCommand('cursorMove', {
                    to: 'viewPortBottom',
                });
                return moveSuccess.success;
            case "VIEW_PORT|START":
                await vscode.commands.executeCommand('cursorMove', {
                    to: 'viewPortTop',
                });
                return moveSuccess.success;
            case "VIEW_PORT|END":
                await vscode.commands.executeCommand('cursorMove', {
                    to: 'viewPortBottom',
                });
                return moveSuccess.success;
            case "PAGE|UP":
            case "PAGE|PREVIOUS":
                await vscode.commands.executeCommand('editorScroll', {
                    to: 'up',
                    by: 'page',
                    revealCursor: true
                });
                return moveSuccess.success;
            case "PAGE|NEXT":
            case "PAGE|DOWN":
                await vscode.commands.executeCommand('editorScroll', {
                    to: 'down',
                    by: 'page',
                    revealCursor: true
                });
                return moveSuccess.success;
            case "BLANK_LINE|UP":
            case "BLANK_LINE|PREVIOUS":
                await vscode.commands.executeCommand('cursorMove', {
                    to: 'prevBlankLine',
                });
                return moveSuccess.success;
            case "BLANK_LINE|DOWN":
            case "BLANK_LINE|NEXT":
                await vscode.commands.executeCommand('cursorMove', {
                    to: 'nextBlankLine',
                });
                return moveSuccess.success;
            case "TAB|RIGHT":
            case "TAB|NEXT":
                await vscode.commands.executeCommand('workbench.action.nextEditor');
                return moveSuccess.success;
            case "TAB|LEFT":
            case "TAB|PREVIOUS":
                await vscode.commands.executeCommand('workbench.action.previousEditor');
                return moveSuccess.success;
            default:
                return moveSuccess.invalid_arg;
        }
    } catch (error) {
        console.error(`Error moving by object in direction: ${error}`);
        return moveSuccess.error;
    }
}





enum unneededArgs {
    num,
    obj,
    dir,
    none,
    noEditor,
    invalid_arg,
    error
}

/**
 * Moves by specified number by object in direction.
 * @param num The number to move.
 * @param obj The object to move.
 * @param dir The direction to move the number and object.
 * @returns A promise that resolves to an enum indicating if any arguments are unneeded.
 */
async function moveNumObjDir(num: number, obj: string, dir: string): Promise<unneededArgs> {
    try {
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
                    return unneededArgs.invalid_arg;

            }

        } else {
            console.error('No active editor');
            return unneededArgs.noEditor;
        }
    } catch (error) {
        console.error(`Error moving by number by object in direction: ${error}`);
        return unneededArgs.error;
    }
}

/*
* Check if num arg1 arg2 or num arg1 is an action
*/
function validateNumArgs(arg1: string, arg2?: string): boolean {
    const kT1 = findKeywordType(arg1);
    if (kT1 === keywordType.number) {
        return false;
    }
    else if (kT1 === keywordType.vsObj) {
        const validCombinations = [
            "LINE|UP", "LINE|DOWN", "PAGE|UP", "PAGE|DOWN",
            "BLANK_LINE|UP", "BLANK_LINE|DOWN", "TAB|RIGHT", "TAB|LEFT",
            "LINE|RIGHT", "LINE|LEFT"
        ];
        if (arg2 && findKeywordType(arg2) === keywordType.dir && validCombinations.includes(`${arg1}|${arg2}`)) {
            return true;
        }
        return false;
    }
    else {
        //only check left is num arg1
        if (kT1 === keywordType.dir) {
            const validNumDir = ["UP", "DOWN", "LEFT", "RIGHT"];
            return validNumDir.includes(arg1);
        }

        return false;
    }
}

async function executeAction1(kT0: keywordType, arg: any): Promise<moveSuccess> {
    try {
        let actionResult: moveSuccess;
        switch (kT0) {
            case keywordType.number:
                actionResult = moveToLine(arg);
                break;
            case keywordType.dir:
                actionResult = await moveDir(arg);
                break;
            case keywordType.vsObj:
                actionResult = await moveObj(arg);
                break;
            default:
                console.error(`Invalid keyword type: ${kT0}`);
                return moveSuccess.invalid_arg;
        }

        return actionResult;

    } catch (error) {
        console.error(`Error executing action: ${error}`);
        return moveSuccess.error;
    }
}

type ActionFunctionMoveSucc = (...args: any[]) => Promise<moveSuccess> | moveSuccess;

async function executeAction2(kT0: keywordType, kT1: keywordType, args: any[]): Promise<moveSuccess> {
    const actionMap: { [key: string]: ActionFunctionMoveSucc } = {
        [`${keywordType.number}_${keywordType.number}`]: moveToLine,
        [`${keywordType.dir}_${keywordType.dir}`]: moveDir,
        [`${keywordType.vsObj}_${keywordType.vsObj}`]: moveObj,
        [`${keywordType.number}_${keywordType.dir}`]: moveNumDir,
        [`${keywordType.number}_${keywordType.vsObj}`]: moveNumObj,
        [`${keywordType.dir}_${keywordType.number}`]: moveNumDir,
        [`${keywordType.dir}_${keywordType.vsObj}`]: moveObjDir,
        [`${keywordType.vsObj}_${keywordType.number}`]: moveNumObj,
        [`${keywordType.vsObj}_${keywordType.dir}`]: moveObjDir,
    };

    const actionKey = `${kT0}_${kT1}`;
    const action = actionMap[actionKey];
    if (action) {
        const result: moveSuccess = await action(...args);
        return result;
    } else {
        console.error(`No action defined for ${actionKey}.`);
        return moveSuccess.invalid_arg;
    }
}

type ActionFunctionUnneededArgs = (...args: any[]) => Promise<unneededArgs>;

enum moveSuccess3 {
    used1,
    used2,
    used_all,
    no_editor,
    invalid_arg,
    error
}
async function executeAction3(kT0: keywordType, kT1: keywordType, kT2: keywordType, args: any[]): Promise<moveSuccess3> {
    const actionMap3Different: { [key: string]: ActionFunctionUnneededArgs } = {
        [`${keywordType.number}_${keywordType.vsObj}_${keywordType.dir}`]: moveNumObjDir,
        [`${keywordType.number}_${keywordType.dir}_${keywordType.vsObj}`]: moveNumObjDir,
        [`${keywordType.vsObj}_${keywordType.number}_${keywordType.dir}`]: moveNumObjDir,
        [`${keywordType.vsObj}_${keywordType.dir}_${keywordType.number}`]: moveNumObjDir,
        [`${keywordType.dir}_${keywordType.number}_${keywordType.vsObj}`]: moveNumObjDir,
        [`${keywordType.dir}_${keywordType.vsObj}_${keywordType.number}`]: moveNumObjDir,
    };
    const actionLast2Same: { [key: string]: ActionFunctionMoveSucc } = {
        [`${keywordType.number}_${keywordType.dir}_${keywordType.dir}`]: moveNumDir,
        [`${keywordType.number}_${keywordType.vsObj}_${keywordType.vsObj}`]: moveNumObj,
        [`${keywordType.dir}_${keywordType.number}_${keywordType.number}`]: moveNumDir,
        [`${keywordType.dir}_${keywordType.vsObj}_${keywordType.vsObj}`]: moveObjDir,
        [`${keywordType.vsObj}_${keywordType.number}_${keywordType.number}`]: moveNumObj,
        [`${keywordType.vsObj}_${keywordType.dir}_${keywordType.dir}`]: moveObjDir,
    };
    const actionFirst2Same: { [key: string]: ActionFunctionMoveSucc } = {
        [`${keywordType.number}_${keywordType.number}_${keywordType.dir}`]: moveToLine,
        [`${keywordType.number}_${keywordType.number}_${keywordType.vsObj}`]: moveToLine,
        [`${keywordType.dir}_${keywordType.dir}_${keywordType.number}`]: moveDir,
        [`${keywordType.dir}_${keywordType.dir}_${keywordType.vsObj}`]: moveDir,
        [`${keywordType.vsObj}_${keywordType.vsObj}_${keywordType.number}`]: moveObj,
        [`${keywordType.vsObj}_${keywordType.vsObj}_${keywordType.dir}`]: moveObj,

    };


    const actionKey = `${kT0}_${kT1}_${kT2}`;
    const action = actionMap3Different[actionKey];
    if (action) {
        //arguments are all different
        const result: unneededArgs = await action(...args);
        switch (result) {
            case unneededArgs.error:
                return moveSuccess3.error;
            case unneededArgs.invalid_arg:
                return moveSuccess3.invalid_arg;
            case unneededArgs.noEditor:
                return moveSuccess3.no_editor;
            case unneededArgs.none:
                return moveSuccess3.used_all;
            default:
                //unneded arg is the first one
                if (result === unneededArgs.num && kT0 === keywordType.number || result === unneededArgs.obj && kT0 === keywordType.vsObj || result === unneededArgs.dir && kT0 === keywordType.dir) {
                    const m: moveSuccess = await executeAction1(kT0, args[0]);
                    switch (m) {
                        case moveSuccess.success:
                            return moveSuccess3.used1;
                        case moveSuccess.invalid_arg:
                            console.error(`Invalid arguments for GO: ${args}`);
                            return moveSuccess3.invalid_arg;
                        case moveSuccess.no_editor:
                            console.error('No active editor');
                            return moveSuccess3.no_editor;
                        case moveSuccess.error:
                            return moveSuccess3.error;
                    }
                }
                //unneeded arg is the last one
                else if (result === unneededArgs.num && kT2 === keywordType.number || result === unneededArgs.obj && kT2 === keywordType.vsObj || result === unneededArgs.dir && kT2 === keywordType.dir) {
                    const m: moveSuccess = await executeAction2(kT0, kT1, args);
                    switch (m) {
                        case moveSuccess.success:
                            return (kT0 !== kT1) ? moveSuccess3.used2 : moveSuccess3.used1;
                        case moveSuccess.invalid_arg:
                            const m1: moveSuccess = await executeAction1(kT0, args[0]);
                            switch (m1) {
                                case moveSuccess.success:
                                    return moveSuccess3.used1;
                                case moveSuccess.invalid_arg:
                                    console.error(`Invalid arguments for GO: ${args}`);
                                    return moveSuccess3.invalid_arg;
                                case moveSuccess.no_editor:
                                    console.error('No active editor');
                                    return moveSuccess3.no_editor;
                                case moveSuccess.error:
                                    return moveSuccess3.error;
                            }
                        case moveSuccess.no_editor:
                            console.error('No active editor');
                            return moveSuccess3.no_editor;
                        case moveSuccess.error:
                            return moveSuccess3.error;
                    }
                }
                //unneded arg is the second one
                else if (result === unneededArgs.num && kT1 === keywordType.number || result === unneededArgs.obj && kT1 === keywordType.vsObj || result === unneededArgs.dir && kT1 === keywordType.dir) {
                    const m: moveSuccess = await executeAction1(kT0, args[0]);
                    switch (m) {
                        case moveSuccess.success:
                            return moveSuccess3.used1;
                        case moveSuccess.invalid_arg:
                            console.error(`Invalid arguments for GO: ${args}`);
                            return moveSuccess3.invalid_arg;
                        case moveSuccess.no_editor:
                            console.error('No active editor');
                            return moveSuccess3.no_editor;
                        case moveSuccess.error:
                            return moveSuccess3.error;
                    }
                } else {
                    console.error(`This state should not be reached. Arguments: ${args}`);
                    return moveSuccess3.error;
                }
        }
    } else {
        const action2 = actionLast2Same[`${kT1}_${kT2}_${kT0}`];
        if (action2) {
            //because the last two args are same we presume the last one is from next set of keywords
            const result: moveSuccess = await action2(...args);
            switch (result) {
                case moveSuccess.success:
                    return moveSuccess3.used2;
                case moveSuccess.invalid_arg:
                    const m: moveSuccess = await executeAction1(kT0, args[0]);
                    switch (m) {
                        case moveSuccess.success:
                            return moveSuccess3.used1;
                        case moveSuccess.invalid_arg:
                            console.error(`Invalid arguments for GO: ${args}`);
                            return moveSuccess3.invalid_arg;
                        case moveSuccess.no_editor:
                            console.error('No active editor');
                            return moveSuccess3.no_editor;
                        case moveSuccess.error:
                            return moveSuccess3.error;
                    }
                case moveSuccess.no_editor:
                    console.error('No active editor');
                    return moveSuccess3.no_editor;
                case moveSuccess.error:
                    return moveSuccess3.error;
            }
        } else {
            const action3 = actionFirst2Same[`${kT0}_${kT1}_${kT2}`];
            if (action3) {
                //because the first two args are same we take the first keyword as separate action
                const result: moveSuccess = await action3(...args);
                switch (result) {
                    case moveSuccess.success:
                        return moveSuccess3.used1;
                    case moveSuccess.invalid_arg:
                        console.error(`Invalid arguments for GO: ${args}`);
                        return moveSuccess3.invalid_arg;
                    case moveSuccess.no_editor:
                        console.error('No active editor');
                        return moveSuccess3.no_editor;
                    case moveSuccess.error:
                        return moveSuccess3.error;
                }
            } else {
                if (!(kT0 === kT1 && kT1 === kT2)) {
                    console.error(`No action defined for ${actionKey}.`);
                    return moveSuccess3.invalid_arg;
                } else {
                    //all three are the same
                    //we can execute first and second keyword as separate actions
                    const m: moveSuccess = await executeAction1(kT0, args[0]);
                    switch (m) {
                        case moveSuccess.success:
                            const m1: moveSuccess = await executeAction1(kT1, args[1]);
                            switch (m1) {
                                case moveSuccess.success:
                                    return moveSuccess3.used2;
                                case moveSuccess.invalid_arg:
                                    console.error(`Invalid arguments for GO: ${args}`);
                                    return moveSuccess3.invalid_arg;
                                case moveSuccess.no_editor:
                                    console.error('No active editor');
                                    return moveSuccess3.no_editor;
                                case moveSuccess.error:
                                    return moveSuccess3.error;
                            }
                        case moveSuccess.invalid_arg:
                            console.error(`Invalid arguments for GO: ${args}`);
                            return moveSuccess3.invalid_arg;
                        case moveSuccess.no_editor:
                            console.error('No active editor');
                            return moveSuccess3.no_editor;
                        case moveSuccess.error:
                            return moveSuccess3.error;
                    }
                }

            }
        }
    }

}


/**
 * Finds the keyword type based on the provided argument.
 * 
 * @param arg - The argument to determine the keyword type for.
 * @returns The keyword type based on the argument. Possible values are: 'number', 'dir', 'vsObj', 'pyObj', 'none'.
 */


// TODO: when adding python object jump feature fix also getNameAndArgs in find-command-offline.ts
// GO must get only arguments that are numbers, directions or vscode objects
export default async function GO(args: any[]): Promise<dictationMode> {
    console.log("GO");
    console.log(args);

    if (args.length < 1) {
        console.error('Invalid arguments for GO. Expected at least 1 argument');
        return dictationMode.execution_failed;
    }
    while (args.length > 0) {
        const arg = args[0];
        const kT0 = findKeywordType(arg);


        if (args.length === 1) {
            const mode = await executeAction1(kT0, arg);
            switch (mode) {
                case moveSuccess.success:
                    // Adjust args according to the action taken
                    args = args.slice(1);
                    break;
                case moveSuccess.invalid_arg:
                    console.error(`Invalid arguments for GO: ${args}`);
                    return dictationMode.execution_failed;
                case moveSuccess.no_editor:
                    console.error('No active editor');
                    return dictationMode.execution_failed;
                case moveSuccess.error:
                    return dictationMode.execution_failed;
            }
        }

        else if (args.length === 2) {
            const kT1 = findKeywordType(args[1]);

            const result: moveSuccess = await executeAction2(kT0, kT1, args);
            switch (result) {
                case moveSuccess.success:
                    // Adjust args according to the action taken
                    args = args.slice((kT0 !== kT1) ? 2 : 1);
                    break;
                case moveSuccess.invalid_arg:
                    console.error(`Invalid arguments for GO: ${args}`);
                    return dictationMode.execution_failed;
                case moveSuccess.no_editor:
                    console.error('No active editor');
                    return dictationMode.execution_failed;
                case moveSuccess.error:
                    return dictationMode.execution_failed;
            }
        }

        else {
            // more than 2 arguments
            const kT1 = findKeywordType(args[1]);
            const kT2 = findKeywordType(args[2]);

            if (args.length > 3) {
                //TODO check if kT2 is num then it could be next keyword combination's num
                //npr. 2 LEFT 3 DOWN => 2 LEFT ; 3 DOWN
                // (we prioritise numbers that are before dir or obj)
                
                if(kT2 === keywordType.number){
                    if(args.length > 4 && validateNumArgs(args[3], args[4]) || validateNumArgs(args[3])){
                        //args[3] is next keyword combination's num
                        const result: moveSuccess = await executeAction2(kT0, kT1, args);
                        switch (result) {
                            case moveSuccess.success:
                                // Adjust args according to the action taken
                                args = args.slice((kT0 !== kT1) ? 2 : 1);
                                break;
                            case moveSuccess.invalid_arg:
                                console.error(`Invalid arguments for GO: ${args}`);
                                return dictationMode.execution_failed;
                            case moveSuccess.no_editor:
                                console.error('No active editor');
                                return dictationMode.execution_failed;
                            case moveSuccess.error:
                                return dictationMode.execution_failed;
                        }
                    } else {
                        const result: moveSuccess3 = await executeAction3(kT0, kT1, kT2, args);
                        switch (result) {
                            case moveSuccess3.used1:
                                args = args.slice(1);
                                break;
                            case moveSuccess3.used2:
                                args = args.slice(2);
                                break;
                            case moveSuccess3.used_all:
                                args = args.slice(3);
                                break;
                            case moveSuccess3.no_editor:
                                console.error('No active editor');
                                return dictationMode.execution_failed;
                            case moveSuccess3.invalid_arg:
                                console.error(`Invalid arguments for GO: ${args}`);
                                return dictationMode.execution_failed;
                            case moveSuccess3.error:
                                return dictationMode.execution_failed;
                        }
                    }

                }
            } else {
                const result: moveSuccess3 = await executeAction3(kT0, kT1, kT2, args);
                switch (result) {
                    case moveSuccess3.used1:
                        args = args.slice(1);
                        break;
                    case moveSuccess3.used2:
                        args = args.slice(2);
                        break;
                    case moveSuccess3.used_all:
                        args = args.slice(3);
                        break;
                    case moveSuccess3.no_editor:
                        console.error('No active editor');
                        return dictationMode.execution_failed;
                    case moveSuccess3.invalid_arg:
                        console.error(`Invalid arguments for GO: ${args}`);
                        return dictationMode.execution_failed;
                    case moveSuccess3.error:
                        return dictationMode.execution_failed;
                }
            }

        }


    }
    return dictationMode.other;
}