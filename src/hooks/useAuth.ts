'use client';

import { useAuthContext } from '../context/AuthContext';

export function useAuth() {
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    const token = localStorage.getItem("hisabdo_auth_token");

    if (!token) {
      setIsAuthenticated(false);
      router.replace("/login");
      return;
    }
    setIsAuthenticated(true);
  }, [router]);

  const logout = () => {
    localStorage.removeItem("hisabdo_auth_token");
    localStorage.removeItem("hisabdo_user");

    setIsAuthenticated(false);
    router.replace("/login");
  };

  return {
    isAuthenticated,
    logout,
  };
}
