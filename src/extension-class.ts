import * as vscode from 'vscode';
import { PythonShell } from 'python-shell';
// import CommandHandler from "./find-command-offline";



export default class Extension {
    private myStatusBarItem: vscode.StatusBarItem;
    private pythonRazpoznavalnikURL: string;
    private narekovanje: boolean = false;
    private context: vscode.ExtensionContext;
    startListeningOnClick: vscode.Disposable;	

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        
        //set python file path for speech recognition
        this.pythonRazpoznavalnikURL = vscode.Uri.joinPath(context.extensionUri, "src", "razpoznavalnik.py").fsPath;
        
        //create status bar item
        let StatusBarOnClickCommandName:string = 'slo-handsfree-coding.listen';
	    this.myStatusBarItem = vscode.window.createStatusBarItem('statusBarRazpoznavalnik', vscode.StatusBarAlignment.Right, 100);
	    this.myStatusBarItem.command = StatusBarOnClickCommandName;
	    this.updateStatusBarNotListening();
	    this.context.subscriptions.push(this.myStatusBarItem);

        this.startListeningOnClick = vscode.commands.registerCommand(StatusBarOnClickCommandName, async () => {
            let transcription: string = await this.startListening();
            vscode.window.showInformationMessage(transcription);
            //TODO: procesiraj ukaz
            
            //če ukaz ni 'stop', nadaljujemo z poslušanjem
            if(transcription !== 'stop') {
                vscode.commands.executeCommand(StatusBarOnClickCommandName);
            }
        });
        context.subscriptions.push(this.startListeningOnClick);

        let startListeningWindow = vscode.commands.registerCommand('slo-handsfree-coding.startListeningWindow', async () => {
            vscode.window.showInformationMessage('Click to start listening', 'Start')
                .then(async selection => {
                    if (selection === 'Start') {
    
                        vscode.commands.executeCommand('slo-handsfree-coding.helloWorld');
                        let transcription: string = await this.startListening();
                        vscode.window.showInformationMessage(transcription);
                    }
                });
        });
        context.subscriptions.push(startListeningWindow);

        
    }

    private updateStatusBarNotListening(): void {
        this.myStatusBarItem.text = `$(mic) ne poslušam`;
        this.myStatusBarItem.show();
    }

    async startListening(): Promise<string> {
        console.log('Listening started');
        this.myStatusBarItem.text = `$(mic-filled) poslušam`;
        this.myStatusBarItem.show();
    
        try {
            const messages: string[] = await PythonShell.run(this.pythonRazpoznavalnikURL, undefined);
            this.updateStatusBarNotListening();
            console.log(messages);
    
    
            if (messages && messages.length > 0) {
                let lastMessage = messages[messages.length - 1];
                let transcription: string;
                (lastMessage === '<Response [200]>') ? transcription = '' : transcription = lastMessage;
                return transcription;
            } else {
                throw new Error('No messages received from PythonShell');
            }
        } catch (error) {
            console.error('Error during transcription:', error);
            throw error; // Re-throw the error if you want the calling function to handle it
        }
    }

    
    
}