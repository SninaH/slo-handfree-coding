# slo-handsfree-coding README
[Klikni za README v slovenščini [SLO]](README.slo.md)

The project was created as part of my thesis "Development of a voice programming tool" at University of Ljubljana, interdisciplinary academic higher education programme Computer Science and Mathematics.

This is a VScode extension to write and edit Python code and use VScode features like debugging and using integrated terminal by speaking commands in the Slovenian language.
You can write and edit Python code or dictate general text and use various features offered by VScode such as debugging. 

## Features

<!-- Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow. -->

All the tool's functionalities are accessible via spoken commands. 
You can dictate words, special characters, Python constructs in short form or add the template.
In addition, the tool offers cursor movement, tab navigation, opening new files and new windows, and closing files or tabs and windows.
The tool also offers the use of VScode's debugger and a terminal.
You can change the names of all commands in the settings.

Instructions for use and the [list of all commands/functionality](https://github.com/SninaH/slo-handfree-coding/wiki/Ukazi-za-Slo%E2%80%90handsfree%E2%80%90coding) can be found in the [Wiki](https://github.com/SninaH/slo-handfree-coding/wiki).

## Requirements

<!-- If you have any requirements or dependencies, add a section describing those and how to install and configure them. -->
For more detailed instructions for installation please check the documentation in the [Wiki](https://github.com/SninaH/slo-handfree-coding/wiki).

To use this extension you need python3 installed on your system.

This extension uses transcriber from https://github.com/clarinsi/Slovene_ASR_e2e.
If you have trouble installing it, try https://github.com/clarinsi/Slovene_ASR_e2e/pull/5.
You will need docker for the transcriber.

For recording speech you can use the speech recorder used by Serenade that comes with this extension.
It is recommended to install the python modules and use the python recording system instead: you will need to import PyAudio, SpeechRecognition and Requests. You can install them with pip: `pip install pyaudio`, `pip install SpeechRecognition` and `pip install requests`.

You can choose which recorder to use in settings under slo-handsfree-coding.speechRecorder


## Extension Settings

<!-- Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something. -->

### General settings

#### slo-handsfree-coding.transcriberLinkTranscribe

Link for api to convert wav audio files of speech to text. 

If you have installed the decoder from slovene-ASR-e2e via docker just make sure that the number after [localhost](http://localhost): is right.

If you want to try working with another recogniser, change the link to the api to convert the wav audio file to text of your recogniser, and set the json parameter name where the transcription result is in the settings to `slo-handsfree-coding.transcriptionResultJSONName`.

#### slo-handsfree-coding.transcriberLinkHealthCheck

Link to the healthcheck api of the transcriber. Used to check if the recogniser is working and send a warning to the user if it is not.

If you have installed the recogniser from slovene-ASR-e2e via docker, just make sure that the number after http://localhost: is correct.

If you want to try working with another recogniser, change the link on the api to convert the wav audio file to text of your recogniser, and set the json parameter name where the transcription result is in the settings at `slo-handsfree-coding.transcriptionResultJSONName`.

#### slo-handsfree-coding.transcriptionResultJSONName

The key name of the JSON object returned by the resolver where the transcript result is. If you are using the slovene-ASR-e2e recogniser, leave `result`

#### slo-handsfree-coding.speechRecorder

Here you select which speech recording system you want to use. Available from the python module SpeechRecognition and from Serenade sheech-recorder. 

#### slo-handsfree-coding.transcriberTimeout

Maximum time in seconds to capture and process with the transcriber. The default value is 120 seconds.

#### slo-handsfree-coding.delimiters

Content between these characters will not be processed. There must be exactly two characters: a start character and an end character for the content to be unprocessed. The default values are `<` and `>` 

#### slo-handsfree-coding.transcriptionToLowercase

Whether the recogniser transcript should be converted to all lowercase before processing. 

### Command name settings

All commands and their functionality are listed in [the list of all commands](https://github.com/SninaH/slo-handfree-coding/wiki/Ukazi-za-Slo%E2%80%90handsfree%E2%80%90coding) 

All setting groups are set up in the same way:

- On the left are the names of the commands you speak, on the right the name of the command to which the program is mapped and then processed.
- To change the command name, press the edit icon on the far right of the line with the command you want to change. Only change the values of the left-hand side. The name must not contain capital letters, numbers or special characters
- If you do not want the command to be detected, change the name to a non-alphabetic character such as `_`, (or if you are using another recogniser, change the name to a character that the recogniser never prints)
- two different commands must not have exactly the same name
- commands may consist of several words. Longer commands are preferred:
    - e.g. if we have the commands `"stop" : "STOP"` and `"stop dictating" : "STOP_DICTATING"`, the connector will first check whether the recogniser has returned a text with `stop dictating` and if it does not match it will look to see if the text contains `stop`.
- When adding/changing names, be careful to include all forms of the word you are going to use (conjunctions, adverbs, etc.) as new names, otherwise the connector doesn't know that it is the same word just in a different form (e.g. if the command `NEW` has only the name `new`, when you call the command as `new`, it will not detect it as a command)

#### slo-handsfree-coding.commandsName

Names for commands that have no parameters. In order for the system to detect this command, the entire output of the user's speech must match the command.

#### slo-handsfree-coding.commandsWithParametersName

Names for commands that need parameters. Parameters must follow the command. The connector will process from where it finds the command name in the text returned by the recognizer to the end of the text. 

### Parameter name settings

#### slo-handsfree-coding.pythonObjectsName

Parameter names representing elements in python code. These parameters can be used with and ADD, NEW commands. Only the PARAMETER command currently works with the GO command.

#### slo-handsfree-coding.vscodeObjectsName

The names of the parameters representing the VScode editor elements. Used for GO, SELECT, ADD, NEW commands.

#### slo-handsfree-coding.directionsName

Parameter names representing directions. Used for GO and SELECT commands.

#### slo-handsfree-coding.selectionName

Parameter names used with the SELECT command

#### slo-handsfree-coding.terminalActionsName

Parameter names used with the TERMINAL command

#### slo-handsfree-coding.suggestionName

Parameter names used with the SUGGESTION command

### other

#### slo-handsfree-coding.specialCharactersName

Here you can specify the names of special characters, letters or texts to which the connector converts when using the DICTATE and ADD commands.

#### slo-handsfree-coding.numbersName

Here you can change the names of numbers. 

#### slo-handsfree-coding.terminalOperationName

Names of operations to perform in the terminal. Use them as a parameter to the EXECUTE command. It works as if you copy the operation or the right side of the table in the preferences, paste it into the terminal from VScode and press enter or return.

#### slo-handsfree-coding.vscodeCommandsName

Parameter names for the COMMAND command. Here you can add commands from VScode that can be executed with `vscode.commands.executeCommand`. Commands can be found e.g. at https://code.visualstudio.com/docs/getstarted/keybindings#_basic-editing

<!-- ## Known Issues -->

<!-- Calling out known issues can help limit users opening duplicate issues against your extension. -->

## Release Notes

<!-- Users appreciate release notes as you update your extension. -->

### 1.0.0

Initial release of Slo-handsfree-coding

<!-- ### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

--- -->

<!-- ## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!** -->
