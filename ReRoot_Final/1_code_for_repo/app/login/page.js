import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

// One login for everyone (students and vendors). New accounts pick a role on /onboarding.
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
