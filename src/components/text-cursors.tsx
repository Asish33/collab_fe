"use client";

import React, { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { Editor } from "@tiptap/react";

interface TextCursorData {
  from: number;
  to: number;
  updatedBy: string;
  color: string;
  name: string;
  lastUpdate: number;
  position?: { top: number; left: number };
}

interface TextCursorsProps {
  socket: Socket | null;
  isCollab: boolean;
  roomId: string;
  editor: Editor | null;
}

const getColorForUser = (socketId: string): string => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E9",
  ];
  const hash = socketId.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
  return colors[Math.abs(hash) % colors.length];
};

const getNameForUser = (socketId: string): string => {
  return `User ${socketId.slice(-4)}`;
};

export function TextCursors({
  socket,
  isCollab,
  roomId,
  editor,
}: TextCursorsProps) {
  const [cursors, setCursors] = useState<Map<string, TextCursorData>>(
    new Map()
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    if (!socket || !isCollab || !editor) return;

    console.log("Setting up text cursors for room:", roomId);

    if (socket.id) {
      setCurrentUser(socket.id);
      console.log("Current user socket ID:", socket.id);
    }

    const handleTextCursorUpdate = (data: {
      from: number;
      to: number;
      updatedBy: string;
      x?: number;
      y?: number;
    }) => {
      console.log("Received text cursor update:", data);
      if (!socket.id || data.updatedBy === socket.id) return;

      try {
        if (typeof data.x === "number" && typeof data.y === "number") {
          setCursors((prev) => {
            const next = new Map(prev);
            next.set(data.updatedBy, {
              from: data.from,
              to: data.to,
              updatedBy: data.updatedBy,
              color: getColorForUser(data.updatedBy),
              name: getNameForUser(data.updatedBy),
              lastUpdate: Date.now(),
              position: { left: data.x!, top: data.y! },
            });
            return next;
          });
          return;
        }

        const size = editor.state.doc.content.size;
        const safeFrom = Math.max(
          1,
          Math.min(Number.isFinite(data.from) ? data.from : 1, size)
        );
        let coords: { top: number; left: number } | null = null;
        try {
          coords = (
            editor.view as {
              coordsAtPos: (
                pos: number,
                side: number
              ) => { top: number; left: number };
            }
          ).coordsAtPos(safeFrom, -1);
        } catch {}
        if (!coords) return;
        setCursors((prev) => {
          const next = new Map(prev);
          next.set(data.updatedBy, {
            from: data.from,
            to: data.to,
            updatedBy: data.updatedBy,
            color: getColorForUser(data.updatedBy),
            name: getNameForUser(data.updatedBy),
            lastUpdate: Date.now(),
            position: { top: coords.top, left: coords.left },
          });
          return next;
        });
      } catch (err) {
        console.warn("Failed to place remote cursor:", err);
      }
    };

    const handleUserDisconnect = (socketId: string) => {
      setCursors((prev) => {
        const newCursors = new Map(prev);
        newCursors.delete(socketId);
        return newCursors;
      });
    };

    socket.on("textCursorUpdate", handleTextCursorUpdate);
    socket.on("userDisconnected", handleUserDisconnect);

    return () => {
      socket.off("textCursorUpdate", handleTextCursorUpdate);
      socket.off("userDisconnected", handleUserDisconnect);
    };
  }, [socket, isCollab, roomId, editor]);

  useEffect(() => {
    if (!isCollab) return;

    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setCursors((prev) => {
        const newCursors = new Map();
        prev.forEach((cursor, socketId) => {
          if (now - cursor.lastUpdate < 3000) {
            newCursors.set(socketId, cursor);
          }
        });
        return newCursors;
      });
    }, 1000);

    return () => clearInterval(cleanupInterval);
  }, [isCollab]);

  if (!isCollab) return null;

  console.log("Rendering text cursors:", {
    cursorCount: cursors.size,
    cursors: Array.from(cursors.values()),
    isCollab,
  });

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {Array.from(cursors.values()).map((cursor) => {
        if (!cursor.position) return null;

        return (
          <div
            key={cursor.updatedBy}
            className="absolute pointer-events-none transition-all duration-100 ease-out"
            style={{
              left: cursor.position.left,
              top: cursor.position.top,
              transform: "translate(-1px, -2px)",
              zIndex: 1000,
            }}
          >
            <div
              className="w-0.5 h-5 relative"
              style={{
                backgroundColor: cursor.color,
                boxShadow: `0 0 0 1px white`,
              }}
            />
            <div
              className="absolute top-6 left-0 px-2 py-1 text-xs font-medium text-white rounded shadow-md"
              style={{
                backgroundColor: cursor.color,
                whiteSpace: "nowrap",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              {cursor.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}
