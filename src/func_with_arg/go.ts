import * as vscode from 'vscode';
import { dictationMode } from '../functions';
import { keywordType, findKeywordType } from './common_stuff';
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
    }
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


//REMEMBER: combination with num in front has precedence over num in the back
//REMEMBER: combination with dir in front of obj has precedence over obj in the back ("pojdi začetek dokumenta") ("pojdi gor za vrstico " ma prednost pred "pojdi za vrstico gor")
// gor prazna vrstica zacetek vrstice => DIR OBJ DIR OBJ => (DIR OBJ) (DIR OBJ)
// prazna vrstica gor vrstica dol => OBJ DIR OBJ DIR => OBJ (DIR OBJ) DIR
// ali spremenim pravila da ne pride do take cudne situacije?
// naj bo zacetek konec pred obj in gor dol levo desno naj bo za obj?
// => combination with dir in front of obj has precedence if dir PREVIOUS, NEXT, START, END otherwise (UP DOWN LEFT RIGHT) obj in front of dir has precedence

export default async function GO(args: any[]): Promise<dictationMode> {
    try {
        while (args.length > 0) {
            const kT0: keywordType = findKeywordType(args[0]);
            if (args.length === 1) {
                if (kT0 === keywordType.number) {
                    const editor = vscode.window.activeTextEditor;
                    if (!editor) {
                        return dictationMode.no_active_editor;
                    }
                    moveToLine(args[0], editor);
                    args = args.slice(1);
                } else if (kT0 === keywordType.dir) {
                    const func = DirToFunctions[args[0]];
                    if (func) {
                        func();
                    } else {
                        console.log(`invalid argument ${args[0]}`);
                        return dictationMode.invalid_arguments;
                    }
                    args = args.slice(1);
                } else if (kT0 === keywordType.vsObj) {
                    if (!moveObj(args[0])) {
                        console.log(`invalid argument ${args[0]}`);
                        return dictationMode.invalid_arguments;
                    }

                } else {
                    return dictationMode.invalid_arguments;
                }
            }
        }
        return dictationMode.other;
    } catch (error) {
        console.log(error);
        return dictationMode.execution_failed;
    }
}