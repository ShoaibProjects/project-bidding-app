'use client';  // Indicates this is a Client Component in Next.js 13+ (app directory)

// Import the Login component from the auth folder
import Login from "@/app/components/auth/login";

/**
 * LoginPage component
 * Renders the Login form component.
 * This is the default export for the /login route.
 */
export default function LoginPage() {
  return (
    <Login />
  );
}
