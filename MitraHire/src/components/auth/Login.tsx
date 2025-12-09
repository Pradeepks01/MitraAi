"use client";
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const Login: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const router = useRouter();


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Authenticate user
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Fetch user data and role
            try {
                const applicantDoc = await getDoc(doc(db, "applicants", user.uid));
                const recruiterDoc = await getDoc(doc(db, "recruiters", user.uid));

                if (applicantDoc.exists()) {
                    const userData = applicantDoc.data();
                    handleApplicantLogin(user, userData);
                } else if (recruiterDoc.exists()) {
                    const userData = recruiterDoc.data();
                    handleRecruiterLogin(user, userData);
                } else {
                    // Fallback if no doc found (maybe new user or data issue)
                    // Defaulting to applicant for safety/demo
                    console.warn("No user role found, defaulting to applicant.");
                    handleApplicantLogin(user, { name: email.split('@')[0], email });
                }
            } catch (firestoreError: any) {
                console.error("Firestore Error:", firestoreError);
                if (firestoreError.message.includes("offline")) {
                    // DEMO MODE / OFFLINE FALLBACK
                    // If we can't check the role, assume applicant for now so they can use the app.
                    alert("Network Issue: Logging in with limited access (Offline Mode).");
                    handleApplicantLogin(user, { name: email.split('@')[0], email });
                } else {
                    throw firestoreError;
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApplicantLogin = (user: any, userData: any) => {
        const role = "applicant";
        localStorage.setItem(
            "user",
            JSON.stringify({ ...userData, role, uid: user.uid })
        );
        router.push("/home"); // Redirect to Home/Applicant Dashboard
    };

    const handleRecruiterLogin = (user: any, userData: any) => {
        const role = "recruiter";
        localStorage.setItem(
            "user",
            JSON.stringify({ ...userData, role, uid: user.uid })
        );
        router.push("/recruit/dashboard");
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-20 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            <div className="absolute w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl top-[-100px] left-[-100px]" />
            <div className="absolute w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl bottom-[-100px] right-[-100px]" />

            <Card className="w-full max-w-md mx-4 relative z-10 shadow-2xl border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-3xl font-bold tracking-tight">Welcome back</CardTitle>
                    <CardDescription>
                        Enter your credentials to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-md bg-destructive/15 text-destructive text-sm font-medium">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link
                                    href="/auth/forgot-password"
                                    className="text-sm font-medium text-primary hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 text-center">
                    <div className="text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/auth/signup"
                            className="text-primary hover:underline font-medium"
                        >
                            Sign up
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Login;
