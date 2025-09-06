"use client";

import { useEffect } from "react";
import { Socket } from "socket.io-client";
import { Editor } from "@tiptap/react";

interface UseTextCursorTrackingProps {
  socket: Socket | null;
  isCollab: boolean;
  roomId: string;
  editor: Editor | null;
}

export function useTextCursorTracking({
  socket,
  isCollab,
  roomId,
  editor,
}: UseTextCursorTrackingProps) {
  useEffect(() => {
    if (!socket || !isCollab || !editor) return;

    const handleSelectionChange = () => {
      const { state } = editor;
      const { from, to } = state.selection;

      let x: number | undefined;
      let y: number | undefined;
      try {
        const c = (
          editor.view as {
            coordsAtPos: (
              pos: number,
              side: number
            ) => { top: number; left: number } | null;
          }
        ).coordsAtPos(from, -1);
        if (c) {
          x = c.left;
          y = c.top;
        }
      } catch {}

      socket.volatile.emit(
        "textCursorMove",
        JSON.stringify({ roomId, from, to, x, y })
      );
    };

    editor.on("selectionUpdate", handleSelectionChange);

    return () => {
      editor.off("selectionUpdate", handleSelectionChange);
    };
  }, [socket, isCollab, roomId, editor]);
}
