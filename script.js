
const chatBox = document.getElementById("chatBox");
const promptInput = document.getElementById("prompt");

let chats = [];

newChat();

function newChat(){
  chatBox.innerHTML = "";

  addAI(`Hello 👋

I'm AskAi — your AI assistant.

Ask me anything:
- Study
- Coding
- Life advice
- Business ideas
- Explanations
- Debugging
- Summaries`);
}

function addUser(text){
  const div = document.createElement("div");
  div.className = "message user";

  div.innerHTML = `
    <div class="bubble user-bubble">${text}</div>
    <div class="avatar user-avatar">🙂</div>
  `;

  chatBox.appendChild(div);
  scrollBottom();
}

function addAI(text){
  const div = document.createElement("div");
  div.className = "message";

  div.innerHTML = `
    <div class="avatar ai-avatar">🤖</div>
    <div class="bubble ai-bubble markdown-body"></div>
  `;

  chatBox.appendChild(div);

  const bubble = div.querySelector(".bubble");

  streamText(bubble, marked.parse(text));

  scrollBottom();
}

function thinking(){
  const div = document.createElement("div");
  div.className = "message";

  div.innerHTML = `
    <div class="avatar ai-avatar">🤖</div>
    <div class="bubble ai-bubble">
      <div class="typing">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;

  chatBox.appendChild(div);
}
