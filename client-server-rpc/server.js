const http = require("http");
const fs = require("fs");
const path = require("path");

const METHODS = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
};

const server = http.createServer((req, res) => {
  if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
    const filePath = path.join(__dirname, "index.html");
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end("Error loading index.html");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
  } else if (req.method === "POST" && req.url === "/rpc") {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      const { method, params } = JSON.parse(body);
      console.log("📥 RPC Call:", method, params);
      if (METHODS[method]) {
        const result = METHODS[method](...params);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ result }));
      } else {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Method not found" }));
      }
    });
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
