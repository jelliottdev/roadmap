import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import { supabase } from "../../lib/supabase";

export function JoinOrCreateTeam() {
  const [teamName, setTeamName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { setTeam, user } = useApp();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!teamName.trim()) {
      setError("Team name is required");
      return;
    }
    if (!user?.id) {
      setError("You must be logged in to create a team");
      return;
    }
    setSubmitting(true);
    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .insert({ name: teamName.trim() })
      .select("id, name, join_code")
      .single();
    if (teamError || !teamData) {
      setError(teamError?.message || "Failed to create team");
      setSubmitting(false);
      return;
    }
    await supabase.from("team_members").insert({ team_id: teamData.id, user_id: user.id, role: "owner" });
    setTeam({ id: teamData.id, name: teamData.name, joinCode: teamData.join_code });
    setSubmitting(false);
    navigate("/dashboard");
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (joinCode.length !== 8) {
      setError("Join code must be 8 characters");
      return;
    }
    if (!user?.id) {
      setError("You must be logged in to join a team");
      return;
    }
    setSubmitting(true);
    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .select("id, name, join_code")
      .eq("join_code", joinCode.toUpperCase())
      .single();
    if (teamError || !teamData) {
      setError("Team not found. Check the join code and try again.");
      setSubmitting(false);
      return;
    }
    await supabase
      .from("team_members")
      .upsert({ team_id: teamData.id, user_id: user.id, role: "member" }, { onConflict: "team_id,user_id" });
    setTeam({ id: teamData.id, name: teamData.name, joinCode: teamData.join_code });
    setSubmitting(false);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#0a0a0a" }}>
      <div
        className="w-full"
        style={{
          maxWidth: 520,
          backgroundColor: "#141414",
          border: "1px solid #2a2a2a",
          borderRadius: 8,
          padding: 32,
          boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
        }}
      >
        <div className="text-center mb-6">
          <h2 style={{ fontSize: 22, fontWeight: 600, color: "#f5f5f5", fontFamily: "Inter, sans-serif" }}>
            Get started
          </h2>
          <p style={{ fontSize: 14, color: "#888888", marginTop: 4 }}>Create a new team or join an existing one</p>
        </div>

        {error && (
          <div style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, padding: "8px 12px", marginBottom: 16, fontSize: 13, color: "#ef4444" }}>
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-0">
          {/* Create Team */}
          <div className="flex-1 p-1">
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#888888", marginBottom: 12 }}>
              Create a team
            </p>
            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="e.g. VeriDocket"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                onBlur={(e) => Object.assign(e.target.style, blurStyle)}
              />
              <button
                type="submit"
                disabled={submitting}
                style={{ ...primaryBtnStyle, opacity: submitting ? 0.7 : 1 }}
                onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = "#4b91f7"; }}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3b82f6")}
              >
                {submitting ? "Creating…" : "Create Team"}
              </button>
            </form>
          </div>

          {/* Divider */}
          <div className="flex md:flex-col items-center gap-3 my-5 md:my-0 md:mx-5">
            <div className="flex-1 md:w-px md:flex-1" style={{ backgroundColor: "#2a2a2a", height: 1, width: "100%" }} />
            <span style={{ fontSize: 12, color: "#888888", whiteSpace: "nowrap" }}>or</span>
            <div className="flex-1 md:w-px md:flex-1" style={{ backgroundColor: "#2a2a2a", height: 1, width: "100%" }} />
          </div>

          {/* Join Team */}
          <div className="flex-1 p-1">
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#888888", marginBottom: 12 }}>
              Join a team
            </p>
            <form onSubmit={handleJoin} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="8-character code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 8))}
                style={{ ...inputStyle, fontFamily: "'SF Mono', 'Fira Code', monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}
                onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                onBlur={(e) => Object.assign(e.target.style, blurStyle)}
              />
              <button
                type="submit"
                disabled={submitting}
                style={{ ...outlinedBtnStyle, opacity: submitting ? 0.7 : 1 }}
                onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = "rgba(59,130,246,0.1)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#1e1e1e"; }}
              >
                {submitting ? "Joining…" : "Join Team"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 44,
  backgroundColor: "#141414",
  border: "1px solid #2a2a2a",
  borderRadius: 6,
  padding: "0 14px",
  color: "#f5f5f5",
  fontSize: 14,
  fontFamily: "Inter, sans-serif",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

const focusStyle = { borderColor: "#3b82f6", boxShadow: "0 0 0 3px rgba(59,130,246,0.15)" };
const blurStyle = { borderColor: "#2a2a2a", boxShadow: "none" };

const primaryBtnStyle: React.CSSProperties = {
  width: "100%",
  height: 44,
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  border: "none",
  borderRadius: 6,
  fontSize: 14,
  fontWeight: 600,
  fontFamily: "Inter, sans-serif",
  cursor: "pointer",
  transition: "background-color 0.15s",
};

const outlinedBtnStyle: React.CSSProperties = {
  width: "100%",
  height: 44,
  backgroundColor: "#1e1e1e",
  color: "#3b82f6",
  border: "1px solid #3b82f6",
  borderRadius: 6,
  fontSize: 14,
  fontWeight: 600,
  fontFamily: "Inter, sans-serif",
  cursor: "pointer",
  transition: "background-color 0.15s",
};
