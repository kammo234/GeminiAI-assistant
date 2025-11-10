from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import google.generativeai as genai
import speech_recognition as sr
import pyttsx3
import os
import time
import pygame
import threading
from datetime import date
from openai import OpenAI

# ===== Flask setup =====
app = Flask(__name__, template_folder="templates", static_folder="static")
CORS(app)

# ===== Gemini setup =====
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

# ===== OpenAI TTS setup =====
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
pygame.mixer.init()

# ===== pyttsx3 setup =====
engine = pyttsx3.init()
engine.setProperty("rate", 190)
voices = engine.getProperty("voices")
if len(voices) > 1:
    engine.setProperty("voice", voices[1].id)

openaitts = True  # True = OpenAI TTS, False = pyttsx3
today = str(date.today())


# ===== Helper: speak safely (no loop conflict) =====
def speak_text(text):
    """Speak response safely without blocking or duplicate loop errors."""
    if not text:
        return

    def speak_thread():
        try:
            if openaitts:
                # OpenAI voice
                response = client.audio.speech.create(
                    model="tts-1",
                    voice="nova",
                    input=text
                )
                fname = "output.mp3"
                response.write_to_file(fname)
                pygame.mixer.music.load(fname)
                pygame.mixer.music.play()
                while pygame.mixer.music.get_busy():
                    time.sleep(0.25)
                pygame.mixer.music.stop()
            else:
                # pyttsx3 fallback (run in isolated thread)
                local_engine = pyttsx3.init()
                local_engine.setProperty("rate", 190)
                voices = local_engine.getProperty("voices")
                if len(voices) > 1:
                    local_engine.setProperty("voice", voices[1].id)
                local_engine.say(text)
                local_engine.runAndWait()
                local_engine.stop()
        except Exception as e:
            print("⚠️ TTS error:", e)

    threading.Thread(target=speak_thread, daemon=True).start()


# ===== Helper: Save logs =====
def append2log(text):
    fname = f"chatlog-{today}.txt"
    with open(fname, "a", encoding="utf-8") as f:
        f.write(text + "\n")


# ===== Route: index =====
@app.route("/")
def index():
    return render_template("index.html")


# ===== Route: Chat text =====
@app.route("/chat", methods=["POST"])
def chat_endpoint():
    """Handle text input from chat."""
    try:
        data = request.get_json()
        user_input = data.get("message", "").strip()
        if not user_input:
            return jsonify({"reply": "Please say or type something."}), 400

        print(f"💬 User: {user_input}")
        response = model.generate_content(user_input)
        reply = response.text.strip() if response.text else "(No text reply)"
        print(f"🤖 Gemini: {reply}")

        append2log(f"You: {user_input}")
        append2log(f"AI: {reply}")

        speak_text(reply)
        return jsonify({"reply": reply})

    except Exception as e:
        print("❌ Chat error:", e)
        return jsonify({"reply": f"Error: {str(e)}"}), 500


# ===== Route: Voice input =====
@app.route("/voice", methods=["POST"])
def voice_endpoint():
    """Handle mic input (speech-to-text)."""
    try:
        recognizer = sr.Recognizer()
        with sr.Microphone() as source:
            print("🎙 Listening...")
            recognizer.adjust_for_ambient_noise(source, duration=0.5)
            audio = recognizer.listen(source, timeout=10, phrase_time_limit=15)
            user_input = recognizer.recognize_google(audio)
            print("🗣 You said:", user_input)

        response = model.generate_content(user_input)
        reply = response.text.strip() if response.text else "(No text reply)"
        print(f"🤖 Gemini: {reply}")

        append2log(f"You (voice): {user_input}")
        append2log(f"AI: {reply}")

        speak_text(reply)
        return jsonify({"user_input": user_input, "reply": reply})

    except sr.WaitTimeoutError:
        return jsonify({"reply": "Listening timed out, please try again."})
    except sr.UnknownValueError:
        return jsonify({"reply": "Sorry, I couldn't understand your speech."})
    except Exception as e:
        print("❌ Voice error:", e)
        return jsonify({"reply": f"Error: {str(e)}"}), 500


# ===== Main =====
if __name__ == "__main__":
    print("🚀 Gemini Voice Assistant running on http://127.0.0.1:5000")
    app.run(debug=True)