import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, BarChart2, Lightbulb } from "lucide-react";

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            {/* Hero Section */}
            <header className="w-full min-h-[90vh] flex flex-col items-center justify-center text-center px-6 bg-gradient-to-b from-background to-muted/50 pt-20">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

                <div className="relative z-10 max-w-4xl mx-auto space-y-8">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                        Welcome to <span className="text-primary">MitraHire</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                        Your AI-powered assistant for professional resume reviews, instant feedback, and personalized career guidance.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Link href="/home">
                            <Button size="lg" className="text-lg px-8 h-14 rounded-full shadow-lg hover:shadow-primary/25 transition-all">
                                Upload Your Resume <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/auth/login">
                            <Button variant="outline" size="lg" className="text-lg px-8 h-14 rounded-full">
                                Login to Account
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* How It Works Section */}
            <section className="py-24 bg-card rounded-t-[3rem] shadow-2xl -mt-20 relative z-20 px-6 md:px-20 border-t border-border/50">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">
                        How It Works
                    </h2>
                    <div className="grid md:grid-cols-3 gap-12">
                        {/* Step 1 */}
                        <Card className="border-none shadow-none bg-transparent relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-transparent dark:from-blue-900/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardContent className="flex flex-col items-center text-center p-6 relative">
                                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">1. Upload</h3>
                                <p className="text-muted-foreground text-lg">
                                    Upload your resume (PDF) in seconds. Secure and private.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Step 2 */}
                        <Card className="border-none shadow-none bg-transparent relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 to-transparent dark:from-purple-900/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardContent className="flex flex-col items-center text-center p-6 relative">
                                <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                                    <BarChart2 className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">2. Analyze</h3>
                                <p className="text-muted-foreground text-lg">
                                    Our AI scans for ATS compatibility, keywords, and structural issues.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Step 3 */}
                        <Card className="border-none shadow-none bg-transparent relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-100/50 to-transparent dark:from-amber-900/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardContent className="flex flex-col items-center text-center p-6 relative">
                                <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                                    <Lightbulb className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">3. Improve</h3>
                                <p className="text-muted-foreground text-lg">
                                    Get a detailed score and actionable tips to land your dream job.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Feature Highlights Section */}
            <section className="py-24 px-6 md:px-20 bg-muted/30">
                <div className="max-w-7xl mx-auto space-y-24">
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
                        Why Choose MitraHire?
                    </h2>

                    {/* Feature 1 */}
                    <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                        <div className="w-full md:w-1/2">
                            <div className="rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-card p-2">
                                <img
                                    src="/resumeReview2.jpeg"
                                    alt="Detailed Report"
                                    className="w-full rounded-xl transform hover:scale-[1.02] transition duration-500"
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 space-y-6">
                            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-semibold text-sm">
                                Comprehensive Analysis
                            </div>
                            <h3 className="text-3xl md:text-4xl font-bold leading-tight">Get a Detailed Report</h3>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Receive a personalized, in-depth analysis of your resume highlighting strengths and identifying areas for improvement. Our report provides actionable insights tailored to your career goals, ensuring you are ready to impress hiring managers.
                            </p>
                        </div>
                    </div>

                    {/* Feature 2 (Reversed) */}
                    <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20">
                        <div className="w-full md:w-1/2">
                            <div className="rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-card p-2">
                                <img
                                    src="/resumeSugesstion.jpeg"
                                    alt="ATS Score"
                                    className="w-full rounded-xl transform hover:scale-[1.02] transition duration-500"
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 space-y-6">
                            <div className="inline-block px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 font-semibold text-sm">
                                ATS Optimization
                            </div>
                            <h3 className="text-3xl md:text-4xl font-bold leading-tight">Know Your ATS Score</h3>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Find out how your resume fares against Applicant Tracking Systems (ATS) used by leading companies. Gain insights into keyword alignment and formatting to maximize your visibility.
                            </p>
                        </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                        <div className="w-full md:w-1/2">
                            <div className="rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-card p-2">
                                <img
                                    src="/Ats.jpeg"
                                    alt="Suggestions"
                                    className="w-full rounded-xl transform hover:scale-[1.02] transition duration-500"
                                />
                            </div>
                        </div>

                        <div className="w-full md:w-1/2 space-y-6">
                            <div className="inline-block px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 font-semibold text-sm">
                                Actionable Feedback
                            </div>
                            <h3 className="text-3xl md:text-4xl font-bold leading-tight">Personalized Suggestions</h3>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Access tailored recommendations to refine your content. From strong action verbs to metric-driven bullet points, our AI helps you craft a compelling professional narrative.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section
                id="upload"
                className="py-24 bg-primary text-primary-foreground text-center px-6 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                    <h2 className="text-3xl md:text-5xl font-bold">
                        Ready to Accelerate Your Career?
                    </h2>
                    <p className="text-xl md:text-2xl text-primary-foreground/80">
                        Join thousands of job seekers who have improved their resumes with <span className="font-bold text-white">MitraHire</span>.
                    </p>
                    <Link href="/auth/login">
                        <Button variant="secondary" size="lg" className="text-lg px-10 h-16 rounded-full shadow-2xl hover:scale-105 transition-transform">
                            Get Started for Free
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
