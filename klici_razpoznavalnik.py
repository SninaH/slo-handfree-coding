import requests
import wave

result = requests.get('http://localhost:8000/api/healthCheck')

print(result.text)

print("++++++++++++++++++++++++++")


audioFile = open('audio/test_datetime.wav', 'rb')
result = requests.post('http://localhost:8000/api/transcribe', files={"audio_file":audioFile})
print(result)
try:
    print(result.json()["result"])
except:
    print("unable to print transcription")
audioFile.close()