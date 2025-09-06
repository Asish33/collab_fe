"use client";
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import type { JSONContent } from "@tiptap/core";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { io, type Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Editor } from "@tiptap/react";

export default function Page() {
  return (
    <Suspense fallback={<div className="py-8">Loading…</div>}>
      <EditorClient />
    </Suspense>
  );
}

interface RemoteCursor {
  socketId: string;
  position: number;
  lastUpdate: number;
}

function EditorClient() {
  const [value, setValue] = useState<JSONContent | string>("");
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const noteId = useMemo(() => searchParams.get("noteId"), [searchParams]);
  const isCollab = useMemo(
    () => searchParams.get("collab") === "1",
    [searchParams]
  );
  const socketRef = useRef<Socket | null>(null);
  const applyingRemoteRef = useRef(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const cursorUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [remoteCursors, setRemoteCursors] = useState<RemoteCursor[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setRemoteCursors((prev) =>
        prev.filter((cursor) => now - cursor.lastUpdate < 30000)
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchNote = async () => {
      if (!noteId || !session?.idToken) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/note/${noteId}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${session.idToken}` },
          }
        );
        if (!res.ok) return;
        const data = await res.json();
        const content = (data?.note?.content ?? data?.content) as
          | JSONContent
          | string
          | undefined;
        if (content !== undefined) setValue(content);
      } catch {}
    };
    fetchNote();
  }, [noteId, session?.idToken]);

  useEffect(() => {
    if (!isCollab || !noteId) return;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) return;

    const socket = io(backendUrl, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("joinRoom", String(noteId));
    });

    socket.on("disconnect", () => {
      setRemoteCursors([]);
    });

    socket.on(
      "noteUpdated",
      ({
        content,
        cursorPosition,
        updatedBy,
      }: {
        content: JSONContent;
        cursorPosition?: number;
        updatedBy?: string;
      }) => {
        applyingRemoteRef.current = true;
        setValue(content);

        if (typeof cursorPosition === "number" && updatedBy) {
          const now = Date.now();
          setRemoteCursors((prev) => {
            const filtered = prev.filter((c) => c.socketId !== updatedBy);
            return [
              ...filtered,
              {
                socketId: updatedBy,
                position: cursorPosition,
                lastUpdate: now,
              },
            ];
          });
        }

        queueMicrotask(() => {
          applyingRemoteRef.current = false;
        });
      }
    );

    socket.on(
      "textCursorUpdate",
      ({ position, updatedBy }: { position: number; updatedBy: string }) => {
        const now = Date.now();
        setRemoteCursors((prev) => {
          const idx = prev.findIndex((c) => c.socketId === updatedBy);
          if (idx !== -1) {
            const newArr = [...prev];
            newArr[idx] = { socketId: updatedBy, position, lastUpdate: now };
            return newArr;
          }
          return [...prev, { socketId: updatedBy, position, lastUpdate: now }];
        });
      }
    );

    socket.on("userDisconnected", ({ socketId }: { socketId: string }) => {
      setRemoteCursors((prev) => prev.filter((c) => c.socketId !== socketId));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setRemoteCursors([]);
    };
  }, [isCollab, noteId]);

  const onChange = (content: JSONContent) => {
    setValue(content);
    if (isCollab && noteId && !applyingRemoteRef.current && editor) {
      const cursorPosition = editor.state.selection.from;
      socketRef.current?.emit(
        "noteChange",
        JSON.stringify({
          roomId: String(noteId),
          content,
          cursorPosition,
        })
      );
    }
  };

  const debouncedCursorUpdate = useCallback(
    (position: number) => {
      if (cursorUpdateTimeoutRef.current) {
        clearTimeout(cursorUpdateTimeoutRef.current);
      }

      cursorUpdateTimeoutRef.current = setTimeout(() => {
        if (socketRef.current && noteId) {
          socketRef.current.emit(
            "textCursorMove",
            JSON.stringify({ roomId: String(noteId), position })
          );
        }
      }, 100);
    },
    [noteId]
  );

  useEffect(() => {
    if (!editor || !isCollab || !noteId) return;

    let lastContentString = JSON.stringify(editor.getJSON());

    const handler = ({ editor }: { editor: Editor }) => {
      const currentContentString = JSON.stringify(editor.getJSON());

      if (currentContentString === lastContentString) {
        const pos = editor.state.selection.from;
        debouncedCursorUpdate(pos);
      }
      lastContentString = currentContentString;
    };

    editor.on("selectionUpdate", handler);
    return () => {
      editor.off("selectionUpdate", handler);
      if (cursorUpdateTimeoutRef.current) {
        clearTimeout(cursorUpdateTimeoutRef.current);
      }
    };
  }, [editor, isCollab, noteId, debouncedCursorUpdate]);

  useEffect(() => {
    return () => {
      if (cursorUpdateTimeoutRef.current) {
        clearTimeout(cursorUpdateTimeoutRef.current);
      }
    };
  }, []);

  const onCreate = async () => {
    if (!session?.idToken) {
      setError("Please sign in to create notes.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const randomTitle = `Untitled Note ${new Date().toLocaleString()}`;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/note/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.idToken}`,
          },
          body: JSON.stringify({ title: randomTitle, content: value }),
        }
      );
      if (!res.ok) throw new Error(`Failed to create note (${res.status})`);
      router.push("/dashboard");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const onUpdate = async () => {
    if (!noteId || !session?.idToken) {
      setError("Please sign in to update notes.");
      return;
    }
    setUpdating(true);
    setError(null);
    try {
      const randomTitle = `Updated Note ${new Date().toLocaleString()}`;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/note/update/${noteId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.idToken}`,
          },
          body: JSON.stringify({ title: randomTitle, content: value }),
        }
      );
      if (!res.ok) throw new Error(`Failed to update note (${res.status})`);
      router.push("/dashboard");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUpdating(false);
    }
  };

  const onDelete = async () => {
    if (!noteId || !session?.idToken) {
      setError("Please sign in to delete notes.");
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/note/delete/${noteId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session.idToken}` },
        }
      );
      if (!res.ok) throw new Error(`Failed to delete note (${res.status})`);
      router.push("/dashboard");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  const renderRemoteCursors = () => {
    if (!editor || !editorRef.current) return null;

    return remoteCursors.map((cursor) => {
      if (typeof cursor.position !== "number" || isNaN(cursor.position)) {
        return null;
      }

      const docSize = editor.state.doc.content.size;
      const safePosition = Math.max(0, Math.min(cursor.position, docSize));

      try {
        const coords = editor.view?.coordsAtPos(safePosition);
        if (!coords) return null;

        const editorElement = editor.view.dom;
        const containerRect = editorRef.current?.getBoundingClientRect();

        if (!editorElement || !containerRect) return null;

        const scrollLeft =
          window.pageXOffset || document.documentElement.scrollLeft;
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;

        const relativeLeft = coords.left - containerRect.left;
        const relativeTop = coords.top - containerRect.top;

        const containerHeight = containerRect.height;
        const containerWidth = containerRect.width;

        if (
          relativeLeft < 0 ||
          relativeLeft > containerWidth ||
          relativeTop < 0 ||
          relativeTop > containerHeight
        ) {
          return null;
        }

        return (
          <div
            key={cursor.socketId}
            className="absolute pointer-events-none z-50"
            style={{
              left: Math.max(0, Math.min(relativeLeft, containerWidth - 2)),
              top: Math.max(0, Math.min(relativeTop, containerHeight - 20)),
              width: 2,
              height: 20,
              backgroundColor: "#ff4444",
              borderRadius: "1px",
              boxShadow: "0 0 2px rgba(255, 68, 68, 0.5)",
              transform: "translateX(-1px)",
              transition: "all 0.1s ease-out",
            }}
          >
            <div
              className="absolute -top-6 left-0 px-1 py-0.5 bg-red-500 text-white text-xs rounded whitespace-nowrap"
              style={{
                fontSize: "10px",
                minWidth: "20px",
                textAlign: "center",
              }}
            >
              User
            </div>
          </div>
        );
      } catch (error) {
        console.warn(`Error positioning cursor at ${safePosition}:`, error);
        return null;
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold truncate">
            {noteId ? "Edit Note" : "New Note"}
          </h1>
          {error && (
            <p className="text-sm text-red-600 mt-1 truncate" title={error}>
              {error}
            </p>
          )}
          {isCollab && (
            <p className="text-sm text-green-600 mt-1">
              Collaborative editing enabled • {remoteCursors.length} active user
              {remoteCursors.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!noteId && (
            <Button onClick={onCreate} disabled={submitting}>
              {submitting ? "Saving…" : "Create"}
            </Button>
          )}
          {noteId && (
            <>
              <Button onClick={onUpdate} disabled={updating}>
                {updating ? "Updating…" : "Update"}
              </Button>
              <Button
                variant="destructive"
                onClick={onDelete}
                disabled={deleting}
                className="gap-2"
              >
                {deleting ? "Deleting…" : "Delete"}
                <Trash2 className="size-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div
        ref={editorRef}
        className="relative overflow-hidden"
        style={{ position: "relative", minHeight: "400px" }}
      >
        <SimpleEditor
          value={value}
          onChange={onChange}
          onEditorReady={setEditor}
        />
        {renderRemoteCursors()}
      </div>
    </div>
  );
}
