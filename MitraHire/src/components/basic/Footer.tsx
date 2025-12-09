"use client";
import Link from "next/link";
import React from "react";
import { Twitter, Linkedin } from "lucide-react";

const Footer = () => {
    return (
        <footer className="w-full bg-background border-t border-border py-8">
            <div className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
                <div className="mb-6 md:mb-0">
                    <Link href="/" className="text-primary font-bold text-lg">
                        MitraHire
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                        Empowering careers with AI-driven solutions.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <Link
                        href="/about"
                        className="text-foreground hover:text-primary transition duration-200"
                    >
                        About Us
                    </Link>
                    <Link
                        href="/contact"
                        className="text-foreground hover:text-primary transition duration-200"
                    >
                        Contact
                    </Link>
                    {/* <Link
                        href="/privacy"
                        className="text-foreground hover:text-primary transition duration-200"
                    >
                        Privacy Policy
                    </Link>
                    <Link
                        href="/terms"
                        className="text-foreground hover:text-primary transition duration-200"
                    >
                        Terms of Service
                    </Link> */}
                </div>

                <div className="flex items-center gap-4 mt-6 md:mt-0">
                    <Link
                        href="https://x.com/PradeepKs__"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 flex items-center justify-center bg-muted rounded-full hover:bg-primary hover:text-primary-foreground transition duration-200"
                        aria-label="Twitter"
                    >
                        <Twitter className="w-5 h-5" />
                    </Link>
                    <Link
                        href="https://www.linkedin.com/in/pradeep-ks-77768732b/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 flex items-center justify-center bg-muted rounded-full hover:bg-primary hover:text-primary-foreground transition duration-200"
                        aria-label="LinkedIn"
                    >
                        <Linkedin className="w-5 h-5" />
                    </Link>
                </div>
            </div>

            <div className="mt-6 text-center text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} MitraHire. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;


