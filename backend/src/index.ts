import express from "express";

const app = express();
const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Hello from Express.js!");
});

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
