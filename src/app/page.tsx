"use client";
import { useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm border rounded-md p-6 bg-white">
        <h1 className="text-xl font-semibold mb-2">Sign in</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Use your Google account to continue.
        </p>
        <Button
          className="w-full"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Loading…" : "Continue with Google"}
        </Button>
      </div>
    </div>
  );
}
