// =========================
// AskAi FINAL script.js
// =========================

// ELEMENTS
const chatBox =
  document.getElementById("chatBox");

const topicInput =
  document.getElementById("topic");

const voiceBtn =
  document.getElementById("voiceBtn");

// =========================
// CHAT MEMORY
// =========================
let history = JSON.parse(

  localStorage.getItem(
    "askai_history"
  ) || "[]"

);

// =========================
// START APP
// =========================
window.startApp = function () {

  document.getElementById(
    "landingPage"
  ).style.display = "none";

  document.getElementById(
    "app"
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
// NEW CHAT
// =========================
function newChat() {

  history = [];

  localStorage.removeItem(
    "askai_history"
  );

  chatBox.innerHTML = "";

  addWelcomeMessage();

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

        method: "POST",

        headers: {

          "Content-Type":
            "application/json"

        },

        body: JSON.stringify({

          topic: text,

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

      role: "user",

      content: text

    });

    // SAVE AI
    history.push({

      role: "assistant",

      content: data.result

    });

    // SAVE MEMORY
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

      addUserMessage(msg.content);

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
// =========================
// THEME SWITCH
// =========================

const themeBtn =
  document.getElementById("themeToggle");

let darkMode = true;

themeBtn.onclick = () => {

  document.body.classList.toggle(
    "light-theme"
  );

  darkMode = !darkMode;

  if(darkMode){

    themeBtn.innerHTML =
      "👾 Shastra";

  }else{

    themeBtn.innerHTML =
      "🤖 Ved";

  }

};

// =========================
// SEARCH CHAT
// =========================

const searchInput =
  document.getElementById(
    "searchChat"
  );

if(searchInput){

  searchInput.addEventListener(
    "input",
    () => {

      const value =
        searchInput.value
        .toLowerCase();

      const items =
        document.querySelectorAll(
          ".history-item"
        );

      items.forEach((item)=>{

        if(
          item.innerText
          .toLowerCase()
          .includes(value)
        ){

          item.style.display =
            "block";

        }else{

          item.style.display =
            "none";

        }

      });

    }
  );

}

// =========================
// PIN CHAT
// =========================

let pinnedChats = JSON.parse(
  localStorage.getItem(
    "askai_pins"
  ) || "[]"
);

function pinChat(text){

  if(
    !pinnedChats.includes(text)
  ){

    pinnedChats.push(text);

    localStorage.setItem(
      "askai_pins",
      JSON.stringify(pinnedChats)
    );

    renderPinned();

  }

}

function renderPinned(){

  const pinnedList =
    document.getElementById(
      "pinnedList"
    );

  if(!pinnedList) return;

  pinnedList.innerHTML = "";

  pinnedChats.forEach((chat)=>{

    const item =
      document.createElement("div");

    item.className =
      "history-item";

    item.innerHTML =
      `📌 ${chat}`;

    pinnedList.appendChild(item);

  });

}

renderPinned();
