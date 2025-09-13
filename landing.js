
window.addEventListener('load', () => {
  const banner = document.getElementById('bannerContent');
  if (banner) {
    banner.classList.add('show');
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const entryFee = document.getElementById("entryFee");
  const attendees = document.getElementById("attendees");

  const entryFeeValue = document.getElementById("entryFeeValue");
  const attendeesValue = document.getElementById("attendeesValue");

  if (entryFee && entryFeeValue) {
    entryFee.addEventListener("input", function () {
      entryFeeValue.textContent = this.value;
    });
  }

  if (attendees && attendeesValue) {
    attendees.addEventListener("input", function () {
      attendeesValue.textContent = this.value;
    });
  }
});

//--------------------------chatbot-----------------------------
function toggleChatbot() {
  const box = document.getElementById('chatbot-box');
  if (box) {
    box.style.display = (box.style.display === 'none' || box.style.display === '') ? 'flex' : 'none';
  }
}

function sendMessage() {
  const input = document.getElementById("userInput");
  const chatBox = document.getElementById("chatBox");
  if (!input || !chatBox) return;

  const userText = input.value.trim();
  if (userText === "") return;

  // User message
  const userMsg = document.createElement("div");
  userMsg.textContent = userText;
  userMsg.style.cssText = `
    background: #e7e9ea;
    color: black;
    padding: 10px;
    margin: 5px;
    border-radius: 10px;
    max-width: 70%;
    display: inline-block;
    align-self: flex-end;
    float: right;
    clear: both;
  `;
  chatBox.appendChild(userMsg);
  chatBox.scrollTop = chatBox.scrollHeight;

  // Bot response
  setTimeout(() => {
    const botMsg = document.createElement("div");
    botMsg.textContent = getBotResponse(userText);
    botMsg.style.cssText = `background: #f0ebec;color: black;
      padding: 10px;
      margin: 5px;
      border-radius: 10px;
      max-width: 70%;
      display: inline-block;
      float: left;
      clear: both;
    `;
    chatBox.appendChild(botMsg);
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 500);

  input.value = "";
}

function getBotResponse(input) {
  const responses = {
    "hello": "Hi there! 😊",
    "how are you": "I'm just a bot, but I'm doing great! How about you?",
    "your name": "I'm a friendly chatbot!",
    "bye": "Goodbye! Have a great day! 👋",
    "email": "Thank you! We’ll reach out to your email soon."
  };

  return responses[input.toLowerCase()] || "I'm not sure how to respond to that 🤖";
}































