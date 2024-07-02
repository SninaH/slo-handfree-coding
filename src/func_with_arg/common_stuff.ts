export enum keywordType {
    dir,
    pyObj,
    vsObj,
    none,
    number
}

export function findKeywordType(arg: any) {

    if (typeof arg === 'number') {
        return keywordType.number;
    } else if (typeof arg === 'string') {
        if (directions.includes(arg)) {
            return keywordType.dir;
        } else if (vscodeObjects.includes(arg)) {
            return keywordType.vsObj;
        } else if (pythonOjects.includes(arg)) {
            return keywordType.pyObj;
        }
    }
    return keywordType.none;

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
