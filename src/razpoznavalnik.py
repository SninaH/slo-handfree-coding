import speech_recognition as sr
import requests
import sys
from requests.exceptions import ConnectionError

print("start python script")

if len(sys.argv) > 1:
    link = sys.argv[1]
else:
    link = "http://localhost:8000"
transcribe_link = link + "/api/transcribe"
health_check_link = link + "/api/healthCheck"

try:
    result = requests.get(health_check_link)
except ConnectionError:
    print("[ERROR] Unable to connect to server")
    sys.exit(0)

r = sr.Recognizer()

with sr.Microphone() as source:
    print("poslusam....")
    audio = r.listen(source)
    print("KONEC poslusanja")
    # with open('speech.wav', 'wb') as f:
    #     f.write(audio.get_wav_data())



try:
    # audioFile = open('audio/speech.wav', 'rb')
    result = requests.post(transcribe_link, files={"audio_file":audio.get_wav_data()})
    # audioFile.close()
    print(result)
    try:
        print(result.json()["result"])
    except:
        print("unable to print transcription")
        # ne pozabi da tisto kar zazna kot da ni govor zapre v <> npr <laugh>
        # zaznava tudi mašila
except ConnectionError:
    print("[ERROR] Unable to connect to server")
    

    