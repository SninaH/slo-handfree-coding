

import { functions } from './functions';
import { dictationMode } from './functions';
import * as vscode from 'vscode';

// Execute the function based on the command 
function executeFunctionByName(fName: string, args: any[]): dictationMode {
    const func = functions[fName as keyof typeof functions]; // Add an index signature to allow indexing with a string
    if (typeof func === 'function') {
        return func(args); // Change the spread operator to a rest parameter
    } else {
        console.error(`Function ${fName} not found.`);
        return dictationMode.function_not_found;
    }
}

// Get the function name and its arguments 
function getNameAndArgs(transcription: string): [string, any[]] { 
    let commands: { [key: string]: string } = vscode.workspace.getConfiguration('slo-handsfree-coding').get('commandsName') as { [key: string]: string };
    if(commands.hasOwnProperty(transcription)) {
        return [commands[transcription], []];
    }
    commands = vscode.workspace.getConfiguration('slo-handsfree-coding').get('commandsWithParametersName') as { [key: string]: string };
    for (let key in commands) {
        let idx_substring = transcription.indexOf(key);
        if(idx_substring !== -1) {
            let args = transcription.substring(idx_substring + key.length).trim().split(' ');
            return [commands[key], args];
        }
    }
    console.log("no command found");
    return ["", []];
}

function matchStringWithKeysOfValue(s: string, value:string, obj: { [key: string]: string }): boolean {
    const KeysWithTheValue = Object.keys(obj).filter(key => obj[key] === value);
    return KeysWithTheValue.some(key => s.includes(key));
}
//process the transcription and execute the command
//return name of command
export default function findCommandOffline(transcription: string, narekovanje: boolean, posebniZnaki: boolean): dictationMode {
    let dicMode = dictationMode.other;
    if(narekovanje && posebniZnaki) {
        const commands = vscode.workspace.getConfiguration('slo-handsfree-coding').get('commandsName') as { [key: string]: string };
        if (matchStringWithKeysOfValue(transcription, "STOP_DICTATING", commands)) {
            return dictationMode.stop_dictating;
        }else if (matchStringWithKeysOfValue(transcription, "STOP", commands)) {
            return dictationMode.stop;
        }
        dicMode = dictationMode.dictate;
        executeFunctionByName('insert', [transcription]);
    }else if(narekovanje && !posebniZnaki) {
        const commands = vscode.workspace.getConfiguration('slo-handsfree-coding').get('commandsName') as { [key: string]: string };
        if (matchStringWithKeysOfValue(transcription, "STOP_DICTATING", commands)) {
            return dictationMode.stop_dictating;
        }else if (matchStringWithKeysOfValue(transcription, "STOP", commands)) {
            return dictationMode.stop;
        }
        dicMode = dictationMode.dictate_without_special_characters;
        executeFunctionByName('insert_plain_text', [transcription]);
    }
    else{    
        // Get the function name and its arguments
        const [fName, args] = getNameAndArgs(transcription);
        if(fName === "") {
            return dictationMode.no_command_found;
        }
        // Execute the function based on the command
        dicMode = executeFunctionByName(fName, args);  }
    return dicMode;
}