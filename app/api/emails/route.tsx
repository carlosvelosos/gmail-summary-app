import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { google, gmail_v1 } from "googleapis";

interface Email {
  id: string;
  snippet: string;
  sender: string;
  subject: string;
  time: string;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.accessToken });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Get list of emails from inbox
    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: 50, // Adjust as needed
    });

    const messages = response.data.messages || [];

    // Fetch details for each email
    const emails: Email[] = await Promise.all(
      messages.map(async (message) => {
        if (!message.id) {
          throw new Error("Message ID is null or undefined");
        }
        const emailResponse = await gmail.users.messages.get({
          userId: "me",
          id: message.id,
        });
        const email = emailResponse.data as gmail_v1.Schema$Message;

        // Extract sender, subject, and time
        const headers = email.payload?.headers || [];
        const sender =
          headers.find((header) => header.name === "From")?.value || "Unknown Sender";
        const subject =
          headers.find((header) => header.name === "Subject")?.value || "No Subject";
        const time = new Date(parseInt(email.internalDate || "0")).toLocaleString();

        return {
          id: email.id || "",
          snippet: email.snippet || "",
          sender,
          subject,
          time,
        };
      })
    );

    return new Response(JSON.stringify({ emails }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Gmail API error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}