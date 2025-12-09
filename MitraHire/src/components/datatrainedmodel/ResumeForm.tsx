import React, { useState } from 'react';

interface ResumeFormProps {
  onEvaluate: (resume: string, jobDescription: string) => Promise<void>;
  isLoading: boolean;
}

export default function ResumeForm({ onEvaluate, isLoading }: ResumeFormProps) {
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEvaluate(resume, jobDescription);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div className="mb-4">
        <label htmlFor="resume" className="block text-gray-700 text-sm font-bold mb-2">
          Resume
        </label>
        <textarea
          id="resume"
          value={resume}
          onChange={(e) => setResume(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-40"
          placeholder="Paste your resume here..."
          required
        />
      </div>
      <div className="mb-6">
        <label htmlFor="job-description" className="block text-gray-700 text-sm font-bold mb-2">
          Job Description
        </label>
        <textarea
          id="job-description"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-40"
          placeholder="Paste the job description here..."
          required
        />
      </div>
      <div className="flex items-center justify-center">
        <button
          type="submit"
          disabled={isLoading}
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline 
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Evaluating...' : 'Evaluate Resume'}
        </button>
      </div>
    </form>
  );
}