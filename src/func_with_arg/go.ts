import * as vscode from 'vscode';
import { dictationMode } from '../functions';
import { tokenType, findKeywordType } from './common_stuff';
import { promises } from 'dns';

function moveToLine(lineNumber: number, editor: vscode.TextEditor): void {
    const position = new vscode.Position(lineNumber - 1, 0); // Lines are zero-indexed
    if (position.isAfterOrEqual(editor.document.lineAt(editor.document.lineCount - 1).range.end)) {
        // Position is beyond the last line of the document
        console.log('Position is beyond the last line of the document');
        return;
    }
    editor.selection = new vscode.Selection(position, position);
    editor.revealRange(new vscode.Range(position, position)); // Scrolls to the position
}

async function moveObj(obj: string): Promise<boolean> {
    if (obj === "DEFINITION") {
        await vscode.commands.executeCommand('editor.action.goToDeclaration');
        return true;
    }
    return false;
}

const DirToFunctions: { [key: string]: () => Promise<void> } = {
    "UP": async () => {
        await vscode.commands.executeCommand('cursorMove', {
            to: 'up',
            by: 'line',
        });
    },
    "DOWN": async () => {
        await vscode.commands.executeCommand('cursorMove', {
            to: 'down',
            by: 'line',
        });
    },
    "LEFT": async () => {
        await vscode.commands.executeCommand('cursorMove', {
            to: 'left',
            by: 'character',
        });
    },
    "RIGHT": async () => {
        await vscode.commands.executeCommand('cursorMove', {
            to: 'right',
            by: 'character',
        });
    },
    "START": async () => {
        await vscode.commands.executeCommand('cursorHome');
    },
    "END": async () => {
        await vscode.commands.executeCommand('cursorMove', {
            to: 'wrappedLineEnd',
        });
    },
    "PREVIOUS": async () => {
        await vscode.commands.executeCommand('workbench.action.navigateBack');
    },
    "NEXT": async () => {
        await vscode.commands.executeCommand('workbench.action.navigateForward');
    },
        
};

/**
 * key: `${num < 9 ? '9-' : '9+'}|${obj}|${dir}`
 * element: function with @param num that moves the cursor according to the given key
 * if the function accepts num that is greater than 9, it will have 9+ as first part of key
 */
const NumObjDirToFunctions: { [key: string]: (num: number) => Promise<void> } = {
    "9+|LINE|UP": async (num: number) => {
        await vscode.commands.executeCommand('cursorMove', {
            to: 'up',
            by: 'line',
            value: num,
        });
    },
    "9+|LINE|DOWN": async (num: number) => {
        await vscode.commands.executeCommand('cursorMove', {
            to: 'down',
            by: 'line',
            value: num,
        });
    },
    "9-|LINE|UP": async (num: number) => {
        await vscode.commands.executeCommand('cursorMove', {
            to: 'up',
            by: 'line',
            value: num,
        });
    },
    "9-|LINE|DOWN": async (num: number) => {
        await vscode.commands.executeCommand('cursorMove', {
            to: 'down',
            by: 'line',
            value: num,
        });
    },
    "9-|PAGE|UP": async (num: number) => {
        for (let i = 0; i < num; i++) {
            await vscode.commands.executeCommand('editorScroll', {
                to: 'up',
                by: 'page',
                revealCursor: true
            });
        }
    },
    "9-|PAGE|DOWN": async (num: number) => {
        for (let i = 0; i < num; i++) {
            await vscode.commands.executeCommand('editorScroll', {
                to: 'down',
                by: 'page',
                revealCursor: true
            });
        }
    },
    "9-|BLANK_LINE|UP": async (num: number) => {
        for (let i = 0; i < num; i++) {
            await vscode.commands.executeCommand('cursorMove', {
                to: 'prevBlankLine',
            });
        }
    },
    "9-|BLANK_LINE|DOWN": async (num: number) => {
        for (let i = 0; i < num; i++) {
            await vscode.commands.executeCommand('cursorMove', {
                to: 'nextBlankLine',
            });
        }
    },
    "9-|TAB|RIGHT": async (num: number) => {
        for (let i = 0; i < num; i++) {
            await vscode.commands.executeCommand('workbench.action.nextEditorInGroup');
        }
    },
    "9-|TAB|LEFT": async (num: number) => {
        for (let i = 0; i < num; i++) {
            await vscode.commands.executeCommand('workbench.action.previousEditorInGroup');
        }
    }
};

const NumObjToFunctions: { [key: string]: (num: number, editor: vscode.TextEditor) => void } = {
    "LINE": moveToLine
};

const NumDirToFunctions: { [key: string]: (num: number) => Promise<void> } = {
    "UP": async (num: number) => {
        await vscode.commands.executeCommand('cursorMove', {
            to: 'up',
            by: 'line',
            value: num,
        });
    },
    "DOWN": async (num: number) => {
        await vscode.commands.executeCommand('cursorMove', {
            to: 'down',
            by: 'line',
            value: num,
        });
    },
    "LEFT": async (num: number) => {
        await vscode.commands.executeCommand('cursorMove', {
            to: 'left',
            by: 'character',
            value: num,
        });
    },
    "RIGHT": async (num: number) => {
        await vscode.commands.executeCommand('cursorMove', {
            to: 'right',
            by: 'character',
            value: num,
        });
    }
};

const ObjDirToFunctions: { [key: string]: () => Promise<void> } = {
    "LINE|UP": async () => {
        await vscode.commands.executeCommand('cursorMove', {
            to: 'up',
            by: 'line',
        });
    },
    "LINE|PREVIOUS": async () => {
        await vscode.commands.executeCommand('cursorMove', {
            to: 'up',
            by: 'line',
        });
    },
    "LINE|DOWN": async () => {
        await vscode.commands.executeCommand('cursorMove', {
            to: 'down',
            by: 'line',
        });
    },
    "LINE|NEXT": async () => {
        await vscode.commands.executeCommand('cursorMove', {
            to: 'down',
            by: 'line',
        });
    },
    "LINE|START": async () => {
        await vscode.commands.executeCommand('cursorMove', {
            to: 'wrappedLineStart',
        });
    },
    "LINE|END": async () => {
        await vscode.commands.executeCommand('cursorMove', {
            to: 'wrappedLineEnd',
        });
    },
    "FILE|START": async () => {
        await vscode.commands.executeCommand('cursorMove', {
            to: 'viewPortTop',
        });
    },
    "FILE|END": async () => {
        await vscode.commands.executeCommand('cursorMove', {
            to: 'viewPortBottom',
        });
    },
    "VIEW_PORT|START": async () => {
        await vscode.commands.executeCommand('cursorMove', {
            to: 'viewPortTop',
        });
    },
    "VIEW_PORT|END": async () => {
        await vscode.commands.executeCommand('cursorMove', {
            to: 'viewPortBottom',
        });
    },
    "PAGE|UP": async () => {
        await vscode.commands.executeCommand('editorScroll', {
            to: 'up',
            by: 'page',
            revealCursor: true
        });
    },
    "PAGE|DOWN": async () => {
        await vscode.commands.executeCommand('editorScroll', {
            to: 'down',
            by: 'page',
            revealCursor: true
        });
    },
    "BLANK_LINE|UP": async () => {
        await vscode.commands.executeCommand('cursorMove', {
            to: 'prevBlankLine',
        });
    },
    "BLANK_LINE|DOWN": async () => {
        await vscode.commands.executeCommand('cursorMove', {
            to: 'nextBlankLine',
        });
    },
    "TAB|RIGHT": async () => {
        await vscode.commands.executeCommand('workbench.action.nextEditorInGroup');
    },
    "TAB|LEFT": async () => {
        await vscode.commands.executeCommand('workbench.action.previousEditorInGroup');
    },
    "TAB|NEXT": async () => {
        await vscode.commands.executeCommand('workbench.action.nextEditor');
    },
    "TAB|PREVIOUS": async () => {
        await vscode.commands.executeCommand('workbench.action.previousEditor');
    }

};


function generateKey(num: number, firstPart: string, secondPart: string): string {
    return `${num < 9 ? '9-' : '9+'}|${firstPart}|${secondPart}`;
}
/**
 * function to get from tokens the key for searching the function and the argument for the function and check if it is valid. 
 * checks for exactly given number of tokens
 * @param args0 first token
 * @param args1 second token
 * @param args2 optional third token
 * @returns [num, key] the key to get function and num argument for function (if none returns -1) if the combination of given tokens is valid, otherwise returns [-1, ""]
 */
function validTokenCombination(args0: [string | number, tokenType], args1: [string | number, tokenType], args2?: [string | number, tokenType]): [number, string] {
    if (args2) {
        let num = -1;
        let key = "";

        //all three args have to be different type
        if (!(args0[1] !== args1[1] && args0[1] !== args2[1] && args1[1] !== args2[1])) {
            return [-1, ""];
        }

        //how comparator works:
        /*
        a The first element for comparison. Will never be undefined.
        b The second element for comparison. Will never be undefined.
        It should return a number where:
        A negative value indicates that a should come before b.
        A positive value indicates that a should come after b.
        Zero or NaN indicates that a and b are considered equal.
        */

        // Determine the order of args based on their types: number, vsObj, dir
        const order = [args0, args1, args2].sort((a, b) => {
            // Prioritize number
            if (a[1] === tokenType.number && b[1] !== tokenType.number) { return -1; }
            if (b[1] === tokenType.number && a[1] !== tokenType.number) { return 1; }

            // Prioritize vsObj
            if (a[1] === tokenType.vsObj && b[1] !== tokenType.vsObj) { return -1; }
            if (b[1] === tokenType.vsObj && a[1] !== tokenType.vsObj) { return 1; }

            // No need to prioritize dir, as it will naturally fall into place
            return 0;
        });

        // Check if the sorted order meets expected pattern num obj dir
        if (order[0][1] === tokenType.number && order[1][1] === tokenType.vsObj && order[2][1] === tokenType.dir) {
            num = order[0][0] as number;
            key = generateKey(num, order[1][0] as string, order[2][0] as string);
        } else {
            return [-1, ""];
        }

        // Return based on whether a valid key was generated
        return NumObjDirToFunctions[key] ? [num, key] : [-1, ""];
    }
    // there are only two arguments
    if (args0[1] === tokenType.number) {
        const num: number = args0[0] as number;
        if (args1[1] === tokenType.dir) {
            const key = `${args1[0]}`;
            return NumDirToFunctions[key] ? [num, key] : [-1, ""];
        } else if (args1[1] === tokenType.vsObj) {
            const key = `${args1[0]}`;
            return NumObjToFunctions[args1[0]] ? [num, key] : [-1, ""];
        }
    } else if (args0[1] === tokenType.dir) {
        if (args1[1] === tokenType.vsObj) {
            const key = `${args1[0]}|${args0[0]}`;
            return ObjDirToFunctions[key] ? [-1, key] : [-1, ""];
        } else if (args1[1] === tokenType.number) {
            const key = args0[0] as string;
            return NumDirToFunctions[key] ? [args1[0] as number, key] : [-1, ""];
        }
    } else if (args0[1] === tokenType.vsObj) {
        if (args1[1] === tokenType.dir) {
            const key = `${args0[0]}|${args1[0]}`;
            return ObjDirToFunctions[key] ? [-1, key] : [-1, ""];
        } else if (args1[1] === tokenType.number) {
            const key = args0[0] as string;
            return NumObjToFunctions[key] ? [args1[0] as number, key] : [-1, ""];
        }
    }
    return [-1, ""];

}

async function executeOneToken(kT0: tokenType, args: any[]): Promise<dictationMode | any[]> {
    if (kT0 === tokenType.number) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return dictationMode.no_active_editor;
        }
        moveToLine(args[0], editor);
        args = args.slice(1);
        return args;
    } else if (kT0 === tokenType.dir) {
        const func = await DirToFunctions[args[0]];
        if (func) {
            await func();
            args = args.slice(1);
            return args;
        } else {
            console.log(`invalid argument ${args[0]}`);
            return dictationMode.invalid_arguments;
        }
    } else if (kT0 === tokenType.vsObj) {
        if (!(await moveObj(args[0]))) {
            console.log(`invalid argument ${args[0]}`);
            return dictationMode.invalid_arguments;
        }
        args = args.slice(1);
        return args;
    } else {
        return dictationMode.invalid_arguments;
    }
}

async function executeTwoTokens(kT0: tokenType, kT1: tokenType, args: any[]): Promise<dictationMode | any[]> {
    console.log("start of executeTwoTokens");
    const valid = validTokenCombination([args[0], kT0], [args[1], kT1]);
    if (valid[1] === "") {
        const result = await executeOneToken(kT0, args);
        if (result instanceof Array) {
            args = result;
            return args;
        } else {
            return result;
        }
    }
    if (valid[0] === -1) {
        await ObjDirToFunctions[valid[1]]();
        args = args.slice(2);
        return args;
    } else {
        const funcNumDir = NumDirToFunctions[valid[1]];
        if (funcNumDir) {
            await funcNumDir(valid[0]);
            args = args.slice(2);
            return args;
        } else {
            const funcNumObj = NumObjToFunctions[valid[1]];
            if (funcNumObj) {
                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    return dictationMode.no_active_editor;
                }
                funcNumObj(valid[0], editor);
                args = args.slice(2);
                return args;
            } else {
                console.log(`unsuccessful execution of two tokens ${args[0]} ${args[1]}`);
                return dictationMode.execution_failed;
            }

        }
    }
}

async function executeThreeTokens(kT0: tokenType, kT1: tokenType, kT2: tokenType, args: any[]): Promise<dictationMode | any[]> {
    const valid = validTokenCombination([args[0], kT0], [args[1], kT1], [args[2], kT2]);
    if (valid[1] === "") {
        const result = await executeTwoTokens(kT0, kT1, args);
        if (result instanceof Array) {
            args = result;
            return args;
        } else {
            return result;
        }
    }

    const funcNumObjDir = NumObjDirToFunctions[valid[1]];
    if (funcNumObjDir) {
        await funcNumObjDir(valid[0]);
        args = args.slice(3);
        return args;
    } else {
        return dictationMode.execution_failed;
    }

}

//REMEMBER: combination with num in front has precedence over num in the back
//REMEMBER: combination with dir in front of obj has precedence over obj in the back ("pojdi začetek dokumenta") ("pojdi gor za vrstico " ma prednost pred "pojdi za vrstico gor")
// gor prazna vrstica zacetek vrstice => DIR OBJ DIR OBJ => (DIR OBJ) (DIR OBJ)
// prazna vrstica gor vrstica dol => OBJ DIR OBJ DIR => OBJ (DIR OBJ) DIR
// ali spremenim pravila da ne pride do take cudne situacije?
// naj bo zacetek konec pred obj in gor dol levo desno naj bo za obj?
// => combination with dir in front of obj has precedence if dir PREVIOUS, NEXT, START, END otherwise (UP DOWN LEFT RIGHT) obj in front of dir has precedence

// GO RIGHT 5 LEFT => (RIGHT) (5 LEFT)
// GO RIGHT 5 LEFT 3 => (RIGHT) (5 LEFT) (3) ---- a ne bi blo boljs (RIGHT 5) (LEFT 3) ?
// GO RIGHT 5 LEFT 3 UP => (RIGHT) (5 LEFT) (3 UP)
// GO PAGE UP 3 LINES UP => (PAGE UP) (3 LINES UP)
// GO PAGE UP 3 LINES UP 2 => (PAGE UP) (3 LINES UP) (2) ---- ali bi bilo boljse (PAGE UP 3) (LINES UP 2) ?
/**
 *  
 * 
 * returns -1 if the combination of first three tokens has precedence over the next combinations. Otherwise returns the index of first token in combination that has precedence over the combination of first three tokens
 * 
 */
function nextHasPrecedence(args: (string | number)[]): number {
    const firstThree: [string | number, tokenType][] = [[args[0], findKeywordType(args[0])], [args[1], findKeywordType(args[1])], [args[2], findKeywordType(args[2])]];

    return -1;
}

export default async function GO(args: any[]): Promise<dictationMode> {
    try {
        while (args.length > 0) {
            console.log("start of while loop in GO");
            console.log(args);
            const kT0: tokenType = findKeywordType(args[0]);
            if (kT0 === tokenType.none || kT0 === tokenType.pyObj) {
                return dictationMode.invalid_arguments;
            }
            if (args.length === 1) {
                const result = await executeOneToken(kT0, args);
                if (result instanceof Array) {
                    args = result;
                    continue;
                } else {
                    return result;
                }
            }
            const kT1: tokenType = findKeywordType(args[1]);
            if (args.length === 2) {
                const result = await executeTwoTokens(kT0, kT1, args);
                if (result instanceof Array) {
                    args = result;
                    continue;
                } else {
                    return result;
                }
            }
            const kT2: tokenType = findKeywordType(args[2]);
            if (args.length === 3) {
                const result = await executeThreeTokens(kT0, kT1, kT2, args);
                if (result instanceof Array) {
                    args = result;
                    continue;
                } else {
                    return result;
                }
            }

            // if there are more than 3 arguments we have to check if the next token combination has precedence over the current one

            //TODO: implement nextHasPrecedence
            const precedenceIdx: number = nextHasPrecedence(args);
            if (precedenceIdx === 1) {
                const result = await executeOneToken(kT0, args);
                if (result instanceof Array) {
                    args = result;
                    continue;
                } else {
                    return result;
                }
            }
            else if (precedenceIdx === 2) {
                const result = await executeTwoTokens(kT0, kT1, args);
                if (result instanceof Array) {
                    args = result;
                    continue;
                } else {
                    return result;
                }
            }
            else {
                const result = await executeThreeTokens(kT0, kT1, kT2, args);
                if (result instanceof Array) {
                    args = result;
                    continue;
                } else {
                    return result;
                }
            }



        }
        console.log("succesful end of GO");
        return dictationMode.other;
    } catch (error) {
        console.log(error);
        return dictationMode.execution_failed;
    }
}