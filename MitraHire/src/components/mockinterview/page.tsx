"use client"
import Image from 'next/image';
import { useState } from 'react';
import { InterviewPreparation } from './InterviewPrep';
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const Mockinterview = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<string | null>(null);
    const [jobDescription, setJobDescription] = useState<string>('');
    const [jobRole, setJobRole] = useState<string>('');
    const [responseMessage, setResponseMessage] = useState<string | null>(null);
    const router = useRouter();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleFileUpload = () => {
        if (selectedFile) {
            setUploadStatus("Upload Complete");
        } else {
            setUploadStatus("Please select a file.");
        }
    };

    const handlePreparationClick = async () => {
        const success = await InterviewPreparation(
            jobDescription,
            jobRole,
            selectedFile,
            setResponseMessage
        );

        if (success) {
            router.push("/mockinterview/start-interview");
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans pt-20">
            <header className="relative py-20 bg-muted/30">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
                <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
                        Ace Your Next Interview
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Prepare confidently with tailored insights, resume analysis, and mock interview guidance powered by AI.
                    </p>
                </div>
            </header>

            <main className="px-6 md:px-20 py-10 space-y-8">
                <Card className="max-w-3xl mx-auto shadow-lg">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">1. Upload Your Resume</CardTitle>
                        <CardDescription>
                            Supported formats: <span className="font-bold">PDF</span>. Maximum size: <span className="font-bold">5MB</span>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center gap-6">
                            <label
                                htmlFor="file-upload"
                                className="flex flex-col items-center justify-center w-full border-2 border-dashed border-primary/50  rounded-lg p-6 cursor-pointer bg-muted/30 hover:bg-muted/50 transition py-10"
                            >
                                {selectedFile ? (
                                    <>
                                        <span className="text-lg font-semibold text-primary">{selectedFile.name}</span>
                                        <span className="text-sm text-muted-foreground">Click to replace file</span>
                                    </>
                                ) : (
                                    <>
                                        <Image
                                            src="/resume_upload_icon.png"
                                            alt="Upload Resume"
                                            width={150}
                                            height={150}
                                            className="mb-4 object-contain"
                                        />
                                        <span className="mt-2 text-muted-foreground">
                                            Drag and drop your file here or click to browse
                                        </span>
                                    </>
                                )}
                                <input
                                    id="file-upload"
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept=".pdf"
                                />
                            </label>

                            <Button
                                onClick={handleFileUpload}
                                className="w-full max-w-xs"
                            >
                                Upload File
                            </Button>

                            {uploadStatus && (
                                <p className={`font-medium ${uploadStatus.includes('Complete') ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                                    {uploadStatus}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="max-w-3xl mx-auto shadow-lg">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">2. Job Details</CardTitle>
                        <CardDescription>Enter the role and job description you are interviewing for to get tailored questions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Job Role / Title</label>
                            <Input
                                value={jobRole}
                                onChange={(e) => setJobRole(e.target.value)}
                                placeholder="e.g. Senior Software Engineer, Product Manager"
                                className="text-base py-6"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Job Description</label>
                            <Textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the job description here..."
                                className="min-h-[200px] text-base"
                            />
                        </div>

                        <div className="flex flex-col items-center pt-4">
                            <Button
                                onClick={handlePreparationClick}
                                size="lg"
                                className="w-full max-w-sm text-lg py-6 bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-700 dark:hover:bg-purple-600"
                            >
                                Prepare for Interview
                            </Button>
                            {responseMessage && (
                                <div className={`mt-6 text-center font-semibold ${responseMessage.includes("Error") ? 'text-destructive' : 'text-green-600 dark:text-green-400'}`}>
                                    {responseMessage}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default Mockinterview;
