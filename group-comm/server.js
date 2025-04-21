const http = require("http");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");

let userCount = 1;
const clients = new Map(); // Map ws => username

const server = http.createServer((req, res) => {
  if (req.url === "/" || req.url === "/index.html") {
    const filePath = path.join(__dirname, "index.html");
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end("Error loading HTML");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  const username = `User${userCount++}`;
  clients.set(ws, username);
  console.log(`🟢 ${username} connected. Total: ${clients.size}`);

  // Notify everyone about the new user
  broadcast(`${username} joined the chat 🥳`);

  ws.on("message", (msg) => {
    const user = clients.get(ws);
    const fullMsg = `${user}: ${msg}`;
    console.log("📨", fullMsg);
    broadcast(fullMsg);
  });

  ws.on("close", () => {
    const user = clients.get(ws);
    clients.delete(ws);
    console.log(`🔴 ${user} disconnected. Total: ${clients.size}`);
    broadcast(`${user} left the chat 👋`);
  });
});

function broadcast(message) {
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

server.listen(8080, () => {
  console.log("🚀 Server running at http://localhost:8080");
});
