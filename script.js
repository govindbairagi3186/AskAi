// =========================
// AskAi - FINAL script.js
// =========================

const chatBox = document.getElementById("chatBox");
const topicInput = document.getElementById("topic");
const voiceBtn = document.getElementById("voiceBtn");
const imageInput = document.getElementById("imageInput");

let history = JSON.parse(
  localStorage.getItem("askai_history") || "[]"
);

// =========================
// AUTO RESIZE
// =========================
topicInput?.addEventListener("input", () => {

  topicInput.style.height = "auto";

  topicInput.style.height =
    topicInput.scrollHeight + "px";

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
// VOICE INPUT
// =========================
const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;

if (SpeechRecognition && voiceBtn) {

  const recognition =
    new SpeechRecognition();

  recognition.continuous = false;

  recognition.lang = "en-US";

  voiceBtn.onclick = () => {

    recognition.start();

    voiceBtn.innerText = "🎙️";

  };

  recognition.onresult = (event) => {

    const transcript =
      event.results[0][0].transcript;

    topicInput.value = transcript;

    voiceBtn.innerText = "🎤";

  };

  recognition.onerror = () => {

    voiceBtn.innerText = "🎤";

  };

}

// =========================
// IMAGE UPLOAD
// =========================
if (imageInput) {

  imageInput.addEventListener(
    "change",
    async (e) => {

      const file = e.target.files[0];

      if (!file) return;

      addUserMessage("🖼️ Image uploaded");

      const reader = new FileReader();

      reader.onload = () => {

        const img = document.createElement("img");

        img.src = reader.result;

        img.className = "uploaded-image";

        chatBox.appendChild(img);

        scrollBottom();

      };

      reader.readAsDataURL(file);

    }
  );

}

// =========================
// NEW CHAT
// =========================
function newChat() {

  history = [];

  localStorage.removeItem("askai_history");

  chatBox.innerHTML = "";

  addAIMessage(`
# 👋 Welcome to AskAi

I can help with:

- 📚 Study
- 💻 Coding
- ✍️ Writing
- 🤖 AI
- 📈 Business Ideas
- 🎯 Career Guidance
- 🌍 General Questions
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

    <div class="bubble">
      ${formatText(text)}
    </div>

    <div class="avatar user-avatar">
      G
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

  const bubble =
    msg.querySelector(".ai-text");

  typeText(
    bubble,
    formatText(text)
  );

  scrollBottom();

}

// =========================
// TYPE EFFECT
// =========================
function typeText(el, text) {

  let i = 0;

  const speed = 3;

  function typing() {

    if (i < text.length) {

      el.innerHTML =
        text.slice(0, i) + "▌";

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
// FORMAT TEXT
// =========================
function formatText(text) {

  return text

    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

    .replace(
      /```([\s\S]*?)```/g,
      "<pre><code>$1</code></pre>"
    )

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
    )

    .replace(/\n/g, "<br>");

}

// =========================
// THINKING
// =========================
function showThinking() {

  const thinking =
    document.createElement("div");

  thinking.className =
    "message ai thinking-box";

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

  const t =
    document.getElementById("thinking");

  if (t) t.remove();

}

// =========================
// SAVE MEMORY
// =========================
function saveMemory(text) {

  let memory = JSON.parse(
    localStorage.getItem("askai_memory")
    || "[]"
  );

  memory.push(text);

  if (memory.length > 20) {

    memory.shift();

  }

  localStorage.setItem(
    "askai_memory",
    JSON.stringify(memory)
  );

}

// =========================
// GET MEMORY
// =========================
function getMemory() {

  return JSON.parse(
    localStorage.getItem("askai_memory")
    || "[]"
  );

}

// =========================
// MAIN AI FUNCTION
// =========================
async function learnTopic() {

  const text =
    topicInput.value.trim();

  if (!text) return;

  addUserMessage(text);

  saveMemory(text);

  topicInput.value = "";

  topicInput.style.height =
    "auto";

  showThinking();

  try {

    const response =
      await fetch("/api/tutor", {

        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({

          topic: text,

          history,

          memory: getMemory()

        })

      });

    const data =
      await response.json();

    removeThinking();

    addAIMessage(
      data.result ||
      "No response."
    );

    history.push({
      role: "user",
      content: text
    });

    history.push({
      role: "assistant",
      content: data.result
    });

    localStorage.setItem(
      "askai_history",
      JSON.stringify(history)
    );

  } catch (error) {

    removeThinking();

    addAIMessage(`
# ❌ Error

Something went wrong.

Please try again.
    `);

    console.log(error);

  }

}

// =========================
// SCROLL
// =========================
function scrollBottom() {

  chatBox.scrollTop =
    chatBox.scrollHeight;

}

// =========================
// LOAD OLD CHAT
// =========================
function loadHistory() {

  if (!history.length) {

    newChat();

    return;

  }

  chatBox.innerHTML = "";

  history.forEach((msg) => {

    if (msg.role === "user") {

      addUserMessage(msg.content);

    } else {

      addAIMessage(msg.content);

    }

  });

}

// =========================
// START
// =========================
loadHistory();
