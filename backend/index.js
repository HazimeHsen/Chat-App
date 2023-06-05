const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const userRouter = require("./routes/userRoute");
const cors = require("cors");
const app = express();
const ws = require("ws");
const jwt = require("jsonwebtoken");
const MessageModal = require("./models/message");
const messageRoute = require("./routes/messageRoutes");
const fs = require("fs");
require("dotenv").config();
app.use(bodyParser.json());
app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true, // Allow cookies to be sent from the backend to the frontend
  })
);
app.use(express.urlencoded({ extended: true }));
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Server is running on port 5000");
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
  });

app.use("/user", userRouter);
app.use("/message", messageRoute);
app.use("/uploads", express.static(__dirname + "/uploads"));

const server = app.listen(5000);
const wss = new ws.WebSocketServer({ server });

wss.on("connection", (connection, req) => {
  function notifyAboutOnlinePeople() {
    [...wss.clients].forEach((client) => {
      client.send(
        JSON.stringify({
          online: [...wss.clients].map((c) => ({ name: c.name, userId: c.id })),
        })
      );
    });
  }

  connection.isAive = true;
  connection.timer = setInterval(() => {
    connection.ping();
    connection.deathTimer = setTimeout(() => {
      connection.isAive = false;
      clearInterval(connection.timer);
      connection.terminate();
      notifyAboutOnlinePeople();
      console.log("dead");
    }, 1000);
  }, 5000);

  connection.on("pong", () => {
    clearTimeout(connection.deathTimer);
  });

  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenCookie = cookies
      .split(";")
      .find((str) => str.startsWith("token="));
    if (tokenCookie) {
      const token = tokenCookie.split("=")[1];
      if (token) {
        jwt.verify(
          token,
          process.env.VITE_SECRET_JWT_KEY,
          {},
          (err, userData) => {
            if (err) throw err;
            const { name, _id } = userData;
            connection.name = name;
            connection.id = _id;
          }
        );
      }
    }
  }

  connection.on("message", async (message) => {
    const messageData = JSON.parse(message.toString());
    const { recipient, text, file } = messageData;
    let filename = null;
    if (file) {
      const parts = file.name.split(".");
      const ext = parts[parts.length - 1];
      filename = Date.now() + "." + ext;
      const path = __dirname + "/uploads/" + filename;
      const bufferData = Buffer.from(file.data.split(",")[1], "base64");
      fs.writeFile(path, bufferData, (err) => {
        if (err) {
          console.error("Error saving file: ", err);
        } else {
          console.log("File saved: ", path);
        }
      });
    }
    if (recipient && (text || file)) {
      const messageDoc = await MessageModal.create({
        sender: connection.id,
        recipient,
        text,
        file: file ? filename : null,
      });
      [...wss.clients]
        .filter((c) => c.id === recipient)
        .forEach((c) =>
          c.send(
            JSON.stringify({
              text,
              sender: connection.id,
              _id: messageDoc._id,
              file: file ? filename : null,
              recipient,
            })
          )
        );
    }
  });

  notifyAboutOnlinePeople();
});
