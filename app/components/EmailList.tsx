"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Email {
  id: string;
  snippet: string;
  sender: string;
  subject: string;
  time: string;
}

export default function EmailList() {
  const { data: session, status } = useSession();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchEmails() {
    if (status !== "authenticated") return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/emails");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch emails");
      }

      const data = await response.json();
      setEmails(data.emails);
    } catch (err: any) {
      console.error("Error fetching emails:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      fetchEmails();
    }
  }, [status]);

  if (status !== "authenticated") {
    return <p>Please sign in to view your emails</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Your Emails</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      <button
        onClick={fetchEmails}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mb-4"
      >
        {loading ? "Loading..." : "Refresh Emails"}
      </button>

      {loading ? (
        <p>Loading emails...</p>
      ) : emails.length > 0 ? (
        <ul className="space-y-4">
          {emails.map((email) => (
            <li key={email.id} className="border p-4 rounded shadow">
              <p className="font-bold">Subject: {email.subject}</p>
              <p className="text-sm text-gray-600">From: {email.sender}</p>
              <p className="text-sm text-gray-600">Time: {email.time}</p>
              <p className="mt-2">{email.snippet}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No emails found</p>
      )}
    </div>
  );
}