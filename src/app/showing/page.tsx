"use client";
import { useSession } from "next-auth/react";
export default function showing() {
  const se = useSession();
  const token = se.data?.idToken;
  return <div>{token}</div>;
}
