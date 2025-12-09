"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const AddProject: React.FC = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [authLoading, setAuthLoading] = useState<boolean>(true); // Authentication loading
    const router = useRouter();

    useEffect(() => {
        const verifyUser = async () => {
            const user = JSON.parse(localStorage.getItem("user") || "{}");

            // Check if the user has the correct role and UID
            if (!user.uid || user.role !== "recruiter") {
                router.push("/auth/login");
                return;
            }

            setAuthLoading(false); // End authentication loading
        };

        verifyUser();
    }, [router]);

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        if (!user?.uid) {
            alert("User not authenticated. Please log in.");
            return;
        }

        const newProject = {
            title,
            description,
            recruiterId: user.uid,
            createdAt: new Date(),
        };

        try {
            const docRef = await addDoc(collection(db, "projects"), newProject);
            router.push(`/recruit/projects?recruiterId=${user.uid}&projectId=${docRef.id}`);
        } catch (error) {
            console.error("Error creating project:", error);
            alert("Failed to create project. Please try again.");
        }
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground">Authenticating, please wait...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-sans flex items-center justify-center py-12 pt-[100px]">
            <Card className="w-full max-w-2xl shadow-xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold">Create New Job Project</CardTitle>
                    <CardDescription>Enter the details for the new recruitment project.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreateProject} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="projectTitle">Job Title</Label>
                            <Input
                                type="text"
                                id="projectTitle"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Senior Software Engineer"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="jobDescription">Job Description</Label>
                            <Textarea
                                id="jobDescription"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={6}
                                placeholder="Provide a detailed description of the job requirements, responsibilities, and expectations"
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full text-lg font-semibold h-12">
                            Create Project & Upload Resumes
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AddProject;
