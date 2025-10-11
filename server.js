// server.js
import { createServer } from "node:http";
import path from "node:path";
import fs from "node:fs";

const mimeTypes = {
  html: "text/html",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  js: "text/javascript",
  css: "text/css",
  json: "application/json",
  svg: "image/svg+xml",
  txt: "text/plain",
};

const PUBLIC_DIR = process.cwd();

const server = createServer((req, res) => {
  try {
    // Simple URL parsing
    let pathname = decodeURIComponent(req.url.split('?')[0]);
    
    // Security: Prevent path traversal
    const filePath = path.normalize(path.join(PUBLIC_DIR, pathname));
    if (!filePath.startsWith(PUBLIC_DIR)) {
      res.writeHead(403, { "Content-Type": "text/plain" });
      res.end("403 Forbidden\n");
      return;
    }

    console.log("Loading " + pathname);

    // Check if file/directory exists
    let stats;
    try {
      stats = fs.statSync(filePath);
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found\n");
      return;
    }

    if (stats.isFile()) {
      // Get file extension and MIME type
      const ext = path.extname(filePath).slice(1).toLowerCase();
      const mimeType = mimeTypes[ext] || "application/octet-stream";
      
      res.writeHead(200, { "Content-Type": mimeType });
      
      const fileStream = fs.createReadStream(filePath);
      
      // Handle stream errors
      fileStream.on("error", (err) => {
        console.error("Stream error:", err);
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "text/plain" });
        }
        res.end("500 Internal Server Error\n");
      });
      
      fileStream.pipe(res);
    } else if (stats.isDirectory()) {
      // Redirect to index.html within that directory
      const indexPath = path.join(pathname, "index.html");
      res.writeHead(302, { Location: indexPath });
      res.end();
    } else {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("500 Internal Error\n");
    }
  } catch (err) {
    console.error("Server error:", err);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("500 Internal Server Error\n");
  }
});

server.listen(3000, "127.0.0.1", () => {
  console.log("Listening on 127.0.0.1:3000");
});