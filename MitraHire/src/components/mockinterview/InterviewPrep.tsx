import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig"; // Adjust the import to your Firebase config

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";

export const InterviewPreparation = async (
    jobDescription: string,
    jobRole: string,
    selectedFile: File | null,
    setResponseMessage: React.Dispatch<React.SetStateAction<string | null>>
): Promise<boolean> => {
    if (!jobDescription && !jobRole) {
        setResponseMessage("Please enter a job role and description.");
        return false;
    }

    setResponseMessage('Analysing resume and Job Details and Generating Mock Interview.....!');

    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    formData.append("jobRole", jobRole || "General Role"); // provide default

    if (selectedFile) {
        formData.append("file", selectedFile);
    }

    const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const userData = user ? JSON.parse(user) : null;
    if (!userData) {
        setResponseMessage("No user data found in localStorage.");
        return false;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/generatemockquestions`, {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            const data = await response.json();
            setResponseMessage("Interview preparation successful!");

            if (typeof window !== "undefined") {
                localStorage.setItem("mockQuestions", JSON.stringify(data));
            }

            try {
                const userDocRef = doc(db, "applicants", userData.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    await updateDoc(userDocRef, {
                        questions: data,
                        lastUpdated: new Date(),
                    });
                }
            } catch (fsError) {
                console.warn("Firestore update failed (Offline Mode?):", fsError);
            }
            return true;
        } else {
            const errorData = await response.json();
            setResponseMessage(errorData.message || "An error occurred.");
            return false;
        }
    } catch (error) {
        console.error("Backend Error:", error);
        setResponseMessage("Backend unreachable. Using Mock Questions.");

        const mockQuestions = {
            "technical_questions": [
                "Can you explain the difference between REST and GraphQL?",
                "How do you handle state management in a large React application?"
            ],
            "behavioral_questions": [
                "Describe a time you had a conflict with a team member and how you resolved it.",
                "Tell me about a project where you had to learn a new technology quickly."
            ]
        };

        if (typeof window !== "undefined") {
            localStorage.setItem("mockQuestions", JSON.stringify(mockQuestions));
        }
        return true;
    }
};
