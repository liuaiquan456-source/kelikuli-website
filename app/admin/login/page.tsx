import { Suspense } from "react";
import LoginForm from "./_form";

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
