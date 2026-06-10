// =========================
// ELEMENTS
// =========================

const chatBox = document.getElementById("chatBox");
const topicInput = document.getElementById("topic");
const voiceBtn = document.getElementById("voiceBtn");

let chats =
  JSON.parse(localStorage.getItem("askai_chats")) || [];

let currentChat = [];

// =========================
// APP START
// =========================

window.onload = () => {
  document.getElementById("app").style.display = "none";
};

// =========================
// START LOADING
// =========================

function startLoading() {
  const loader =
    document.getElementById("loadingScreen");

  loader.style.display = "flex";

  setTimeout(() => {
    loader.style.display = "none";
    startApp();
  }, 2200);
}

function startApp() {
  document.getElementById("landingPage").style.display = "none";
  document.getElementById("app").style.display = "flex";

  loadRecentChats();

  if (currentChat.length === 0) {
    addAIMessage(
      "👋 Hey buddy!\n\nI'm AskAi.\n\nAsk me anything."
    );
  }
}

// =========================
// THEME
// =========================

function toggleTheme() {
  document.body.classList.toggle("light-theme");

  const btn =
    document.getElementById("themeBtn");

  btn.innerHTML =
    document.body.classList.contains(
      "light-theme"
    )
      ? "🤖 Ved"
      : "👾 Shastra";
}

// =========================
// AUTO RESIZE
// =========================

topicInput.addEventListener("input", () => {
  topicInput.style.height = "auto";
  topicInput.style.height =
    topicInput.scrollHeight + "px";
});

// =========================
// ENTER SEND
// =========================

topicInput.addEventListener(
  "keydown",
  (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
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

  recognition.onerror = () => {
    voiceBtn.innerText = "🎤";
  };
}

// =========================
// SAVE CHATS
// =========================

function saveChats() {
  localStorage.setItem(
    "askai_chats",
    JSON.stringify(chats)
  );
}

// =========================
// USER MESSAGE
// =========================

function addUserMessage(text) {
  const msg =
    document.createElement("div");

  msg.className = "message user";

  msg.innerHTML = `
    <div class="bubble">${text}</div>
    <div class="avatar user-avatar">G</div>
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

  msg.className = "message ai";

  msg.innerHTML = `
    <div class="avatar ai-avatar">AI</div>
    <div class="bubble ai-text"></div>
  `;

  chatBox.appendChild(msg);

  typeText(
    msg.querySelector(".ai-text"),
    text
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

      setTimeout(typing, 5);
    } else {
      el.innerHTML = text;
    }
  }

  typing();
}

// =========================
// THINKING
// =========================

function showThinking() {
  const div =
    document.createElement("div");

  div.id = "thinking";

  div.className = "message ai";

  div.innerHTML = `
    <div class="avatar ai-avatar">AI</div>
    <div class="bubble">Thinking...</div>
  `;

  chatBox.appendChild(div);

  scrollBottom();
}

function removeThinking() {
  document
    .getElementById("thinking")
    ?.remove();
}

// =========================
// SEND MESSAGE
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
            "application/json",
        },

        body: JSON.stringify({
          topic: text,
          history: currentChat,
        }),
      });

    const data =
      await response.json();

    removeThinking();

    addAIMessage(data.result);

    currentChat.push({
      role: "user",
      content: text,
    });

    currentChat.push({
      role: "assistant",
      content: data.result,
    });

  } catch (error) {
    removeThinking();

    addAIMessage(
      "Something went wrong."
    );

    console.log(error);
  }
}

// =========================
// NEW CHAT
// =========================

function newChat() {

  if (currentChat.length > 0) {

    chats.unshift({
      id: Date.now(),

      title:
        currentChat.find(
          m => m.role === "user"
        )?.content.substring(0, 40) ||
        "New Chat",

      messages: [...currentChat]
    });

    saveChats();
  }

  currentChat = [];

  chatBox.innerHTML = "";

  addAIMessage(
    "👋 Hey buddy!\n\nI'm AskAi.\n\nWhat would you like to talk about today?"
  );

  loadRecentChats();
}

// =========================
// RECENT CHATS
// =========================

function loadRecentChats() {

  const recent =
    document.getElementById(
      "recentChats"
    );

  if (!recent) return;

  recent.innerHTML = "";

  chats.forEach(chat => {

    const item =
      document.createElement("div");

    item.className =
      "recent-item";

    item.innerText =
      "💬 " + chat.title;

    item.onclick = () =>
      openChat(chat.id);

    recent.appendChild(item);

  });

}

// =========================
// OPEN OLD CHAT
// =========================

function openChat(id) {

  const chat =
    chats.find(
      c => c.id === id
    );

  if (!chat) return;

  currentChat =
    [...chat.messages];

  chatBox.innerHTML = "";

  currentChat.forEach(msg => {

    if (msg.role === "user") {
      addUserMessage(msg.content);
    } else {
      addAIMessage(msg.content);
    }

  });

}

// =========================
// SCROLL
// =========================

function scrollBottom() {
  chatBox.scrollTop =
    chatBox.scrollHeight;
}

// =========================
// INIT
// =========================

loadRecentChats();
