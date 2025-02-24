import { useEffect, useState } from "react";
import { createClient, User } from "@supabase/supabase-js";

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

const Login = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const signInWithProvider = async (provider: "google" | "apple") => {
        setIsLoading(true);
        setError(null);

        try {
            const { data, error: authError } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/callback`,
                },
            });

            if (authError) {
                throw new Error(authError.message);
            }

            console.log("Login data:", data);
        } catch (err) {
            console.error("Error logging in:", err);
            setError("Failed to log in. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { error: logoutError } = await supabase.auth.signOut();
            if (logoutError) {
                throw new Error(logoutError.message);
            }
            setUser(null);
        } catch (err) {
            console.error("Error logging out:", err);
            setError("Failed to log out. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const { data } = await supabase.auth.getSession();
                setUser(data.session?.user ?? null);
            } catch (err) {
                console.error("Error fetching user session:", err);
                setError("Failed to fetch user session.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                console.log("Auth state changed:", event, session);
                setUser(session?.user ?? null);
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="p-6 bg-white rounded-lg shadow-lg w-96">
                <h2 className="mb-4 text-xl font-semibold text-center">Login</h2>

                {error && (
                    <div className="mb-4 p-3 text-sm text-red-600 bg-red-100 rounded-lg">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center items-center p-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : user ? (
                    <div className="mb-4">
                        <p className="text-center">Logged in as: {user.email}</p>
                        <button
                            onClick={handleLogout}
                            disabled={isLoading}
                            className="w-full p-3 mt-3 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-red-300"
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <>
                        <button
                            onClick={() => signInWithProvider("google")}
                            disabled={isLoading}
                            className="w-full p-3 mb-2 text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:bg-red-300"
                        >
                            Sign in with Google
                        </button>
                        <button
                            onClick={() => signInWithProvider("apple")}
                            disabled={isLoading}
                            className="w-full p-3 text-white bg-black rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
                        >
                            Sign in with Apple
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Login;