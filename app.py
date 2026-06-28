from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import logging
from dotenv import load_dotenv

# ==============================
# Load Environment Variables
# ==============================

load_dotenv()

# ==============================
# Flask App
# ==============================

app = Flask(
    __name__,
    template_folder="templates",
    static_folder="static"
)

CORS(app)

# ==============================
# Logging
# ==============================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

logger = logging.getLogger(__name__)

# ==============================
# Gemini
# ==============================

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    logger.error("GOOGLE_API_KEY environment variable is missing.")
    raise RuntimeError("GOOGLE_API_KEY is not configured.")

genai.configure(api_key=GOOGLE_API_KEY)

model = genai.GenerativeModel(
    "gemini-2.5-flash"
)

# ==============================
# Routes
# ==============================

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/health")
def health():
    return jsonify(
        {
            "status": "ok",
            "service": "Gemini Assistant"
        }
    )


@app.route("/chat", methods=["POST"])
def chat():

    try:

        data = request.get_json()

        if not data:
            return jsonify(
                {
                    "error": "No JSON received"
                }
            ),400

        message = data.get(
            "message",
            ""
        ).strip()

        if not message:

            return jsonify(
                {
                    "error":"Message is empty."
                }
            ),400

        logger.info(f"USER : {message}")

        response = model.generate_content(message)

        reply = ""

        if response.text:
            reply = response.text.strip()
        else:
            reply = "Sorry, I couldn't generate a response."

        logger.info(f"AI : {reply}")

        return jsonify(
            {
                "reply":reply
            }
        )

    except Exception as e:

        logger.exception(e)

        return jsonify(
            {
                "error":"Internal Server Error",
                "details":str(e)
            }
        ),500


if __name__ == "__main__":

    app.run(
    host="0.0.0.0",
    port=int(os.environ.get("PORT", 5000)),
    debug=False
)