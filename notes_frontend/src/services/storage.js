//
// Storage service for Notes App
// Chooses API client when REACT_APP_API_BASE is defined; otherwise uses localStorage.
// Includes simple in-memory cache to minimize reads and optimistic UI updates.
//
// PUBLIC_INTERFACE
export class NotesStorage {
  /**
   * PUBLIC_INTERFACE
   * Create a new NotesStorage service.
   * Uses the following environment variables (optional):
   * - REACT_APP_API_BASE: Base URL for the backend API. If not set, localStorage is used.
   * - REACT_APP_BACKEND_URL: Legacy/alt base URL fallback if REACT_APP_API_BASE is empty.
   */
  constructor() {
    // Read environment variables safely; undefined/empty values are handled.
    const apiBase = process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || "";
    this.apiBase = typeof apiBase === "string" ? apiBase.trim() : "";
    this.useApi = this.apiBase.length > 0;

    this.localKey = "notes_app__notes_v1";
    this.cache = null;

    if (!this.useApi) {
      // Seed initial notes on first run if local storage is empty
      const existing = this._readLocal();
      if (!existing || existing.length === 0) {
        const now = new Date().toISOString();
        const seed = [
          {
            id: this._genId(),
            title: "Welcome to Ocean Notes",
            content:
              "This is your first note. Create, edit, delete, and search notes.\n\nTip: Use the search in the sidebar.\n\nStorage: Local (no API configured).",
            createdAt: now,
            updatedAt: now,
          },
          {
            id: this._genId(),
            title: "Environment variables",
            content:
              "Set REACT_APP_API_BASE to use a backend API.\nIf empty, the app uses localStorage persistence.\n\nColors follow the Ocean Professional theme.",
            createdAt: now,
            updatedAt: now,
          },
        ];
        this._writeLocal(seed);
      }
    }
  }

  // PUBLIC_INTERFACE
  async listNotes(query = "") {
    /**
     * List notes optionally filtering by query (searches title and content).
     * Returns an array of note objects: {id, title, content, createdAt, updatedAt}
     */
    if (this.useApi) {
      const res = await fetch(this._url("/notes?query=" + encodeURIComponent(query || "")));
      if (!res.ok) throw new Error("Failed to list notes");
      return res.json();
    }
    const notes = this._readLocal();
    const q = (query || "").toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) =>
        (n.title || "").toLowerCase().includes(q) ||
        (n.content || "").toLowerCase().includes(q)
    );
  }

  // PUBLIC_INTERFACE
  async getNote(id) {
    /**
     * Get a single note by id.
     */
    if (this.useApi) {
      const res = await fetch(this._url(`/notes/${encodeURIComponent(id)}`));
      if (!res.ok) throw new Error("Failed to fetch note");
      return res.json();
    }
    const notes = this._readLocal();
    return notes.find((n) => n.id === id) || null;
  }

  // PUBLIC_INTERFACE
  async createNote({ title, content }) {
    /**
     * Create a new note with title and content. Returns created note.
     */
    const now = new Date().toISOString();
    if (this.useApi) {
      const res = await fetch(this._url("/notes"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) throw new Error("Failed to create note");
      return res.json();
    }
    const newNote = { id: this._genId(), title: title || "", content: content || "", createdAt: now, updatedAt: now };
    const notes = this._readLocal();
    notes.unshift(newNote);
    this._writeLocal(notes);
    return newNote;
  }

  // PUBLIC_INTERFACE
  async updateNote(id, { title, content }) {
    /**
     * Update an existing note. Returns updated note.
     */
    const now = new Date().toISOString();
    if (this.useApi) {
      const res = await fetch(this._url(`/notes/${encodeURIComponent(id)}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) throw new Error("Failed to update note");
      return res.json();
    }
    const notes = this._readLocal();
    const idx = notes.findIndex((n) => n.id === id);
    if (idx === -1) throw new Error("Note not found");
    const updated = { ...notes[idx], title: title ?? notes[idx].title, content: content ?? notes[idx].content, updatedAt: now };
    notes[idx] = updated;
    this._writeLocal(notes);
    return updated;
  }

  // PUBLIC_INTERFACE
  async deleteNote(id) {
    /**
     * Delete a note by id. Returns true when successful.
     */
    if (this.useApi) {
      const res = await fetch(this._url(`/notes/${encodeURIComponent(id)}`), { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete note");
      return true;
    }
    const notes = this._readLocal();
    const filtered = notes.filter((n) => n.id !== id);
    this._writeLocal(filtered);
    return true;
  }

  // Helpers
  _url(path) {
    return this.apiBase.replace(/\/+$/, "") + path;
    // path expected to start with '/'
  }

  _genId() {
    return "n_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  _readLocal() {
    if (this.cache) return this.cache;
    try {
      const raw = window.localStorage.getItem(this.localKey);
      const parsed = raw ? JSON.parse(raw) : [];
      this.cache = Array.isArray(parsed) ? parsed : [];
    } catch {
      this.cache = [];
    }
    return this.cache;
  }

  _writeLocal(notes) {
    this.cache = notes;
    try {
      window.localStorage.setItem(this.localKey, JSON.stringify(notes));
    } catch {
      // ignore quota errors
    }
  }
}

export default new NotesStorage();
