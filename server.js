import express from "express";

const app = express();

app.get("/api/greeting", (_req, res) => {
  // GREETING_TAG is read at runtime from the process environment (ox env file).
  res.type("text/plain").send(`hello world oxzoo-web3-vue_${process.env.GREETING_TAG}`);
});

app.get("/health", (_req, res) => {
  res.type("text/plain").send("ok");
});

const port = process.env.PORT || 9116;
const host = "127.0.0.1";

app.listen(port, host, () => {
  console.log(`oxzoo-web3-vue listening on http://${host}:${port}`);
});
