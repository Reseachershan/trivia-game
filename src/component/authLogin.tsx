import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

const Login = () => {
    const [user, setUser] = useState<any>(null);

    const signInWithProvider = async (provider: any) => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/callback`,
            },
        });

        if (error) console.error("Error logging in:", error.message);
        console.log("Login data:", data);
    };

    useEffect(() => {
        const fetchUser = async () => {
            const { data } = await supabase.auth.getSession();
            setUser(data.session?.user ?? null);
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
            <div className="p-6 bg-white rounded-lg shadow-lg">
                <h2 className="mb-4 text-xl font-semibold">Login</h2>

                {user ? (
                    <div className="mb-4">
                        <p>Logged in as: {user.email}</p>
                        <button
                            onClick={async () => {
                                await supabase.auth.signOut();
                                setUser(null);
                            }}
                            className="w-full p-3 mt-3 text-white bg-red-600 rounded-lg hover:bg-red-700"
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <>
                        <button
                            onClick={() => signInWithProvider("google")}
                            className="w-full p-3 mb-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
                        >
                            Sign in with Google
                        </button>
                        <button
                            onClick={() => signInWithProvider("apple")}
                            className="w-full p-3 text-white bg-black rounded-lg hover:bg-gray-800"
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
