'use client';

import { useState } from 'react';
import { MessageSquare, ThumbsUp, Send, User } from 'lucide-react';
import { Comment, getCommentsByMarketId } from '@/lib/users-data';

interface DiscussionThreadProps {
  marketId: string;
}

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function DiscussionThread({ marketId }: DiscussionThreadProps) {
  const [comments, setComments] = useState<Comment[]>(getCommentsByMarketId(marketId));
  const [newComment, setNewComment] = useState('');
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      marketId,
      userId: 'user-1',
      userName: 'Demo User',
      userAvatar: 'DU',
      userDepartment: 'Engineering',
      content: newComment,
      createdAt: new Date().toISOString(),
      likes: 0,
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  const handleLike = (commentId: string) => {
    if (likedComments.has(commentId)) {
      likedComments.delete(commentId);
      setLikedComments(new Set(likedComments));
      setComments(comments.map(c =>
        c.id === commentId ? { ...c, likes: c.likes - 1 } : c
      ));
    } else {
      setLikedComments(new Set(likedComments.add(commentId)));
      setComments(comments.map(c =>
        c.id === commentId ? { ...c, likes: c.likes + 1 } : c
      ));
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Discussion</h3>
          <span className="text-sm text-gray-500">({comments.length})</span>
        </div>
      </div>

      {/* New Comment Form */}
      <form onSubmit={handleSubmit} className="p-4 border-b border-gray-100">
        <div className="flex gap-3">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-semibold text-indigo-600 flex-shrink-0">
            DU
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your insights or analysis..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Post
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="divide-y divide-gray-50">
        {comments.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No comments yet. Be the first to share your analysis!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="p-4 hover:bg-gray-50/50 transition-colors">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-semibold text-gray-600 flex-shrink-0">
                  {comment.userAvatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 text-sm">{comment.userName}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{comment.userDepartment}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">{timeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <button
                      onClick={() => handleLike(comment.id)}
                      className={`flex items-center gap-1 text-xs transition-colors ${
                        likedComments.has(comment.id)
                          ? 'text-indigo-600'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{comment.likes}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
