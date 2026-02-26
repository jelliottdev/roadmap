import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useApp, RoadmapItem, Status, Priority } from "../context/AppContext";

interface Props {
  open: boolean;
  onClose: () => void;
  editItem?: RoadmapItem | null;
  defaultStatus?: Status;
}

const statusOptions: { value: Status; label: string; color: string }[] = [
  { value: "planned", label: "Planned", color: "#6366f1" },
  { value: "in_progress", label: "In Progress", color: "#f59e0b" },
  { value: "completed", label: "Completed", color: "#22c55e" },
  { value: "cancelled", label: "Cancelled", color: "#ef4444" },
];

const priorityOptions: { value: Priority; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "#6b7280" },
  { value: "medium", label: "Medium", color: "#f59e0b" },
  { value: "high", label: "High", color: "#ef4444" },
];

export function ItemModal({ open, onClose, editItem, defaultStatus }: Props) {
  const { addItem, updateItem } = useApp();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>(defaultStatus || "planned");
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState("");
  const [quarter, setQuarter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (editItem) {
      setTitle(editItem.title);
      setDescription(editItem.description);
      setStatus(editItem.status);
      setPriority(editItem.priority);
      setCategory(editItem.category);
      setQuarter(editItem.quarter);
      setStartDate(editItem.startDate);
      setEndDate(editItem.endDate);
    } else {
      setTitle("");
      setDescription("");
      setStatus(defaultStatus || "planned");
      setPriority("medium");
      setCategory("");
      setQuarter("");
      setStartDate("");
      setEndDate("");
    }
  }, [editItem, defaultStatus, open]);

  if (!open) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    const data = { title: title.trim(), description: description.trim(), status, priority, category: category.trim(), quarter: quarter.trim(), startDate, endDate };
    if (editItem) {
      updateItem(editItem.id, data);
    } else {
      addItem(data);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: 560,
          maxWidth: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          backgroundColor: "#141414",
          border: "1px solid #2a2a2a",
          borderRadius: 8,
          padding: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "#f5f5f5" }}>
            {editItem ? "Edit Item" : "New Item"}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#888888", cursor: "pointer", padding: 4, display: "flex" }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ height: 1, backgroundColor: "#2a2a2a", marginBottom: 16 }} />

        {/* Form */}
        <div className="flex flex-col gap-3.5">
          <div>
            <label style={labelStyle}>Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Feature or milestone name"
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, focusStyle)}
              onBlur={(e) => Object.assign(e.target.style, blurStyle)}
            />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this item about?"
              rows={4}
              style={{ ...inputStyle, height: "auto", padding: "10px 14px", resize: "vertical" }}
              onFocus={(e) => Object.assign(e.target.style, focusStyle)}
              onBlur={(e) => Object.assign(e.target.style, blurStyle)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Status</label>
              <div className="relative">
                <div
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: statusOptions.find((s) => s.value === status)?.color }}
                />
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Status)}
                  style={{ ...inputStyle, paddingLeft: 28, appearance: "none", cursor: "pointer" }}
                  onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.target.style, blurStyle)}
                >
                  {statusOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Priority</label>
              <div className="relative">
                <div
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: priorityOptions.find((p) => p.value === priority)?.color }}
                />
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  style={{ ...inputStyle, paddingLeft: 28, appearance: "none", cursor: "pointer" }}
                  onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.target.style, blurStyle)}
                >
                  {priorityOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Category</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. UI, integrations, intake"
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                onBlur={(e) => Object.assign(e.target.style, blurStyle)}
              />
            </div>
            <div>
              <label style={labelStyle}>Quarter</label>
              <input
                value={quarter}
                onChange={(e) => setQuarter(e.target.value)}
                placeholder="e.g. Q2 2025"
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                onBlur={(e) => Object.assign(e.target.style, blurStyle)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ ...inputStyle, cursor: "pointer", colorScheme: "dark" }}
                onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                onBlur={(e) => Object.assign(e.target.style, blurStyle)}
              />
            </div>
            <div>
              <label style={labelStyle}>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ ...inputStyle, cursor: "pointer", colorScheme: "dark" }}
                onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                onBlur={(e) => Object.assign(e.target.style, blurStyle)}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ height: 1, backgroundColor: "#2a2a2a", margin: "16px 0" }} />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            style={{
              height: 38,
              padding: "0 16px",
              backgroundColor: "#1e1e1e",
              color: "#f5f5f5",
              border: "1px solid #2a2a2a",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              transition: "background-color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#252525")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1e1e1e")}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              height: 38,
              padding: "0 20px",
              backgroundColor: "#3b82f6",
              color: "#ffffff",
              border: "none",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              transition: "background-color 0.15s",
              opacity: title.trim() ? 1 : 0.5,
            }}
            onMouseEnter={(e) => { if (title.trim()) e.currentTarget.style.backgroundColor = "#4b91f7"; }}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3b82f6")}
          >
            Save Item
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 500,
  color: "#888888",
  marginBottom: 4,
  fontFamily: "Inter, sans-serif",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 40,
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
