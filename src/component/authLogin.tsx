import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const Login = () => {
    const [user, setUser] = useState<any>(null);

    const signInWithProvider = async (provider: any) => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider
        });

        if (error) console.error("Error logging in:", error.message);
        console.log("Login data:", data);
    };

    useEffect(() => {
        const fetchUser = async () => {
            const { data } = await supabase.auth.getSession();
            const currentUser = data.session?.user ?? null;
            setUser(currentUser);
            console.log("currentUser", currentUser);
            
            if (currentUser) {
                await saveUserToDB(currentUser);
            }
        };

        fetchUser();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log("Auth state changed:", event, session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    await saveUserToDB(session.user);
                }
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const saveUserToDB = async (user: any) => {
        console.log("user", user);
        const { data, error } = await supabase
            .from("users")
            .upsert([
                {
                    id: user.id,
                    email: user.email,
                    name: user.user_metadata?.full_name || "",
                    created_at: new Date()
                }
            ]);

        if (error) console.error("Error saving user:", error.message);
        else console.log("User saved:", data);
    };

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
