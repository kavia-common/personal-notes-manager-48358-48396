import React, { useEffect, useRef } from "react";
import "../theme.css";

// PUBLIC_INTERFACE
export default function Sidebar({
  notes,
  query,
  onQueryChange,
  onCreate,
  selectedId,
  onSelect,
}) {
  /** Sidebar contains:
   * - brand header
   * - search input
   * - "New Note" button
   * - notes list with filter applied by parent
   */

  const listRef = useRef(null);

  // simple keyboard navigation for the list (up/down/enter)
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const handler = (e) => {
      const items = [...el.querySelectorAll("[data-note-id]")];
      if (items.length === 0) return;

      const currentIndex = items.findIndex((n) => n.getAttribute("data-note-id") === selectedId);
      if (e.key === "ArrowDown") {
        const nextIndex = Math.min(items.length - 1, currentIndex + 1);
        const id = items[nextIndex]?.getAttribute("data-note-id");
        if (id) onSelect(id);
        e.preventDefault();
      } else if (e.key === "ArrowUp") {
        const prevIndex = Math.max(0, currentIndex - 1);
        const id = items[prevIndex]?.getAttribute("data-note-id");
        if (id) onSelect(id);
        e.preventDefault();
      } else if (e.key === "Enter" && currentIndex >= 0) {
        const id = items[currentIndex]?.getAttribute("data-note-id");
        if (id) onSelect(id);
      }
    };

    el.addEventListener("keydown", handler);
    return () => el.removeEventListener("keydown", handler);
  }, [selectedId, onSelect]);

  return (
    <aside className="sidebar" aria-label="Sidebar">
      <div className="brand" role="banner">
        <div className="logo" aria-hidden="true" />
        <div>
          <div className="title">Ocean Notes</div>
          <div className="helper">Personal notes manager</div>
        </div>
      </div>

      <div className="search-box" role="search">
        <input
          className="input"
          placeholder="Search notes..."
          aria-label="Search notes"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
        <button className="btn btn-primary" onClick={onCreate} aria-label="Create new note">
          ＋
        </button>
      </div>

      <div
        ref={listRef}
        className="note-list"
        tabIndex={0}
        aria-label="Notes list"
        role="list"
      >
        {notes.length === 0 ? (
          <div className="helper">No notes yet. Create your first note.</div>
        ) : (
          notes.map((n) => (
            <button
              key={n.id}
              data-note-id={n.id}
              role="listitem"
              onClick={() => onSelect(n.id)}
              className={
                "note-list-item" + (selectedId === n.id ? " active" : "")
              }
              aria-current={selectedId === n.id ? "true" : "false"}
            >
              <div className="title">{n.title || "Untitled"}</div>
              <div className="snippet">{(n.content || "").slice(0, 80)}</div>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
