import * as vscode from 'vscode';
import { PythonShell, Options } from 'python-shell';
import CommandHandler from "./find-command-offline";
import { dictationMode } from './functions';
// Import from the razpoznavalnik.js file
import { startRecording, stopRecording } from './razpoznavalnik.js';
import * as path from 'path';


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
    transcriberLinkTranscribe: string;
    transcriberLinkHealthCheck: string;
    outputchannel: vscode.OutputChannel;

    constructor(context: vscode.ExtensionContext, outputchannel: vscode.OutputChannel) {
        this.context = context;

        //get timeout time from settings
        this.transcriberTimeout = vscode.workspace.getConfiguration('slo-handsfree-coding').get('transcriberTimeout') as number;

        //set python file path for speech recognition
        // this.pythonRazpoznavalnikURL = vscode.Uri.joinPath(context.extensionUri, "src", "razpoznavalnik.py").fsPath;
        this.pythonRazpoznavalnikURL = path.join(context.extensionPath, "pyscripts", "razpoznavalnik.py");

        //get the path to the transcriber from settings
        this.transcriberLinkTranscribe = vscode.workspace.getConfiguration('slo-handsfree-coding').get('transcriberLinkTranscribe') as string;
        this.transcriberLinkHealthCheck = vscode.workspace.getConfiguration('slo-handsfree-coding').get('transcriberLinkHealthCheck') as string;

        //create output channel
        this.outputchannel = outputchannel;

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
        context.subscriptions.push(stopListeningOnClick);

        this.startListeningOnClick = vscode.commands.registerCommand(StatusBarOnClickCommandName, async () => {
            let transcription: string = await this.startListening();
            //remove tags for emotion recognition and question marks
            transcription = transcription.replace(/<[^>]+>/g, '');
            transcription = transcription.replace(/⁇/g, '');
            vscode.window.showInformationMessage(transcription);
            //procesiraj ukaz
            let command: dictationMode = await CommandHandler(this.context, this.outputchannel, transcription, this.narekovanje, this.posebniZnaki, this.crkuj, this.capsLock);
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

    private async pythonTranscribing(): Promise<string> {
        let options: Options = {
            args: [this.transcriberLinkTranscribe, this.transcriberLinkHealthCheck]
        };
        console.log('PythonShell started for recording and transcription');
        this.outputchannel.appendLine('PythonShell started for recording and transcription');
        

        const timeout = (ms: number) => new Promise(resolve => setTimeout(resolve, ms, 'Timeout'));
        const milliseconds: number = this.transcriberTimeout * 1000;
        const messages = await Promise.race([
            PythonShell.run(this.pythonRazpoznavalnikURL, options),
            timeout(milliseconds)
        ]) as string[] | "Timeout";

        if (messages === 'Timeout') {
            console.error(`Operation timed out after ${this.transcriberTimeout} seconds`);
            this.outputchannel.appendLine(`[ERROR] Recording timed out after ${this.transcriberTimeout} seconds`);
            
            // Handle timeout case here
            this.updateStatusBarNotListening();
            throw new Error('Transcription timed out');
        } else {
            //označi, da ne posluša več
            console.log('Listening stopped');
            this.outputchannel.appendLine('Listening stopped');
            
            this.updateStatusBarNotListening();
            console.log(messages);


            if (messages && messages.length > 0) {
                let lastMessage = messages[messages.length - 1];
                let transcription: string;
                //TODO: preveri vse tipe Response, ne le 200
                if (lastMessage === '[ERROR] Unable to connect to server') {
                    vscode.window.showErrorMessage('Napaka pri povezavi s strežnikom. Preverite ali deluje razpoznavalnik (docker) in ali ste napisali pravo povezavo v nastavitvah.');
                    this.outputchannel.appendLine('Napaka pri povezavi s strežnikom. Preverite ali deluje razpoznavalnik (docker) in ali ste napisali pravo povezavo v nastavitvah.');
                    
                    throw new Error('server connection error: transcriber not running or wrong link in settings');
                } else {
                    (lastMessage === '<Response [200]>') ? transcription = '' : transcription = lastMessage;
                    console.log('Transcription:', transcription);
                    this.outputchannel.appendLine('Python Transcription: ' + transcription);
                    
                    return transcription;
                }
            } else {
                this.outputchannel.appendLine('No messages received from PythonShell');
                
                throw new Error('No messages received from PythonShell');
            }
        }
    }

    private async serenadeTranscribing(): Promise<string> {
        try {
            const transcription = await startRecording(this.transcriberLinkTranscribe, this.transcriberLinkHealthCheck, this.outputchannel);
            console.log('Transcription:', transcription);
            this.outputchannel.appendLine('Serenade speech-recorder Transcription: ' + transcription);
            
            return transcription;
        } catch (error) {
            if (error instanceof Error && error.message === '[ERROR] Health check failed') {
                vscode.window.showErrorMessage('Napaka pri healthcheck strežnika. Preverite ali deluje razpoznavalnik (docker) in ali ste napisali pravo povezavo v nastavitvah.');
                    this.outputchannel.appendLine('Napaka pri healthcheck strežnika. Preverite ali deluje razpoznavalnik (docker) in ali ste napisali pravo povezavo v nastavitvah.');
                    
                    throw new Error('server connection error: transcriber not running or wrong link in settings');
                // Handle the specific error, e.g., by notifying the user or taking corrective action
            } else {
                // Handle other types of errors
                console.error("An unexpected error occurred:", error);
                this.outputchannel.appendLine("An unexpected error occurred: " + error);
                
                throw error;
            }
        } finally {
            await stopRecording(this.outputchannel);
            console.log('Listening stopped');
            this.outputchannel.appendLine('Listening stopped');
            
            this.updateStatusBarNotListening();
            
        }
        
    }

    private async getRecorderSetting(): Promise<string> {
        const recorder = vscode.workspace.getConfiguration('slo-handsfree-coding').get<string>('speechRecorder');
        if (!recorder) {
            throw new Error('Recorder not selected');
        }
        return recorder;
    }
    
    private async transcribeBasedOnRecorder(recorder: string): Promise<string> {
        switch (recorder) {
            case 'serenade':
                return await this.serenadeTranscribing();
            case 'python':
                return await this.pythonTranscribing();
            default:
                throw new Error(`Unsupported recorder: ${recorder}`);
        }
    }
    
    async startListening(): Promise<string> {
        console.log('Listening started');
        this.outputchannel.appendLine('Listening started');
        
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
            // check from settings slo-handsfree-coding.recorder which recorder is being used
            // if serenade is selected, use serenadeTranscribing
            // if python is selected, use pythonTranscribing
            const recorder: string = await this.getRecorderSetting();
            return await this.transcribeBasedOnRecorder(recorder);

        } catch (error) {
            this.updateStatusBarNotListening();
            console.error('Error during transcription:', error);
            throw error; // Re-throw the error if you want the calling function to handle it
        }
    }



}
