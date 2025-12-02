import React from "react";
import "../theme.css";

// PUBLIC_INTERFACE
export default function NoteViewer({ note, onEdit, onDelete }) {
  /**
   * PUBLIC_INTERFACE
   * Displays a note in read-only mode with edit and delete actions.
   */
  if (!note) {
    return (
      <div className="card note-view">
        <h2>Select or create a note</h2>
        <p className="helper">Choose a note from the sidebar or create a new one.</p>
      </div>
    );
  }

  return (
    <div className="card note-view" aria-live="polite">
      <div className="toolbar">
        <h2 style={{ margin: 0 }}>{note.title || "Untitled"}</h2>
        <div className="header-actions">
          <button className="btn btn-ghost" onClick={onEdit} aria-label="Edit note">Edit</button>
          <button className="btn btn-danger" onClick={onDelete} aria-label="Delete note">Delete</button>
        </div>
      </div>
      <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{note.content || ""}</div>
      <div className="meta">Updated: {new Date(note.updatedAt).toLocaleString()}</div>
    </div>
  );
}
