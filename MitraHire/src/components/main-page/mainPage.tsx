"use client";
import React, { useState } from "react";
import Image from "next/image";
import jsPDF from 'jspdf';

const generatePDFReport = (analysisResult: AnalysisResult) => {
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const sectionSpacing = 12;
    const maxLineWidth = pageWidth - 2 * margin;

    const wrapText = (text: string, width: number): string[] => {
        return doc.splitTextToSize(text, width);
    };

    const addSection = (
        title: string,
        items: string[],
        startY: number,
        color: string
    ): number => {
        let currentY = startY;

        doc.setFontSize(18);
        doc.setTextColor(color);
        doc.setFont('times', 'italic');
        doc.text(title, margin, currentY + 10);
        currentY += 10;
        doc.setDrawColor(color);
        doc.setLineWidth(0.5);
        doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        items.forEach((item) => {
            const wrappedLines = wrapText('• ' + item, maxLineWidth);
            wrappedLines.forEach((line, index) => {
                if (currentY + sectionSpacing > pageHeight - 20) {
                    doc.addPage();
                    applyBackground(doc);
                    currentY = margin;
                }
                currentY += sectionSpacing / (index === 0 ? 1 : 1.5);
                doc.text(line, margin, currentY);
            });
        });
        doc.text(" ", margin, currentY)
        return currentY + 10;
    };

    const drawHeader = () => {
        const gradientHeight = 30;

        for (let i = 0; i <= gradientHeight; i++) {
            const gradientColor = `rgba(186, 85, 211, ${1 - i / gradientHeight})`; // Purple fade
            doc.setFillColor(186, 85, 211, i / gradientHeight);
            doc.rect(0, i, pageWidth, 1, 'F');
        }

        doc.setFont('times', 'italic');
        doc.setFontSize(24);
        doc.setTextColor(255, 255, 255);
        doc.text('Mitra AI Resume Analysis Report', pageWidth / 2, 20, { align: 'center' });
    };

    const drawFooter = (doc: jsPDF) => {
        const totalPages = doc.internal.pages.length - 1;
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            const footerText = `Page ${i} of ${totalPages}`;
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }
    };

    const applyBackground = (doc: jsPDF) => {
        doc.setFillColor(255, 250, 240);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
    };

    applyBackground(doc);
    drawHeader();

    let nextY = 50;

    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.setFont('times', 'italic');
    doc.text('ATS Score', margin, nextY);
    nextY += 15;
    doc.setFontSize(30);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(analysisResult.atsScore, margin, nextY);

    nextY += sectionSpacing;
    nextY = addSection('Strengths', analysisResult.strengths, nextY, '#228B22'); // Green
    nextY = addSection('Areas for Improvement', analysisResult.weaknesses, nextY, '#FF6347'); // Red
    nextY = addSection('Recommendations', analysisResult.suggestions, nextY, '#6A5ACD'); // Purple

    drawFooter(doc);
    doc.save('Resume_Analysis_Report.pdf');
};

interface AnalysisResult {
    atsScore: string;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
}

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";

const MainPage: React.FC = () => {
    const [selectedResumeFile, setSelectedResumeFile] = useState<File | null>(null);
    const [jobDescription, setJobDescription] = useState<string>("");
    const [uploadStatus, setUploadStatus] = useState<string>("");
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null; // or a loading spinner
    }

    const parseAnalysisText = (text: string): AnalysisResult => {
        const result: AnalysisResult = {
            atsScore: "Score not available",
            strengths: [],
            weaknesses: [],
            suggestions: []
        };

        const atsMatch = text.match(/ATS Score[^\d]*(\d+)\/100/);
        if (atsMatch) {
            result.atsScore = atsMatch[1] + '/100';
        }

        const extractSection = (sectionTitles: string[], text: string): string => {
            const sectionOrder = ['ATS Score', 'Strengths', 'Weaknesses', 'Areas for Improvement', 'Suggestions', 'Recommendations'];
            const currentSectionIndex = sectionTitles.map(title => sectionOrder.indexOf(title)).filter(index => index !== -1)[0];

            const nextSectionTitles = sectionOrder.slice(currentSectionIndex + 1);
            const nextSectionRegexPattern = nextSectionTitles.map(title => `(${title})`).join('|');
            const sectionRegex = new RegExp(
                `(${sectionTitles.join('|')})([^]*?)(?=${nextSectionRegexPattern}|$)`,
                'i'
            );

            const match = text.match(sectionRegex);
            return match ? match[2].trim() : '';
        };

        const extractBulletPoints = (sectionText: string): string[] => {
            if (!sectionText) return [];

            return sectionText
                .split('\n')
                .map(line => line.trim())
                .map(line => {
                    return line
                        .replace(/^[*#\s]+/, '')
                        .replace(/[*#]+/g, '')
                        .trim();
                })
                .filter(line => line.length > 0);
        };

        const sectionMappings = {
            strengths: ['Strengths'],
            weaknesses: ['Weaknesses', 'Areas for Improvement'],
            suggestions: ['Suggestions', 'Recommendations']
        };

        Object.entries(sectionMappings).forEach(([key, titles]) => {
            const sectionContent = extractSection(titles, text);
            const bulletPoints = extractBulletPoints(sectionContent);

            if (bulletPoints.length > 0) {
                result[key as keyof Omit<AnalysisResult, 'atsScore'>] = bulletPoints;
            }
        });

        // Defaults
        if (result.strengths.length === 0) result.strengths = ["Additional feedback needed - Please provide specific strengths"];
        if (result.weaknesses.length === 0) result.weaknesses = ["Additional feedback needed - Please provide specific areas for improvement"];
        if (result.suggestions.length === 0) result.suggestions = ["Additional feedback needed - Please provide specific recommendations"];

        return result;
    };


    const analyzeWithLangchain = async (resumeText: string) => {
        setUploadStatus("Analyzing with AI...");

        try {
            const response = await fetch(`${API_BASE_URL}/analyze_resume`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    resume_text: resumeText,
                    job_description: jobDescription || ""
                }),
            });

            if (!response.ok) {
                // Fallback if backend fails (e.g. 500 error)
                throw new Error("Backend analysis failed");
            }

            const data = await response.json();

            // Handle case where data.analysis might be a JSON string or raw text
            let analysisText = data.analysis;
            if (typeof analysisText !== 'string') {
                analysisText = JSON.stringify(analysisText);
            }

            const parsedAnalysis = parseAnalysisText(analysisText);
            setAnalysisResult(parsedAnalysis);
            setUploadStatus("Analysis Complete!");

        } catch (error) {
            console.error("Analysis Error:", error);
            setUploadStatus("Analysis failed. Backend server unavailable. Please ensure the server is running.");
            setAnalysisResult(null);
        }
    };

    const handleResumeFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.[0]) {
            const file = event.target.files[0];

            if (file.type !== "application/pdf") {
                setUploadStatus("Only PDF files are supported.");
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                setUploadStatus("File size exceeds 5MB.");
                return;
            }

            setSelectedResumeFile(file);
            setUploadStatus("");
        }
    };

    const handleFileUpload = async () => {
        if (!selectedResumeFile) {
            setUploadStatus("Please select a resume file first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedResumeFile);

        setUploadStatus("Uploading...");

        try {
            const response = await fetch(`${API_BASE_URL}/extract_text`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            const data = await response.json();
            await analyzeWithLangchain(data.text);
        } catch (error) {
            console.error("Upload Error:", error);
            setUploadStatus("Upload failed. Please try again.");
        }
    };
    return (
        <div className="min-h-screen bg-background text-foreground font-sans pt-20">
            <main className="px-6 md:px-20 py-10">
                <Card className="max-w-3xl mx-auto shadow-xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-bold">Upload Your Resume</CardTitle>
                        <CardDescription>
                            Supported formats: <span className="font-bold">PDF</span>. Maximum size: <span className="font-bold">5MB</span>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Resume Upload Section */}
                        <div className="flex flex-col items-center gap-6">
                            <label
                                htmlFor="resume-upload"
                                className="flex flex-col items-center justify-center w-full border-2 border-dashed border-primary/50  rounded-lg p-6 cursor-pointer bg-muted/50 hover:bg-muted transition py-10"
                            >
                                {selectedResumeFile ? (
                                    <>
                                        <span className="text-lg font-semibold text-primary">{selectedResumeFile.name}</span>
                                        <span className="text-sm text-muted-foreground">Click to replace resume</span>
                                    </>
                                ) : (
                                    <>
                                        <Image
                                            src="/upload.svg"
                                            alt="Upload Icon"
                                            width={48}
                                            height={48}
                                            className="text-primary mb-3"
                                        />
                                        <span className="mt-2 text-muted-foreground">
                                            Drag and drop your resume here or click to browse
                                        </span>
                                    </>
                                )}
                                <input
                                    id="resume-upload"
                                    type="file"
                                    className="hidden"
                                    onChange={handleResumeFileChange}
                                    accept=".pdf"
                                />
                            </label>

                            {/* Optional Job Description Input Section */}
                            <div className="w-full mt-4 space-y-2">
                                <h3 className="text-center text-xl text-foreground font-medium">
                                    Optional: Job Description
                                </h3>
                                <textarea
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    placeholder="Paste job description here (optional)"
                                    className="w-full p-4 rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[150px] resize-y"
                                />
                            </div>

                            <Button
                                onClick={handleFileUpload}
                                className="w-full max-w-xs text-lg py-6"
                                size="lg"
                            >
                                Upload Resume
                            </Button>

                            {uploadStatus && (
                                <p
                                    className={`mt-4 font-medium ${uploadStatus.includes("Complete") ? "text-green-600 dark:text-green-400" :
                                        uploadStatus.includes("Analyzing") ? "text-blue-600 dark:text-blue-400" : "text-destructive"
                                        }`}
                                >
                                    {uploadStatus}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Analysis Results */}
                {analysisResult && (
                    <section className="mt-16 space-y-8">
                        <h3 className="text-3xl font-bold text-foreground text-center">
                            Resume Analysis
                        </h3>

                        <div className="grid gap-6">
                            {/* ATS Score */}
                            <Card className="border-l-4 border-l-primary shadow-lg">
                                <CardHeader>
                                    <CardTitle className="text-primary">ATS Score</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-3xl font-bold text-foreground">{analysisResult.atsScore}</p>
                                </CardContent>
                            </Card>

                            {/* Strengths */}
                            <Card className="border-l-4 border-l-green-500 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="text-green-600 dark:text-green-400">Strengths</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                        {analysisResult.strengths.map((strength, index) => (
                                            <li key={index}>{strength}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* Weaknesses */}
                            <Card className="border-l-4 border-l-destructive shadow-lg">
                                <CardHeader>
                                    <CardTitle className="text-destructive dark:text-red-400">Areas for Improvement</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                        {analysisResult.weaknesses.map((weakness, index) => (
                                            <li key={index}>{weakness}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* Suggestions */}
                            <Card className="border-l-4 border-l-purple-500 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="text-purple-600 dark:text-purple-400">Recommendations</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                        {analysisResult.suggestions.map((suggestion, index) => (
                                            <li key={index}>{suggestion}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="mt-8 text-center">
                            <Button
                                onClick={() => generatePDFReport(analysisResult)}
                                variant="secondary"
                                className="bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600"
                            >
                                Download Detailed Report
                            </Button>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default MainPage;