import whisper

# basemodel = whisper.load_model("base")
# baseresult = basemodel.transcribe("audio/test_imput.mp3", fp16=False, language="Slovenian")
# print(baseresult["text"])
# baseresult = basemodel.transcribe("audio/abeceda.mp3", fp16=False, language= "Slovenian")
# print(baseresult["text"])

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

largemodel = whisper.load_model("large")
largeresult = largemodel.transcribe("audio/test_imput.mp3", fp16=False, language="Slovenian")
print(largeresult["text"])
largeresult = largemodel.transcribe("audio/abeceda.mp3", fp16=False, language= "Slovenian")
print(largeresult["text"])
largeresult = largemodel.transcribe("audio/abeceda.mp3", fp16=False, language= "Slovenian")
print(largeresult["text"])
largeresult = largemodel.transcribe("audio/abeceda.mp3", fp16=False, language= "Slovenian")
print(largeresult["text"])