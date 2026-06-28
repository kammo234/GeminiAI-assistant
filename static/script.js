// ======================================================
// GEMINIAI ASSISTANT
// Production Version 2.0
// Part 1 - Foundation
// ======================================================

class GeminiAssistant {

  constructor() {

    // -----------------------------
    // DOM Elements
    // -----------------------------

    this.welcomeScreen = document.getElementById("welcomeScreen");
    this.chatInterface = document.getElementById("chatInterface");

    this.startChatBtn = document.getElementById("startChatBtn");
    this.voiceDemoBtn = document.getElementById("voiceDemoBtn");

    this.closeChatBtn = document.getElementById("closeChatBtn");
    this.minimizeBtn = document.getElementById("minimizeBtn");
    this.clearChatBtn = document.getElementById("clearChatBtn");

    this.chatMessages = document.getElementById("chatMessages");

    this.messageInput = document.getElementById("messageInput");

    this.sendMessageBtn = document.getElementById("sendMessageBtn");

    this.voiceInputBtn = document.getElementById("voiceInputBtn");

    this.typingIndicator = document.getElementById("typingIndicator");

    this.voiceIndicator = document.getElementById("voiceIndicator");

    this.cancelVoiceBtn = document.getElementById("cancelVoiceBtn");

    // -----------------------------
    // State
    // -----------------------------

    this.isListening = false;

    this.isTyping = false;

    this.currentSpeech = null;

    this.typingSpeed = 18;

    this.recognition = null;

    this.supportsSpeech = false;

    // -----------------------------
    // Initialize
    // -----------------------------

    this.initializeSpeech();

    this.registerEvents();

  }

  // ==================================================
  // Speech Recognition
  // ==================================================

  initializeSpeech() {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

      console.warn("Speech Recognition not supported.");

      this.supportsSpeech = false;

      return;

    }

    this.supportsSpeech = true;

    this.recognition = new SpeechRecognition();

    this.recognition.lang = "en-IN";

    this.recognition.interimResults = false;

    this.recognition.maxAlternatives = 1;

    this.recognition.continuous = false;

  }

  // ==================================================
  // Event Listeners
  // ==================================================

  registerEvents() {

    this.startChatBtn?.addEventListener(
      "click",
      () => this.openChat()
    );

    this.voiceDemoBtn?.addEventListener(
      "click",
      () => this.startListening()
    );

    this.closeChatBtn?.addEventListener(
      "click",
      () => this.closeChat()
    );

    this.clearChatBtn?.addEventListener(
      "click",
      () => this.clearChat()
    );

    this.sendMessageBtn?.addEventListener(
      "click",
      () => this.sendMessage()
    );

    this.voiceInputBtn?.addEventListener(
      "click",
      () => this.startListening()
    );

    this.cancelVoiceBtn?.addEventListener(
      "click",
      () => this.stopListening()
    );

    this.messageInput?.addEventListener(
      "keydown",
      (e) => {

        if (e.key === "Enter") {

          e.preventDefault();

          this.sendMessage();

        }

      }
    );

  }

  // ==================================================
  // Open Chat
  // ==================================================

  openChat() {

    this.welcomeScreen.classList.add("hidden");

    this.chatInterface.classList.remove("hidden");

    this.messageInput.focus();

  }

  // ==================================================
  // Close Chat
  // ==================================================

  closeChat() {

    this.chatInterface.classList.add("hidden");

    this.welcomeScreen.classList.remove("hidden");

  }

  // ==================================================
  // Clear Chat
  // ==================================================

  clearChat() {

    this.chatMessages.innerHTML = "";

  }

  // ==================================================
  // Voice Placeholder
  // ==================================================

  startListening(){

    if(!this.supportsSpeech){

        alert("Speech Recognition not supported.");

        return;

    }

    this.voiceIndicator.classList.remove("hidden");

    this.isListening=true;

    this.recognition.start();

    this.recognition.onresult=(event)=>{

        const transcript=
            event.results[0][0].transcript;

        this.voiceIndicator.classList.add("hidden");

        this.isListening=false;

        this.messageInput.value=transcript;

        this.sendMessage();

    };

    this.recognition.onerror=()=>{

        this.voiceIndicator.classList.add("hidden");

        this.isListening=false;

    };

    this.recognition.onend=()=>{

        this.voiceIndicator.classList.add("hidden");

        this.isListening=false;

    };

}

  stopListening(){

    if(this.recognition){

        this.recognition.stop();

    }

    this.voiceIndicator.classList.add("hidden");

    this.isListening=false;

}

  // ==================================================
  // Chat Placeholder
  // ==================================================

  // ==================================================
  // Add Message
  // ==================================================

  addMessage(sender, text) {

    const group = document.createElement("div");

    group.className = `message-group ${sender}`;

    const avatar = document.createElement("div");

    avatar.className = "message-avatar";

    avatar.innerHTML =
      sender === "bot"
        ? '<i class="fas fa-robot"></i>'
        : '<i class="fas fa-user"></i>';

    const content = document.createElement("div");

    content.className = "message-content";

    const bubble = document.createElement("div");

    bubble.className = "message-bubble";

    const p = document.createElement("p");

    p.textContent = text;

    const time = document.createElement("span");

    time.className = "message-time";

    time.textContent =
      new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });

    bubble.appendChild(p);

    bubble.appendChild(time);

    content.appendChild(bubble);

    group.appendChild(avatar);

    group.appendChild(content);

    this.chatMessages.appendChild(group);

    this.scrollBottom();



  }



  // ==================================================
  // Typing
  // ==================================================

  showTyping() {

    this.typingIndicator.classList.remove("hidden");

    this.scrollBottom();

  }

  hideTyping() {

    this.typingIndicator.classList.add("hidden");

  }



  // ==================================================
  // Scroll
  // ==================================================

  scrollBottom() {

    this.chatMessages.scrollTop =
      this.chatMessages.scrollHeight;

  }

  // ==================================================
  // Speak AI Response
  // ==================================================

  speak(text) {

    if (!("speechSynthesis" in window)) {

      return;

    }

    window.speechSynthesis.cancel();

    const speech =
      new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";

    speech.rate = 1;

    speech.pitch = 1;

    speech.volume = 1;

    this.currentSpeech = speech;

    window.speechSynthesis.speak(speech);

  }



  // ==================================================
  // Stop Speaking
  // ==================================================

  stopSpeaking() {

    window.speechSynthesis.cancel();

  }

  // ==================================================
// Type Writer Animation
// ==================================================

async typeBotMessage(text){

    const group =
        document.createElement("div");

    group.className="message-group bot";

    group.innerHTML=`

    <div class="message-avatar">

        <i class="fas fa-robot"></i>

    </div>

    <div class="message-content">

        <div class="message-bubble">

            <p></p>

            <span class="message-time">

                ${new Date().toLocaleTimeString([],{

                    hour:"2-digit",

                    minute:"2-digit"

                })}

            </span>

        </div>

    </div>

    `;

    this.chatMessages.appendChild(group);

    const p =
        group.querySelector("p");

    for(let i=0;i<text.length;i++){

        p.textContent += text[i];

        this.scrollBottom();

        await new Promise(resolve=>{

            setTimeout(

                resolve,

                this.typingSpeed

            );

        });

    }

}

  // ==================================================
  // Send Message
  // ==================================================

  async sendMessage() {

    const message =
      this.messageInput.value.trim();

    if (!message) {

      return;

    }

    this.addMessage("user", message);

    this.messageInput.value = "";

    this.showTyping();

    try {

      const response =
        await fetch("/chat", {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            message: message

          })

        });

      const data =
        await response.json();

      this.hideTyping();

      if (response.ok) {

        await this.typeBotMessage(data.reply);;

      }

      else {

        this.addMessage(

          "bot",

          data.error || "Something went wrong."

        );

      }

    }

    catch (error) {

      this.hideTyping();

      console.error(error);

      this.addMessage(

        "bot",

        "Unable to connect to server."

      );

    }

  }

}

// ======================================================
// Start Application
// ======================================================

document.addEventListener(

  "DOMContentLoaded",

  () => {

    new GeminiAssistant();

  }

);

