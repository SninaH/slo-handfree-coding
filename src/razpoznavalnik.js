const vscode = require('vscode');
const { SpeechRecorder } = require("speech-recorder");
const { WaveFile } = require("wavefile");

let buffer = [];
const sampleRate = 16000; // 16 kHz
let recorder = null; // Initialize recorder reference
let resolveWavFilePromise = null; // Promise resolver for WAV file creation
let wav = null;

function createWavFromBuffer(buffer, sampleRate) {
    let wav = new WaveFile();
    wav.fromScratch(1, sampleRate, '16', buffer);
    return wav;
}

async function transcribe(wav, transcribeLink, healthCheckLink, transcriptionJSONName, outputChannel) {
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
        return transcriptionResult[transcriptionJSONName];
    } catch (error) {
        outputChannel.appendLine(`[slo-handsfree ERROR] "${error.message}". Is transcription server running?`);

        console.error(error.message);
        vscode.window.showErrorMessage(`Napaka pri povezavi s strežnikom. Preverite ali deluje razpoznavalnik (docker) in ali ste napisali pravo povezavo v nastavitvah.`);
        return null;
    }
}

function initializeRecorder(outputChannel, transcribeLink, healthCheckLink, transcriptionJSONName) {
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
                wav = createWavFromBuffer(buffer, sampleRate);
                buffer = [];
                if (resolveWavFilePromise) {
                    console.log("Resolving WAV file promise...");
                    resolveWavFilePromise(wav);
                    resolveWavFilePromise = null; // Reset the resolver
                }
            }
        }
    });
    recorder.isRecording = false; // Initialize the isRecording flag
}

async function transcribeWavFile(transcribeLink, healthCheckLink, transcriptionJSONName, outputChannel) {
    try {
        if (!wav) {
            console.log("create promise");
            // Create a promise that will be resolved when the WAV file is ready
            const wavFilePromise = new Promise((resolve, reject) => {
                resolveWavFilePromise = resolve;
            });
            console.log("waiting for promise");
            // Wait for the WAV file to be created
            await wavFilePromise;
        }
        console.log("transcribing");
        const transcription = await transcribe(wav, transcribeLink, healthCheckLink, transcriptionJSONName, outputChannel);
        console.log("Transcription:", transcription);
        wav = null; // Reset the WAV file
        return transcription;
    } catch (error) {
        console.log("Error during transcription:", error);
        return "";
    }
}

async function getLastTranscription(transcribeLink, healthCheckLink, transcriptionJSONName, outputChannel) {
    // if the recorder is not initialized, initialize it
    // then get transcription of the last recorded chunk
    try {
        // Check if the recorder is already initialized and not currently recording
        if (!recorder) {
            initializeRecorder(outputChannel, transcribeLink, healthCheckLink, transcriptionJSONName);
        }
        if (recorder.isRecording === false) {
            console.log("Starting recording...");
            recorder.start();
            recorder.isRecording = true; // Add a flag to indicate recording has started
            console.log("Recording started...");
            outputChannel.appendLine("Recording started...");
        }
        const transcription = await transcribeWavFile(transcribeLink, healthCheckLink, transcriptionJSONName, outputChannel);
        return transcription;

    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function stopRecording(outputChannel) {
    console.log("Stopping recording...");
    if (recorder && recorder.isRecording) {
        await recorder.stop();
        recorder.isRecording = false; // Reset the recording flag
        console.log("Recording stopped.");
        outputChannel.appendLine("Recording stopped.");
    } else {
        console.log("Recorder is not recording.");
    }
}

module.exports = {
    getLastTranscription,
    stopRecording
};