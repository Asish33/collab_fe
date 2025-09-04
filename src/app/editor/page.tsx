"use client";
import RichTextEditor from "@/components/editor";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import type { JSONContent } from "@tiptap/core";

function EditorClient() {
  const [post, setPost] = useState<JSONContent | string>("");
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const noteId = useMemo(() => searchParams.get("noteId"), [searchParams]);

  useEffect(() => {
    const fetchNote = async () => {
      if (!noteId) return;
      if (!session?.idToken) return;
      setError(null);
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
        if (!res.ok) {
          throw new Error(`Failed to load note (${res.status})`);
        }
        const data = await res.json();
        const content = (data?.note?.content ?? data?.content) as
          | JSONContent
          | string
          | undefined;
        if (content !== undefined) {
          setPost(content as JSONContent);
        }
      } catch (e) {
        setError((e as Error).message);
      }
    };
    fetchNote();
  }, [noteId, session?.idToken]);

  const onChange = (content: JSONContent) => {
    setPost(content);
    console.log(content);
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
            content: post,
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
            content: post,
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
    <div className="max-w-3xl mx-auto py-8">
      <RichTextEditor content={post} onChange={onChange} />
      <div className="mt-4 flex items-center gap-3">
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
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto py-8">Loading…</div>}>
      <EditorClient />
    </Suspense>
  );
}
