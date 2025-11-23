import Mailjet from "node-mailjet";
import dotenv from "dotenv";
dotenv.config();

const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_SECRET_KEY
);

export async function sendEmail(to, subject, html) {
  try {
    await mailjet
      .post("send", { version: "v3.1" })
      .request({
        Messages: [
          {
            From: {
              Email: process.env.MAIL_FROM,
              Name: "FluxData"
            },
            To: [{ Email: to }],
            Subject: subject,
            HTMLPart: html
          }
        ]
      });

    return true;

  } catch (error) {
    console.error("Error enviando correo:", error);
    return false;
  }
}
