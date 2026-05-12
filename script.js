// =========================
// AskAi - script.js
// =========================

const chatBox = document.getElementById("chatBox");
const topicInput = document.getElementById("topic");

let history = [];

// =========================
// AUTO RESIZE INPUT
// =========================
topicInput?.addEventListener("input", () => {
  topicInput.style.height = "auto";
  topicInput.style.height = topicInput.scrollHeight + "px";
});

// =========================
// ENTER TO SEND
// =========================
topicInput?.addEventListener("keydown", (e) => {

  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    learnTopic();
  }

});

// =========================
// NEW CHAT
// =========================
function newChat() {

  history = [];

  chatBox.innerHTML = "";

  addAIMessage(`
# 👋 Welcome to AskAi

I can help you with:

- 📚 Study & Notes
- 💻 Coding
- 🤖 AI Tools
- ✈️ Travel
- 🧠 Ideas
- 📄 Writing
- 🎯 Career Guidance
- 😄 Casual Chat

Ask me anything.
  `);

}

// =========================
// USER MESSAGE
// =========================
function addUserMessage(text) {

  const msg = document.createElement("div");

  msg.className = "message user";

  msg.innerHTML = `
    <div class="avatar user-avatar">
      G
    </div>

    <div class="bubble">
      ${formatText(text)}
    </div>
  `;

  chatBox.appendChild(msg);

  scrollBottom();
}

// =========================
// AI MESSAGE
// =========================
function addAIMessage(text) {

  const msg = document.createElement("div");

  msg.className = "message ai";

  msg.innerHTML = `
    <div class="avatar ai-avatar">
      AI
    </div>

    <div class="bubble ai-text"></div>
  `;

  chatBox.appendChild(msg);

  const bubble = msg.querySelector(".ai-text");

  typeText(bubble, formatText(text));

  scrollBottom();
}

// =========================
// TYPE EFFECT
// =========================
function typeText(el, text) {

  let i = 0;

  const speed = 4;

  function typing() {

    if (i < text.length) {

      el.innerHTML = text.slice(0, i) + "▌";

      i++;

      scrollBottom();

      setTimeout(typing, speed);

    } else {

      el.innerHTML = text;

    }

  }

  typing();
}

// =========================
// FORMAT OUTPUT
// =========================
function formatText(text) {

  return text

    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

    .replace(
      /```([\s\S]*?)```/g,
      "<pre><code>$1</code></pre>"
    )

    .replace(/\n/g, "<br>")

    .replace(
      /^# (.*$)/gim,
      "<h1>$1</h1>"
    )

    .replace(
      /^## (.*$)/gim,
      "<h2>$1</h2>"
    )

    .replace(
      /^### (.*$)/gim,
      "<h3>$1</h3>"
    )

    .replace(
      /\*\*(.*?)\*\*/g,
      "<b>$1</b>"
    );
}

// =========================
// THINKING
// =========================
function showThinking() {

  const thinking = document.createElement("div");

  thinking.className = "message ai thinking-box";

  thinking.id = "thinking";

  thinking.innerHTML = `
    <div class="avatar ai-avatar">
      AI
    </div>

    <div class="bubble">

      <div class="typing">
        <span></span>
        <span></span>
        <span></span>
      </div>

    </div>
  `;

  chatBox.appendChild(thinking);

  scrollBottom();
}

// =========================
// REMOVE THINKING
// =========================
function removeThinking() {

  const t = document.getElementById("thinking");

  if (t) t.remove();
}

// =========================
// MAIN AI FUNCTION
// =========================
async function learnTopic() {

  const text = topicInput.value.trim();

  if (!text) return;

  addUserMessage(text);

  topicInput.value = "";

  topicInput.style.height = "auto";

  showThinking();

  try {

    const response = await fetch("/api/tutor", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({

        topic: text,

        history

      })

    });

    const data = await response.json();

    removeThinking();

    addAIMessage(data.result);

    history.push({
      role: "user",
      content: text
    });

    history.push({
      role: "assistant",
      content: data.result
    });

  } catch (error) {

    removeThinking();

    addAIMessage(`
# ❌ Error

Something went wrong.

Please try again.
    `);

  }

}

// =========================
// SCROLL
// =========================
function scrollBottom() {

  chatBox.scrollTop = chatBox.scrollHeight;

}

// =========================
// START
// =========================
newChat();
