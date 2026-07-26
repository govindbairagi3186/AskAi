// =========================
// ELEMENTS
// =========================

const chatBox =
  document.getElementById("chatBox");

const topicInput =
  document.getElementById("topic");

const voiceBtn =
  document.getElementById("voiceBtn");

const fileInput =
  document.getElementById("fileInput");

// =========================
// FILE MEMORY
// =========================

let uploadedFileText = "";

// =========================
// APP START
// =========================

// HIDE APP INITIALLY
window.onload = () => {

  const appEl = document.getElementById("app");

  if (appEl) {
    appEl.style.display = "none";
  }

};

// =========================
// START LOADING
// =========================

function startLoading() {

  const loader =
    document.getElementById(
      "loadingScreen"
    );

  loader.style.display =
    "flex";

  setTimeout(() => {

    loader.style.display =
      "none";

    startApp();

  }, 2200);

}

// =========================
// START APP
// =========================

function startApp() {

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
    document.getElementById(
      "themeBtn"
    );

  if (
    document.body.classList.contains(
      "light-theme"
    )
  ) {

    btn.innerHTML =
      "🤖 Ved";

  } else {

    btn.innerHTML =
      "👾 Shastra";

  }

}

// =========================
// AUTO RESIZE
// =========================

if (topicInput) {
  topicInput.addEventListener(
    "input",
    () => {

      topicInput.style.height =
        "auto";

      topicInput.style.height =
        topicInput.scrollHeight + "px";

    }
  );
}

// =========================
// ENTER SEND
// =========================

if (topicInput) {
  topicInput.addEventListener(
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
}

// =========================
// VOICE INPUT
// =========================

const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;

if (SpeechRecognition && voiceBtn && topicInput) {

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
// FILE UPLOAD
// =========================

// =========================
// FILE UPLOAD
// =========================

if (fileInput) {

  fileInput.addEventListener(

    "change",

    async (e) => {

      const file =
        e.target.files[0];

      if (!file) return;

      // SHOW USER MESSAGE
      addUserMessage(
        `📎 Uploaded: ${file.name}`
      );

      // SHOW ANALYZING
      addAIMessage(
        "📂 Analyzing file..."
      );

      try {

        // CREATE FORM DATA
        const formData =
          new FormData();

        formData.append(
          "file",
          file
        );

        // SEND FILE
        const response =
          await fetch(

            "/api/upload",

            {

              method: "POST",

              body: formData,

            }

          );

        // GET RESPONSE
        const data =
          await response.json();

        // HANDLE ERRORS
        if (!response.ok) {

          addAIMessage(

            `❌ ${
              data.error ||
              "Failed to analyze file."
            }`

          );

          return;

        }

        // SAVE FILE TEXT
        uploadedFileText =
          data.text || "";

        // SUCCESS MESSAGE
        addAIMessage(

`✅ File analyzed successfully!

📄 ${file.name}

You can now ask questions about this file.`

        );

        console.log(
          "FILE TEXT:",
          uploadedFileText
        );

      } catch (error) {

        console.log(error);

        addAIMessage(

          "❌ Failed to analyze file."

        );

      }

    }

  );

}

// =========================
// HISTORY
// =========================

let history = JSON.parse(
  localStorage.getItem(
    "askai_history"
  ) || "[]"
);

// =========================
// USER MESSAGE
// =========================

function addUserMessage(text) {

  if (!chatBox) return;

  const msg =
    document.createElement("div");

  msg.className =
    "message user";

  msg.innerHTML = `

    <div class="bubble">
      ${text}
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

  if (!chatBox) return;

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

      setTimeout(
        typing,
        5
      );

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

  if (!chatBox) return;

  const think =
    document.createElement("div");

  think.id = "thinking";

  think.className =
    "message ai";

  think.innerHTML = `

    <div class="avatar ai-avatar">
      AI
    </div>

    <div class="bubble">
      Thinking...
    </div>

  `;

  chatBox.appendChild(think);

  scrollBottom();

}

function removeThinking() {

  const think =
    document.getElementById(
      "thinking"
    );

  if (think) think.remove();

}

// =========================
// MAIN AI
// =========================

async function learnTopic() {

  if (!topicInput || !chatBox) return;

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

          history,

          fileText:
          uploadedFileText

        })

      });

    const data =
      await response.json();

    removeThinking();

    addAIMessage(
      data.result
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

    loadRecentChats();

  } catch (error) {

    removeThinking();

    addAIMessage(
      "Something went wrong."
    );

    console.log(error);

  }

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

  const chats =
    history.filter(
      x => x.role === "user"
    );

  chats
    .slice()
    .reverse()
    .slice(0, 10)
    .forEach((chat) => {

      const item =
        document.createElement("div");

      item.className =
        "recent-item";

      item.innerHTML =
        "💬 " +
        chat.content.slice(0, 25);

      item.onclick = () => {

        topicInput.value =
          chat.content;

      };

      recent.appendChild(item);

    });

}

// =========================
// NEW CHAT
// =========================

function newChat() {

  history = [];

  uploadedFileText = "";

  localStorage.removeItem(
    "askai_history"
  );

  chatBox.innerHTML = "";

  addAIMessage(`
👋 Hey buddy!

I'm AskAi.

What do you want to talk about today?
  `);

  loadRecentChats();

}

// =========================
// SCROLL
// =========================

function scrollBottom() {

  if (!chatBox) return;

  chatBox.scrollTop =
    chatBox.scrollHeight;

}

// =========================
// LOAD OLD CHATS
// =========================

function loadHistory() {

  if (!history.length) {

    addAIMessage(`
👋 Hey buddy!

I'm AskAi.

Ask me anything.
    `);

    return;

  }

  history.forEach((msg) => {

    if (
      msg.role === "user"
    ) {

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
