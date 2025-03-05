"use client";

import { ReactNode } from "react";
import {
  Authenticated,
  ConvexReactClient,
  Unauthenticated,
} from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, SignInButton, useAuth } from "@clerk/clerk-react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!} //TODO: Add this to .env.local
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {/* <Authenticated>{children}</Authenticated>
        <Unauthenticated>
          <Login />
        </Unauthenticated> */}
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

function Login() {
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
    </main>
  );
}
