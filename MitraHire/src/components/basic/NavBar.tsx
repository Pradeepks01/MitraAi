"use client";
import Link from "next/link";
import React, { useState } from "react";
import { ChevronDown, FileText, Briefcase } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle"; // Import ModeToggle

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => {
        setIsOpen((prev) => !prev);
    };

    return (
        <div className="w-full h-[65px] fixed top-0 shadow-lg shadow-gray-300/50 dark:shadow-none dark:border-b bg-background/80 backdrop-blur-md z-50 px-10 rounded-b-2xl transition-colors duration-300">
            <div className="w-full h-full flex items-center justify-between">
                <Link
                    href="/"
                    className="flex flex-row items-center"
                >
                    <span className="font-bold ml-[10px] text-primary text-xl">
                        MitraHire
                    </span>
                </Link>

                {/* Navigation Links (Desktop) */}
                <div className="hidden md:flex md:flex-row md:items-center md:justify-between md:w-[350px] md:mr-20">
                    <div className="flex items-center justify-between w-full h-auto py-[10px] rounded-full text-foreground">
                        <Link href="/about" className="cursor-pointer hover:text-primary transition duration-200">
                            About Us
                        </Link>
                        <div className="relative">
                            {/* Dropdown Button */}
                            <button
                                onClick={toggleDropdown}
                                className="flex items-center gap-2 text-foreground hover:text-primary transition duration-200 focus:outline-none"
                            >
                                Mitra AI
                                <ChevronDown className={`w-4 h-4 transform ${isOpen ? "rotate-180" : "rotate-0"}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isOpen && (
                                <div className="absolute mt-2 bg-card border border-border rounded-md shadow-lg w-48 z-50">
                                    <Link
                                        href="/home"
                                        className="flex items-center gap-3 px-4 py-2 text-foreground hover:bg-primary hover:text-primary-foreground transition duration-200 rounded-t-md"
                                    >
                                        <FileText className="w-5 h-5" />
                                        Resume Analysis
                                    </Link>
                                    <Link
                                        href="/mockinterview"
                                        className="flex items-center gap-3 px-4 py-2 text-foreground hover:bg-primary hover:text-primary-foreground transition duration-200 rounded-b-md"
                                    >
                                        <Briefcase className="w-5 h-5" />
                                        Mock Interview
                                    </Link>
                                </div>
                            )}
                        </div>
                        <Link href="/auth/login" className="cursor-pointer hover:text-primary transition duration-200">
                            Login
                        </Link>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <ModeToggle />
                    <Link href="/recruit/dashboard" className="px-4 mx-2 py-2 bg-primary text-primary-foreground rounded-full shadow-md hover:bg-primary/90 transition duration-200">
                        Recruiter
                    </Link>
                    <Link href="/contact" className="px-4 py-2 bg-primary text-primary-foreground rounded-full shadow-md hover:bg-primary/90 transition duration-200">
                        Contact Us
                    </Link>
                </div>

                <div className="md:hidden flex items-center gap-2">
                    <ModeToggle />
                    <button
                        onClick={toggleMenu}
                        className="text-foreground focus:outline-none"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16m-7 6h7"
                            />
                        </svg>
                    </button>
                </div>

                {/* {Navigation links (smaller screen)} */}
                <div
                    className={`md:hidden absolute top-[65px] left-0 w-full bg-background shadow-md rounded-lg transition-all duration-300 ${isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10 pointer-events-none"
                        }`}
                >
                    <div className="flex flex-col items-center justify-center gap-5 px-5 py-3">
                        <Link
                            href="/about"
                            className="cursor-pointer text-foreground hover:text-primary transition duration-200"
                        >
                            About Us
                        </Link>
                        <Link
                            href="/home"
                            className="cursor-pointer text-foreground hover:text-primary transition duration-200"
                        >
                            Mitra AI
                        </Link>
                        <Link
                            href="/mockinterview"
                            className="cursor-pointer text-foreground hover:text-primary transition duration-200"
                        >
                            Mock Interview
                        </Link>

                        <Link
                            href="/contact"
                            className="cursor-pointer text-foreground hover:text-primary transition duration-200"
                        >
                            Contact Us
                        </Link>
                        <Link href="/recruit/dashboard" className="px-4 mx-2 py-2 bg-primary text-primary-foreground rounded-full shadow-md hover:bg-primary/90 transition duration-200">
                            Recruiter
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
