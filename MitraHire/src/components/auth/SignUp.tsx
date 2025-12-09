"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

const Register: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState<"applicant" | "recruiter">("applicant");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const collectionName = role === "applicant" ? "applicants" : "recruiters";
            await setDoc(doc(db, collectionName, user.uid), {
                name,
                email,
                role,
            });

            setError("Registration successful!");

            setTimeout(() => {
                router.push("/auth/login");
            }, 2000);
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError("Email already in use. Please log in.");
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-20 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            <div className="absolute w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl top-[-100px] left-[-100px]" />
            <div className="absolute w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl bottom-[-100px] right-[-100px]" />

            <Card className="w-full max-w-lg mx-4 relative z-10 shadow-2xl border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-3xl font-bold tracking-tight">Create an account</CardTitle>
                    <CardDescription>
                        Enter your information to get started with Mitra AI
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        {error && (
                            <div className={`p-3 rounded-md text-sm font-medium ${error === "Registration successful!" ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-destructive/15 text-destructive"}`}>
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
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
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select onValueChange={(val: "applicant" | "recruiter") => setRole(val)} defaultValue={role}>
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Select your role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="applicant">Applicant - Level Up Your Resume!</SelectItem>
                                    <SelectItem value="recruiter">Recruiter - Find top-tier talent!</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Creating account..." : "Create Account"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 text-center">
                    <div className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link
                            href="/auth/login"
                            className="text-primary hover:underline font-medium"
                        >
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Register;