import { useAuthStore } from "@/store/authStore";
import { LoginCredentials, SignupCredentials } from "@/types";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import toast from "react-hot-toast";

export function useAuth() {
  const { user, isAuthenticated, isInitialized, login, signup, logout } =
    useAuthStore();
  const router = useRouter();

  const handleLogin = async (credentials: LoginCredentials, redirect?: string) => {
    try {
      await login(credentials);
      const loggedIn = useAuthStore.getState().user;
      toast.success(`Welcome back, ${loggedIn?.name ?? ""}!`);
      if (loggedIn?.role === "ADMIN") {
        router.push(ROUTES.ADMIN);
      } else {
        router.push(redirect ?? ROUTES.HOME);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      toast.error(msg);
      throw err;
    }
  };

  const handleSignup = async (credentials: SignupCredentials) => {
    try {
      await signup(credentials);
      toast.success("Account created! Welcome to GrocerApp.");
      router.push(ROUTES.HOME);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Signup failed";
      toast.error(msg);
      throw err;
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push(ROUTES.LOGIN);
  };

  const isAdmin = user?.role === "ADMIN";
  const isClient = user?.role === "CLIENT";

  return {
    user,
    isAuthenticated,
    isInitialized,
    isAdmin,
    isClient,
    handleLogin,
    handleSignup,
    handleLogout,
  };
}
