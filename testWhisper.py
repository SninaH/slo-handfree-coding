import whisper
import pyaudio
import wave

print("start whisper prerecorded test")

basemodel = whisper.load_model("base")
baseresult = basemodel.transcribe("audio/test_imput.mp3", fp16=False, language="Slovenian")
print(baseresult["text"])
baseresult = basemodel.transcribe("audio/abeceda.mp3", fp16=False, language= "Slovenian")
print(baseresult["text"])

# smallmodel = whisper.load_model("small")
# smallresult = smallmodel.transcribe("audio/test_imput.mp3", fp16=False, language="Slovenian")
# print(smallresult["text"])
# smallresult = smallmodel.transcribe("audio/abeceda.mp3", fp16=False, language= "Slovenian")
# print(smallresult["text"])

# mediummodel = whisper.load_model("medium")
# mediumresult = mediummodel.transcribe("audio/test_imput.mp3", fp16=False, language="Slovenian")
# print(mediumresult["text"])
# mediumresult = mediummodel.transcribe("audio/abeceda.mp3", fp16=False, language= "Slovenian")
# print(mediumresult["text"])



# largemodel = whisper.load_model("large")
# largeresult = largemodel.transcribe("audio/test_imput.mp3", fp16=False, language="Slovenian")
# print(largeresult["text"])
# largeresult = largemodel.transcribe("audio/abeceda.mp3", fp16=False, language= "Slovenian")
# print(largeresult["text"])
# largeresult = largemodel.transcribe("audio/abeceda.mp3", fp16=False, language= "Slovenian")
# print(largeresult["text"])
# largeresult = largemodel.transcribe("audio/abeceda.mp3", fp16=False, language= "Slovenian")
# print(largeresult["text"])

print("start recrod test")
 
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 44100
CHUNK = 1024
RECORD_SECONDS = 5
WAVE_OUTPUT_FILENAME = "mic.wav"
REPETITIONS = 3
 

for ponovitev in range(REPETITIONS): 
    audio = pyaudio.PyAudio()
    
    # start Recording
    stream = audio.open(format=FORMAT, channels=CHANNELS,
                    rate=RATE, input=True,
                    frames_per_buffer=CHUNK)
    print("recording...")
    frames = []
    
    for i in range(0, int(RATE / CHUNK * RECORD_SECONDS)):
        data = stream.read(CHUNK)
        frames.append(data)
    print("finished recording")
    
    
    # stop Recording
    stream.stop_stream()
    stream.close()
    audio.terminate()
    
    waveFile = wave.open(WAVE_OUTPUT_FILENAME, 'wb')
    waveFile.setnchannels(CHANNELS)
    waveFile.setsampwidth(audio.get_sample_size(FORMAT))
    waveFile.setframerate(RATE)
    waveFile.writeframes(b''.join(frames))
    waveFile.close()

    baseresult = basemodel.transcribe("mic.wav", fp16=False, language= "Slovenian")
    print(baseresult["text"])