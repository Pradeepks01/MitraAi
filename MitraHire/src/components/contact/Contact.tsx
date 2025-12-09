"use client";
import React from "react";

const ContactPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#eef4fa] to-[#fdfefe] py-[150px] px-4">
            <div className="w-full max-w-4xl bg-white shadow-lg rounded-2xl flex flex-col md:flex-row items-center px-6 py-10 hover:shadow-2xl transition duration-300">
                {/* Photo Section */}
                <div className="w-full md:w-1/3 flex justify-center items-center mb-8 md:mb-0">
                    <img
                        src="/myphoto.jpg" // Replace with your photo path
                        alt="Pradeep KS."
                        className="w-[250px] md:w-[350px] rounded-[20px] shadow-md hover:scale-105 transition duration-300"
                    />
                </div>

                {/* Contact Information */}
                <div className="w-full md:w-2/3 md:pl-8 text-center md:text-left">
                    <h2 className="text-3xl font-bold text-[#2b4b77] mb-4">
                        Pradeep K S
                    </h2>
                    <p className="text-lg text-gray-600 mb-6">
                        Feel free to reach out to me anytime!
                    </p>
                    <div className="space-y-3">
                        <div className="flex flex-col md:flex-row items-center md:items-start">
                            <span className="text-[#2f88ff] font-bold w-28 md:text-left">
                                Email:
                            </span>
                            <a
                                href="mailto:pradeepks7483@gmail.com"
                                className="text-gray-700 hover:text-[#2f88ff] transition duration-200"
                            >
                                pradeepks7483@gmail.com
                            </a>
                        </div>
                        <div className="flex flex-col md:flex-row items-center md:items-start">
                            <span className="text-[#2f88ff] font-bold w-28 md:text-left">
                                Phone:
                            </span>
                            <a
                                href="tel:+917483401010"
                                className="text-gray-700 hover:text-[#2f88ff] transition duration-200"
                            >
                                +91 7483401010
                            </a>
                        </div>
                        <div className="flex flex-col md:flex-row items-center md:items-start">
                            <span className="text-[#2f88ff] font-bold w-28 md:text-left">
                                LinkedIn:
                            </span>
                            <a
                                href="https://www.linkedin.com/in/pradeep-ks-77768732b/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-700 hover:text-[#2f88ff] transition duration-200"
                            >
                                linkedin.com/in/pradeep-ks-77768732b
                            </a>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-8 flex justify-center md:justify-start space-x-4">
                        <a
                            href="/path-to-resume.pdf" // Replace with your resume link
                            download
                            className="px-6 py-3 bg-[#2f88ff] text-white font-bold rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition duration-300 glow-animation"
                        >
                            Resume
                        </a>
                        
                    </div>
                </div>
            </div>

            {/* Glowing Button Animation */}
            <style jsx>{`
                .glow-animation {
                    position: relative;
                    overflow: hidden;
                }
                .glow-animation:hover::before {
                    content: "";
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(255, 255, 255, 0.5) 10%, transparent 70%);
                    animation: glow 1.5s infinite alternate;
                }
                @keyframes glow {
                    from {
                        transform: translate(-30%, -30%) scale(0.8);
                    }
                    to {
                        transform: translate(-30%, -30%) scale(1.1);
                    }
                }
            `}</style>
        </div>
    );
};

export default ContactPage;
