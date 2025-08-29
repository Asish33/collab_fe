"use client";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Note = {
  id: string;
  title?: string | null;
  content?: unknown;
  updatedAt?: string | null;
  createdAt?: string | null;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");

  const extractPlainText = (content: unknown): string => {
    if (typeof content === "string") return content;
    if (!content || typeof content !== "object") return "";
    try {
      const root = content as { type?: string; content?: unknown[] };
      const gather = (node: any): string => {
        if (!node) return "";
        if (typeof node === "string") return node;
        if (Array.isArray(node)) return node.map(gather).join(" ");
        if (node.type === "text" && typeof node.text === "string")
          return node.text;
        if (node.content) return gather(node.content);
        return "";
      };
      return gather(root).trim();
    } catch {
      return "";
    }
  };

  useEffect(() => {
    const fetchNotes = async () => {
      if (!session?.idToken) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("http://localhost:5000/note/getall", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.idToken}`,
          },
        });
        if (!res.ok) {
          throw new Error(`Failed to load notes (${res.status})`);
        }
        const data = (await res.json()) as { notes?: Note[] } | Note[];
        const extracted = Array.isArray(data) ? data : data.notes ?? [];
        setNotes(extracted);
      } catch (err) {
        setError((err as Error).message);
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [session?.idToken]);

  const displayedNotes = useMemo(() => {
    const list = [...(notes ?? [])];
    // Sort by updatedAt desc then createdAt desc
    list.sort((a, b) => {
      const aTime = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
      const bTime = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
      return bTime - aTime;
    });
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter((n) => {
      const title = (n.title ?? "Untitled").toLowerCase();
      return title.includes(q);
    });
  }, [notes, query]);

  if (status === "loading") {
    return <div className="max-w-4xl mx-auto p-6">Loading session…</div>;
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Your Notes</h1>
          <Link href="/api/auth/signin">
            <Button>Sign in</Button>
          </Link>
        </div>
        <p>Please sign in to view your notes.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold truncate">Your Notes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {notes ? `${displayedNotes.length} of ${notes.length} notes` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes…"
            className="h-9 w-48 sm:w-64 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-slate-200 bg-white"
          />
          <Link href="/editor">
            <Button>Create</Button>
          </Link>
        </div>
      </div>

      {error && <p className="text-red-600 mb-3">{error}</p>}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded border p-4 bg-white animate-pulse">
              <div className="h-4 w-1/3 bg-slate-200 rounded mb-3" />
              <div className="h-3 w-full bg-slate-200 rounded mb-2" />
              <div className="h-3 w-5/6 bg-slate-200 rounded mb-2" />
              <div className="h-3 w-2/3 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(displayedNotes ?? []).length === 0 ? (
            <p className="col-span-full text-muted-foreground">
              No notes found.
            </p>
          ) : (
            displayedNotes.map((note) => (
              <Link
                key={note.id}
                href={`/editor?noteId=${note.id}`}
                className="group rounded border p-4 hover:shadow-sm transition block bg-white"
              >
                <h2 className="font-semibold mb-2 truncate">
                  {note.title ?? "Untitled"}
                </h2>
                {note.content !== undefined && note.content !== null && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {extractPlainText(note.content)}
                  </p>
                )}
                {(note.updatedAt || note.createdAt) && (
                  <div className="mt-3 text-xs text-muted-foreground flex items-center justify-between">
                    <span>
                      {note.updatedAt ? "Updated" : "Created"}:{" "}
                      {note.updatedAt ?? note.createdAt}
                    </span>
                    <span className="opacity-0 group-hover:opacity-100 transition text-primary">
                      Open →
                    </span>
                  </div>
                )}
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
