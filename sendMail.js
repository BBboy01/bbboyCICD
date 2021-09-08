const email = require("nodemailer");

const { QQ_ACCOUNT, AUTHORIZATION_CODE } = require("./config");

const transporter = email.createTransport({
  service: "qq",
  port: 465,
  secureConnection: true,
  auth: {
    user: `${QQ_ACCOUNT}@qq.com`,
    pass: AUTHORIZATION_CODE,
  },
});

function sendMail(message) {
  const mailOptions = {
    from: `"${QQ_ACCOUNT} <${QQ_ACCOUNT}@qq.com>`,
    to: `${QQ_ACCOUNT}@qq.com`,
    subject: "部署通知",
    html: message,
  };
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      return console.log(err);
    }
    console.log(`Message sent: ${info.messageId}`);
  });
}

module.exports = sendMail;
