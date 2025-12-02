import React, { useEffect, useMemo, useState } from "react";
import "./theme.css";
import "./index.css";
import Sidebar from "./components/Sidebar";
import NoteViewer from "./components/NoteViewer";
import NoteEditor from "./components/NoteEditor";
import storage, { NotesStorage } from "./services/storage";

/**
 * Notes App
 * - Layout: Sidebar (navigation/search) + Main area (view/edit)
 * - Storage strategy:
 *    If REACT_APP_API_BASE is defined (non-empty), uses API.
 *    Otherwise, data persists to localStorage.
 *
 * Environment variables (optional):
 * - REACT_APP_API_BASE: Base URL for backend API (e.g., https://api.example.com)
 * - REACT_APP_BACKEND_URL: Fallback base URL if REACT_APP_API_BASE is empty
 * - Other REACT_APP_* variables are ignored by the app UI but may be used by the hosting environment
 *
 * To switch between API/local storage:
 * - Set REACT_APP_API_BASE in your environment to use backend API.
 * - Leave it empty/unset to use localStorage with seed notes on first run.
 */

// PUBLIC_INTERFACE
function App() {
  const [query, setQuery] = useState("");
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [mode, setMode] = useState("view"); // 'view' | 'edit' | 'create'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Use a singleton storage instance (already exported default)
  const client = useMemo(() => storage instanceof NotesStorage ? storage : new NotesStorage(), []);

  // initial load or when query changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");
    client
      .listNotes(query)
      .then((list) => {
        if (!isMounted) return;
        setNotes(list);
        // auto-select first if none selected
        if (list.length > 0 && !list.find((n) => n.id === selectedId)) {
          setSelectedId(list[0].id);
        }
      })
      .catch((e) => {
        if (!isMounted) return;
        setError(e?.message || "Failed to load notes");
      })
      .finally(() => isMounted && setLoading(false));

    return () => {
      isMounted = false;
    };
  }, [query]); // intentionally not watching selectedId or client

  const selectedNote = useMemo(() => notes.find((n) => n.id === selectedId) || null, [notes, selectedId]);

  const handleCreate = async () => {
    setMode("create");
  };

  const handleSaveCreate = async (partial) => {
    // optimistic create
    setLoading(true);
    setError("");
    try {
      const created = await client.createNote(partial);
      setNotes((prev) => [created, ...prev]);
      setSelectedId(created.id);
      setMode("view");
    } catch (e) {
      setError(e?.message || "Failed to create note");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (!selectedNote) return;
    setMode("edit");
  };

  const handleSaveEdit = async (partial) => {
    if (!selectedId) return;
    setLoading(true);
    setError("");
    try {
      const updated = await client.updateNote(selectedId, partial);
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      setMode("view");
    } catch (e) {
      setError(e?.message || "Failed to update note");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    const confirmDelete = window.confirm("Delete this note?");
    if (!confirmDelete) return;

    setLoading(true);
    setError("");
    const idToDelete = selectedId;
    try {
      // optimistic UI: remove immediately
      setNotes((prev) => prev.filter((n) => n.id !== idToDelete));
      await client.deleteNote(idToDelete);
      setSelectedId((prevId) => {
        if (prevId === idToDelete) {
          // select next available
          const remaining = notes.filter((n) => n.id !== idToDelete);
          return remaining[0]?.id || null;
        }
        return prevId;
      });
      setMode("view");
    } catch (e) {
      setError(e?.message || "Failed to delete note");
      // reload to sync
      client.listNotes(query).then(setNotes).catch(() => {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        notes={notes}
        query={query}
        onQueryChange={setQuery}
        onCreate={handleCreate}
        selectedId={selectedId}
        onSelect={(id) => {
          setSelectedId(id);
          setMode("view");
        }}
      />
      <main className="main" aria-live="polite">
        <div className="toolbar" style={{ marginBottom: 16 }}>
          <button
            className="btn btn-primary"
            onClick={handleCreate}
            aria-label="Create note"
          >
            New Note
          </button>
          {selectedNote && mode === "view" && (
            <>
              <button className="btn btn-ghost" onClick={handleEdit} aria-label="Edit selected note">
                Edit
              </button>
              <button className="btn btn-danger" onClick={handleDelete} aria-label="Delete selected note">
                Delete
              </button>
            </>
          )}
          <div className="header-actions" />
        </div>

        {error && (
          <div className="card" role="alert" style={{ borderLeft: `4px solid #EF4444` }}>
            <strong style={{ color: "#EF4444" }}>Error:</strong> {error}
          </div>
        )}

        {loading && <div className="card">Loading…</div>}

        {!loading && mode === "create" && (
          <NoteEditor initialNote={{ title: "", content: "" }} onSave={handleSaveCreate} onCancel={() => setMode("view")} />
        )}

        {!loading && mode === "edit" && (
          <NoteEditor initialNote={selectedNote} onSave={handleSaveEdit} onCancel={() => setMode("view")} />
        )}

        {!loading && mode === "view" && <NoteViewer note={selectedNote} onEdit={handleEdit} onDelete={handleDelete} />}
      </main>
    </div>
  );
}

export default App;
