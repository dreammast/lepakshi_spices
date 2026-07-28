import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config({ path: "../.env" });

console.log("Node version:", process.version);
console.log("OpenSSL version:", process.versions.openssl);
console.log("Nodemailer version:", nodemailer?.version ?? "unknown");

function makeTransporter({ port, secure }) {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    logger: true,
    debug: true,
  });
}

async function runScenario({ label, port, secure }) {
  console.log(`\n=== ${label} ===`);
  console.log({
    host: process.env.SMTP_HOST,
    port,
    secure,
    user: process.env.SMTP_USER,
    from: process.env.MAIL_FROM,
  });

  const transporter = makeTransporter({ port, secure });

  let verifyResult = "not-run";
  try {
    console.log("Calling transporter.verify()");
    const verifyOutcome = await Promise.race([
      transporter.verify().then(() => "verified").catch((err) => ({ error: err })),
      new Promise((resolve) => setTimeout(() => resolve("timeout"), 15000)),
    ]);

    if (verifyOutcome === "verified") {
      console.log("SMTP VERIFIED");
      verifyResult = "verified";
    } else if (verifyOutcome === "timeout") {
      console.log("Hanging during transporter.verify()");
      verifyResult = "timeout";
    } else {
      console.error("VERIFY FAILED");
      console.error(verifyOutcome.error);
      verifyResult = "failed";
    }
  } catch (err) {
    console.error("VERIFY FAILED");
    console.error(err);
    verifyResult = "failed";
  }

  let sendMailResult = "not-run";
  try {
    console.log("Calling transporter.sendMail() without verify()");
    const sendOutcome = await Promise.race([
      transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: process.env.SMTP_USER,
        subject: `SMTP Test ${label}`,
        text: `SMTP test for ${label}`,
      }).then((info) => ({ info })),
      new Promise((resolve) => setTimeout(() => resolve({ timeout: true }), 15000)),
    ]);

    if (sendOutcome.timeout) {
      console.log("Hanging during transporter.sendMail()");
      sendMailResult = "timeout";
    } else {
      console.log("SENDMAIL OK");
      console.log(sendOutcome.info);
      sendMailResult = "succeeded";
    }
  } catch (err) {
    console.error("SENDMAIL FAILED");
    console.error(err);
    sendMailResult = "failed";
  }

  return { verifyResult, sendMailResult };
}

async function rawSmtpProbe({ label, port, secure }) {
  console.log(`\n=== RAW PROBE ${label} ===`);
  const net = await import("node:net");
  const tls = await import("node:tls");

  const servername = process.env.SMTP_HOST;
  const socket =
    secure
      ? tls.connect({
          host: process.env.SMTP_HOST,
          port,
          servername,
        })
      : net.createConnection({
          host: process.env.SMTP_HOST,
          port,
        });

  socket.setTimeout(15000);

  socket.on("connect", () => {
    console.log("RAW CONNECT");
  });

  socket.on("secureConnect", () => {
    console.log("RAW SECURE CONNECT");
  });

  socket.on("data", (chunk) => {
    console.log("RAW DATA");
    console.log(chunk.toString("utf8"));
    if (!secure) {
      socket.write(`EHLO localhost\r\n`);
    }
  });

  socket.on("timeout", () => {
    console.log("RAW TIMEOUT");
    socket.destroy();
  });

  socket.on("error", (err) => {
    console.error("RAW ERROR");
    console.error(err);
  });

  await new Promise((resolve) => {
    socket.on("close", () => resolve(undefined));
    if (!secure) {
      socket.once("data", () => {
        setTimeout(() => {
          socket.end("QUIT\r\n");
        }, 1000);
      });
    } else {
      socket.once("secureConnect", () => {
        setTimeout(() => {
          socket.end("EHLO localhost\r\nQUIT\r\n");
        }, 1000);
      });
    }
  });
}

const results = [];
results.push(await runScenario({ label: "PORT 587", port: 587, secure: false }));
results.push(await runScenario({ label: "PORT 465", port: 465, secure: true }));
results.push(await runScenario({ label: "PORT 2525", port: 2525, secure: false }));

await rawSmtpProbe({ label: "PORT 587", port: 587, secure: false });
await rawSmtpProbe({ label: "PORT 465", port: 465, secure: true });
await rawSmtpProbe({ label: "PORT 2525", port: 2525, secure: false });

console.log("\n=== SUMMARY ===");
console.log({
  nodeVersion: process.version,
  opensslVersion: process.versions.openssl,
  nodemailerVersion: nodemailer?.version ?? "unknown",
  results,
});
