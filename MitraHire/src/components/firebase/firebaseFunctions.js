import { db, storage } from "./firebaseConfig"; // Correct import for Firestore and Storage
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Creates a new project under a recruiter.
 */
export const createProject = async (recruiterId, projectName) => {
  try {
    const projectRef = await addDoc(
      collection(db, "recruiters", recruiterId, "projects"), // Use db instead of firestore
      {
        name: projectName,
        createdAt: new Date().toISOString(),
      }
    );
    return projectRef.id;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

/**
 * Uploads a resume to Firebase Storage and saves metadata in Firestore.
 */
export const uploadResume = async (
  recruiterId,
  projectId,
  file,
  applicantName
) => {
  try {
    const sanitizedFileName = `${applicantName.replace(
      /\s+/g,
      "_"
    )}_${Date.now()}.pdf`;
    const storagePath = `recruiter/${recruiterId}/${projectId}/${sanitizedFileName}`;

    const storageRef = ref(storage, storagePath);
    const uploadResult = await uploadBytes(storageRef, file);

    const downloadURL = await getDownloadURL(uploadResult.ref);

    // Save metadata in Firestore
    await addDoc(
      collection(
        db, // Use db instead of firestore
        "recruiters",
        recruiterId,
        "projects",
        projectId,
        "resumes"
      ),
      {
        applicantName,
        fileName: sanitizedFileName,
        downloadURL,
        uploadedAt: new Date().toISOString(),
      }
    );

    return downloadURL;
  } catch (error) {
    console.error("Error uploading resume:", error);
    throw error;
  }
};
