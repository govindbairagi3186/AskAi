// =======================================================
// AskAi v2
// Created By Govind Vaishnav
// =======================================================

// =======================================================
// DOM ELEMENTS
// =======================================================

const app = document.getElementById("app");
const landingPage = document.getElementById("landingPage");
const loadingScreen = document.getElementById("loadingScreen");

const chatBox = document.getElementById("chatBox");
const topicInput = document.getElementById("topic");

const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");

const themeBtn = document.getElementById("themeBtn");
const themeToggle = document.getElementById("themeToggle");

const fileInput = document.getElementById("fileInput");

const searchChat = document.getElementById("searchChat");

const typingIndicator =
document.getElementById("typingIndicator");

const welcomeScreen =
document.getElementById("welcomeScreen");

const modelSelect =
document.getElementById("modelSelect");

// =======================================================
// APP STATE
// =======================================================

let currentChat = [];

let chats =
JSON.parse(
localStorage.getItem("askai_chats")
) || [];

let currentChatId = null;

let uploadedFileText = "";

let currentTheme =
localStorage.getItem("askai_theme") || "dark";

let isGenerating = false;

let recognition = null;

// =======================================================
// APP START
// =======================================================

window.addEventListener("load", () => {

    initializeApp();

});

// =======================================================
// INITIALIZE
// =======================================================

function initializeApp(){

    applyTheme(currentTheme);

    loadRecentChats();

    autoResize();

    registerEvents();

    if(app){

        app.style.display="none";

    }

}

// =======================================================
// REGISTER EVENTS
// =======================================================

function registerEvents(){

    if(sendBtn){

        sendBtn.addEventListener(
        "click",
        sendMessage);

    }

    if(topicInput){

        topicInput.addEventListener(
        "keydown",
        handleEnter);

    }

    if(themeBtn){

        themeBtn.onclick = toggleTheme;

    }

    if(themeToggle){

        themeToggle.onclick = toggleTheme;

    }

    if(searchChat){

        searchChat.addEventListener(
        "input",
        filterChats);

    }

}

// =======================================================
// LOADING SCREEN
// =======================================================

function startLoading(){

    loadingScreen.style.display="flex";

    setTimeout(()=>{

        loadingScreen.style.display="none";

        openApp();

    },1800);

}

// =======================================================
// OPEN APP
// =======================================================

function openApp(){

    landingPage.style.display="none";

    app.style.display="flex";

    if(currentChat.length===0){

        showWelcome();

    }

}

// =======================================================
// SHOW WELCOME
// =======================================================

function showWelcome(){

    if(welcomeScreen){

        welcomeScreen.style.display="flex";

    }

    chatBox.innerHTML="";

}

// =======================================================
// HIDE WELCOME
// =======================================================

function hideWelcome(){

    if(welcomeScreen){

        welcomeScreen.style.display="none";

    }

}

// =======================================================
// NEW CHAT
// =======================================================

function newChat(){

    if(currentChat.length){

        saveCurrentChat();

    }

    currentChat=[];

    currentChatId=Date.now();

    chatBox.innerHTML="";

    showWelcome();

}

// =======================================================
// SAVE CHAT
// =======================================================

function saveCurrentChat(){

    if(currentChat.length===0) return;

    const title=

    currentChat.find(

    m=>m.role==="user"

    )?.content.substring(0,45)

    || "New Chat";

    const existing=

    chats.find(

    c=>c.id===currentChatId

    );

    if(existing){

        existing.messages=[...currentChat];

        existing.title=title;

    }

    else{

        chats.unshift({

            id:currentChatId,

            title,

            created:new Date().toISOString(),

            messages:[...currentChat]

        });

    }

    localStorage.setItem(

        "askai_chats",

        JSON.stringify(chats)

    );

    loadRecentChats();

}

// =======================================================
// LOAD SIDEBAR
// =======================================================

function loadRecentChats(){

    const recent=

    document.getElementById(

    "recentChats"

    );

    if(!recent) return;

    recent.innerHTML="";

    chats.forEach(chat=>{

        const div=

        document.createElement("div");

        div.className="recent-item";

        div.innerHTML=`
        <span>💬</span>
        <span>${chat.title}</span>
        `;

        div.onclick=()=>{

            openChat(chat.id);

        };

        recent.appendChild(div);

    });

}
// =======================================================
// MESSAGE FUNCTIONS
// =======================================================

function createMessage(role, text) {

    hideWelcome();

    const message = document.createElement("div");
    message.className = `message ${role}`;

    const avatar = document.createElement("div");
    avatar.className =
        role === "user"
            ? "avatar user-avatar"
            : "avatar ai-avatar";

    avatar.textContent =
        role === "user" ? "G" : "AI";

    const bubble = document.createElement("div");
    bubble.className = "bubble";

    bubble.innerHTML =
        role === "assistant"
            ? formatMarkdown(text)
            : escapeHTML(text);

    message.appendChild(avatar);
    message.appendChild(bubble);

    if (role === "assistant") {

        const actions =
        document.createElement("div");

        actions.className =
        "message-actions";

        actions.innerHTML = `

<button onclick="copyMessage(this)">
📋 Copy
</button>

<button onclick="regenerateLastResponse()">
🔄 Regenerate
</button>

`;

        bubble.appendChild(actions);

    }

    chatBox.appendChild(message);

    scrollBottom();

}

// =======================================================
// SEND MESSAGE
// =======================================================

async function sendMessage(){

    if(isGenerating) return;

    const text =
    topicInput.value.trim();

    if(!text) return;

    hideWelcome();

    createMessage("user",text);

    currentChat.push({

        role:"user",

        content:text

    });

    topicInput.value="";

    autoResize();

    showTyping();

    isGenerating=true;

    try{

        const response =
        await fetch("/api/tutor",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                topic:text,

                history:currentChat,

                fileText:uploadedFileText,

                model:modelSelect.value

            })

        });

        const data =
        await response.json();

        hideTyping();

        createMessage(

            "assistant",

            data.result

        );

        currentChat.push({

            role:"assistant",

            content:data.result

        });

        saveCurrentChat();

    }

    catch(err){

        hideTyping();

        createMessage(

            "assistant",

            "❌ Unable to contact the AI server."

        );

        console.error(err);

    }

    finally{

        isGenerating=false;

    }

}

// =======================================================
// OPEN CHAT
// =======================================================

function openChat(id){

    const chat =
    chats.find(c=>c.id===id);

    if(!chat) return;

    currentChatId=id;

    currentChat=[...chat.messages];

    hideWelcome();

    chatBox.innerHTML="";

    currentChat.forEach(msg=>{

        createMessage(

            msg.role==="assistant"
            ? "assistant"
            : "user",

            msg.content

        );

    });

}

// =======================================================
// HANDLE ENTER
// =======================================================

function handleEnter(e){

    if(

        e.key==="Enter"

        &&

        !e.shiftKey

    ){

        e.preventDefault();

        sendMessage();

    }

}

// =======================================================
// TYPING INDICATOR
// =======================================================

function showTyping(){

    typingIndicator.style.display="flex";

    scrollBottom();

}

function hideTyping(){

    typingIndicator.style.display="none";

}

// =======================================================
// COPY RESPONSE
// =======================================================

function copyMessage(button){

    const bubble =

    button

    .closest(".bubble");

    const text =

    bubble.innerText

    .replace("📋 Copy","")

    .replace("🔄 Regenerate","")

    .trim();

    navigator.clipboard

    .writeText(text);

    button.innerHTML="✅ Copied";

    setTimeout(()=>{

        button.innerHTML="📋 Copy";

    },1500);

}

// =======================================================
// REGENERATE
// =======================================================

function regenerateLastResponse(){

    const lastUser =

    [...currentChat]

    .reverse()

    .find(

        m=>m.role==="user"

    );

    if(!lastUser) return;

    topicInput.value=

    lastUser.content;

    sendMessage();

}

// =======================================================
// AUTO SCROLL
// =======================================================

function scrollBottom(){

    requestAnimationFrame(()=>{

        chatBox.scrollTop=

        chatBox.scrollHeight;

    });

}
// =======================================================
// ASKAI v2
// PART 3
// =======================================================

// =======================================================
// AUTO RESIZE TEXTAREA
// =======================================================

function autoResize() {

    if (!topicInput) return;

    topicInput.addEventListener("input", () => {

        topicInput.style.height = "auto";

        topicInput.style.height =
            topicInput.scrollHeight + "px";

    });

}

// =======================================================
// THEME
// =======================================================

function applyTheme(theme) {

    if (theme === "light") {

        document.body.classList.add("light-theme");

    } else {

        document.body.classList.remove("light-theme");

    }

    localStorage.setItem("askai_theme", theme);

    currentTheme = theme;

}

function toggleTheme() {

    if (currentTheme === "dark") {

        applyTheme("light");

    } else {

        applyTheme("dark");

    }

}

// =======================================================
// SEARCH CHATS
// =======================================================

function filterChats() {

    const query =
        searchChat.value.toLowerCase().trim();

    const items =
        document.querySelectorAll(".recent-item");

    items.forEach(item => {

        if (
            item.innerText
                .toLowerCase()
                .includes(query)
        ) {

            item.style.display = "flex";

        } else {

            item.style.display = "none";

        }

    });

}

// =======================================================
// DELETE CHAT
// =======================================================

function deleteChat(id) {

    const ok =
        confirm("Delete this chat?");

    if (!ok) return;

    chats = chats.filter(chat => chat.id !== id);

    localStorage.setItem(
        "askai_chats",
        JSON.stringify(chats)
    );

    loadRecentChats();

    if (currentChatId === id) {

        newChat();

    }

}

// =======================================================
// RENAME CHAT
// =======================================================

function renameChat(id) {

    const chat =
        chats.find(c => c.id === id);

    if (!chat) return;

    const title =
        prompt(
            "Rename chat",
            chat.title
        );

    if (!title) return;

    chat.title = title;

    localStorage.setItem(
        "askai_chats",
        JSON.stringify(chats)
    );

    loadRecentChats();

}

// =======================================================
// VOICE INPUT
// =======================================================

const SpeechRecognition =
window.SpeechRecognition ||
window.webkitSpeechRecognition;

if (SpeechRecognition) {

    recognition =
        new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.interimResults = false;

    recognition.continuous = false;

    voiceBtn.addEventListener(

        "click",

        () => {

            recognition.start();

            voiceBtn.innerHTML = "🎙️";

        }

    );

    recognition.onresult = (event) => {

        topicInput.value =

        event.results[0][0].transcript;

        autoResizeHeight();

    };

    recognition.onend = () => {

        voiceBtn.innerHTML = "🎤";

    };

}

// =======================================================
// AUTO RESIZE HEIGHT
// =======================================================

function autoResizeHeight() {

    topicInput.style.height = "auto";

    topicInput.style.height =
        topicInput.scrollHeight + "px";

}

// =======================================================
// TEXT TO SPEECH
// =======================================================

function speak(text) {

    if (!("speechSynthesis" in window))
        return;

    speechSynthesis.cancel();

    const utterance =
        new SpeechSynthesisUtterance(text);

    utterance.rate = 1;

    utterance.pitch = 1;

    utterance.lang = "en-US";

    speechSynthesis.speak(utterance);

}

// =======================================================
// FILE UPLOAD
// =======================================================

if (fileInput) {

    fileInput.addEventListener(

        "change",

        uploadFile

    );

}

async function uploadFile(e) {

    const file = e.target.files[0];

    if (!file) return;

    const form =
        new FormData();

    form.append("file", file);

    showTyping();

    try {

        const res =
        await fetch(

            "/api/upload",

            {

                method: "POST",

                body: form

            }

        );

        const data =
            await res.json();

        uploadedFileText =
            data.text || "";

        hideTyping();

        createMessage(

            "assistant",

            "📄 " +

            file.name +

            " uploaded successfully."

        );

    }

    catch (err) {

        hideTyping();

        createMessage(

            "assistant",

            "❌ Upload failed."

        );

    }

}

// =======================================================
// ESCAPE HTML
// =======================================================

function escapeHTML(text) {

    return text

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;");

}

// =======================================================
// SIMPLE MARKDOWN
// =======================================================

function formatMarkdown(text) {

    let html =
        escapeHTML(text);

    html = html.replace(

        /\*\*(.*?)\*\*/g,

        "<strong>$1</strong>"

    );

    html = html.replace(

        /\*(.*?)\*/g,

        "<em>$1</em>"

    );

    html = html.replace(

        /`([^`]+)`/g,

        "<code>$1</code>"

    );

    html = html.replace(

        /\n/g,

        "<br>"

    );

    return html;

}

// =======================================================
// SAVE BEFORE EXIT
// =======================================================

window.addEventListener(

    "beforeunload",

    () => {

        saveCurrentChat();

    }

);

// =======================================================
// END OF PART 3
// =======================================================
