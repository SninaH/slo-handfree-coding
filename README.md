# slo-handsfree-coding README

This is a VScode extension to write and edit Python code and use VScode features like debugging by speaking commands in the Slovenian language.
This project was created for my Thesis.

To je priključek za urejevalnik VScode, ki sem ga ustvarila za diplomsko nalogo. S tem priključkom lahko kodirate tako, da govorite v mikrofon ukaze v slovenščini.
Lahko pišete in urejate Python kodo ali narekujete splošno besedilo in uporabljate razne funkcije, ki jih ponuja VScode kot je razhroščevanje. 

## Features

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

Ta projekt uporablja python3. Če ga nimate ga prosim naložite.
Naložite tudi python knjižnice pyaudio, speech_recognition in requests. To lahko storite z `pip install pyaudio`, `pip install SpeechRecognition` ter `pip install requests` v terminalu.
Za razpoznavalnik uporablja https://github.com/clarinsi/Slovene_ASR_e2e.
Če imate težave pri namestitvi razpoznavalnika, poskusite https://github.com/clarinsi/Slovene_ASR_e2e/pull/5
Za delovanje razpoznavalnika potrebujete docker.


## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Following extension guidelines

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

**Enjoy!**
