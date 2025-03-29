// src/app/sign-up/page.tsx (updated)
import { SignUpForm } from "@/components/auth/sign-up-form";
import { AuthCheck } from "@/components/auth/auth-check";

export default function SignUpPage() {
  return (
    <AuthCheck requireAuth={false}>
      <div className="flex min-h-screen items-center justify-center p-6">
        <SignUpForm />
      </div>
    </AuthCheck>
  );
}