import type { Metadata } from "next";
import { ClinicLoginForm } from "@/components/auth/clinic-login-form";

export const metadata: Metadata = { title: "دخول العيادة" };

export default function LoginPage() {
  return <ClinicLoginForm />;
}
