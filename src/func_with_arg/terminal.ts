import * as vscode from 'vscode';
import { dictationMode } from '../functions';



export default async function TERMINAL(args: any[]): Promise<dictationMode> {
    console.log("Terminal");
    console.log(args);
    if (args.length === 0) {
        return dictationMode.invalid_arguments;
    }
    while (args.length > 0) {
        let arg = args.shift();
        switch (arg) {
            case "NEW":
                vscode.commands.executeCommand('workbench.action.terminal.new');
                break;
            case "SHOW":
                vscode.commands.executeCommand('workbench.action.terminal.focus');
                break;
            case "HIDE":
                vscode.commands.executeCommand('workbench.action.closePanel');
                break;
            case "CLEAR":  
                vscode.commands.executeCommand('workbench.action.terminal.clear');
                break;
            case "KILL":
                vscode.commands.executeCommand('workbench.action.terminal.kill');
                break;
            case "FOCUS_NEXT":
                vscode.commands.executeCommand('workbench.action.terminal.focusNext');
                break;
            case "FOCUS_PREVIOUS":
                vscode.commands.executeCommand('workbench.action.terminal.focusPrevious');
                break;
            case "SELECT_ALL":
                vscode.commands.executeCommand('workbench.action.terminal.selectAll');
                break;
            case "SCROLL_DOWN":
                vscode.commands.executeCommand('workbench.action.terminal.scrollDown');
                break;
            case "SCROLL_UP":
                vscode.commands.executeCommand('workbench.action.terminal.scrollUp');
                break;
        }
    }
    return dictationMode.other;
}
