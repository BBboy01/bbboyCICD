const http = require("http");
const crypto = require("crypto");
const spawn = require("child_process");

const sendMail = require("./sendMail");

const { SECRET } = require("./config");

function sign(body) {
  console.log(
    "sha1" + crypto.createHmac("sha1", SECRET).update(body).digest("hex")
  );
  console.log(
    "sha1" +
      crypto.createHmac("sha1", SECRET).update(body.toString()).digest("hex")
  );
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
      console.log(signature);
      if (signature !== sign(body)) {
        return res.end("Not Allow");
      }
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ ok: true }));
      // 部署
      if (event === "push") {
        const payload = JSON.parse(body);
        console.log(`执行脚本 ./${payload.repository.name}.sh`);
        const child_process = spawn("sh", [`./${payload.repository.name}.sh`]);
        let buffers = [];
        child_process.stdout.on("data", (buffer) => {
          buffers.push(buffer);
        });
        child_process.stdout.on("end", () => {
          const log = Buffer.concat(buffers).toString();
          sendMail(`
            <h1>部署日期：${new Date()}</h1>
            <h2>部署用户：${payload.pusher.name}</h2>
            <h2>用户邮箱：${payload.pusher.email}</h2>
            <h2>提交信息：${
              payload.head_commit && payload.head_commit["message"]
            }</h2>
            <h2>部署日志${log.replace("\r\n", "<br/>")}</h2>
          `);
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
