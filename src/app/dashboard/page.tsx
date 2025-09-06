"use client";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  PenTool,
  Search,
  Plus,
  Users,
  Calendar,
  FileText,
  ArrowRight,
} from "lucide-react";

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
  const router = useRouter();

  const handleCollaborate = async (noteId: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!session?.idToken) {
      setError("Please sign in to collaborate.");
      return;
    }
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error("Backend URL not configured");
      }

      const res = await fetch(`${backendUrl}/collab/join/${noteId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.idToken}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Collab join error:", res.status, errorText);
        throw new Error(`Failed to join collab (${res.status}): ${errorText}`);
      }

      const data = await res.json();
      const roomId = data?.room ?? noteId;
      router.push(`/editor?noteId=${encodeURIComponent(roomId)}&collab=1`);
    } catch (err) {
      console.error("Collaborate error:", err);
      setError((err as Error).message);
    }
  };

  const extractPlainText = (content: unknown): string => {
    if (typeof content === "string") return content;
    if (!content || typeof content !== "object") return "";
    try {
      type JSONNode = { type?: string; text?: string; content?: unknown[] };
      const root = content as { type?: string; content?: unknown[] };
      const gather = (node: unknown): string => {
        if (!node) return "";
        if (typeof node === "string") return node;
        if (Array.isArray(node)) return node.map(gather).join(" ");
        const n = node as JSONNode;
        if (n.type === "text" && typeof n.text === "string") return n.text;
        if (n.content) return gather(n.content);
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
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/note/getall`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.idToken}`,
            },
          }
        );
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Loading session…</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
            <PenTool className="h-16 w-16 text-blue-400 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-white mb-4">
              Welcome to NoteCollab
            </h1>
            <p className="text-slate-300 mb-6">
              Please sign in to view your notes.
            </p>
            <Link href="/api/auth/signin">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <PenTool className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold text-white">NoteCollab</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-slate-300 text-sm">
                Welcome back, {session.user?.name || "User"}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="min-w-0">
              <h1 className="text-3xl font-bold text-white mb-2">Your Notes</h1>
              <p className="text-slate-300">
                {notes
                  ? `${displayedNotes.length} of ${notes.length} notes`
                  : "Manage your notes and collaborate with others"}
              </p>
            </div>
            <Link href="/editor">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Plus className="mr-2 h-5 w-5" />
                Create Note
              </Button>
            </Link>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notes…"
              className="w-full h-12 pl-10 pr-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 animate-pulse"
              >
                <div className="h-5 w-2/3 bg-slate-700 rounded mb-4" />
                <div className="h-4 w-full bg-slate-700 rounded mb-3" />
                <div className="h-4 w-5/6 bg-slate-700 rounded mb-3" />
                <div className="h-4 w-1/2 bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(displayedNotes ?? []).length === 0 ? (
              <div className="col-span-full text-center py-16">
                <FileText className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-300 mb-2">
                  No notes found
                </h3>
                <p className="text-slate-500 mb-6">
                  {query
                    ? "Try adjusting your search terms"
                    : "Get started by creating your first note"}
                </p>
                {!query && (
                  <Link href="/editor">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl">
                      <Plus className="mr-2 h-5 w-5" />
                      Create Your First Note
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              displayedNotes.map((note) => (
                <Link
                  key={note.id}
                  href={`/editor?noteId=${note.id}`}
                  className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:bg-slate-800/70 hover:border-slate-600 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <h2 className="font-semibold text-white text-lg truncate group-hover:text-blue-400 transition-colors">
                      {note.title ?? "Untitled"}
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleCollaborate(note.id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white"
                    >
                      <Users className="mr-1 h-3 w-3" />
                      Collaborate
                    </Button>
                  </div>

                  {note.content !== undefined && note.content !== null && (
                    <p className="text-slate-300 text-sm line-clamp-3 mb-4">
                      {extractPlainText(note.content)}
                    </p>
                  )}

                  {(note.updatedAt || note.createdAt) && (
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {note.updatedAt ? "Updated" : "Created"}:{" "}
                          {new Date(
                            note.updatedAt ?? note.createdAt ?? ""
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-blue-400 flex items-center gap-1">
                        Open
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  )}
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
