import { useState } from "react";
import axios from "axios";

export default function CreatePoll() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [pollLink, setPollLink] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const createPoll = async () => {
    // Question validation
    if (!question.trim()) {
      alert("Enter a question");
      return;
    }

    // Remove empty options
    const validOptions = options
      .map(o => o.trim())
      .filter(o => o !== "");

    // Minimum options check
    if (validOptions.length < 2) {
      alert("Minimum 2 options required");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/polls",
        {
          question,
          options: validOptions
        }
      );

      // IMPORTANT: dynamic origin (works after deployment too)
      const link = `${window.location.origin}/poll/${res.data.pollId}`;
      setPollLink(link);

    } catch (err) {
      alert("Failed to create poll");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pollLink);
      alert("Link copied!");
    } catch {
      alert("Failed to copy link");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #0f0f0f, #1a1a1a)"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          background: "#1c1c1c",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>Create Poll</h2>

        {/* Question */}
        <input
          placeholder="Enter poll question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "6px",
            border: "none",
            background: "#2a2a2a",
            color: "white",
            marginBottom: "20px"
          }}
        />

        {/* Options */}
        {options.map((opt, i) => (
          <input
            key={i}
            placeholder={`Option ${i + 1}`}
            value={opt}
            onChange={(e) =>
              handleOptionChange(i, e.target.value)
            }
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "none",
              background: "#2a2a2a",
              color: "white",
              marginBottom: "10px"
            }}
          />
        ))}

        {/* Buttons */}
        <div style={{ marginTop: "15px" }}>
          <button
            onClick={addOption}
            style={{ marginRight: "10px" }}
          >
            Add Option
          </button>

          <button
            onClick={createPoll}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Poll"}
          </button>
        </div>

        {/* LINK DISPLAY */}
        {pollLink && (
          <div
            style={{
              marginTop: "25px",
              padding: "15px",
              background: "#111",
              borderRadius: "8px"
            }}
          >
            <p style={{ marginBottom: "8px" }}>
              Poll created successfully 🎉
            </p>

            <input
              value={pollLink}
              readOnly
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "6px",
                border: "none",
                background: "#222",
                color: "#4caf50"
              }}
            />

            <button
              onClick={copyLink}
              style={{ marginTop: "10px" }}
            >
              Copy Link
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
