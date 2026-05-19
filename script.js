// =========================
// 🕉️OmAi👾 FINAL script.js
// =========================

const chatBox =
  document.getElementById("chatBox");

const topicInput =
  document.getElementById("topic");

const voiceBtn =
  document.getElementById("voiceBtn");


// =========================
// HISTORY
// =========================
let history = JSON.parse(
  localStorage.getItem("🕉️OmAi👾_history") || "[]"
);

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
// NEW CHAT
// =========================
function newChat() {

  history = [];

  localStorage.removeItem(
    "🕉️OmAi👾_history"
  );

  chatBox.innerHTML = "";

  addAIMessage(`
# 👋 Welcome to 🕉️OmAi👾

I can help with:

- 📚 Study
- 💻 Coding
- 🤖 AI
- 🌍 General Questions
- ✍️ Writing
- 📈 Business Ideas
- 🎯 Career Guidance

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
      /\n/g,
      "<br>"
    );

}

// =========================
// THINKING
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
// MAIN AI
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

          history

        })

      });

    const data =
      await response.json();

    removeThinking();

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

    // SAVE CHAT HISTORY
    localStorage.setItem(
      "🕉️OmAi👾_history",
      JSON.stringify(history)
    );

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
// LOAD HISTORY
// =========================
function loadHistory() {

  const savedHistory = JSON.parse(
    localStorage.getItem("🕉️OmAi👾_history") || "[]"
  );

  history = savedHistory;

  chatBox.innerHTML = "";

  // NO HISTORY
  if (!history.length) {

    addAIMessage(`
# 👋 Welcome to 🕉️OmAi👾

I can help with:

- 📚 Study
- 💻 Coding
- 🤖 AI
- 🌍 General Questions
- ✍️ Writing
- 📈 Business Ideas
- 🎯 Career Guidance

Ask me anything.
    `);

    return;

  }

  // LOAD OLD CHATS
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
// START
// =========================
loadHistory();
