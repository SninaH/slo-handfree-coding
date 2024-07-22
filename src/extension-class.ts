import * as vscode from 'vscode';
import { PythonShell, Options } from 'python-shell';
import CommandHandler from "./find-command-offline";
import { dictationMode } from './functions';



export default class Extension {
    private transcriberTimeout: number;
    private myStatusBarItem: vscode.StatusBarItem;
    private stopButton: vscode.StatusBarItem;
    private pythonRazpoznavalnikURL: string;
    private narekovanje: boolean = false;
    private posebniZnaki: boolean = true;
    private crkuj: boolean = false;
    private capsLock: boolean = false;
    private context: vscode.ExtensionContext;
    private pressedStopButton: boolean = false;
    startListeningOnClick: vscode.Disposable;
    transcriberLink: string;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;

        //get timeout time from settings
        this.transcriberTimeout = vscode.workspace.getConfiguration('slo-handsfree-coding').get('transcriberTimeout') as number;

        //set python file path for speech recognition
        this.pythonRazpoznavalnikURL = vscode.Uri.joinPath(context.extensionUri, "src", "razpoznavalnik.py").fsPath;

        //get the path to the transcriber from settings
        this.transcriberLink = vscode.workspace.getConfiguration('slo-handsfree-coding').get('transcriberLink') as string;

        //create status bar item for listening
        let StatusBarOnClickCommandName: string = 'slo-handsfree-coding.listen';
        this.myStatusBarItem = vscode.window.createStatusBarItem('statusBarRazpoznavalnik', vscode.StatusBarAlignment.Right, 100);
        this.myStatusBarItem.command = StatusBarOnClickCommandName;
        this.updateStatusBarNotListening();
        this.context.subscriptions.push(this.myStatusBarItem);

        //create status bar item for stopping listening
        this.stopButton = vscode.window.createStatusBarItem('stopButton', vscode.StatusBarAlignment.Right, 99);
        this.stopButton.text = `$(stop-circle) Stop poslušanje`;
        let StopButtonOnClickCommandName: string = 'slo-handsfree-coding.stopListening';
        this.stopButton.command = StopButtonOnClickCommandName;
        this.stopButton.show();
        this.context.subscriptions.push(this.stopButton);

        //add stop button functionality
        let stopListeningOnClick = vscode.commands.registerCommand(StopButtonOnClickCommandName, () => {
            this.pressedStopButton = true;
            this.stopButton.text = `$(stop) Poslušanje ustavljeno`;
        });
        // context.subscriptions.push(stopListeningOnClick);

        this.startListeningOnClick = vscode.commands.registerCommand(StatusBarOnClickCommandName, async () => {
            let transcription: string = await this.startListening();
            //remove tags for emotion recognition and question marks
            transcription = transcription.replace(/<[^>]+>/g, '');
            transcription = transcription.replace(/⁇/g, '');
            vscode.window.showInformationMessage(transcription);
            //procesiraj ukaz
            let command: dictationMode = await CommandHandler(this.context, transcription, this.narekovanje, this.posebniZnaki, this.crkuj, this.capsLock);
            console.log(command);

            if (command === dictationMode.dictate) {
                this.narekovanje = true;
                this.posebniZnaki = true;
            } else if (command === dictationMode.dictate_without_special_characters) {
                this.narekovanje = true;
                this.posebniZnaki = false;
            } else if (command === dictationMode.stop_dictating) {
                this.narekovanje = false;
                this.posebniZnaki = true;
                this.crkuj = false;
                this.capsLock = false;
            } else if (command === dictationMode.spell) {
                this.crkuj = true;
            } else if (command === dictationMode.spell_uppercase) {
                this.crkuj = true;
                this.capsLock = true;
            } else if (command === dictationMode.no_command_found) {
                vscode.window.showInformationMessage('Noben ukaz ni bil najden');
            } else if (command === dictationMode.execution_failed) {
                vscode.window.showErrorMessage('Izvedba ukaza ni bila uspešna');
            } else if (command === dictationMode.no_active_editor) {
                vscode.window.showErrorMessage('Ni aktivnega urejevalnika');
            } else if (command === dictationMode.invalid_arguments) {
                vscode.window.showErrorMessage('Neveljavni argumenti');
            }

            if (command === dictationMode.stop) {
                this.narekovanje = false;
                this.posebniZnaki = true;
                this.crkuj = false;
                this.capsLock = false;
            }
            //če ukaz ni 'stop', nadaljujemo z poslušanjem
            else if (!this.pressedStopButton) {
                vscode.commands.executeCommand(StatusBarOnClickCommandName);
            } else if (this.pressedStopButton) {
                this.narekovanje = false;
                this.posebniZnaki = true;
                this.crkuj = false;
                this.capsLock = false;
                this.pressedStopButton = false;
                this.stopButton.text = `$(stop-circle) Stop poslušanje`;
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
        if (this.crkuj) {
            this.myStatusBarItem.text = `$(mic-filled) črkovanje`;
        } else if (this.narekovanje && this.posebniZnaki) {
            this.myStatusBarItem.text = `$(mic-filled) narekovanje`;
        } else if (this.narekovanje && !this.posebniZnaki) {
            this.myStatusBarItem.text = `$(mic-filled) narekovanje brez posebnih znakov`;
        } else {
            this.myStatusBarItem.text = `$(mic-filled) poslušam`;
        }
        this.myStatusBarItem.show();

        try {
            let options: Options = {
                args: [this.transcriberLink]
            };
            console.log('PythonShell started for recording and transcription');
            const timeout = (ms: number) => new Promise(resolve => setTimeout(resolve, ms, 'Timeout'));
            const milliseconds: number = this.transcriberTimeout * 1000;
            const messages = await Promise.race([
                PythonShell.run(this.pythonRazpoznavalnikURL, options),
                timeout(milliseconds)
            ]) as string[] | "Timeout";

            if (messages === 'Timeout') {
                console.error(`Operation timed out after ${this.transcriberTimeout} seconds`);
                // Handle timeout case here
                this.updateStatusBarNotListening();
                throw new Error('Transcription timed out');
            } else {
                //označi, da ne posluša več
                console.log('Listening stopped');
                this.updateStatusBarNotListening();
                console.log(messages);


                if (messages && messages.length > 0) {
                    let lastMessage = messages[messages.length - 1];
                    let transcription: string;
                    //TODO: preveri vse tipe Response, ne le 200
                    if (lastMessage === '[ERROR] Unable to connect to server') {
                        vscode.window.showErrorMessage('Napaka pri povezavi s strežnikom. Preverite ali deluje razpoznavalnik (docker) in ali ste napisali pravo povezavo v nastavitvah.');
                        throw new Error('server connection error: transcriber not running or wrong link in settings');
                    } else {
                        (lastMessage === '<Response [200]>') ? transcription = '' : transcription = lastMessage;
                        return transcription;
                    }
                } else {
                    throw new Error('No messages received from PythonShell');
                }
            }


        } catch (error) {
            this.updateStatusBarNotListening();
            console.error('Error during transcription:', error);
            throw error; // Re-throw the error if you want the calling function to handle it
        }
    }



}
