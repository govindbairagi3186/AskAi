// =========================
// AskAi PREMIUM script.js
// =========================

// ELEMENTS
const chatBox =
  document.getElementById("chatBox");

const topicInput =
  document.getElementById("topic");

const voiceBtn =
  document.getElementById("voiceBtn");

const historyList =
  document.getElementById("historyList");

const fileInput =
  document.getElementById("fileInput");

const modelSelect =
  document.getElementById("modelSelect");

// =========================
// CHAT MEMORY
// =========================
let history = JSON.parse(
  localStorage.getItem("askai_history") || "[]"
);

// =========================
// LANDING PAGE LOGIC
// =========================
window.startApp = function () {

  document.getElementById(
    "landingPage"
  ).style.display = "none";

  document.getElementById(
    "mainApp"
  ).style.display = "flex";

};

// =========================
// AUTO RESIZE
// =========================
topicInput?.addEventListener(
  "input",
  () => {

    topicInput.style.height =
      "auto";

    topicInput.style.height =
      topicInput.scrollHeight + "px";

  }
);

// =========================
// ENTER TO SEND
// =========================
topicInput?.addEventListener(
  "keydown",
  (e) => {

    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {

      e.preventDefault();

      learnTopic();

    }

  }
);

// =========================
// VOICE INPUT
// =========================
const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;

if (SpeechRecognition && voiceBtn) {

  const recognition =
    new SpeechRecognition();

  recognition.lang = "en-US";

  recognition.continuous = false;

  voiceBtn.onclick = () => {

    recognition.start();

    voiceBtn.innerText = "🎙️";

  };

  recognition.onresult = (e) => {

    topicInput.value =
      e.results[0][0].transcript;

    voiceBtn.innerText = "🎤";

  };

  recognition.onerror = () => {

    voiceBtn.innerText = "🎤";

  };

}

// =========================
// FILE UPLOAD
// =========================
if (fileInput) {

  fileInput.addEventListener(
    "change",
    (e) => {

      const file =
        e.target.files[0];

      if (!file) return;

      addUserMessage(
        `📎 Uploaded file: ${file.name}`
      );

      setTimeout(() => {

        addAIMessage(`
# 📎 File Uploaded Successfully

File Name:
${file.name}

Future Support:
- PDF Analysis
- AI Summaries
- OCR Extraction
- AI Notes
- Smart Search
        `);

      }, 500);

    }
  );

}

// =========================
// NEW CHAT
// =========================
function newChat() {

  history = [];

  localStorage.removeItem(
    "askai_history"
  );

  chatBox.innerHTML = "";

  addWelcomeMessage();

  updateSidebarHistory();

}

// =========================
// WELCOME MESSAGE
// =========================
function addWelcomeMessage() {

  addAIMessage(`
# 👋 Welcome to AskAi

Your premium AI assistant.

Capabilities:

- 🤖 AI Chat
- 💻 Coding Help
- 📚 Study Notes
- ✍️ Writing
- 🌍 General Knowledge
- 📈 Business Ideas
- 🎨 Creative Thinking
- 🧠 AI Memory

Ask me anything.
  `);

}

// =========================
// USER MESSAGE
// =========================
function addUserMessage(text) {

  const msg =
    document.createElement("div");

  msg.className =
    "message user";

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

  const msg =
    document.createElement("div");

  msg.className =
    "message ai";

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

  function typing() {

    if (i < text.length) {

      el.innerHTML =
        text.slice(0, i) + "▌";

      i++;

      scrollBottom();

      setTimeout(
        typing,
        2
      );

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

    .replace(
      /\n/g,
      "<br>"
    );

}

// =========================
// THINKING ANIMATION
// =========================
function showThinking() {

  const t =
    document.createElement("div");

  t.id = "thinking";

  t.className =
    "message ai";

  t.innerHTML = `

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

  chatBox.appendChild(t);

  scrollBottom();

}

// =========================
// REMOVE THINKING
// =========================
function removeThinking() {

  const t =
    document.getElementById(
      "thinking"
    );

  if (t) t.remove();

}

// =========================
// MAIN AI FUNCTION
// =========================
async function learnTopic() {

  const text =
    topicInput.value.trim();

  if (!text) return;

  addUserMessage(text);

  topicInput.value = "";

  topicInput.style.height =
    "auto";

  showThinking();

  try {

    const response =
      await fetch("/api/tutor", {

        method:"POST",

        headers:{
          "Content-Type":
          "application/json"
        },

        body:JSON.stringify({

          topic:text,

          history,

          model:modelSelect.value

        })

      });

    const data =
      await response.json();

    removeThinking();

    if (data.error) {

      addAIMessage(`
# ❌ Error

${data.error}
      `);

      return;

    }

    addAIMessage(
      data.result
    );

    // SAVE USER
    history.push({
      role:"user",
      content:text
    });

    // SAVE AI
    history.push({
      role:"assistant",
      content:data.result
    });

    // SAVE MEMORY
    localStorage.setItem(
      "askai_history",
      JSON.stringify(history)
    );

    updateSidebarHistory();

  } catch(error){

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
function scrollBottom(){

  chatBox.scrollTop =
    chatBox.scrollHeight;

}

// =========================
// SIDEBAR HISTORY
// =========================
function updateSidebarHistory() {

  if (!historyList) return;

  historyList.innerHTML = "";

  const chats = history.filter(
    msg => msg.role === "user"
  );

  chats
    .slice()
    .reverse()
    .slice(0,20)
    .forEach((msg) => {

      const item =
        document.createElement("div");

      item.className =
        "history-item";

      item.innerText =
        msg.content.slice(0,40);

      item.onclick = () => {

        topicInput.value =
          msg.content;

      };

      historyList.appendChild(item);

    });

}

// =========================
// LOAD HISTORY
// =========================
function loadHistory() {

  chatBox.innerHTML = "";

  if (!history.length) {

    addWelcomeMessage();

    return;

  }

  history.forEach((msg) => {

    if (msg.role === "user") {

      const userMsg =
        document.createElement("div");

      userMsg.className =
        "message user";

      userMsg.innerHTML = `

        <div class="bubble">
          ${formatText(msg.content)}
        </div>

        <div class="avatar user-avatar">
          G
        </div>

      `;

      chatBox.appendChild(userMsg);

    } else {

      const aiMsg =
        document.createElement("div");

      aiMsg.className =
        "message ai";

      aiMsg.innerHTML = `

        <div class="avatar ai-avatar">
          AI
        </div>

        <div class="bubble">
          ${formatText(msg.content)}
        </div>

      `;

      chatBox.appendChild(aiMsg);

    }

  });

  scrollBottom();

}

// =========================
// INIT
// =========================
loadHistory();

updateSidebarHistory();
