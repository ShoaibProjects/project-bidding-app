'use client';  // Mark this as a client-side component (Next.js 13+ app directory)

import Signup from "@/app/components/auth/signup";

/**
 * SignupPage component
 * Renders the Signup form component.
 * This is the default export for the /signup route.
 */
export default function SignupPage() {
  return (
    <Signup />
  );
}
