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

async function transcribe(wav, transcribeLink, healthCheckLink) {

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
        console.error(error.message);
        vscode.window.showErrorMessage(error.message);
        return null;
    }
}

function initializeRecorder(transcribeLink, healthCheckLink, callback) {
    transcriptionCallback = callback; // Assign the passed callback to the global variable
    recorder = new SpeechRecorder({
        sampleRate,
        consecutiveFramesForSilence: 20,
        onChunkStart: () => {
            console.log(Date.now(), "Chunk start");
            buffer = [];
        },
        onAudio: ({ audio, speech }) => {
            if (speech) {
                buffer.push(...audio);
            }
        },
        onChunkEnd: async () => {
            console.log(Date.now(), "Chunk end");
            if (buffer.length > 0) {
                const wav = createWavFromBuffer(buffer, sampleRate);
                const transcription = await transcribe(wav, transcribeLink, healthCheckLink);
                console.log("Transcription:", transcription);
                if (transcriptionCallback) {
                    transcriptionCallback(transcription); // Call the callback with the transcription result
                }
                buffer = [];
            }
        }
    });
}

function startRecording(transcribeLink, healthCheckLink) {
    return new Promise((resolve, reject) => {
        if (!recorder) {
            initializeRecorder(transcribeLink, healthCheckLink, (transcription) => {
                resolve(transcription); // Resolve the promise with the transcription result
            });
        }
        console.log("Recording started...");
        recorder.start();
    });
}

function stopRecording() {
    if (recorder) {
        console.log("Recording stopped.");
        recorder.stop();
    }
}

module.exports = {
    startRecording,
    stopRecording
};