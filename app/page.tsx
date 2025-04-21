'use client'

import LoginButton from "./components/LoginButton";
import EmailList from "./components/EmailList";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Gmail Summary App</h1>
        
        <div className="mb-8">
          <LoginButton />
        </div>

        <div className="mt-4">
          <Link href="/summary" className="text-blue-500 hover:underline">
            View Today's Email Summary
          </Link>
        </div>
        
        <div>
          <EmailList />
        </div>
      </div>
    </main>
  );
}