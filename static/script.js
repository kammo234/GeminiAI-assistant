// DOM Elements
const welcomeScreen = document.getElementById('welcomeScreen');
const chatInterface = document.getElementById('chatInterface');
const startChatBtn = document.getElementById('startChatBtn');
const voiceDemoBtn = document.getElementById('voiceDemoBtn');
const closeChatBtn = document.getElementById('closeChatBtn');
const minimizeBtn = document.getElementById('minimizeBtn');
const clearChatBtn = document.getElementById('clearChatBtn');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const voiceInputBtn = document.getElementById('voiceInputBtn');
const typingIndicator = document.getElementById('typingIndicator');
const voiceIndicator = document.getElementById('voiceIndicator');
const cancelVoiceBtn = document.getElementById('cancelVoiceBtn');

// App State
let isListening = false;

// Initialize the app
function initApp() {
  // Event Listeners
  startChatBtn.addEventListener('click', openChat);
  voiceDemoBtn.addEventListener('click', startVoiceDemo);
  closeChatBtn.addEventListener('click', closeChat);
  minimizeBtn.addEventListener('click', minimizeChat);
  clearChatBtn.addEventListener('click', clearChat);
  sendMessageBtn.addEventListener('click', sendMessage);
  messageInput.addEventListener('keypress', handleKeyPress);
  voiceInputBtn.addEventListener('click', toggleVoiceInput);
  cancelVoiceBtn.addEventListener('click', cancelVoiceInput);
}

// Open chat interface
function openChat() {
  welcomeScreen.classList.add('hidden');
  chatInterface.classList.remove('hidden');
  messageInput.focus();
}

// Close chat interface
function closeChat() {
  chatInterface.classList.add('hidden');
  welcomeScreen.classList.remove('hidden');
  clearChat();
}

// Minimize chat (placeholder functionality)
function minimizeChat() {
  // In a real app, this would minimize the chat window
  alert('Minimize functionality would be implemented in a desktop app context');
}

// Clear chat messages
function clearChat() {
  chatMessages.innerHTML = `
    <div class="message-group bot">
      <div class="message-avatar">
        <i class="fas fa-robot"></i>
      </div>
      <div class="message-content">
        <div class="message-bubble">
          <p>Hello! I'm GeminiAI, your professional assistant powered by Google's Gemini AI. How can I help you today?</p>
          <span class="message-time">Just now</span>
        </div>
      </div>
    </div>
  `;
}

// Handle key press in message input
function handleKeyPress(e) {
  if (e.key === 'Enter') {
    sendMessage();
  }
}

// Send message to Flask backend
async function sendMessage() {
  const message = messageInput.value.trim();
  if (message === '') return;
  
  addMessage('user', message);
  messageInput.value = '';
  
  // Show typing indicator
  showTypingIndicator();
  
  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: message })
    });
    
    const data = await response.json();
    hideTypingIndicator();
    
    if (response.ok) {
      addMessage('bot', data.reply);
    } else {
      addMessage('bot', `Error: ${data.reply}`);
    }
  } catch (error) {
    hideTypingIndicator();
    addMessage('bot', 'Sorry, there was an error connecting to the AI service.');
    console.error('Chat error:', error);
  }
}

// Add message to chat
function addMessage(sender, text) {
  const messageGroup = document.createElement('div');
  messageGroup.className = `message-group ${sender}`;
  
  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  
  const avatarIcon = document.createElement('i');
  avatarIcon.className = sender === 'bot' ? 'fas fa-robot' : 'fas fa-user';
  
  avatar.appendChild(avatarIcon);
  
  const messageContent = document.createElement('div');
  messageContent.className = 'message-content';
  
  const messageBubble = document.createElement('div');
  messageBubble.className = 'message-bubble';
  
  const messageText = document.createElement('p');
  messageText.textContent = text;
  
  const messageTime = document.createElement('span');
  messageTime.className = 'message-time';
  messageTime.textContent = getCurrentTime();
  
  messageBubble.appendChild(messageText);
  messageBubble.appendChild(messageTime);
  messageContent.appendChild(messageBubble);
  
  messageGroup.appendChild(avatar);
  messageGroup.appendChild(messageContent);
  
  chatMessages.appendChild(messageGroup);
  scrollToBottom();
}

// Show typing indicator
function showTypingIndicator() {
  typingIndicator.classList.remove('hidden');
  scrollToBottom();
}

// Hide typing indicator
function hideTypingIndicator() {
  typingIndicator.classList.add('hidden');
}

// Get current time for message timestamp
function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Scroll to bottom of chat
function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Start voice demo
function startVoiceDemo() {
  if (!isListening) {
    startVoiceInput();
  }
}

// Toggle voice input
function toggleVoiceInput() {
  if (isListening) {
    cancelVoiceInput();
  } else {
    startVoiceInput();
  }
}

// Start voice input
async function startVoiceInput() {
  voiceIndicator.classList.remove('hidden');
  isListening = true;
  
  try {
    const response = await fetch('/voice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const data = await response.json();
    voiceIndicator.classList.add('hidden');
    isListening = false;
    
    if (response.ok && data.user_input) {
      // Add user's voice message
      addMessage('user', data.user_input);
      
      // Show typing indicator for AI response
      showTypingIndicator();
      
      // Add AI response from voice endpoint
      setTimeout(() => {
        hideTypingIndicator();
        addMessage('bot', data.reply);
      }, 1000);
      
    } else {
      addMessage('bot', data.reply || 'Voice recognition failed.');
    }
  } catch (error) {
    voiceIndicator.classList.add('hidden');
    isListening = false;
    addMessage('bot', 'Voice service unavailable. Please try again.');
    console.error('Voice error:', error);
  }
}

// Cancel voice input
function cancelVoiceInput() {
  voiceIndicator.classList.add('hidden');
  isListening = false;
  // Note: We can't actually cancel the server-side voice recognition
  // once it's started, but we can hide the UI indicator
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);