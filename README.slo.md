# slo-handsfree-coding README
[Click for README in English](README.md)

Za podrobnejše informacije o namestitvi in uporabi preberite [Wiki](https://github.com/SninaH/slo-handfree-coding/wiki).

Ta projekt je bil izdelan kot del diplomske naloge "Razvoj orodja za glasovno programiranje" na Univerzi v Ljubljani pri interdisciplinarnem univerzitetnem študijskem programu prve stopnje Računalništvo in matematika.

To je razširitev za urejevalnik Visual Studio Code. S tem priključkom lahko kodirate tako, da govorite v mikrofon ukaze v slovenščini.
Lahko pišete in urejate Python kodo ali narekujete splošno besedilo in uporabljate razne funkcije, ki jih ponuja VScode kot je razhroščevanje. 

## Funkcionalnosti, ki jih orodje ponuja

<!-- Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow. -->

Vse funkcionalnosti orodja so dostopne preko ustno izrečenih ukazov. 
Lahko narekujete besede, posebne znake, Python konstrukcije v kratki obliki ali v obliki predlog (template).
Poleg tega orodje ponuja premikanje kazalca, navigiranje po zavihkih, odpiranje novih datotek in novih oken ter zapiranje datotek oz. zavihkov in oken.
Orodje ponuja tudi uporabo razhroščevalnika in terminala.
Imena vseh ukazov lahko spreminjate v nastavitvah.

Navodila za uporabo in [seznam vseh ukazov oz. funkcionalnosti](https://github.com/SninaH/slo-handfree-coding/wiki/Ukazi-za-Slo%E2%80%90handsfree%E2%80%90coding) najdete na [Wiki](https://github.com/SninaH/slo-handfree-coding/wiki).


## Navodila za namestitev in zahteve za delovanje

<!-- If you have any requirements or dependencies, add a section describing those and how to install and configure them. -->
Podrobnejša navodila najdete na [Wiki](https://github.com/SninaH/slo-handfree-coding/wiki).

Za popolno delovanje te razširitve morate imeti nameščen python3 na vašem sistemu.

To orodje je namenjeno za uporabo z razpoznavalnikom iz RSDO projekta. Za uporabo razpoznavalnika potrebujete docker. Trenutno uradni ne deluje, zato predlagamo uporabo https://github.com/clarinsi/Slovene_ASR_e2e/pull/5

Za zaznavanje govora imate na voljo dva snemalnika: python in serenade. 
 - Speech Recorder (v nastavitvah imenovan serenade) je že vključen v to razširitev. Je snemalnik govora, ki ga uporablja [Serenade](https://serenade.ai/), orodje za glasovno programiranje v angleščini.
 - Za uporabo python sistema za snemanje govora \[priporočeno], si morate namestiti na vaš sistem Python knjižnjice PyAudio, SpeechRecognition in Requests. Lahko jih namestite z pip: `pip install pyaudio`, `pip install SpeechRecognition` and `pip install requests`.

Kateri snemalnik govora želite uporabljati, lahko izberete v nastavitvah pod slo-handsfree-coding.speechRecorder

Za namestiti razširitev, si naložite iz [Releases](https://github.com/SninaH/slo-handfree-coding/releases) datoteko s končnico .vsix, nato v VScode pojdite pod Extensions view, Kliknite **Views and More Actions...**, izberite **Install from VSIX...** in nato izberite .vsix datoteko, ki ste jo naložili.


## Extension Settings

<!-- Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something. -->

## Splošne nastavitve

### slo-handsfree-coding.transcriberLinkTranscribe

Povezava za api za pretvorbo wav audio datoteke govora v tekst. 

Če ste namestili razpoznavalnik od slovene-ASR-e2e preko docker pazite le da je število po [localhost](http://localhost): pravo.

Če želite poskusiti delovanje s kakim drugim razpoznavalnikom spremenite povezavo na api za pretvorbo wav audio datoteke v text vašega razpoznavalnika, ter nastavite ime json parametra kjer je rezultat zapisa v nastavitvah pri `slo-handsfree-coding.transcriptionResultJSONName`

### slo-handsfree-coding.transcriberLinkHealthCheck

Povezava do api za healthcheck razpoznavalnika. Uporablja se za preverjanje ali razpoznavalnik deluje in pošlje uporabniku opozorilo, če ni.

Če ste namestili razpoznavalnik od slovene-ASR-e2e preko docker pazite le da je število po [localhost](http://localhost): pravo.

Če želite poskusiti delovanje s kakim drugim razpoznavalnikom spremenite povezavo na api za pretvorbo wav audio datoteke v text vašega razpoznavalnika, ter nastavite ime json parametra kjer je rezultat zapisa v nastavitvah pri `slo-handsfree-coding.transcriptionResultJSONName`

### slo-handsfree-coding.transcriptionResultJSONName

Ime ključa od JSON objekta, ki ga vrne razpoznavalnik, kjer je rezultat zapisa. Če uporabljate razpoznavalnik slovene-ASR-e2e pustite `result`

### slo-handsfree-coding.speechRecorder

Tu izberete kateri sistem snemanja govora želite uporabiti. Na voljo sta iz python modula SpeechRecognition in od serenade sheech-recorder.

### slo-handsfree-coding.transcriberTimeout

Maksimalen čas v sekundah za posneti in predelati z razpoznavalnikom. Privzeta vrednost je 120 sekund.

### slo-handsfree-coding.delimiters

Vsebina med tema znakoma ne bo procesirana. Znaka morata biti točno dva: znak za začetek in znak za konec vsebine, ki naj ne bo procesirana. Privzeta vrednost sta `<` ter `>` 

### slo-handsfree-coding.transcriptionToLowercase

Ali naj bo zapis razpoznavalnika pretvorjen vse v male črke pred procesiranjem. 

## Nastavitve imena ukazov

Za razlago delovanja vsakega ukaza poglejte [seznam vseh ukazov](https://github.com/SninaH/slo-handfree-coding/wiki/Ukazi-za-Slo%E2%80%90handsfree%E2%80%90coding) 

Vse skupine nastavitev so sestavljene na enak način:

- Na levi strani so imena ukazov, ki jih izrečete, na desni pa ime ukaza v katerega se preslika in program nato procesira.
- Za spremeniti ime ukaza, pritisnite ikono za urejati na skrajno desni strani vrstice z ukazom, ki ga želite spremeniti. Spreminjajte vrednosti le leve strani. Ime ne sme vsebovati velikih črk, številk ali posebnih znakov
- Če ne želite da zazna ukaza, spremenite ime v znak, ki ni v abecedi kot je `_`, (oz. v primeru da uporabljate drug razpoznavalnik, spremenite ime v znak, ki ga razpoznavalnik nikoli ne izpiše)
- dva različna ukaza ne smeta imeti popolnoma enakega imena
- ukazi so lahko sestavljeni iz več besed. Prednost imajo daljši ukazi:
    - npr. če imamo ukaza `“nehaj” : ”STOP”` in `“nehaj narekovati” : “STOP_DICTATING”`, bo priključek najprej preveril ali je razpoznavalnik vrnil tekst z `nehaj narekovati` in če se ne ujema bo pogledal ali tekst vsebuje `nehaj`.
- Ko dodajate/spreminjate imena, pazite, da vključite vse oblike besede, ki boste uporabili (sklanjatve, spregatve, …), kot nova imena, saj priključek drugače ne ve, da je to ista beseda le v drugi obliki (npr. če ukaz `NEW` ima le ime `nova`, ko kličete ukaz kot `novi`, ne bo zaznal kot ukaz)

### slo-handsfree-coding.commandsName

Imena za ukaze, ki nimajo parametrov. Zato, da bo sistem zaznal ta ukaz se mora celoten izpis govora uporabnika ujemati z ukazom.

### slo-handsfree-coding.commandsWithParametersName

Imena za ukaze, ki potrebujejo parametre. Parametri morajo biti za ukazom. Priključek bo procesiral od kjer najde ime ukaza v tekstu, ki ga vrne razpoznavalnik, do konca teksta. 

## Nastavitve imen parametrov

### slo-handsfree-coding.pythonObjectsName

Imena parametrov, ki predstavljajo elemente v python kodi. Te parametre se lahko uporabi z ukazi in ADD, NEW. Z ukazom GO deluje trenutno samo PARAMETER.

### slo-handsfree-coding.vscodeObjectsName

Imena parametrov, ki predstavljajo elemente urejevalnika VScode. Uporablja se za ukaze GO, SELECT, ADD, NEW.

### slo-handsfree-coding.directionsName

Imena parametrov, ki predstavljajo smeri. Uporablja se za ukaza GO in SELECT.

### slo-handsfree-coding.selectionName

Imena parametrov, ki se uporablja z ukazom SELECT

### slo-handsfree-coding.terminalActionsName

Imena parametrov, ki se uporablja z ukazom TERMINAL

### slo-handsfree-coding.suggestionName

Imena parametrov, ki se uporablja z ukazom SUGGESTION

## ostalo

### slo-handsfree-coding.specialCharactersName

Tu lahko določite imena posebnih znakov, črk ali besedil v katere priključek pretvori pri ukazih DICTATE ter ADD.

### slo-handsfree-coding.numbersName

Tu lahko spremenite imena števil.

### slo-handsfree-coding.terminalOperationName

Imena operacij, za izvesti v terminalu. Uporabite jih kot parameter za ukaz EXECUTE. Deluje tako kot da bi operacijo oz. desno stran tabele v nastavitvah kopirali, prilepili v terminal od VScode in pritisnili enter oz. return.

### slo-handsfree-coding.vscodeCommandsName

Imena parametrov za ukaz COMMAND. Tu lahko dodajate ukaze od VScode, ki se jih da izvesti z `vscode.commands.executeCommand`. Ukaze lahko najdete npr. na https://code.visualstudio.com/docs/getstarted/keybindings#_basic-editing

<!-- ## Known Issues -->

<!-- Calling out known issues can help limit users opening duplicate issues against your extension. -->

## Release Notes

<!-- Users appreciate release notes as you update your extension. -->

### 1.0.0

Prva verzija
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
