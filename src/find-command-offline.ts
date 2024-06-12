

// function executeFunctionByName(fName: string, ...args: any[]): void {
//     let func = loadMethod(fName as keyof typeof functions); // Cast fName to keyof typeof functions
//     if (typeof func === 'function') {
//         func(...args);
//     } else {
//         console.error(`Function ${fName} does not exist.`);
//     }
// }

// function loadMethod<K extends keyof typeof functions>(fnName: K ): typeof functions[K]{
//     return functions[fnName]; 
// }

// // get the name of the function and its arguments from transcription
// function getNameAndArgs(transcription: string): [string, any[]] {
//     //TODO: procesiraj vse možnosti
//     const words: string[] = transcription.split(' ');
//     const fName: string = words[0];
//     const args: string[] = words.slice(1);
//     return [fName, args];
// }

// export default function findCommandOffline(command: string): void {
//     // Get the function name and its arguments
//     const [fName, args] = getNameAndArgs(command);
//     // Execute the function based on the command
//     executeFunctionByName(fName, ...args);  
// }