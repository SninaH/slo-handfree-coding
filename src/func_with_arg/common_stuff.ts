export enum tokenType {
    dir = "dir",
    pyObj = "pyObj",
    vsObj = "vsObj",
    none = "none",
    number = "number",
    selection = "selection"
}

export function findTokenType(arg: any): tokenType {

    if (typeof arg === 'number') {
        return tokenType.number;
    } else if (typeof arg === 'string') {
        if (directions.includes(arg)) {
            return tokenType.dir;
        } else if (vscodeObjects.includes(arg)) {
            return tokenType.vsObj;
        } else if (pythonOjects.includes(arg)) {
            return tokenType.pyObj;
        } else if (selection.includes(arg)) {
            return tokenType.selection;
        }
    }
    return tokenType.none;

}

/**
 * Array of directions.
 */
export const directions = ["UP", "DOWN", "LEFT", "RIGHT", "START", "END", "NEXT", "PREVIOUS"];

/**
 * Array of Python objects.
 */
export const pythonOjects = [
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
export const vscodeObjects = ["LINE", "FILE", "VIEW_PORT", "BLANK_LINE", "TAB", "DEFINITION", "PAGE"];

export const selection = ["ALL", "MORE", "LESS", "FROM", "TO", "TO_START", "TO_END"];