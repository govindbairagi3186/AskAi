const chatBox =
  document.getElementById("chatBox");

const topicInput =
  document.getElementById("topic");

const voiceBtn =
  document.getElementById("voiceBtn");

const imageInput =
  document.getElementById("imageInput");

let history = JSON.parse(
  localStorage.getItem("askai_history") || "[]"
);

// AUTO RESIZE
topicInput?.addEventListener("input", () => {

  topicInput.style.height = "auto";

  topicInput.style.height =
    topicInput.scrollHeight + "px";

});

// ENTER TO SEND
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

// VOICE
const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;

if (SpeechRecognition && voiceBtn) {

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



// IMAGE UPLOAD
if (imageInput) {

  imageInput.addEventListener(
    "change",
    (e) => {

      const file = e.target.files[0];

      if (!file) return;

      const reader = new FileReader();

      reader.onload = () => {

        // USER IMAGE MESSAGE
        const msg =
          document.createElement("div");

        msg.className =
          "message user";

        msg.innerHTML = `

          <div class="bubble">

            <img
              src="${reader.result}"
              class="uploaded-image"
            />

          </div>

          <div class="avatar user-avatar">
            G
          </div>

        `;

        chatBox.appendChild(msg);

        scrollBottom();

        // AI RESPONSE
        setTimeout(() => {

          addAIMessage(`
# 🖼️ Image Uploaded Successfully

Your image was uploaded.

Future upgrades can include:

- 🔍 AI image analysis
- 📝 OCR text extraction
- 📷 Object detection
- 🤖 Vision AI support
          `);

        }, 500);

      };

      reader.readAsDataURL(file);

    }
  );

}

// NEW CHAT
function newChat() {

  history = [];

  localStorage.removeItem(
    "askai_history"
  );

  chatBox.innerHTML = "";

  addAIMessage(`
# 👋 Welcome to AskAi

I can help with:

- 📚 Study
- 💻 Coding
- 🤖 AI
- ✍️ Writing
- 🌍 General Questions
- 📈 Business Ideas
- 🎯 Career Guidance

Ask me anything.
  `);

}

// USER
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

// AI
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

}

// TYPE EFFECT
function typeText(el, text) {

  let i = 0;

  function typing() {

    if (i < text.length) {

      el.innerHTML =
        text.slice(0, i) + "▌";

      i++;

      scrollBottom();

      setTimeout(typing, 2);

    } else {

      el.innerHTML = text;

    }

  }

  typing();

}

// FORMAT
function formatText(text) {

  return text

    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

    .replace(
      /```([\\s\\S]*?)```/g,
      "<pre><code>$1</code></pre>"
    )

    .replace(/^# (.*$)/gim,"<h1>$1</h1>")
    .replace(/^## (.*$)/gim,"<h2>$1</h2>")
    .replace(/^### (.*$)/gim,"<h3>$1</h3>")
    .replace(/\n/g,"<br>");

}

// THINKING
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

function removeThinking() {

  const t =
    document.getElementById(
      "thinking"
    );

  if (t) t.remove();

}

// MAIN AI
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

  } catch(error){

    removeThinking();

    addAIMessage(`
# ❌ Error

Something went wrong.
    `);

  }

}

// SCROLL
function scrollBottom(){

  chatBox.scrollTop =
    chatBox.scrollHeight;

}

// LOAD HISTORY
function loadHistory(){

  if(!history.length){

    newChat();

    return;

  }

  chatBox.innerHTML = "";

  history.forEach((msg)=>{

    if(msg.role==="user"){

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

// START
loadHistory();
