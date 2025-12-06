'use client';

import { useState, useRef, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { 
  Send, 
  Sparkles, 
  Github, 
  Database, 
  MessageSquare, 
  Bot, 
  CheckCircle2, 
  FileText, 
  Plus, 
  BarChart3, 
  Users, 
  Clock,
  ArrowRight,
  Loader2,
  X
} from 'lucide-react';

// --- Types ---

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'proposal' | 'market-map';
  data?: any;
}

interface MarketProposal {
  title: string;
  description: string;
  criteria: string;
  category: string;
  closingDate: string;
  estimatedSize: string;
  confidence: number;
}

// --- Components ---

function IntegrationButton({ icon: Icon, label, connected = false }: { icon: any, label: string, connected?: boolean }) {
  return (
    <button className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
      connected 
        ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
        : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
    }`}>
      <Icon className={`w-4 h-4 ${connected ? 'text-emerald-600' : 'text-slate-400'}`} />
      {label}
      {connected && <CheckCircle2 className="w-3.5 h-3.5 ml-auto" />}
    </button>
  );
}

function MarketProposalCard({ proposal, onEdit, onConfirm }: { proposal: MarketProposal, onEdit: () => void, onConfirm: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-indigo-100 shadow-lg shadow-indigo-500/5 overflow-hidden animate-in fade-in zoom-in-95 duration-300 mt-4 mb-2 max-w-lg">
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-3 border-b border-indigo-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-semibold text-indigo-900">Market Proposal</span>
        </div>
        <span className="text-xs font-medium px-2 py-0.5 bg-white rounded-full text-indigo-600 border border-indigo-100">
          {proposal.confidence}% Confidence
        </span>
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1">{proposal.title}</h3>
          <p className="text-sm text-slate-500">{proposal.description}</p>
        </div>
        
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Resolution Criteria</h4>
          <p className="text-sm text-slate-700 leading-relaxed">{proposal.criteria}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <Clock className="w-4 h-4 text-slate-400" />
            Closes: <span className="font-medium text-slate-900">{proposal.closingDate}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Users className="w-4 h-4 text-slate-400" />
            Est. Traders: <span className="font-medium text-slate-900">{proposal.estimatedSize}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
           <button 
             onClick={onEdit}
             className="flex-1 py-2 px-4 bg-white border border-slate-200 text-slate-600 font-medium rounded-lg text-sm hover:bg-slate-50 transition-colors"
           >
             Edit Details
           </button>
           <button 
             onClick={onConfirm}
             className="flex-1 py-2 px-4 bg-indigo-600 text-white font-medium rounded-lg text-sm hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/20"
           >
             Create Market
           </button>
        </div>
      </div>
    </div>
  );
}

function MarketMapNode({ label, type }: { label: string, type: 'source' | 'market' | 'outcome' }) {
    const colors = {
        source: 'bg-slate-100 border-slate-200 text-slate-600',
        market: 'bg-indigo-50 border-indigo-200 text-indigo-700',
        outcome: 'bg-emerald-50 border-emerald-200 text-emerald-700'
    };

    return (
        <div className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${colors[type]} flex items-center gap-2`}>
            {label}
        </div>
    );
}

export default function CreateMarketPage() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'assistant', 
      content: "Hi! I'm your Market Architect. I can help you design high-quality prediction markets based on your data. Connect your data sources to get started, or just describe what you want to predict." 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI processing
    setTimeout(() => {
        setIsTyping(false);
        const lowerInput = userMsg.content.toLowerCase();
        
        let responseMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: "I can help with that. Could you provide a bit more context?"
        };

        if (lowerInput.includes('github') || lowerInput.includes('issue') || lowerInput.includes('ship')) {
            responseMsg = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I see you're interested in tracking engineering velocity. Based on your GitHub data, I've drafted a market for the upcoming v2.0 release.",
                type: 'proposal',
                data: {
                    title: "Will the v2.0 Release ship to production by March 15th?",
                    description: "Tracking the main branch deployment status for the v2.0 milestone.",
                    criteria: "Market resolves YES if the v2.0 release tag is created in GitHub and deployed to production environment before 11:59 PM PST on March 15, 2024.",
                    category: "product",
                    closingDate: "Mar 15, 2024",
                    estimatedSize: "40-60 Traders",
                    confidence: 92
                }
            };
        } else if (lowerInput.includes('sales') || lowerInput.includes('revenue') || lowerInput.includes('deal')) {
             responseMsg = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Sales forecasting is critical. Based on Salesforce pipeline data, here's a proposal for Q1 revenue targets.",
                type: 'proposal',
                data: {
                    title: "Will Q1 2025 ARR exceed $5.2M?",
                    description: "Based on current pipeline of $12M with 30% weighted probability.",
                    criteria: "Resolves YES if Finance confirms recognized ARR >= $5.2M for Q1 closing March 31st.",
                    category: "sales",
                    closingDate: "Mar 31, 2025",
                    estimatedSize: "25-30 Traders",
                    confidence: 88
                }
            };
        } else if (lowerInput.includes('map') || lowerInput.includes('structure')) {
            responseMsg = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Here's a market map visualization showing how we can connect your data sources to outcome buckets.",
                type: 'market-map',
                data: {
                    sources: ['GitHub Issues', 'Jira Epics'],
                    market: 'Engineering Velocity',
                    outcomes: ['On Time', 'Delayed', 'Scope Cut']
                }
            }
        }

        setMessages(prev => [...prev, responseMsg]);
    }, 1500);
  };

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* Left Sidebar - Data & Context */}
        <div className="w-80 bg-white border-r border-slate-200 p-6 flex flex-col gap-8 hidden lg:flex overflow-y-auto">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Data Sources</h2>
            <div className="space-y-3">
              <IntegrationButton icon={Github} label="GitHub" connected={true} />
              <IntegrationButton icon={Database} label="Salesforce" />
              <IntegrationButton icon={MessageSquare} label="Slack" connected={true} />
              <button className="flex items-center gap-2 px-3 py-2 w-full rounded-lg border border-dashed border-slate-300 text-slate-500 text-sm hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                <Plus className="w-4 h-4" />
                Add Integration
              </button>
            </div>
          </div>

          <div>
             <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Market Map</h2>
             <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 min-h-[200px] relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <BarChart3 className="w-24 h-24 text-slate-400" />
                </div>
                <div className="space-y-6 relative z-10">
                    <div className="space-y-2">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase">Inputs</p>
                        <div className="flex flex-wrap gap-2">
                            <MarketMapNode label="GH: v2.0 Milestone" type="source" />
                            <MarketMapNode label="Jira: Epics" type="source" />
                        </div>
                    </div>
                    
                    <div className="flex justify-center">
                        <ArrowRight className="w-4 h-4 text-slate-300 rotate-90" />
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase">Market Structure</p>
                         <div className="flex flex-wrap gap-2">
                            <MarketMapNode label="Release Date Prediction" type="market" />
                        </div>
                    </div>
                </div>
             </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-50/50">
          <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'assistant' 
                      ? 'bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-200 shadow-md' 
                      : 'bg-slate-200'
                  }`}>
                    {msg.role === 'assistant' ? <Bot className="w-5 h-5 text-white" /> : <Users className="w-5 h-5 text-slate-500" />}
                  </div>
                  
                  <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.role === 'assistant' 
                        ? 'bg-white border border-slate-100 text-slate-700 rounded-tl-none' 
                        : 'bg-indigo-600 text-white rounded-tr-none'
                    }`}>
                      {msg.content}
                    </div>

                    {msg.type === 'proposal' && msg.data && (
                        <MarketProposalCard 
                            proposal={msg.data} 
                            onEdit={() => {}} 
                            onConfirm={() => {}} 
                        />
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-4">
                   <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-indigo-200 shadow-md">
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  </div>
                  <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-200">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSendMessage} className="relative group">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Describe the market you want to create (e.g. 'Track our v2.0 release date based on GitHub')"
                  className="w-full pl-5 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all shadow-sm text-slate-900 placeholder:text-slate-400"
                />
                <button 
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <p className="text-center text-xs text-slate-400 mt-3">
                AI can make mistakes. Review generated criteria before publishing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
