"use client";
import React, { useState } from "react";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
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

const MainPage: React.FC = () => {
    const [selectedResumeFile, setSelectedResumeFile] = useState<File | null>(null);
    const [jobDescription, setJobDescription] = useState<string>("");
    const [uploadStatus, setUploadStatus] = useState<string>("");
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

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

    const createResumeAnalysisPrompt = (): PromptTemplate => {
        return PromptTemplate.fromTemplate(`Analyze this resume ${jobDescription ? 'in the context of the provided job description' : 'for general ATS optimization'} and provide a detailed and comprehensive analysis in the following format:

**ATS Score**  
[Provide a score out of 100 based on criteria such as keyword optimization, formatting, section arrangement, and relevance of content for Applicant Tracking Systems${jobDescription ? ' relative to the job description' : ''}.]

**Strengths**  
* List all strengths in alignment with the resume sections${jobDescription ? ' and job description requirements' : ''}. Use a single bullet for each strength, starting with the section name followed by details. For example:  
  - **Skills:** Strong expertise in JavaScript, React.js, and Node.js, aligned with industry requirements.  
  - **Education:** High academic performance with a CGPA of 9.10, showcasing a solid academic foundation.  

**Weaknesses**  
* Highlight weaknesses section-wise, identifying specific areas of improvement${jobDescription ? ' based on job description' : ''}. Use a single bullet per weakness, starting with the section name followed by details. For example:  
  - **Work Experience:** Lacks quantifiable achievements, making it harder to gauge impact.  
  - **Skills:** Missing important certifications relevant to the role.  

**Suggestions**  
* Provide actionable recommendations to enhance each section, ensuring the resume becomes more impactful and ATS-friendly${jobDescription ? ' for the specific job description' : ''}. Use a single bullet per suggestion, starting with the section name followed by details. For example:  
  - **Work Experience:** Include measurable results, such as "Increased user engagement by 20% through optimization."  
  - **Skills:** Add certifications in trending technologies to strengthen technical credibility.  

Ensure the analysis is detailed, section-specific, and offers constructive feedback. 
${jobDescription ? 'Focus on alignment with job description requirements and improving candidacy for the specific role.  The analysis and ATS Score should be strictly based on Job Description (ATS Score should be very less if resume does not align with Job Description).' : 'Focus on improving overall resume appeal for ATS and recruiters.'}

Job Description (if provided):
{jobDescriptionText}

Resume text:
{resumeText}`);
    };

    const analyzeWithLangchain = async (resumeText: string) => {
        setUploadStatus("Analyzing...");

        try {
            const model = new ChatGoogleGenerativeAI({
                apiKey: "AIzaSyBRKVqXRqEcaBkK_xqG2lUyBhbIVMneBLQ", // Use environment variable
                model: "gemini-1.5-pro-latest",
                temperature: 0.7
            });

            const prompt = createResumeAnalysisPrompt();
            const chain = prompt.pipe(model).pipe(new StringOutputParser());

            const analysisText = await chain.invoke({
                resumeText,
                jobDescriptionText: jobDescription || ""
            });

            const parsedAnalysis = parseAnalysisText(analysisText);
            setAnalysisResult(parsedAnalysis);
            setUploadStatus("Analysis Complete!");
        } catch (error) {
            console.error("Gemini Analysis Error:", error);
            setUploadStatus("Analysis failed. Please try again.");
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
            const response = await fetch("http://localhost:5001/upload", {
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
        <div className="min-h-screen bg-gradient-to-br from-[#eef4fa] to-[#d6e4f3] text-[#2b4b77] font-sans">
            {/* Previous header remains unchanged */}

            <main className="px-6 md:px-20 py-20">
                <div className="bg-white shadow-lg rounded-xl p-8 max-w-3xl mx-auto py-14">
                    <h2 className="text-3xl font-bold text-center mb-6">
                        Upload Your Resume
                    </h2>
                    <p className="text-gray-600 text-center mb-8">
                        Supported formats: <span className="font-bold">PDF</span>. Maximum size: <span className="font-bold">5MB</span>.
                    </p>

                    {/* Resume Upload Section */}
                    <div className="flex flex-col items-center gap-6">
                        <label
                            htmlFor="resume-upload"
                            className="flex flex-col items-center justify-center w-full border-2 border-dashed border-[#3b82f6] rounded-lg p-6 cursor-pointer bg-[#f8f9fa] hover:bg-[#eef4fa] transition py-10"
                        >
                            {selectedResumeFile ? (
                                <>
                                    <span className="text-lg font-semibold text-[#2b4b77]">{selectedResumeFile.name}</span>
                                    <span className="text-sm text-gray-500">Click to replace resume</span>
                                </>
                            ) : (
                                <>
                                    <Image
                                        src="/upload.svg"
                                        alt="Upload Icon"
                                        width={48}
                                        height={48}
                                        className="text-[#2f88ff]"
                                    />
                                    <span className="mt-2 text-gray-600">
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
                        <div className="w-full mt-4">
                            <h3 className="text-center text-xl mb-4 text-gray-700">
                                Optional: Job Description
                            </h3>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste job description here (optional)"
                                className="w-full p-4 border-2 border-[#6a5acd] rounded-lg min-h-[150px] resize-y focus:outline-none focus:ring-2 focus:ring-[#6a5acd]/50 transition"
                            />
                        </div>

                        <button
                            onClick={handleFileUpload}
                            className="w-full max-w-xs px-6 py-3 bg-[#3b82f6] text-white font-bold rounded-lg shadow-md hover:bg-[#2563eb] transition duration-200"
                        >
                            Upload Resume
                        </button>

                        {uploadStatus && (
                            <p
                                className={`mt-4 font-medium ${uploadStatus.includes("Complete") ? "text-green-600" :
                                    uploadStatus.includes("Analyzing") ? "text-blue-600" : "text-red-600"
                                    }`}
                            >
                                {uploadStatus}
                            </p>
                        )}
                    </div>
                </div>

                {/* Analysis Results */}
                {analysisResult && (
                    <section className="mt-16 bg-gradient-to-tr from-[#eef4fa] to-[#d6e4f3] shadow-md rounded-xl p-8">
                        <h3 className="text-3xl font-bold mb-4 text-[#2b4b77] text-center">
                            Resume Analysis
                        </h3>
                        <div className="space-y-6">
                            {/* ATS Score */}
                            <div className="bg-white shadow-lg rounded-lg p-6 border-l-4 border-[#3b82f6]">
                                <h4 className="text-lg font-semibold text-[#2563eb]">ATS Score</h4>
                                <p className="text-gray-600 text-xl font-semibold mt-2">{analysisResult.atsScore}</p>
                            </div>

                            {/* Strengths */}
                            <div className="bg-white shadow-lg rounded-lg p-6 border-l-4 border-green-500">
                                <h4 className="text-lg font-semibold text-green-600">Strengths</h4>
                                <ul className="list-disc pl-6 text-gray-600 mt-2 space-y-2">
                                    {analysisResult.strengths.map((strength, index) => (
                                        <li key={index} className="text-gray-700">{strength}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Weaknesses */}
                            <div className="bg-white shadow-lg rounded-lg p-6 border-l-4 border-red-500">
                                <h4 className="text-lg font-semibold text-red-600">Areas for Improvement</h4>
                                <ul className="list-disc pl-6 text-gray-600 mt-2 space-y-2">
                                    {analysisResult.weaknesses.map((weakness, index) => (
                                        <li key={index} className="text-gray-700">{weakness}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Suggestions */}
                            <div className="bg-white shadow-lg rounded-lg p-6 border-l-4 border-purple-500">
                                <h4 className="text-lg font-semibold text-purple-600">Recommendations</h4>
                                <ul className="list-disc pl-6 text-gray-600 mt-2 space-y-2">
                                    {analysisResult.suggestions.map((suggestion, index) => (
                                        <li key={index} className="text-gray-700">{suggestion}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>


                )}
                {analysisResult && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => generatePDFReport(analysisResult)}
                            className="px-6 py-3 bg-purple-600 text-white font-bold rounded-lg shadow-md hover:bg-purple-700 transition duration-200"
                        >
                            Download Detailed Report
                        </button>
                    </div>
                )}

                {/* Rest of the component remains unchanged */}
            </main>
        </div>
    );
};

export default MainPage;