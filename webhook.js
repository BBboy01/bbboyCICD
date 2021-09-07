const http = require("http");
const crypto = require("crypto");
const spawn = require("child_process");

const { SECRET } = require("./config");

function sign(body) {
  return "sha1" + crypto.createHmac("sha1", SECRET).update(body).digest("hex");
}

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/webhook") {
    let buffers = [];
    req.on("data", (buffer) => {
      buffers.push(buffer);
    });
    req.on("end", () => {
      const body = Buffer.concat(buffers);
      const event = req.headers["x-github-event"]; // push
      const signature = req.headers["x-hub-signature"]; // 需要验证的签名
      if (signature !== sign(body)) {
        return res.end("Not Allow");
      }
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ ok: true }));
      // 部署
      if (event === "push") {
        const payload = JSON.parse(body);
        const child_process = spawn("sh", [`./${payload.repository.name}.sh`]);
        let buffers = [];
        child_process.stdout.on("data", (buffer) => {
          buffers.push(buffer);
        });
        child_process.stdout.on("end", () => {
          Buffer.concat(buffers);
        });
      }
    });
  } else {
    res.end("Not Found");
  }
});

server.listen(4000, () => {
  console.log("server run in port 4000");
});
