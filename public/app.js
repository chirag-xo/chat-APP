let socket = new WebSocket("ws://" + location.host);
let messages = [];

const chat = document.getElementById("chat");
const input = document.getElementById("msg");
const sendBtn = document.getElementById("send");

socket.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === "init") {
    messages = msg.data;
  } else if (msg.type === "new") {
    messages.push(msg.data);
  } else if (msg.type === "update") {
    messages = messages.map(m => m.id === msg.data.id ? msg.data : m);
  } else if (msg.type === "delete") {
    messages = messages.filter(m => m.id !== msg.data.id);
  }
  render();
};

sendBtn.onclick = () => {
  const text = input.value.trim();
  if (text) {
    socket.send(JSON.stringify({ type: "new", text }));
    input.value = "";
  }
};

function edit(id) {
  const newText = prompt("Update message:");
  if (newText) {
    socket.send(JSON.stringify({ type: "update", id, text: newText }));
  }
}

function remove(id) {
  socket.send(JSON.stringify({ type: "delete", id }));
}

function render() {
  chat.innerHTML = '';
  messages.forEach(msg => {
    const isBot = msg.text.startsWith('🤖');
    const div = document.createElement('div');
    div.className = `msg ${isBot ? 'bot' : 'user'}`;
    div.innerHTML = `
      ${msg.text}
      ${!isBot ? `<span onclick="edit('${msg.id}')">✏️</span><span onclick="remove('${msg.id}')">❌</span>` : ''}
    `;
    chat.appendChild(div);
  });
  chat.scrollTop = chat.scrollHeight;
}
