const express = require("express");
const router = express.Router();
const Poll = require("../models/poll");


// ===============================
// CREATE POLL
// ===============================
router.post("/", async (req, res) => {
  try {
    const { question, options } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        error: "Question required"
      });
    }

    const cleanOptions = options
      .map(opt => opt.trim())
      .filter(opt => opt.length > 0);

    if (cleanOptions.length < 2) {
      return res.status(400).json({
        error: "At least 2 options required"
      });
    }

    const poll = await Poll.create({
      question: question.trim(),
      options: cleanOptions.map(opt => ({
        text: opt,
        votes: 0
      }))
    });

    res.status(201).json({
      pollId: poll._id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to create poll"
    });
  }
});


// ===============================
// VOTE ON POLL
// (IMPORTANT: before /:id)
// ===============================
router.post("/vote", async (req, res) => {
  try {
    const { pollId, optionIndex } = req.body;

    if (!pollId) {
      return res.status(400).json({
        error: "Poll ID required"
      });
    }

    const poll = await Poll.findById(pollId);

    if (!poll) {
      return res.status(404).json({
        error: "Poll not found"
      });
    }

    if (
      optionIndex === undefined ||
      optionIndex < 0 ||
      optionIndex >= poll.options.length
    ) {
      return res.status(400).json({
        error: "Invalid option"
      });
    }

    // ===============================
    // DUPLICATE VOTE PROTECTION
    // ===============================
    const voterId = req.ip; // simple unique identifier

    if (poll.voters.includes(voterId)) {
      return res.status(400).json({
        error: "You have already voted"
      });
    }

    // Increment vote
    poll.options[optionIndex].votes += 1;

    // Save voter
    poll.voters.push(voterId);

    await poll.save();

    // Emit realtime update
    const io = req.app.get("io");
    if (io) {
      io.to(pollId).emit("vote_update", poll);
    }

    res.status(200).json({
      success: true,
      poll
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Vote failed"
    });
  }
});


// ===============================
// GET POLL
// (Keep LAST)
// ===============================
router.get("/:id", async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({
        error: "Poll not found"
      });
    }

    res.json(poll);

  } catch (err) {
    res.status(404).json({
      error: "Poll not found"
    });
  }
});

module.exports = router;
