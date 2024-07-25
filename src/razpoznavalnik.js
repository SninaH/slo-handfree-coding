const vscode = require('vscode');
const { SpeechRecorder } = require("speech-recorder");
const { WaveFile } = require("wavefile");

let buffer = [];
const sampleRate = 16000; // 16 kHz
let recorder = null; // Initialize recorder reference
let transcriptionCallback = null; // Callback to handle transcription result

function createWavFromBuffer(buffer, sampleRate) {
    let wav = new WaveFile();
    wav.fromScratch(1, sampleRate, '16', buffer);
    return wav;
}

async function transcribe(wav, transcribeLink, healthCheckLink, outputChannel) {

    try {
        // Perform health check
        const healthCheckResponse = await fetch(healthCheckLink);
        if (!healthCheckResponse.ok) {
            throw new Error('[ERROR] Health check failed');
        }

        // If health check passes, proceed with transcription
        const wavBuffer = wav.toBuffer();
        const formData = new FormData();
        formData.append("audio_file", new Blob([wavBuffer]), "audio.wav");

        const transcriptionResponse = await fetch(transcribeLink, {
            method: "POST",
            body: formData
        });

        if (!transcriptionResponse.ok) {
            throw new Error('[ERROR] Transcription request failed');
        }

        const transcriptionResult = await transcriptionResponse.json();
        return transcriptionResult["result"];
    } catch (error) {
        outputChannel.appendLine(`[slo-handsfree ERROR] "${error.message}". Is transcription server running?`);

        console.error(error.message);
        vscode.window.showErrorMessage(`Napaka pri povezavi s strežnikom. Preverite ali deluje razpoznavalnik (docker) in ali ste napisali pravo povezavo v nastavitvah.`);
        return null;
    }
}

function initializeRecorder(outputChannel, transcribeLink, healthCheckLink, callback) {
    transcriptionCallback = callback; // Assign the passed callback to the global variable
    recorder = new SpeechRecorder({
        sampleRate,
        consecutiveFramesForSilence: 10,
        onChunkStart: () => {
            console.log(Date.now(), "Chunk start");
            outputChannel.appendLine("Chunk start");

            buffer = [];
        },
        onAudio: ({ audio, speech }) => {
            if (speech) {
                buffer.push(...audio);
            }
        },
        onChunkEnd: async () => {
            console.log(Date.now(), "Chunk end");
            outputChannel.appendLine("Chunk end");

            if (buffer.length > 0) {
                const wav = createWavFromBuffer(buffer, sampleRate);
                const transcription = await transcribe(wav, transcribeLink, healthCheckLink, outputChannel);
                console.log("Transcription:", transcription);
                if (transcriptionCallback) {
                    transcriptionCallback(transcription); // Call the callback with the transcription result
                }
                buffer = [];
            }
        }
    });
}

async function startRecording(transcribeLink, healthCheckLink, outputChannel) {
    try {
        return new Promise((resolve, reject) => {
            // Check if the recorder is already initialized and not currently recording
            if (!recorder || recorder.isRecording === false) {
                initializeRecorder(outputChannel, transcribeLink, healthCheckLink, (transcription) => {
                    resolve(transcription); // Resolve the promise with the transcription result
                });
                console.log("Recording started...");
                outputChannel.appendLine("Recording started...");

                recorder.start();
                recorder.isRecording = true; // Add a flag to indicate recording has started
            } else {
                reject("Recorder is already in use."); // Reject the promise if the recorder is already recording
            }
        });
    } catch (err) { reject(err); }
}

async function stopRecording(outputChannel) {
    if (recorder) {
        console.log("Recording stopped.");
        outputChannel.appendLine("Recording stopped.");

        await recorder.stop();
        recorder.isRecording = false; // Reset the recording flag
    }
}

module.exports = {
    startRecording,
    stopRecording
};