const express = require("express");

const {
  createCommunicationSession,
  sendCommunicationMessage,
  getCommunicationSessions,
  getCommunicationSession,
  finishCommunicationSession,
} = require("../controller/CommunicationController");

const isAuth = require("../middlewares/isAuth.js");

const router = express.Router();

router.post("/sessions", isAuth, createCommunicationSession);
router.post("/sessions/:id/message", isAuth, sendCommunicationMessage);
router.get("/sessions", isAuth, getCommunicationSessions);
router.get("/sessions/:id", isAuth, getCommunicationSession);
router.patch("/sessions/:id/finish", isAuth, finishCommunicationSession);

module.exports = router;
