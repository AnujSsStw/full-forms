"use client";

import { SignInButton, UserButton } from "@clerk/clerk-react";
import { Authenticated, Unauthenticated } from "convex/react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Unauthenticated>
        <div className="text-center space-y-6 p-8 rounded-lg bg-white shadow-xl">
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-600">Please sign in to continue</p>
          <SignInButton mode="modal">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Sign In
            </button>
          </SignInButton>
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="text-center space-y-4">
          <UserButton />
          <Content />
        </div>
      </Authenticated>
    </main>
  );
}

function Content() {
  return (
    <div className="text-xl text-gray-800">Welcome to your dashboard!</div>
  );
}
