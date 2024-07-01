

import { functions } from './functions';
import { dictationMode } from './functions';
import { changeKeyWithObjectValue } from './functions';
import { changeNumbers } from './functions';
import * as vscode from 'vscode';

// Execute the function based on the command 
async function executeFunctionByName(fName: string, args: any[]): Promise<dictationMode> {
    const func = functions[fName as keyof typeof functions]; // Add an index signature to allow indexing with a string
    if (typeof func === 'function') {
        const r = await func(args); // Change the spread operator to a rest parameter
        return r;
    } else {
        console.error(`Function ${fName} not found.`);
        return dictationMode.function_not_found;
    }
}

// Get the function name and its arguments 
async function getNameAndArgs(transcription: string): Promise<[string, any[]]> { 
    //TODO add support for multiple commands in one transcription
    
    //get commands without parameters
    const commandsNoParameter: { [key: string]: string } = await vscode.workspace.getConfiguration('slo-handsfree-coding').get('commandsName') as { [key: string]: string };
    if(commandsNoParameter.hasOwnProperty(transcription)) {
        console.log(`found command without parameters ${commandsNoParameter[transcription]}`);
        return [commandsNoParameter[transcription], []];
    }
    //get commands with parameters
    const commands = await vscode.workspace.getConfiguration('slo-handsfree-coding').get('commandsWithParametersName') as { [key: string]: string };
    const pyObjects = await vscode.workspace.getConfiguration('slo-handsfree-coding').get('pythonObjectsName') as { [key: string]: string };
    const vsObjects = await vscode.workspace.getConfiguration('slo-handsfree-coding').get('vscodeObjectsName') as { [key: string]: string };
    const keywords = await vscode.workspace.getConfiguration('slo-handsfree-coding').get('directionsName') as { [key: string]: string };
    console.log(`commands: ${commands}`);
    console.log(`objects: ${pyObjects}`);
    console.log(`objects: ${vsObjects}`);
    console.log(`keywords: ${keywords}`);
    for (let key in commands) {
        let idx_substring = transcription.indexOf(key);
        if(idx_substring !== -1) {
            //found command
            //now get the arguments
            let argsString = transcription.substring(idx_substring + key.length).trim(); //get substring after the command
            argsString = changeKeyWithObjectValue(argsString, pyObjects); //replace objects keys with their values/codes
            argsString = changeKeyWithObjectValue(argsString, vsObjects); //replace objects keys with their values/codes
            argsString = changeKeyWithObjectValue(argsString, keywords); //replace keywords keys with their values/codes
            argsString = changeNumbers(argsString); //replace words for numbers with numbers
            let args = argsString.split(/\s+(?=[A-Z0-9])/); //split by space before capital letter or number because values/codes are in uppercase and we want also numbers as parameters
            console.log(`found command ${commands[key]} and arguments ${args}`);
            return [commands[key], args];
        }
    }
    console.log("no command found");
    return ["", []];
}

function matchStringWithKeysOfValue(s: string, value:string, obj: { [key: string]: string }): boolean {
    const KeysWithTheValue: string[] = Object.keys(obj).filter(key => obj[key] === value); //get keys with the value and store them in an array
    return KeysWithTheValue.some(key => new RegExp(`\\b${key.replace(/ /g, '\\s')}\\b`).test(s)); //check if the string contains any of the keys (keys can have space within them)
}
//process the transcription and execute the command
//return name of command
export default async function findCommandOffline(transcription: string, narekovanje: boolean, posebniZnaki: boolean): Promise<dictationMode> {
    let dicMode = dictationMode.other;
    if(transcription === "") {
        return dictationMode.no_command_found;
    }
    if(narekovanje && posebniZnaki) {
        const commands = vscode.workspace.getConfiguration('slo-handsfree-coding').get('commandsName') as { [key: string]: string };
        if (matchStringWithKeysOfValue(transcription, "STOP_DICTATING", commands)) {
            console.log("stop dictating");
            return dictationMode.stop_dictating;
        }else if (matchStringWithKeysOfValue(transcription, "STOP", commands)) {
            console.log("stop");
            return dictationMode.stop;
        }
        dicMode = dictationMode.dictate;
        await executeFunctionByName('insert', [transcription]);
    }else if(narekovanje && !posebniZnaki) {
        const commands = vscode.workspace.getConfiguration('slo-handsfree-coding').get('commandsName') as { [key: string]: string };
        if (matchStringWithKeysOfValue(transcription, "STOP_DICTATING", commands)) {
            console.log("stop dictating");
            return dictationMode.stop_dictating;
        }else if (matchStringWithKeysOfValue(transcription, "STOP", commands)) {
            console.log("stop");
            return dictationMode.stop;
        }
        dicMode = dictationMode.dictate_without_special_characters;
        console.log("currently in dictate mode without special characters");
        await executeFunctionByName('insert_plain_text', [transcription]);
    }
    else{
        console.log("currently in command mode");    
        // Get the function name and its arguments
        const [fName, args] = await getNameAndArgs(transcription);
        if(fName === "") {
            console.log("no command found");
            return dictationMode.no_command_found;
        }
        // Execute the function based on the command
        dicMode = await executeFunctionByName(fName, args);  }
    return dicMode;
}