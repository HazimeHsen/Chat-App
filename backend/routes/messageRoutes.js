const express = require("express");
const { isAuth } = require("../utlis");
const MessageModal = require("../models/message");
const messageRoute = express.Router();

messageRoute.get("/:id", isAuth, async (req, res) => {
  const { id } = req.params;
  const text = await MessageModal.find({
    sender: { $in: [id, req.user._id] },
    recipient: { $in: [id, req.user._id] },
  });
  res.send(text);
});

module.exports = messageRoute;
