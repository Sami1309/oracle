'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Plus } from 'lucide-react';

interface GeneratedQuestion {
  question: string;
  resolution_criteria: string;
  closing_date: string;
  decision_relevance: string;
}

interface QuestionGeneratorProps {
  onSelectQuestion: (q: GeneratedQuestion) => void;
}

export function QuestionGenerator({ onSelectQuestion }: QuestionGeneratorProps) {
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<GeneratedQuestion[]>([]);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, context }),
      });
      const data = await res.json();
      setSuggestions(data.questions || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 space-y-4 border border-purple-100">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <h3 className="font-semibold text-gray-900">AI Question Generator</h3>
      </div>

      <p className="text-sm text-gray-600">
        Describe what you want to predict and let AI craft well-structured market questions.
      </p>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="What do you want to predict? (e.g., 'Q1 product launch', 'competitor pricing')"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
        />
        <textarea
          placeholder="Additional context (optional)"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          rows={2}
          className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
        />
        <button
          onClick={generate}
          disabled={!topic || loading}
          className="w-full py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Generate Questions
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-purple-200">
          <p className="text-sm font-medium text-gray-700">Suggested Questions:</p>
          {suggestions.map((q, i) => (
            <div key={i} className="bg-white rounded-lg p-4 space-y-2 border border-purple-100">
              <p className="font-medium text-gray-900">{q.question}</p>
              <p className="text-sm text-gray-500">
                <span className="font-medium">Resolution:</span> {q.resolution_criteria}
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium">Closes:</span> {q.closing_date}
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium">Why it matters:</span> {q.decision_relevance}
              </p>
              <button
                onClick={() => onSelectQuestion(q)}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Use this question
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
