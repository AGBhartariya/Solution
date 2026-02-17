const express = require("express");
const router = express.Router();
const Poll = require("../models/poll");

router.post("/", async (req, res) => {
  try {
    const { pollId, optionIndex } = req.body;
    const userIP = req.ip;

    const poll = await Poll.findById(pollId);

    if (!poll)
      return res.status(404).json({ error: "Poll not found" });

    // SECOND FAIRNESS MECHANISM
    if (poll.voters.includes(userIP)) {
      return res.status(400).json({
        error: "You have already voted"
      });
    }

    poll.options[optionIndex].votes += 1;

    // store IP
    poll.voters.push(userIP);

    await poll.save();

    req.io.to(pollId).emit("vote_update", poll);

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: "Vote failed" });
  }
});

module.exports = router;
