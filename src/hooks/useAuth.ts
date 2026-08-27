'use client';

import { useAuthContext } from '../context/AuthContext';

export function useAuth() {
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    // Authentication is handled by the server-side middleware.
    // The auth token is stored in an HttpOnly cookie,
    // so it cannot be accessed from localStorage.
    setIsAuthenticated(true);
  }, []);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }

    setIsAuthenticated(false);
    router.replace("/login");
  };

  return {
    isAuthenticated,
    logout,
  };
}
