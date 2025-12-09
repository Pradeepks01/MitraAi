"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    collection,
    getDocs,
    query,
    where,
    deleteDoc,
    doc,
    updateDoc,
} from "firebase/firestore";
import { db, storage } from "../firebase/firebaseConfig";
import { listAll, ref, deleteObject } from "firebase/storage";
import {
    LogOut,
    Plus,
    Edit2,
    Trash2,
    Eye,
    FolderOpen
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Project {
    id: string;
    title: string;
    description: string;
}

const RecruiterDashboard: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    useEffect(() => {
        const verifyUserAndFetchProjects = async () => {
            const user = JSON.parse(localStorage.getItem("user") || "{}");

            if (!user.uid || user.role !== "recruiter") {
                router.push("/auth/login");
                return;
            }

            try {
                const q = query(
                    collection(db, "projects"),
                    where("recruiterId", "==", user.uid)
                );
                const querySnapshot = await getDocs(q);
                const projectList: Project[] = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Project[];
                setProjects(projectList);
            } catch (error) {
                console.error("Error fetching projects:", error);
            } finally {
                setLoading(false);
            }
        };

        verifyUserAndFetchProjects();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("user");
        router.push("/auth/login");
    };

    const handleEdit = (project: Project) => {
        setEditingProject(project);
        setIsEditDialogOpen(true);
    };

    const deleteAssociatedResumes = async (recruiterId: string, projectId: string) => {
        const storagePath = `recruiter/${recruiterId}/${projectId}`;
        const folderRef = ref(storage, storagePath);

        try {
            const result = await listAll(folderRef);
            const deletePromises = result.items.map((itemRef) => deleteObject(itemRef));
            await Promise.all(deletePromises);
        } catch (error) {
            console.error("Error deleting associated resumes:", error);
        }
    };

    const handleDelete = async (projectId: string) => {
        if (confirm("Are you sure you want to delete this project?")) {
            try {
                const user = JSON.parse(localStorage.getItem("user") || "{}");
                await deleteAssociatedResumes(user.uid, projectId);
                await deleteDoc(doc(db, "projects", projectId));
                setProjects(projects.filter((project) => project.id !== projectId));
                alert("Project and associated resumes deleted successfully.");
            } catch (error) {
                console.error("Error deleting project:", error);
                alert("Failed to delete the project.");
            }
        }
    };

    const handleViewMore = (projectId: string) => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const recruiterId = user.uid;
        router.push(`/recruit/projects?recruiterId=${recruiterId}&projectId=${projectId}`);
    };

    const handleSaveEdit = async () => {
        if (editingProject) {
            try {
                await updateDoc(doc(db, "projects", editingProject.id), {
                    title: editingProject.title,
                    description: editingProject.description,
                });
                setProjects((prev) =>
                    prev.map((project) =>
                        project.id === editingProject.id ? editingProject : project
                    )
                );
                setIsEditDialogOpen(false);
                setEditingProject(null);
            } catch (error) {
                console.error("Error updating project:", error);
                alert("Failed to update the project.");
            }
        }
    };
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <header className="bg-primary text-primary-foreground py-6 shadow-lg pt-24 pb-12">
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Recruiter Dashboard</h1>
                        <p className="text-primary-foreground/80 mt-1">Manage your recruitment projects</p>
                    </div>
                    <Button
                        onClick={handleLogout}
                        variant="secondary"
                        className="gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </Button>
                </div>
            </header>

            <main className="container mx-auto py-12 px-6">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold">My Projects</h2>
                    <Button
                        onClick={() => router.push("/recruit/projects/new")}
                        className="gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        New Project
                    </Button>
                </div>

                {projects.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project, index) => (
                            <Card key={project.id} className="hover:shadow-lg transition-shadow duration-300">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardDescription className="mb-1">Project #{index + 1}</CardDescription>
                                            <CardTitle className="leading-tight text-xl">{project.title}</CardTitle>
                                        </div>
                                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                                            Active
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {project.description}
                                    </p>
                                </CardContent>
                                <CardFooter className="flex justify-between items-center border-t pt-4">
                                    <span className="text-xs text-muted-foreground">
                                        Created: {new Date().toLocaleDateString()}
                                    </span>
                                    <div className="flex gap-2">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => handleViewMore(project.id)}
                                            title="View Details"
                                            className="h-8 w-8"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => handleEdit(project)}
                                            title="Edit Project"
                                            className="h-8 w-8 text-yellow-600 dark:text-yellow-500"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => handleDelete(project.id)}
                                            title="Delete Project"
                                            className="h-8 w-8 text-destructive"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 px-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                            <FolderOpen className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No Projects Found</h3>
                        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                            You haven't created any recruitment projects yet. Get started by creating your first project.
                        </p>
                        <Button
                            onClick={() => router.push("/recruit/projects/new")}
                            className="gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Create Your First Project
                        </Button>
                    </div>
                )}

                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit Project</DialogTitle>
                            <DialogDescription>
                                Update the details of your recruitment project.
                            </DialogDescription>
                        </DialogHeader>
                        {editingProject && (
                            <div className="space-y-4 py-2">
                                <div className="space-y-2">
                                    <Label htmlFor="project-title">Project Title</Label>
                                    <Input
                                        id="project-title"
                                        value={editingProject.title}
                                        onChange={(e) =>
                                            setEditingProject({
                                                ...editingProject,
                                                title: e.target.value,
                                            })
                                        }
                                        placeholder="Enter project title"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="project-description">Description</Label>
                                    <Textarea
                                        id="project-description"
                                        value={editingProject.description}
                                        onChange={(e) =>
                                            setEditingProject({
                                                ...editingProject,
                                                description: e.target.value,
                                            })
                                        }
                                        placeholder="Describe your project"
                                        rows={4}
                                    />
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveEdit}>Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
};

export default RecruiterDashboard;