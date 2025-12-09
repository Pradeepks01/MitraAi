import React from 'react';

interface EvaluationResult {
  match_score: number;
  perplexity: number;
  feedback: string;
  timestamp: string;
}

interface ResultDisplayProps {
  result: EvaluationResult;
}

export default function ResultDisplay({ result }: ResultDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Evaluation Results</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="font-semibold">Match Score:</p>
          <p className={`text-3xl font-bold ${getScoreColor(result.match_score)}`}>
            {result.match_score}%
          </p>
        </div>
        <div>
          <p className="font-semibold">Perplexity:</p>
          <p className="text-xl">{result.perplexity}</p>
        </div>
        <div className="md:col-span-2">
          <p className="font-semibold">Feedback:</p>
          <p className="text-gray-700">{result.feedback}</p>
        </div>
        <div className="md:col-span-2 text-sm text-gray-500">
          <p>Evaluated at: {new Date(result.timestamp).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}