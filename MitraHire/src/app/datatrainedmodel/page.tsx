'use client';

import ResultDisplay from '@/components/datatrainedmodel/ResultDisplay';
import ResumeForm from '@/components/datatrainedmodel/ResumeForm';
import React, { useState } from 'react';


interface EvaluationResult {
  match_score: number;
  perplexity: number;
  feedback: string;
  timestamp: string;
}

export default function ResumePage() {
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEvaluate = async (resume: string, jobDescription: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:5001/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume,
          job_description: jobDescription
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Evaluation failed');
      }

      const data: EvaluationResult = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center text-gray-900">
          Resume Evaluation Tool
        </h1>
        <ResumeForm 
          onEvaluate={handleEvaluate} 
          isLoading={isLoading}
        />
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            {error}
          </div>
        )}
        {result && <ResultDisplay result={result} />}
      </div>
    </div>
  );
}