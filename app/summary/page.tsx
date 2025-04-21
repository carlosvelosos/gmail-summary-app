'use client'

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface EmailSummary {
  sender: string;
  count: number;
}

type DateRange = "today" | "yesterday";

export default function TodaysSummary() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [summary, setSummary] = useState<EmailSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalEmails, setTotalEmails] = useState<number>(0);
  const [dateRange, setDateRange] = useState<DateRange>("today");

  async function fetchEmailSummary(range: DateRange) {
    if (status !== "authenticated") return;

    setLoading(true);
    setError(null);
    setDateRange(range);

    try {
      const response = await fetch("/api/emails");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch emails");
      }

      const data = await response.json();
      const emails = data.emails || [];

      // Get date ranges
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      // Filter emails by date range
      const filteredEmails = emails.filter((email: any) => {
        const emailDate = new Date(email.time);
        
        if (range === "today") {
          return emailDate >= today && emailDate < tomorrow;
        } else if (range === "yesterday") {
          return emailDate >= yesterday && emailDate < today;
        }
        
        return false;
      });

      // Count emails by sender
      const senderCounts: Record<string, number> = {};
      filteredEmails.forEach((email: any) => {
        // Extract the sender name from the email address
        const senderName = email.sender.split('<')[0].trim() || email.sender;
        senderCounts[senderName] = (senderCounts[senderName] || 0) + 1;
      });

      // Convert to array and sort by count (descending)
      const summaryArray = Object.entries(senderCounts).map(([sender, count]) => ({
        sender,
        count
      }));

      summaryArray.sort((a, b) => b.count - a.count);
      
      setSummary(summaryArray);
      setTotalEmails(filteredEmails.length);
    } catch (err: any) {
      console.error("Error fetching email summary:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      fetchEmailSummary(dateRange);
    } else if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return <p>Loading authentication...</p>;
  }

  if (status !== "authenticated") {
    return <p>Please sign in to view your email summary</p>;
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Email Summary</h1>
        
        <div className="mb-8">
          <button 
            onClick={() => router.push("/")}
            className="text-blue-500 hover:underline"
          >
            &larr; Back to Home
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error: {error}
          </div>
        )}
        
        <div className="flex items-center gap-4 mb-4">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => fetchEmailSummary("today")}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
                dateRange === "today"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              Today's Emails
            </button>
            <button
              type="button"
              onClick={() => fetchEmailSummary("yesterday")}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
                dateRange === "yesterday"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              Yesterday's Emails
            </button>
          </div>

          <button
            onClick={() => fetchEmailSummary(dateRange)}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <p>Loading summary...</p>
        ) : summary.length > 0 ? (
          <>
            <div className="bg-blue-100 p-4 rounded mb-6">
              <p className="font-bold">
                You received {totalEmails} email{totalEmails !== 1 ? 's' : ''} {dateRange === "today" ? "today" : "yesterday"} from {summary.length} sender{summary.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="bg-white shadow rounded">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 text-left">Sender</th>
                    <th className="py-3 px-4 text-right">Number of Emails</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-3 px-4">{item.sender}</td>
                      <td className="py-3 px-4 text-right">{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p>No emails received {dateRange === "today" ? "today" : "yesterday"}</p>
        )}
      </div>
    </main>
  );
}