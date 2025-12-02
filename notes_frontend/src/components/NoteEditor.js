import React, { useState, useEffect } from "react";
import "../theme.css";

// PUBLIC_INTERFACE
export default function NoteEditor({ initialNote, onSave, onCancel }) {
  /**
   * PUBLIC_INTERFACE
   * Editor for creating or editing a note.
   * Props:
   * - initialNote: {id?, title, content}
   * - onSave: (partialNote) => void
   * - onCancel: () => void
   */
  const [title, setTitle] = useState(initialNote?.title || "");
  const [content, setContent] = useState(initialNote?.content || "");

  useEffect(() => {
    setTitle(initialNote?.title || "");
    setContent(initialNote?.content || "");
  }, [initialNote]);

  const handleSave = () => {
    onSave({ title: title.trim(), content });
  };

  return (
    <div className="card note-edit">
      <div className="toolbar">
        <input
          className="input title-input"
          placeholder="Note title"
          aria-label="Note title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ fontSize: "1.1rem", fontWeight: 700, flex: 1 }}
        />
        <div className="header-actions">
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
      <textarea
        className="textarea"
        placeholder="Write your note here..."
        aria-label="Note content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
    </div>
  );
}
