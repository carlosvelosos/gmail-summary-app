"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function LoginButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <button
        disabled
        className="bg-gray-300 text-gray-500 font-bold py-2 px-4 rounded cursor-not-allowed"
      >
        Loading...
      </button>
    );
  }

  if (status === "authenticated") {
    return (
      <button
        onClick={() => signOut()}
        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
      >
        Sign Out ({session?.user?.email || "Unknown User"})
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/" })}
      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center"
    >
      <span className="mr-2">Sign in with Google</span>
    </button>
  );
}