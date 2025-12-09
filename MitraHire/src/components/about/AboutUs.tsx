import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, Users, ShieldCheck, ArrowRight } from "lucide-react";

const AboutUs: React.FC = () => {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            {/* Header Section */}
            <header className="relative py-24 bg-muted/30 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
                <div className="absolute w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -top-20 -right-20 pointer-events-none" />
                <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
                        About Us
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Driving innovation and empowering careers with cutting-edge AI solutions.
                    </p>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 md:px-12 py-16 space-y-20">
                {/* Mission Section */}
                <section className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-primary">Our Mission</h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            At MitraHire, our mission is to empower individuals with cutting-edge tools to elevate their professional journeys and achieve success. We believe in democratizing access to career guidance through the power of Artificial Intelligence.
                        </p>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            We strive to bridge the gap between talent and opportunity, providing every job seeker with the personalized support they need to land their dream job.
                        </p>
                    </div>
                    <div className="flex justify-center">
                        <div className="relative w-full max-w-md aspect-square">
                            <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl opacity-50" />
                            <Image
                                src="/about_mission.png"
                                alt="Our Mission"
                                width={500}
                                height={500}
                                className="relative rounded-2xl shadow-2xl skew-y-3 transform transition hover:skew-y-0 duration-500"
                            />
                        </div>
                    </div>
                </section>

                {/* What We Do Section */}
                <section className="text-center max-w-4xl mx-auto space-y-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary">What We Do</h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        MitraHire uses AI to analyze and enhance your resume, ensuring it stands out to recruiters. Our platform provides actionable insights for improving content, structure, and ATS compatibility. We offer personalized career guidance to help you advance in your job search. With our tools, you’ll be better equipped to succeed in a competitive job market.
                    </p>
                </section>

                {/* Why Choose Us Section */}
                <section>
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-12">Why Choose Us?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="hover:shadow-lg transition-shadow border-primary/10">
                            <CardHeader>
                                <Brain className="w-12 h-12 text-primary mb-2" />
                                <CardTitle className="text-xl">AI-Driven Insights</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Precise, actionable recommendations powered by advanced algorithms to optimize your profile.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="hover:shadow-lg transition-shadow border-primary/10">
                            <CardHeader>
                                <Users className="w-12 h-12 text-primary mb-2" />
                                <CardTitle className="text-xl">User-Friendly</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    A seamless and intuitive experience designed for users of all technical levels.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="hover:shadow-lg transition-shadow border-primary/10">
                            <CardHeader>
                                <TrendingUp className="w-12 h-12 text-primary mb-2" />
                                <CardTitle className="text-xl">Tailored Guidance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Industry-specific advice and analytics to ensure your professional success and growth.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="hover:shadow-lg transition-shadow border-primary/10">
                            <CardHeader>
                                <ShieldCheck className="w-12 h-12 text-primary mb-2" />
                                <CardTitle className="text-xl">Holistic Approach</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Comprehensive evaluation covering layout, content, and impact for career development.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="text-center py-12 bg-primary/5 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10 space-y-8 px-6">
                        <h3 className="text-3xl font-bold">
                            Ready to transform your career?
                        </h3>
                        <p className="text-muted-foreground max-w-xl mx-auto">
                            Join thousands of others who possess the tools to succeed. Start your journey with MitraHire today.
                        </p>
                        <Link href="/auth/signup">
                            <Button size="lg" className="h-14 text-lg px-8 rounded-full shadow-lg gap-2">
                                Get Started <ArrowRight className="w-5 h-5" />
                            </Button>
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AboutUs;
