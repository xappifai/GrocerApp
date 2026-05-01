import type { Metadata } from "next";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: `Sign In | ${APP_NAME}`,
  description: `Sign in to your ${APP_NAME} account. ${APP_DESCRIPTION}`,
};

export default function LoginPage() {
  return <LoginForm />;
}
