"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import RecruiterUpload from "./RecruiterUpload";
import { X, Upload, BarChart2, Link as LinkIcon, Star, Eye } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type ProjectsTab = "upload" | "analytics" | "acceptResumes" | "shortlistResumes";

interface Candidate {
  name: string;
  score: number;
  resumeUrl: string;
  summary?: string;
}

const RecruiterProjects: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProjectsTab>("analytics");
  const [applicants, setApplicants] = useState<
    { name: string; resumeURL: string }[]
  >([]);
  const [shortlisted, setShortlisted] = useState<
    { name: string; resumeURL: string }[]
  >([]);
  const [shortlistCount, setShortlistCount] = useState<number>(0);
  const [aiShortlisted, setAIShortlisted] = useState<
    { name: string; resumeUrl: string; score: number; }[]
  >([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const [totalResumes, setTotalResumes] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [recruiterId, setRecruiterId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState<string | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string>("");

  useEffect(() => {
    const id = searchParams?.get("projectId");
    if (id) {
      setProjectId(id);
      fetchJobDescription(id);
    }
  }, [searchParams]);

  const fetchJobDescription = async (id: string) => {
    try {
      const docRef = doc(db, "projects", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setJobDescription(data.description || "No description available");
      } else {
        setJobDescription("Project not found");
      }
    } catch (error) {
      console.error("Error fetching job description:", error);
      setJobDescription("Failed to fetch job description.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const verifyUser = async () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (!user.uid || user.role !== "recruiter") {
        router.push("/auth/login");
        return;
      }

      setAuthLoading(false);
    };

    verifyUser();
  }, [router]);

  useEffect(() => {
    const recruiterIdParam = searchParams.get("recruiterId");
    const projectIdParam = searchParams.get("projectId");
    setRecruiterId(recruiterIdParam);
    setProjectId(projectIdParam);
  }, [searchParams]);

  useEffect(() => {
    const fetchResumes = async () => {
      if (!recruiterId || !projectId) return;

      setLoading(true);

      const resumesRef = collection(
        db,
        "recruiters",
        recruiterId,
        "projects",
        projectId,
        "resumes"
      );

      try {
        const querySnapshot = await getDocs(resumesRef);
        const resumes = querySnapshot.docs.map((doc) => ({
          name: doc.data().applicantName,
          resumeURL: doc.data().downloadURL,
        }));
        setApplicants(resumes);
        setTotalResumes(resumes.length);
      } catch (error) {
        console.error("Error fetching resumes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, [recruiterId, projectId]);

  const generateLink = () => {
    if (recruiterId && projectId) {
      const link = `https://resume-upload-nine.vercel.app/?recruiterId=${recruiterId}&projectId=${projectId}`;
      setGeneratedLink(link);
    } else {
      alert("Recruiter ID and Project ID are not available.");
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  const handleShowSummary = async (candidate: Candidate) => {
    try {
      const response = await fetch(`http://127.0.0.1:5001/api/generate-summary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeUrl: candidate.resumeUrl,
          jobDescription,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch summary from backend");
      }

      const data = await response.json();
      const summary = data.summary || "No summary available.";

      setSelectedCandidate({ ...candidate, summary });
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching candidate summary:", error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCandidate(null);
  };

  const handleShortlistAI = async () => {
    if (shortlistCount <= 0) {
      alert("Please enter a valid number of applicants to shortlist.");
      return;
    }

    if (!applicants || applicants.length === 0) {
      alert("No resumes available to shortlist.");
      return;
    }

    if (!jobDescription) {
      alert("Job Description Not Found")
    }

    try {
      const response = await fetch("http://127.0.0.1:5001/api/resumeshortlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          count: shortlistCount,
          resumes: applicants,
          jobdescription: jobDescription
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch shortlisted resumes.");
      }

      const data = await response.json();
      setAIShortlisted(data.shortlisted);
    } catch (error) {
      console.error("Error shortlisting resumes:", error);
      alert("An error occurred while shortlisting resumes.");
    }
  };


  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="bg-primary text-primary-foreground py-12 pt-24 pb-12 shadow-md">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-extrabold mb-2 tracking-tight">
            Recruiting Projects
          </h1>
          <p className="text-xl opacity-90">
            Manage, upload, and analyze your recruitment projects
          </p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px] mb-8">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="acceptResumes">Links</TabsTrigger>
            <TabsTrigger value="shortlistResumes">Shortlist</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <RecruiterUpload />
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart2 className="w-5 h-5" /> Resume Analytics</CardTitle>
                <CardDescription>Overview of your applicant pool.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-32 space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground">Loading data...</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="bg-muted/50 border-none shadow-none">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Total Resumes</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-4xl font-bold text-primary">{totalResumes}</div>
                        </CardContent>
                      </Card>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Applicants</h3>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Resume</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {applicants.length > 0 ? (
                              applicants.map((applicant, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">{applicant.name}</TableCell>
                                  <TableCell>
                                    <a href={applicant.resumeURL} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                      <Eye className="w-4 h-4" /> View
                                    </a>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={2} className="text-center h-24 text-muted-foreground">
                                  No resumes uploaded yet.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="acceptResumes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><LinkIcon className="w-5 h-5" /> Accept Resumes via Link</CardTitle>
                <CardDescription>Generate a public link for candidates to upload their resumes directly.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={generateLink} className="gap-2">
                  <LinkIcon className="w-4 h-4" /> Generate Link
                </Button>
                {generatedLink && (
                  <div className="p-4 bg-muted rounded-md border text-sm break-all">
                    <p className="mb-2 text-muted-foreground">Share this link:</p>
                    <a href={generatedLink} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">
                      {generatedLink}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shortlistResumes">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Star className="w-5 h-5" /> AI Shortlisting</CardTitle>
                  <CardDescription>Use AI to rank and shortlist candidates based on the job description.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-2 max-w-sm">
                    <Label htmlFor="shortlistCount">Number of Applicants to Shortlist</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        id="shortlistCount"
                        value={shortlistCount}
                        onChange={(e) => setShortlistCount(Number(e.target.value))}
                        placeholder="e.g. 5"
                      />
                      <Button onClick={handleShortlistAI}>Shortlist</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Manual Shortlist</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Resume</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {applicants.map((applicant, index) => {
                          const isShortlisted = shortlisted.some((s) => s.resumeURL === applicant.resumeURL);
                          return (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{applicant.name}</TableCell>
                              <TableCell>
                                <a href={applicant.resumeURL} target="_blank" rel="noreferrer" className="text-primary hover:underline">View</a>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant={isShortlisted ? "destructive" : "default"}
                                  size="sm"
                                  onClick={() => {
                                    if (isShortlisted) {
                                      setShortlisted((prev) => prev.filter((s) => s.resumeURL !== applicant.resumeURL));
                                    } else {
                                      setShortlisted((prev) => [...prev, applicant]);
                                    }
                                  }}
                                >
                                  {isShortlisted ? "Remove" : "Shortlist"}
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {applicants.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">No applicants found.</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {shortlisted.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Manual Shortlisted Candidates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Resume</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {shortlisted.map((candidate, index) => (
                            <TableRow key={index}>
                              <TableCell>{candidate.name}</TableCell>
                              <TableCell>
                                <a href={candidate.resumeURL} target="_blank" rel="noreferrer" className="text-primary hover:underline">View</a>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {aiShortlisted.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>AI-Shortlisted Candidates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Resume</TableHead>
                            <TableHead>Summary</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {aiShortlisted.map((candidate, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{candidate.name}</TableCell>
                              <TableCell>{candidate.score}</TableCell>
                              <TableCell>
                                <a href={candidate.resumeUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">View</a>
                              </TableCell>
                              <TableCell>
                                <Button size="sm" variant="outline" onClick={() => handleShowSummary(candidate)}>View Summary</Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedCandidate?.name}'s Summary</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-foreground/80 leading-relaxed">{selectedCandidate?.summary}</p>
            </div>
            <DialogFooter>
              <Button onClick={handleCloseModal}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </main>
    </div>
  );
};

export default RecruiterProjects;

