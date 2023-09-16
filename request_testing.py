import azure.cognitiveservices.speech as speechsdk

# Initialize the speech configuration
speech_key = "a8a1dcfbc0734c7094090da3535dc740"
service_region = "eastus"
speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=service_region)

# Set the audio configuration to write the output to a file
audio_filename = "output_audio.wav"
audio_output = speechsdk.audio.AudioOutputConfig(filename=audio_filename)

# Create a speech synthesizer using the provided settings
speech_synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=audio_output)

# Provide the text that you want to synthesize
ssml_text = """
<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="cs-CZ">
<voice name="cs-CZ-AntoninNeural">
Já sem vlasta doufam že sem nikoho neurazil.
</voice>
</speak>
"""
# Use the synthesizer to get the speech
result = speech_synthesizer.speak_ssml_async(ssml_text).get()

# Check the result
if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
    print(f"Speech synthesized to [{audio_filename}] successfully.")

else:
    print(f"Speech synthesis failed: {result.reason}")

