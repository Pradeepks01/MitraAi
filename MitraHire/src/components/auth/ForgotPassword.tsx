"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Assuming you have Alert, if not will use simple div for now or text

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const router = useRouter();

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (!email) {
            setMessage({ type: "error", text: "Please enter your email address." });
            setLoading(false);
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            setMessage({
                type: "success",
                text: "Password reset link sent! Check your inbox.",
            });
            // Optional: Redirect after a few seconds
            // setTimeout(() => router.push("/auth/login"), 5000);
        } catch (error: any) {
            console.error("Reset password error:", error);
            let errorMsg = "Failed to send reset email. Please try again.";
            if (error.code === "auth/user-not-found") {
                errorMsg = "No account found with this email.";
            } else if (error.code === "auth/invalid-email") {
                errorMsg = "Invalid email address.";
            }
            setMessage({ type: "error", text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background pt-16 px-4">
            <Card className="w-full max-w-md shadow-2xl border-primary/20">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email address and we'll send you a link to reset your password.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-background/50"
                            />
                        </div>

                        {message && (
                            <div
                                className={`p-3 rounded-md text-sm font-medium ${message.type === "success"
                                    ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                    }`}
                            >
                                {message.text}
                            </div>
                        )}

                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                "Send Reset Link"
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Link
                        href="/auth/login"
                        className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
};

export default ForgotPassword;
