import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { Plus, Copy, Search, Pencil, Trash2, LayoutGrid, Check } from "lucide-react";
import { useApp, RoadmapItem, Status, Priority } from "../context/AppContext";
import { ItemModal } from "./ItemModal";

const STATUS_CONFIG: { key: Status; label: string; color: string }[] = [
  { key: "planned", label: "Planned", color: "#6366f1" },
  { key: "in_progress", label: "In Progress", color: "#f59e0b" },
  { key: "completed", label: "Completed", color: "#22c55e" },
  { key: "cancelled", label: "Cancelled", color: "#ef4444" },
];

const PRIORITY_COLORS: Record<Priority, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#6b7280",
};

const PRIORITY_LABELS: Record<Priority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const QUARTERS = ["All", "Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025", "Q1 2026", "Q2 2026"];

export function Dashboard() {
  const { user, team, items, logout, loading } = useApp();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RoadmapItem | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<Status>("planned");
  const [copied, setCopied] = useState(false);

  // Filters
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterQuarter, setFilterQuarter] = useState("All");

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { deleteItem } = useApp();

  useEffect(() => {
    if (!user || !team) navigate("/");
  }, [user, team]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filterStatus !== "all" && item.status !== filterStatus) return false;
      if (filterPriority !== "all" && item.priority !== filterPriority) return false;
      if (filterCategory && !item.category.toLowerCase().includes(filterCategory.toLowerCase())) return false;
      if (filterQuarter !== "All" && item.quarter !== filterQuarter) return false;
      return true;
    });
  }, [items, filterStatus, filterPriority, filterCategory, filterQuarter]);

  const columns = useMemo(() => {
    return STATUS_CONFIG.map((s) => ({
      ...s,
      items: filteredItems.filter((i) => i.status === s.key),
    }));
  }, [filteredItems]);

  const handleCopy = () => {
    if (team) {
      navigator.clipboard.writeText(team.joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const openNewItem = (status?: Status) => {
    setEditingItem(null);
    setDefaultStatus(status || "planned");
    setModalOpen(true);
  };

  const openEditItem = (item: RoadmapItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteItem(id);
    setDeleteConfirm(null);
  };

  if (!user || !team) return null;

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: "#0a0a0a", fontFamily: "Inter, sans-serif" }}>
      {/* Navbar */}
      <nav
        className="flex items-center justify-between px-5 shrink-0"
        style={{ height: 56, backgroundColor: "#141414", borderBottom: "1px solid #2a2a2a" }}
      >
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 16, fontWeight: 600, color: "#f5f5f5" }}>
            Roadmap<span style={{ color: "#3b82f6" }}>.</span>
          </span>
          <span style={{ color: "#2a2a2a", fontSize: 16 }}>/</span>
          <span style={{ fontSize: 14, color: "#888888" }}>{team.name}</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Join code pill */}
          <div className="flex items-center gap-2" style={{ backgroundColor: "#1e1e1e", border: "1px solid #2a2a2a", borderRadius: 20, padding: "4px 12px", fontSize: 13 }}>
            <span style={{ color: "#888888" }}>Code:</span>
            <span style={{ color: "#f5f5f5", fontFamily: "'SF Mono', 'Fira Code', monospace", letterSpacing: "0.05em" }}>{team.joinCode}</span>
            <button
              onClick={handleCopy}
              style={{ background: "none", border: "none", color: copied ? "#22c55e" : "#888888", cursor: "pointer", padding: 0, display: "flex", transition: "color 0.15s" }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>

          {/* Avatar */}
          <div
            className="flex items-center justify-center"
            style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "#3b82f6", color: "#fff", fontSize: 14, fontWeight: 600 }}
          >
            {user.initial}
          </div>

          {/* Logout */}
          <button
            onClick={() => { logout().then(() => navigate("/")); }}
            style={{ background: "none", border: "none", color: "#888888", cursor: "pointer", fontSize: 13, fontFamily: "Inter, sans-serif", transition: "color 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f5f5f5")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#888888")}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Filter Bar */}
      <div
        className="flex items-center justify-between px-5 shrink-0"
        style={{ height: 52, backgroundColor: "#1e1e1e", borderBottom: "1px solid #2a2a2a" }}
      >
        <div className="flex items-center gap-2">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={selectStyle}>
            <option value="all">Status: All</option>
            <option value="planned">Planned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={selectStyle}>
            <option value="all">Priority: All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "#888888" }} />
            <input
              placeholder="Category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ ...selectStyle, paddingLeft: 30, width: 150 }}
              onFocus={(e) => Object.assign(e.target.style, { borderColor: "#3b82f6", boxShadow: "0 0 0 3px rgba(59,130,246,0.15)" })}
              onBlur={(e) => Object.assign(e.target.style, { borderColor: "#2a2a2a", boxShadow: "none" })}
            />
          </div>

          <select value={filterQuarter} onChange={(e) => setFilterQuarter(e.target.value)} style={selectStyle}>
            {QUARTERS.map((q) => (
              <option key={q} value={q}>{q === "All" ? "Quarter: All" : q}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => openNewItem()}
          className="flex items-center gap-1.5"
          style={{
            height: 36,
            padding: "0 14px",
            backgroundColor: "#3b82f6",
            color: "#ffffff",
            border: "none",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            transition: "background-color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4b91f7")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3b82f6")}
        >
          <Plus size={16} />
          New Item
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden" style={{ padding: 16 }}>
        <div className="flex gap-4 h-full" style={{ minWidth: "fit-content" }}>
          {columns.map((col) => (
            <div key={col.key} className="flex flex-col" style={{ width: 300, minWidth: 300 }}>
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: col.color }} />
                  <span style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", color: col.color, letterSpacing: "0.03em" }}>
                    {col.label}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color: "#888888",
                    backgroundColor: "#1e1e1e",
                    borderRadius: 10,
                    padding: "1px 8px",
                    minWidth: 22,
                    textAlign: "center",
                  }}
                >
                  {col.items.length}
                </span>
              </div>

              {/* Column Body */}
              <div className="flex-1 overflow-y-auto pr-1" style={{ paddingBottom: 8 }}>
                <div className="flex flex-col gap-2.5">
                  {loading ? (
                    <>
                      <SkeletonCard />
                      <SkeletonCard />
                      <SkeletonCard />
                    </>
                  ) : col.items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10">
                      <LayoutGrid size={28} style={{ color: "#2a2a2a", marginBottom: 8 }} />
                      <span style={{ fontSize: 13, color: "#888888" }}>No items yet</span>
                    </div>
                  ) : (
                    col.items.map((item) => (
                      <RoadmapCard
                        key={item.id}
                        item={item}
                        statusColor={col.color}
                        onEdit={() => openEditItem(item)}
                        deleteConfirm={deleteConfirm}
                        setDeleteConfirm={setDeleteConfirm}
                        onDelete={() => handleDelete(item.id)}
                      />
                    ))
                  )}
                </div>

                {/* Add item ghost button */}
                {!loading && (
                  <button
                    onClick={() => openNewItem(col.key)}
                    className="flex items-center justify-center gap-1.5 w-full mt-2.5"
                    style={{
                      height: 38,
                      border: "1px dashed #2a2a2a",
                      borderRadius: 8,
                      backgroundColor: "transparent",
                      color: "#888888",
                      fontSize: 13,
                      cursor: "pointer",
                      fontFamily: "Inter, sans-serif",
                      transition: "border-color 0.15s, color 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.color = "#3b82f6"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = "#888888"; }}
                  >
                    <Plus size={14} />
                    Add item
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ItemModal open={modalOpen} onClose={() => setModalOpen(false)} editItem={editingItem} defaultStatus={defaultStatus} />
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      style={{
        backgroundColor: "#141414",
        border: "1px solid #2a2a2a",
        borderRadius: 8,
        borderLeft: "3px solid #2a2a2a",
        padding: 12,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div style={{ width: 60, height: 12, borderRadius: 4, backgroundColor: "#1e1e1e" }} className="animate-pulse" />
        <div style={{ width: 48, height: 12, borderRadius: 4, backgroundColor: "#1e1e1e" }} className="animate-pulse" />
      </div>
      <div style={{ width: "85%", height: 14, borderRadius: 4, backgroundColor: "#1e1e1e", marginBottom: 6 }} className="animate-pulse" />
      <div style={{ width: "65%", height: 12, borderRadius: 4, backgroundColor: "#1e1e1e" }} className="animate-pulse" />
      <div className="flex items-center justify-between mt-3">
        <div style={{ width: 50, height: 12, borderRadius: 4, backgroundColor: "#1e1e1e" }} className="animate-pulse" />
        <div style={{ width: 40, height: 12, borderRadius: 4, backgroundColor: "#1e1e1e" }} className="animate-pulse" />
      </div>
    </div>
  );
}

interface CardProps {
  item: RoadmapItem;
  statusColor: string;
  onEdit: () => void;
  deleteConfirm: string | null;
  setDeleteConfirm: (id: string | null) => void;
  onDelete: () => void;
}

function RoadmapCard({ item, statusColor, onEdit, deleteConfirm, setDeleteConfirm, onDelete }: CardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); if (deleteConfirm === item.id) setDeleteConfirm(null); }}
      style={{
        backgroundColor: "#141414",
        border: `1px solid ${hovered ? "#3b82f6" : "#2a2a2a"}`,
        borderRadius: 8,
        borderLeft: `3px solid ${statusColor}`,
        padding: 12,
        cursor: "default",
        transition: "border-color 0.15s",
      }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: PRIORITY_COLORS[item.priority] }} />
          <span style={{ fontSize: 11, color: PRIORITY_COLORS[item.priority], fontWeight: 500 }}>
            {PRIORITY_LABELS[item.priority]}
          </span>
        </div>
        {item.category && (
          <span
            style={{
              fontSize: 11,
              color: "#888888",
              backgroundColor: "#1e1e1e",
              borderRadius: 10,
              padding: "1px 8px",
            }}
          >
            {item.category}
          </span>
        )}
      </div>

      {/* Title */}
      <p
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "#f5f5f5",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          lineHeight: "1.4",
          margin: 0,
        }}
      >
        {item.title}
      </p>

      {/* Description */}
      {item.description && (
        <p
          style={{
            fontSize: 12,
            color: "#888888",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: "1.4",
            marginTop: 4,
            marginBottom: 0,
          }}
        >
          {item.description}
        </p>
      )}

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-3">
        <span style={{ fontSize: 12, color: "#888888" }}>{item.quarter}</span>
        <div className="flex items-center gap-1">
          <IconBtn icon={<Pencil size={14} />} onClick={onEdit} hoverColor="#3b82f6" />
          <div className="relative">
            <IconBtn
              icon={<Trash2 size={14} />}
              onClick={() => setDeleteConfirm(deleteConfirm === item.id ? null : item.id)}
              hoverColor="#ef4444"
            />
            {deleteConfirm === item.id && (
              <div
                className="absolute right-0 top-full mt-1 z-10 flex items-center gap-2"
                style={{
                  backgroundColor: "#1e1e1e",
                  border: "1px solid #2a2a2a",
                  borderRadius: 6,
                  padding: "4px 8px",
                  whiteSpace: "nowrap",
                  fontSize: 12,
                }}
              >
                <span style={{ color: "#ef4444" }}>Sure?</span>
                <button onClick={onDelete} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 12, fontWeight: 600, padding: 0 }}>
                  Yes
                </button>
                <span style={{ color: "#2a2a2a" }}>|</span>
                <button onClick={() => setDeleteConfirm(null)} style={{ background: "none", border: "none", color: "#888888", cursor: "pointer", fontSize: 12, padding: 0 }}>
                  No
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function IconBtn({ icon, onClick, hoverColor }: { icon: React.ReactNode; onClick: () => void; hoverColor: string }) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: "none",
        border: "none",
        color: h ? hoverColor : "#888888",
        cursor: "pointer",
        padding: 4,
        display: "flex",
        borderRadius: 4,
        transition: "color 0.15s",
      }}
    >
      {icon}
    </button>
  );
}

const selectStyle: React.CSSProperties = {
  height: 34,
  backgroundColor: "#141414",
  border: "1px solid #2a2a2a",
  borderRadius: 6,
  padding: "0 10px",
  color: "#f5f5f5",
  fontSize: 13,
  fontFamily: "Inter, sans-serif",
  outline: "none",
  cursor: "pointer",
  appearance: "auto",
  transition: "border-color 0.15s",
};
