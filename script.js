// =========================
// ELEMENTS
// =========================

const chatBox =
  document.getElementById("chatBox");

const topicInput =
  document.getElementById("topic");

const voiceBtn =
  document.getElementById("voiceBtn");

const searchInput =
  document.getElementById("searchChats");

const recentChats =
  document.getElementById("recentChats");

const pinnedChats =
  document.getElementById("pinnedChats");

// =========================
// MEMORY
// =========================

let history = JSON.parse(
  localStorage.getItem("askai_history") || "[]"
);

let pinned = JSON.parse(
  localStorage.getItem("askai_pinned") || "[]"
);

// =========================
// START APP
// =========================

function startApp() {
  // =========================
// LOADING TRANSITION
// =========================

function startLoading() {

  const loading =
    document.getElementById(
      "loadingScreen"
    );

  loading.style.display =
    "flex";

  setTimeout(() => {

    loading.style.display =
      "none";

    startApp();

  }, 2500);

}

  document.getElementById(
    "landingPage"
  ).style.display = "none";

  document.getElementById(
    "app"
  ).style.display = "flex";

}

// =========================
// THEME SWITCH
// =========================

function toggleTheme() {

  document.body.classList.toggle(
    "light-theme"
  );

  const btn =
    document.getElementById("themeBtn");

  if (
    document.body.classList.contains(
      "light-theme"
    )
  ) {

    btn.innerText = "Ved🤖";

    localStorage.setItem(
      "askai_theme",
      "light"
    );

  } else {

    btn.innerText = "Shastra👾";

    localStorage.setItem(
      "askai_theme",
      "dark"
    );

  }

}

// LOAD THEME
const savedTheme =
  localStorage.getItem("askai_theme");

if (savedTheme === "light") {

  document.body.classList.add(
    "light-theme"
  );

}

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
// ENTER SEND
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
// VOICE
// =========================

const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;

if (SpeechRecognition) {

  const recognition =
    new SpeechRecognition();

  recognition.lang = "en-US";

  voiceBtn.onclick = () => {

    recognition.start();

    voiceBtn.innerText = "🎙️";

  };

  recognition.onresult = (e) => {

    topicInput.value =
      e.results[0][0].transcript;

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

  loadRecentChats();

}

// =========================
// WELCOME
// =========================

function addWelcomeMessage() {

  addAIMessage(`
# 👋 Welcome to AskAi

Your intelligent AI assistant.

Capabilities:

- 🤖 AI Chat
- 💻 Coding
- 📚 Study
- ✍️ Writing
- 🌍 Knowledge
- 📈 Business
- 🎨 Creativity

Ask anything.
  `);

}

// =========================
// USER MESSAGE
// =========================

function addUserMessage(text) {

  const div =
    document.createElement("div");

  div.className =
    "message user";

  div.innerHTML = `

    <div class="bubble">
      ${formatText(text)}
    </div>

    <div class="avatar user-avatar">
      G
    </div>

  `;

  chatBox.appendChild(div);

  scrollBottom();

}

// =========================
// AI MESSAGE
// =========================

function addAIMessage(text) {

  const div =
    document.createElement("div");

  div.className =
    "message ai";

  div.innerHTML = `

    <div class="avatar ai-avatar">
      AI
    </div>

    <div class="bubble ai-text"></div>

  `;

  chatBox.appendChild(div);

  const bubble =
    div.querySelector(".ai-text");

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
// FORMAT
// =========================

function formatText(text) {

  return text

    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

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
      Thinking...
    </div>

  `;

  chatBox.appendChild(t);

  scrollBottom();

}

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

    history.push({
      role:"user",
      content:text
    });

    history.push({
      role:"assistant",
      content:data.result
    });

    localStorage.setItem(
      "askai_history",
      JSON.stringify(history)
    );

    loadRecentChats();

  } catch(error) {

    removeThinking();

    addAIMessage(`
# ❌ Error

Something went wrong.
    `);

  }

}

// =========================
// RECENT CHATS
// =========================

function loadRecentChats() {

  if (!recentChats) return;

  recentChats.innerHTML = "";

  const chats =
    history.filter(
      x => x.role === "user"
    );

  chats
    .slice()
    .reverse()
    .forEach((msg) => {

      const item =
        document.createElement("div");

      item.className =
        "sidebar-item";

      item.innerHTML = `
        💬 ${msg.content.slice(0,25)}
      `;

      item.onclick = () => {

        topicInput.value =
          msg.content;

      };

      // PIN BUTTON
      const pin =
        document.createElement("span");

      pin.innerHTML = "📌";

      pin.style.float = "right";

      pin.onclick = (e) => {

        e.stopPropagation();

        pinned.push(msg.content);

        localStorage.setItem(
          "askai_pinned",
          JSON.stringify(pinned)
        );

        loadPinnedChats();

      };

      item.appendChild(pin);

      recentChats.appendChild(item);

    });

}

// =========================
// PINNED
// =========================

function loadPinnedChats() {

  if (!pinnedChats) return;

  pinnedChats.innerHTML = "";

  pinned.forEach((chat) => {

    const item =
      document.createElement("div");

    item.className =
      "sidebar-item";

    item.innerHTML =
      `📌 ${chat.slice(0,25)}`;

    item.onclick = () => {

      topicInput.value = chat;

    };

    pinnedChats.appendChild(item);

  });

}

// =========================
// SEARCH
// =========================

searchInput?.addEventListener(
  "input",
  () => {

    const value =
      searchInput.value.toLowerCase();

    const items =
      document.querySelectorAll(
        ".sidebar-item"
      );

    items.forEach((item) => {

      if (
        item.innerText
          .toLowerCase()
          .includes(value)
      ) {

        item.style.display =
          "block";

      } else {

        item.style.display =
          "none";

      }

    });

  }
);

// =========================
// SCROLL
// =========================

function scrollBottom() {

  chatBox.scrollTop =
    chatBox.scrollHeight;

}

// =========================
// LOAD CHAT
// =========================

function loadHistory() {

  chatBox.innerHTML = "";

  if (!history.length) {

    addWelcomeMessage();

    return;

  }

  history.forEach((msg) => {

    if (msg.role === "user") {

      addUserMessage(
        msg.content
      );

    } else {

      addAIMessage(
        msg.content
      );

    }

  });

}

// =========================
// INIT
// =========================

loadHistory();

loadRecentChats();

loadPinnedChats();
