import speech_recognition as sr
import requests

r = sr.Recognizer()

with sr.Microphone() as source:
    print("poslusam....")
    audio = r.listen(source)
    print("KONEC poslusanja")
    with open('audio/speech.wav', 'wb') as f:
        f.write(audio.get_wav_data())



result = requests.get('http://localhost:8000/api/healthCheck')

print(result.text)

print("++++++++++++++++++++++++++")


audioFile = open('audio/speech.wav', 'rb')
result = requests.post('http://localhost:8000/api/transcribe', files={"audio_file":audioFile})
print(result)
try:
    print(result.json()["result"])
except:
    print("unable to print transcription")

audioFile.close()

