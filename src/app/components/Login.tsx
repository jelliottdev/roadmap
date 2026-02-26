import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import { useApp } from "../context/AppContext";
import { supabase } from "../../lib/supabase";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("All fields are required");
      return;
    }
    setSubmitting(true);
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    if (data.user) {
      setUser({ id: data.user.id, email: data.user.email!, initial: data.user.email!.charAt(0).toUpperCase() });
      const savedTeamId = localStorage.getItem("roadmap_team_id");
      navigate(savedTeamId ? "/dashboard" : "/team");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#0a0a0a" }}>
      <div
        className="w-full"
        style={{
          maxWidth: 480,
          backgroundColor: "#141414",
          border: "1px solid #2a2a2a",
          borderRadius: 8,
          padding: 32,
          boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
        }}
      >
        <div className="text-center mb-6">
          <h1 style={{ fontSize: 24, fontWeight: 600, color: "#f5f5f5", fontFamily: "Inter, sans-serif" }}>
            Roadmap<span style={{ color: "#3b82f6" }}>.</span>
          </h1>
          <p style={{ fontSize: 14, color: "#888888", marginTop: 4 }}>Welcome back</p>
        </div>

        {error && (
          <div style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, padding: "8px 12px", marginBottom: 16, fontSize: 13, color: "#ef4444" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            onFocus={(e) => Object.assign(e.target.style, focusStyle)}
            onBlur={(e) => Object.assign(e.target.style, blurStyle)}
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ ...inputStyle, paddingRight: 44 }}
              onFocus={(e) => Object.assign(e.target.style, focusStyle)}
              onBlur={(e) => Object.assign(e.target.style, blurStyle)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ background: "none", border: "none", color: "#888888", cursor: "pointer", padding: 0, display: "flex" }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {}}
              style={{ background: "none", border: "none", color: "#888888", cursor: "pointer", fontSize: 13 }}
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{ ...primaryBtnStyle, opacity: submitting ? 0.7 : 1 }}
            onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = "#4b91f7"; }}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3b82f6")}
          >
            {submitting ? "Logging in…" : "Login"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1" style={{ height: 1, backgroundColor: "#2a2a2a" }} />
          <span style={{ fontSize: 12, color: "#888888" }}>or</span>
          <div className="flex-1" style={{ height: 1, backgroundColor: "#2a2a2a" }} />
        </div>

        <p className="text-center" style={{ fontSize: 14, color: "#888888" }}>
          Don&apos;t have an account?{" "}
          <button onClick={() => navigate("/register")} style={{ color: "#3b82f6", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500 }}>
            Register
          </button>
        </p>
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
