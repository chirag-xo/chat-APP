const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let messages = [];

function broadcast(msg) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(msg));
    }
  });
}

wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "init", data: messages }));

  ws.on("message", (data) => {
    const msg = JSON.parse(data);

    if (msg.type === "new") {
      const id = Date.now().toString();
      const userMsg = { id, text: msg.text };
      messages.push(userMsg);
      broadcast({ type: "new", data: userMsg });

      // Basic bot logic
      let botText = "";
      const text = msg.text.toLowerCase();
      if (text.includes("hello")) {
        botText = "👋 Hello! How can I help you today?";
      } else if (text.includes("joke")) {
        botText = "😂 Why don't robots panic? Because they have nerves of steel!";
      } else if (text.includes("weather")) {
        botText = "🌤️ It's always sunny in the terminal!";
      }

      if (botText) {
        setTimeout(() => {
          const botMsg = { id: Date.now().toString(), text: `🤖 ${botText}` };
          messages.push(botMsg);
          broadcast({ type: "new", data: botMsg });
        }, 500);
      }
    }

    if (msg.type === "update") {
      const updated = messages.find(m => m.id === msg.id);
      if (updated) {
        updated.text = msg.text;
        broadcast({ type: "update", data: updated });
      }
    }

    if (msg.type === "delete") {
      messages = messages.filter(m => m.id !== msg.id);
      broadcast({ type: "delete", data: { id: msg.id } });
    }
  });
});

app.use(express.static(path.join(__dirname, "public")));

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
