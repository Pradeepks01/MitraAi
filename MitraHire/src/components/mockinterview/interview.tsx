"use client"

import React, { useEffect, useRef, useState } from 'react';
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { Camera, Mic, MicOff, StopCircle, PlayCircle, Check, X } from 'lucide-react';
import { log } from 'node:console';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

declare global {
    interface Window {
        SpeechRecognition: typeof SpeechRecognition;
        webkitSpeechRecognition: typeof SpeechRecognition;
    }

    var SpeechRecognition: {
        prototype: SpeechRecognition;
        new(): SpeechRecognition;
    };
    var webkitSpeechRecognition: {
        prototype: SpeechRecognition;
        new(): SpeechRecognition;
    };
}

interface SpeechRecognitionEvent extends Event {
    readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
    interimResults: boolean;
    continuous: boolean;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onend: (() => void) | null;
    onerror: ((event: Event) => void) | null;
    start(): void;
    stop(): void;
}

const Interview: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [transcript, setTranscript] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const [response, setResponse] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [questions, setQuestions] = useState<{ behavioral_questions: string[]; technical_questions: string[] } | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1); // Changed to -1 to indicate interview hasn't started
    const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [isInterviewComplete, setIsInterviewComplete] = useState(false);
    const [isInterviewStarted, setIsInterviewStarted] = useState(false);

    const router = useRouter();

    const handleNextQuestion = async () => {
        if (!questions) return;

        const allQuestions = [...questions.behavioral_questions, ...questions.technical_questions];
        const currentQuestion = allQuestions[currentQuestionIndex];

        // Check if there's an answer (transcript)
        if (!transcript.trim()) {
            // Show error or alert
            alert("Please provide an answer before moving to the next question.");
            return;
        }

        // Save the current answer using the transcript
        setUserAnswers((prev) => ({ ...prev, [currentQuestion]: transcript }));

        // Clear the current answer and transcript
        setCurrentAnswer('');
        setTranscript('');

        if (currentQuestionIndex < allQuestions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            // Play the next question
            fetchAndPlayAudio(`Next question: ${allQuestions[currentQuestionIndex + 1]}`);
        } else {
            setIsInterviewComplete(true);
        }
    };

    const startInterview = () => {
        setIsInterviewStarted(true);
        setCurrentQuestionIndex(0);
        // Play initial greeting and first question
        if (questions) {
            const allQuestions = [...questions.behavioral_questions, ...questions.technical_questions];
            fetchAndPlayAudio(`Let's begin with the first question: ${allQuestions[0]}`);
        }
    };

    // Save the last answer
    const allQuestions = [...(questions?.behavioral_questions || []), ...(questions?.technical_questions || [])];
    const currentQuestion = allQuestions[currentQuestionIndex];

    const updatedAnswers = { ...userAnswers, [currentQuestion]: transcript };

    const endInterview = async () => {
        // Check if there's an answer (transcript) for the current question
        localStorage.setItem('UserAnswers', JSON.stringify(updatedAnswers));
        if (!transcript.trim()) {
            alert("Please provide an answer before ending the interview.");
            return;
        }


        // Prepare data for backend
        const feedbackData = {
            userName: userName || "Anonymous",
            answers: updatedAnswers,
        };


        // Send data to the backend
        try {
            const response = await fetch('http://127.0.0.1:5000/api/interviewfeedback', { // Updated port to 5000
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(feedbackData),
            });

            if (response.ok) {
                const feedbackResponse = await response.json(); // Expected format: { summary: string, feedback: string }
                const { summary, feedback } = feedbackResponse;
                console.log("Summary : " + summary);
                console.log("FeedBack : " + feedback);

                // Store summary and feedback in local storage
                localStorage.setItem('interviewSummary', summary);
                localStorage.setItem('UserAnswers', JSON.stringify(updatedAnswers));
                localStorage.setItem('interviewFeedback', feedback);

                fetchAndPlayAudio("Thank you for completing the interview. Your responses and feedback have been saved.");

                if (summary && feedback) {
                    router.push("/mockinterview/interviewfeedback");
                } else {
                    alert('Summary and Feedback Not recived')
                }
            } else {
                throw new Error("Backend returned error");
            }
        } catch (error) {
            console.error("Error sending feedback, using mock fallback:", error);

            // Mock Fallback for Demo Mode
            const mockSummary = "Candidate demonstrated strong communication skills and good technical knowledge of React. Needs improvement in system design concepts.";
            const mockFeedback = "Good use of STAR method for behavioral questions. Technical answers were accurate but could be more detailed.";

            localStorage.setItem('interviewSummary', mockSummary);
            localStorage.setItem('UserAnswers', JSON.stringify(updatedAnswers));
            localStorage.setItem('interviewFeedback', mockFeedback);

            fetchAndPlayAudio("Thank you for completing the interview. Your responses have been saved (Demo Mode).");
            router.push("/mockinterview/interviewfeedback");
        }

        setIsInterviewComplete(true);
    };

    const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const userData = user ? JSON.parse(user) : null;

    const userName = userData?.name;

    const startVideoStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("Error accessing camera");
        }
    };

    const initializeSpeechRecognition = () => {
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.interimResults = true;
                recognition.continuous = true;

                recognition.onresult = (event: SpeechRecognitionEvent) => {
                    const result = event.results[event.results.length - 1][0].transcript;
                    setTranscript(result);
                };

                recognition.onend = () => setIsRecording(false);
                recognition.onerror = (event: any) => {
                    console.error("Speech recognition error:", event.error);
                    if (event.error === 'network') {
                        setError("Network error: Speech recognition service unavailable. Please check your connection.");
                        setIsRecording(false);
                    } else if (event.error === 'not-allowed') {
                        setError("Microphone access denied. Please check permission.");
                        setIsRecording(false);
                    } else if (event.error === 'aborted') {
                        // Ignore aborted, user likely stopped it
                        setIsRecording(false);
                    } else if (event.error === 'no-speech') {
                        console.warn("No speech detected.");
                        setIsRecording(false);
                    }
                };

                recognitionRef.current = recognition;
            } else {
                console.error("SpeechRecognition API not supported.");
                setError("SpeechRecognition API not supported");
            }
        } catch (err) {
            console.error("Error initializing speech recognition:", err);
            setError("Error initializing speech recognition");
        }
    };

    const startRecording = () => {
        if (isRecording) return; // Prevent starting if already recording

        try {
            if (recognitionRef.current) {
                recognitionRef.current.start();
                setIsRecording(true);
            }
        } catch (err: any) {
            // Ignore error if recognition is already started
            if (err.name !== 'InvalidStateError') {
                console.error("Error starting speech recognition:", err);
                setError("Error starting speech recognition");
            } else {
                console.warn("Speech recognition already started.");
                setIsRecording(true);
            }
        }
    };

    const stopRecording = () => {
        try {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
                setIsRecording(false);
            }
        } catch (err) {
            console.error("Error stopping speech recognition:", err);
            setError("Error stopping speech recognition");
        }
    };

    const generateAiResponse = async () => {

    };

    const fetchAndPlayAudio = async (text: string) => {
        try {
            const voiceId = 'cgSgspJ2msm6clMCkdW9';
            const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`;
            const apiKey = 'sk_5bcd751ebc64ba0cadd28e20a6e759774e10141b75676d2b';

            const data = { text, voice_settings: { stability: 0.1, similarity_boost: 0.3 } };
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'xi-api-key': apiKey },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                console.error(`ElevenLabs API Error: ${response.status} ${response.statusText}`);
                // Optional: Fallback to browser TTS or just silent fail
                return;
            }

            const arrayBuffer = await response.arrayBuffer();
            const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(blob);
            const audio = new Audio(audioUrl);
            audio.play();

            // Optional: Cleanup
            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
            };

        } catch (error) {
            console.error("Error playing audio:", error);
        }
    };

    const isInitializedRef = useRef(false);
    useEffect(() => {

        if (isInitializedRef.current) return; // Prevent repeated execution

        isInitializedRef.current = true;

        initializeSpeechRecognition();
        startVideoStream();

        // Fetch and play a greeting message
        if (userName) {
            fetchAndPlayAudio(`Hello ${userName}, welcome to the Interview and we will start it in few seconds`);
        } else {
            fetchAndPlayAudio(`Hello , welcome to the Interview and we will start it in few seconds`);
        }

        const mockQuestions = localStorage.getItem("mockQuestions");
        if (mockQuestions) {
            setQuestions(JSON.parse(mockQuestions));
        } else {
            alert("No questions found. Please ensure questions are loaded.");
        }

        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);


    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col pt-20">
            <div className="container mx-auto px-4 py-6 flex-grow flex flex-col">
                <div className="grid md:grid-cols-2 gap-6 flex-grow">
                    {/* Video Section - Full Height */}
                    <Card className="flex flex-col overflow-hidden shadow-lg h-[600px] bg-black">
                        <div className="flex-grow relative w-full h-full">
                            <video
                                ref={videoRef}
                                autoPlay
                                muted
                                className="absolute top-0 left-0 w-full h-full object-cover"
                            />
                            {error && (
                                <div className="absolute inset-0 bg-destructive/10 flex items-center justify-center text-destructive p-4">
                                    {error}
                                </div>
                            )}
                        </div>

                        {/* Enhanced Transcript Overlay */}
                        <div className="bg-black/80 text-white p-4 text-center min-h-[100px] flex items-center justify-center border-t border-white/10">
                            <div className="max-h-24 overflow-y-auto w-full">
                                {transcript || <span className="text-gray-400 italic">Waiting for your response...</span>}
                            </div>
                        </div>
                    </Card>

                    {/* Interview Control Section */}
                    <div className="flex flex-col space-y-6">
                        {/* Question Display with Progress */}
                        <Card className="flex-grow flex flex-col shadow-lg border-primary/20">
                            <CardHeader className="flex flex-row justify-between items-center pb-2">
                                <CardTitle className="text-xl font-bold text-primary">
                                    {!isInterviewStarted
                                        ? "Interview Preparation"
                                        : isInterviewComplete
                                            ? "Interview Completed"
                                            : "Current Question"}
                                </CardTitle>
                                {questions && (
                                    <div className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">
                                        Question {currentQuestionIndex + 1} of {questions.behavioral_questions.length + questions.technical_questions.length}
                                    </div>
                                )}
                            </CardHeader>

                            <CardContent className="flex-grow flex flex-col justify-center">
                                {isInterviewStarted && questions && currentQuestionIndex >= 0 && (
                                    <p className="text-2xl font-medium leading-relaxed text-center">
                                        {[...questions.behavioral_questions, ...questions.technical_questions][currentQuestionIndex]}
                                    </p>
                                )}

                                {!isInterviewStarted && (
                                    <div className="text-center space-y-4">
                                        <p className="text-muted-foreground text-lg">
                                            Prepare for a comprehensive interview experience.
                                            Click <span className="font-bold text-foreground">Start Interview</span> to begin your professional assessment.
                                        </p>
                                    </div>
                                )}

                                {isInterviewComplete && (
                                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                            <Check className="text-green-600 dark:text-green-400 w-8 h-8" />
                                        </div>
                                        <p className="text-lg font-medium text-green-600 dark:text-green-400">
                                            Thank you for completing the interview.
                                            Your responses have been recorded and will be reviewed.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="flex justify-center items-center p-6 shadow-lg bg-card/50 backdrop-blur">
                            <div className="relative w-32 h-32">
                                <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
                                <div className="absolute inset-0 flex justify-center items-center">
                                    <div className="absolute w-full h-full bg-primary/10 rounded-full animate-ping"></div>
                                </div>

                                <div className="relative z-10 w-32 h-32 bg-gradient-to-br from-primary to-primary/80 rounded-full flex justify-center items-center shadow-xl">
                                    <span className="text-primary-foreground text-xl font-bold tracking-wider">
                                        Mitra AI
                                    </span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Enhanced Control Buttons */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {!isInterviewStarted && !isInterviewComplete && (
                        <Button
                            onClick={startInterview}
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-700 text-white w-full h-14 text-lg"
                        >
                            <PlayCircle className="mr-2 h-5 w-5" /> Start Interview
                        </Button>
                    )}

                    {isInterviewStarted && !isInterviewComplete && currentQuestionIndex < (questions ? [...questions.behavioral_questions, ...questions.technical_questions].length - 1 : 0) && (
                        <Button
                            onClick={handleNextQuestion}
                            size="lg"
                            className="w-full h-14 text-lg"
                        >
                            <Check className="mr-2 h-5 w-5" /> Next Question
                        </Button>
                    )}

                    {isInterviewStarted && !isInterviewComplete && currentQuestionIndex === (questions ? [...questions.behavioral_questions, ...questions.technical_questions].length - 1 : 0) && (
                        <Button
                            onClick={endInterview}
                            size="lg"
                            variant="destructive"
                            className="w-full h-14 text-lg"
                        >
                            <X className="mr-2 h-5 w-5" /> End Interview
                        </Button>
                    )}

                    <Button
                        onClick={startRecording}
                        disabled={isRecording || !isInterviewStarted || isInterviewComplete}
                        variant={isRecording ? "secondary" : "default"}
                        className={`w-full h-14 text-lg ${!isRecording && isInterviewStarted && !isInterviewComplete ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
                    >
                        <Mic className="mr-2 h-5 w-5" />
                        {isRecording ? 'Recording...' : 'Start Recording'}
                    </Button>

                    <Button
                        onClick={stopRecording}
                        disabled={!isRecording || !isInterviewStarted || isInterviewComplete}
                        variant="destructive"
                        className="w-full h-14 text-lg"
                    >
                        <MicOff className="mr-2 h-5 w-5" /> Stop Recording
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Interview;
