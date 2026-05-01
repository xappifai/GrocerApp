import type { Metadata } from "next";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";
import SignupForm from "./SignupForm";

export const metadata: Metadata = {
  title: `Create Account | ${APP_NAME}`,
  description: `Sign up for ${APP_NAME}. ${APP_DESCRIPTION}`,
};

export default function SignupPage() {
  return <SignupForm />;
}
