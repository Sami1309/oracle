'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { QuestionGenerator } from '@/components/ai/QuestionGenerator';
import { Calendar, CheckCircle } from 'lucide-react';

export default function AdminPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('product');
  const [resolutionCriteria, setResolutionCriteria] = useState('');
  const [closesAt, setClosesAt] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSelectQuestion = (q: { question: string; resolution_criteria: string; closing_date: string; decision_relevance: string }) => {
    setTitle(q.question);
    setResolutionCriteria(q.resolution_criteria);
    setDescription(q.decision_relevance);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setTitle('');
      setDescription('');
      setResolutionCriteria('');
      setClosesAt('');
    }, 3000);
  };

  return (
    <AppLayout>
      <div className="p-8">
        {/* Success Toast */}
        {showSuccess && (
          <div className="fixed top-20 right-8 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Market created successfully!
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Market</h1>
          <p className="text-gray-500 mb-8">Set up a new prediction market for your team</p>

          <div className="grid grid-cols-2 gap-8">
            {/* AI Question Generator */}
            <QuestionGenerator onSelectQuestion={handleSelectQuestion} />

            {/* Manual Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h3 className="font-semibold text-gray-900 mb-4">Market Details</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Will we ship X by Y date?"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional context about this prediction"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="product">Product</option>
                  <option value="sales">Sales</option>
                  <option value="competitor">Competitor</option>
                  <option value="hiring">Hiring</option>
                  <option value="fun">Fun</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resolution Criteria
                </label>
                <textarea
                  value={resolutionCriteria}
                  onChange={(e) => setResolutionCriteria(e.target.value)}
                  placeholder="How will this market be resolved?"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Closing Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={closesAt}
                    onChange={(e) => setClosesAt(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors mt-4"
              >
                Create Market
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
