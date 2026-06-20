import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/auth/admin-login-form";

export const metadata: Metadata = { title: "دخول المنصة · Admin" };

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}
