"use client";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import type { JSONContent } from "@tiptap/core";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { io, type Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function Page() {
  return (
    <Suspense fallback={<div className="py-8">Loading…</div>}>
      <EditorClient />
    </Suspense>
  );
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

  // Default to light mode when opening the editor route
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  useEffect(() => {
    const fetchNote = async () => {
      if (!noteId) return;
      if (!session?.idToken) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/note/${noteId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${session.idToken}`,
            },
          }
        );
        if (!res.ok) return;
        const data = await res.json();
        const content = (data?.note?.content ?? data?.content) as
          | JSONContent
          | string
          | undefined;
        if (content !== undefined) {
          setValue(content);
        }
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

    socket.on("noteUpdated", ({ content }: { content: JSONContent }) => {
      applyingRemoteRef.current = true;
      setValue(content);
      queueMicrotask(() => {
        applyingRemoteRef.current = false;
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isCollab, noteId]);

  const onChange = (content: JSONContent) => {
    setValue(content);
    if (isCollab && noteId && !applyingRemoteRef.current) {
      socketRef.current?.emit(
        "noteChange",
        JSON.stringify({ roomId: String(noteId), content })
      );
    }
  };

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
          body: JSON.stringify({
            title: randomTitle,
            content: value,
          }),
        }
      );
      if (!res.ok) {
        throw new Error(`Failed to create note (${res.status})`);
      }
      router.push("/dashboard");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const onUpdate = async () => {
    if (!noteId) return;
    if (!session?.idToken) {
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
          body: JSON.stringify({
            title: randomTitle,
            content: value,
          }),
        }
      );
      if (!res.ok) {
        throw new Error(`Failed to update note (${res.status})`);
      }
      router.push("/dashboard");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUpdating(false);
    }
  };

  const onDelete = async () => {
    if (!noteId) return;
    if (!session?.idToken) {
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
          headers: {
            Authorization: `Bearer ${session.idToken}`,
          },
        }
      );
      if (!res.ok) {
        throw new Error(`Failed to delete note (${res.status})`);
      }
      router.push("/dashboard");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDeleting(false);
    }
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

      <SimpleEditor value={value} onChange={onChange} />
    </div>
  );
}
