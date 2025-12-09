"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { uploadResume } from "../firebase/firebaseFunctions";
import { FileUp, CheckCircle2, AlertTriangle, File } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const RecruiterUpload: React.FC = () => {
  const searchParams = useSearchParams();
  const [recruiterId, setRecruiterId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [applicantName, setApplicantName] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [downloadURL, setDownloadURL] = useState<string | null>(null);

  useEffect(() => {
    const recruiterIdParam = searchParams.get("recruiterId");
    const projectIdParam = searchParams.get("projectId");

    setRecruiterId(recruiterIdParam);
    setProjectId(projectIdParam);
  }, [searchParams]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!recruiterId || !projectId) {
      alert("Recruiter ID or Project ID not found in the URL.");
      return;
    }

    if (!file || !applicantName) {
      alert("Please provide an applicant name and select a file.");
      return;
    }

    setUploadStatus("Uploading...");

    try {
      const url = await uploadResume(recruiterId, projectId, file, applicantName);
      setUploadStatus("Upload successful!");
      setDownloadURL(url);
      setFile(null);
      setApplicantName("");
    } catch (error) {
      setUploadStatus("Error during upload. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <FileUp className="w-12 h-12 text-primary opacity-80" strokeWidth={1.5} />
          </div>
          <CardTitle className="text-3xl font-semibold">Resume Upload</CardTitle>
          <CardDescription>Upload applicant resumes securely and efficiently</CardDescription>
        </CardHeader>
        <CardContent>
          {recruiterId && projectId ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="applicantName">Applicant Full Name</Label>
                <Input
                  type="text"
                  id="applicantName"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file-upload">Resume File (PDF)</Label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    id="file-upload"
                    className="hidden"
                  />
                  <Label
                    htmlFor="file-upload"
                    className="w-full px-4 py-8 border-2 border-dashed border-input rounded-lg text-center cursor-pointer hover:border-primary transition duration-300 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    {file ? (
                      <>
                        <File className="w-8 h-8 text-primary" />
                        <span className="font-medium text-foreground">{file.name}</span>
                      </>
                    ) : (
                      <>
                        <FileUp className="w-8 h-8" />
                        <span>Click to select PDF</span>
                      </>
                    )}
                  </Label>
                </div>
              </div>

              <Button
                onClick={handleUpload}
                disabled={!file || !applicantName}
                className="w-full h-12 text-lg gap-2"
              >
                <FileUp className="w-5 h-5" />
                Upload Resume
              </Button>
            </div>
          ) : (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-center gap-3">
              <AlertTriangle className="text-yellow-600 dark:text-yellow-500 w-6 h-6" />
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                Recruiter ID or Project ID is missing from the URL.
              </p>
            </div>
          )}

          {uploadStatus && (
            <div className={`mt-6 p-4 rounded-lg text-sm flex items-center justify-center gap-2 ${uploadStatus.includes("successful")
              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
              : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
              }`}>
              {uploadStatus.includes("successful") ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
              {uploadStatus}
            </div>
          )}
        </CardContent>
        {downloadURL && (
          <CardFooter className="justify-center">
            <a
              href={downloadURL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline transition duration-300"
            >
              View Uploaded File
            </a>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default RecruiterUpload;