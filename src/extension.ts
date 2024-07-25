// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import Extension from './extension-class';

let OutputChannel: vscode.OutputChannel;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "slo-handsfree-coding" is now active!');

	OutputChannel = vscode.window.createOutputChannel('Slo Handsfree Coding');
	let extension = new Extension(context, OutputChannel);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('slo-handsfree-coding.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello from Slo Handsfree Coding! Za aktivirati razpoznavalnik, pritisnite na ikono z mikrofonom spodaj v status bar.');
	});
	context.subscriptions.push(disposable);

	vscode.commands.executeCommand('slo-handsfree-coding.helloWorld');

}

// This method is called when your extension is deactivated
export function deactivate() {
	OutputChannel.dispose();
}

// async function startListening():Promise<string> {
// 	console.log('Listening started');
// 	myStatusBarItem.text = `$(mic-filled) poslušam`;
// 	myStatusBarItem.show();
// 	let transcription: string;
// 	await PythonShell.run(pythonRazpoznavalnikURL, undefined).then(messages => {
// 		console.log(messages);
// 		transcription = messages[messages.length - 1];
		
// 	});
// 	return transcription;
// }



