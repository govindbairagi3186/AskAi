// ===============================
// AskAi Script.js (Part 1)
// Chat Engine
// ===============================

// DOM Elements
const topic = document.getElementById("topic");
const sendBtn = document.getElementById("sendBtn");
const chatBox = document.getElementById("chatBox");
const typingIndicator = document.getElementById("typingIndicator");
const welcomeScreen = document.getElementById("welcomeScreen");
const modelSelect = document.getElementById("modelSelect");

// Chat history
let history = [];

// Uploaded document text
let uploadedFileText = "";

// ===============================
// Add Message
// ===============================

function addMessage(message, sender) {

    welcomeScreen.style.display = "none";

    const wrapper = document.createElement("div");

    wrapper.className = sender === "user"
        ? "message user-message"
        : "message ai-message";

    wrapper.innerHTML = `
        <div class="message-content">
            ${message.replace(/\n/g, "<br>")}
        </div>
    `;

    chatBox.appendChild(wrapper);

    chatBox.scrollTop = chatBox.scrollHeight;
}

// ===============================
// Show Typing
// ===============================

function showTyping() {
    typingIndicator.style.display = "flex";
    chatBox.scrollTop = chatBox.scrollHeight;
}

function hideTyping() {
    typingIndicator.style.display = "none";
}

// ===============================
// Send Message
// ===============================

async function sendMessage() {

    const message = topic.value.trim();

    if (!message) return;

    addMessage(message, "user");

    history.push({
        role: "user",
        content: message
    });

    topic.value = "";

    showTyping();

    try {

        const response = await fetch("/api/tutor", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                topic: message,

                history,

                fileText: uploadedFileText,

                model: modelSelect.value

            })

        });

        const data = await response.json();

        hideTyping();

        addMessage(data.result, "assistant");

        history.push({

            role: "assistant",

            content: data.result

        });

    }

    catch (error) {

        hideTyping();

        addMessage(

            "❌ Unable to connect to AskAi.",

            "assistant"

        );

        console.error(error);

    }

}

// ===============================
// Send Button
// ===============================

sendBtn.addEventListener("click", sendMessage);

// ===============================
// Enter Key
// ===============================

topic.addEventListener("keydown", function (e) {

    if (e.key === "Enter" && !e.shiftKey) {

        e.preventDefault();

        sendMessage();

    }

});

// ===============================
// Auto Height
// ===============================

topic.addEventListener("input", function () {

    this.style.height = "auto";

    this.style.height = this.scrollHeight + "px";

});
// ===============================
// START LOADING
// ===============================

function startLoading() {

    const loadingScreen = document.getElementById("loadingScreen");
    const landingPage = document.getElementById("landingPage");
    const app = document.getElementById("app");

    if (loadingScreen) {
        loadingScreen.style.display = "flex";
    }

    setTimeout(() => {

        if (loadingScreen) loadingScreen.style.display = "none";

        if (landingPage) landingPage.style.display = "none";

        if (app) app.style.display = "flex";

    }, 1800);

}

// ===============================
// NEW CHAT
// ===============================

function newChat() {

    history = [];

    chatBox.innerHTML = "";

    welcomeScreen.style.display = "flex";

    topic.value = "";

    uploadedFileText = "";

}

// ===============================
// THEME
// ===============================

const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {

    themeToggle.addEventListener("click", () => {

        document.body.classList.toggle("dark");

    });

}
