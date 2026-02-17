import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import socket from "../socket";

export default function PollRoom() {
  const { id } = useParams();

  const [poll, setPoll] = useState(null);
  const [voted, setVoted] = useState(false);
  const [loadingVote, setLoadingVote] = useState(false);

  useEffect(() => {
    // Fetch poll
    axios
      .get(`http://localhost:5000/api/polls/${id}`)
      .then(res => setPoll(res.data))
      .catch(() => alert("Failed to load poll"));

    // Join socket room
    socket.emit("join_poll", id);

    const handleVoteUpdate = (updatedPoll) => {
      setPoll(updatedPoll);
    };

    socket.on("vote_update", handleVoteUpdate);

    // Local vote lock
    const alreadyVoted =
      localStorage.getItem(`voted_${id}`) === "true";
    setVoted(alreadyVoted);

    return () => {
      socket.off("vote_update", handleVoteUpdate);
    };
  }, [id]);

  // ===============================
  // VOTE FUNCTION
  // ===============================
  const vote = async (index) => {
    if (voted || loadingVote) return;

    try {
      setLoadingVote(true);

      // Optimistic UI update
      setPoll(prev => {
        const updated = { ...prev };
        updated.options = [...prev.options];
        updated.options[index] = {
          ...updated.options[index],
          votes: updated.options[index].votes + 1
        };
        return updated;
      });

      // ✅ CORRECT API ROUTE
      await axios.post(
        "http://localhost:5000/api/polls/vote",
        {
          pollId: id,
          optionIndex: index
        }
      );

      localStorage.setItem(`voted_${id}`, "true");
      setVoted(true);

    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Vote failed. Please try again.");
    } finally {
      setLoadingVote(false);
    }
  };

  if (!poll)
    return <h3 style={{ padding: 20 }}>Loading...</h3>;

  const totalVotes = poll.options.reduce(
    (sum, opt) => sum + opt.votes,
    0
  );

  const maxVotes = Math.max(
    ...poll.options.map(o => o.votes)
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "60px",
        background:
          "linear-gradient(135deg, #0f0f0f, #1a1a1a)"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "750px",
          background: "#1c1c1c",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
        }}
      >
        <h2 style={{ marginBottom: "10px" }}>
          {poll.question}
        </h2>

        <p style={{ color: "#aaa", marginBottom: "25px" }}>
          Total Votes: {totalVotes}
        </p>

        {poll.options.map((opt, i) => {
          const percentage =
            totalVotes === 0
              ? 0
              : Math.round(
                  (opt.votes / totalVotes) * 100
                );

          const isWinner =
            opt.votes === maxVotes && maxVotes > 0;

          return (
            <div key={i} style={{ marginBottom: "20px" }}>
              <button
                onClick={() => vote(i)}
                disabled={voted || loadingVote}
                style={{
                  marginBottom: "6px",
                  padding: "8px 14px",
                  borderRadius: "6px",
                  border: "none",
                  background:
                    voted || loadingVote
                      ? "#333"
                      : "#222",
                  color: "#fff",
                  cursor:
                    voted || loadingVote
                      ? "default"
                      : "pointer"
                }}
              >
                {opt.text}
              </button>

              <div
                style={{
                  background: "#333",
                  height: "20px",
                  borderRadius: "6px",
                  overflow: "hidden"
                }}
              >
                <div
                  style={{
                    width: `${percentage}%`,
                    background: isWinner
                      ? "#4caf50"
                      : "#555",
                    height: "100%",
                    transition:
                      "width 0.5s ease-in-out"
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: "14px",
                  color: "#ccc",
                  marginTop: "4px"
                }}
              >
                {opt.votes} votes ({percentage}%)
              </div>
            </div>
          );
        })}

        {voted && (
          <div
            style={{
              marginTop: "20px",
              padding: "12px",
              background: "#143d2b",
              borderRadius: "6px",
              color: "#4caf50"
            }}
          >
            ✅ You have already voted
          </div>
        )}
      </div>
    </div>
  );
}
