import speech_recognition as sr
import requests

print("start python script")

r = sr.Recognizer()

with sr.Microphone() as source:
    print("poslusam....")
    audio = r.listen(source)
    print("KONEC poslusanja")
    # with open('speech.wav', 'wb') as f:
    #     f.write(audio.get_wav_data())



result = requests.get('http://localhost:8000/api/healthCheck')


# audioFile = open('audio/speech.wav', 'rb')
result = requests.post('http://localhost:8000/api/transcribe', files={"audio_file":audio.get_wav_data()})
# audioFile.close()
print(result)
try:
    print(result.json()["result"])
except:
    print("unable to print transcription")
    # ne pozabi da tisto kar zazna kot da ni govor zapre v <> npr <laugh>
    # zaznava tudi mašila

    

    