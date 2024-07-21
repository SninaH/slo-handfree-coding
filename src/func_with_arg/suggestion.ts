import * as vscode from 'vscode';
import { dictationMode } from '../functions';
import { findTokenType, tokenType } from './common_stuff';

const suggestTokenToFunction: { [key: string]: () => Promise<void> } = {
    "SHOW": async () => {
        await vscode.commands.executeCommand('editor.action.triggerSuggest');
    },
    "ACCEPT": async () => {
        await vscode.commands.executeCommand('editor.action.inlineSuggest.acceptNextLine');
        console.log("accepting suggestion");
    }
};

async function executeOneToken(kT0: tokenType, args: any[]): Promise<dictationMode | any[]> {
    if (kT0 === tokenType.suggestion) {
        const key = args[0];
        console.log("key: ", key);
        if (suggestTokenToFunction[key]) {
            console.log(`executing suggestion ${key}`);
            await suggestTokenToFunction[key]();
            console.log("executed suggestion");
            args = args.slice(1);
            return args;
        } else {
            return dictationMode.invalid_arguments;
        }
    } else {
        return dictationMode.invalid_arguments;
    }
}

export default async function SUGGESTION(args: any[]): Promise<dictationMode> {
    if (args.length === 0) {
        await suggestTokenToFunction["SHOW"]();
        return dictationMode.other;
    }
    while (args.length > 0) {
        const kT0 = findTokenType(args[0]);
        const result = await executeOneToken(kT0, args);
        if(result instanceof Array){
            args = result;
            continue;
        }else{
            return result;
        }
    }
    return dictationMode.other;
}