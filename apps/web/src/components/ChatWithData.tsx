"use client";

import { useState, useRef, useEffect } from 'react';
import { chatWithData } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant' | 'error';
  content: string;
  sql?: string;
  results?: any[];
}

export default function ChatWithData() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);
    const currentQuestion = question;
    setQuestion('');
    setLoading(true);

    try {
      const response = await chatWithData(currentQuestion);
      
      // Create a natural language summary
      let summary = '';
      if (response.results && response.results.length > 0) {
        summary = `I found ${response.results.length} result${response.results.length !== 1 ? 's' : ''} for your query.`;
      } else {
        summary = 'No results found for your query.';
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: summary,
        sql: response.sql,
        results: response.results
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'error',
        content: error instanceof Error ? error.message : 'Failed to process query'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Chat with Your Data</h2>
        <p className="text-gray-500 mt-1">Ask questions in natural language</p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 bg-white rounded-lg shadow p-6 overflow-y-auto mb-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg mb-4">👋 Start a conversation!</p>
            <p className="text-sm">Try asking:</p>
            <ul className="text-sm mt-2 space-y-1">
              <li>"Show me all invoices from last month"</li>
              <li>"What's my total spending?"</li>
              <li>"List top 5 vendors by amount"</li>
              <li>"How many invoices are there?"</li>
              <li>"Show me invoices over $1000"</li>
            </ul>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx}>
                {/* User Message */}
                {msg.role === 'user' && (
                  <div className="flex justify-end">
                    <div className="bg-[#5B47FB] text-white rounded-lg px-4 py-3 max-w-[80%]">
                      <div className="font-medium text-sm mb-1">You</div>
                      <div className="text-sm">{msg.content}</div>
                    </div>
                  </div>
                )}

                {/* Assistant Message */}
                {msg.role === 'assistant' && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-4 py-3 max-w-[90%]">
                      <div className="font-medium text-sm mb-2 text-gray-900">🤖 AI Assistant</div>
                      <div className="text-sm text-gray-700 mb-3">{msg.content}</div>
                      
                      {/* SQL Query Display */}
                      {msg.sql && (
                        <div className="mb-3">
                          <div className="text-xs font-semibold text-gray-600 mb-1">Generated SQL:</div>
                          <div className="bg-gray-800 text-green-400 rounded p-2 text-xs font-mono overflow-x-auto">
                            {msg.sql}
                          </div>
                        </div>
                      )}

                      {/* Results Table */}
                      {msg.results && msg.results.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs font-semibold text-gray-600 mb-2">
                            Results ({msg.results.length} row{msg.results.length !== 1 ? 's' : ''}):
                          </div>
                          <div className="overflow-x-auto max-h-96 overflow-y-auto border border-gray-300 rounded">
                            <table className="min-w-full divide-y divide-gray-200 text-xs">
                              <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                  {Object.keys(msg.results[0]).map((key) => (
                                    <th
                                      key={key}
                                      className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                                    >
                                      {key}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {msg.results.map((row, rowIdx) => (
                                  <tr key={rowIdx} className="hover:bg-gray-50">
                                    {Object.values(row).map((value: any, colIdx) => (
                                      <td key={colIdx} className="px-3 py-2 whitespace-nowrap text-gray-900">
                                        {value === null || value === undefined
                                          ? '-'
                                          : typeof value === 'object'
                                          ? JSON.stringify(value)
                                          : String(value)}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {msg.role === 'error' && (
                  <div className="flex justify-start">
                    <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 max-w-[80%]">
                      <div className="font-medium text-sm mb-1">⚠️ Error</div>
                      <div className="text-sm">{msg.content}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
        
        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start mt-4">
            <div className="bg-gray-100 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-[#5B47FB] border-t-transparent rounded-full"></div>
                <span className="text-sm text-gray-600">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="flex gap-2 p-4">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about your invoices..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B47FB] focus:border-transparent text-sm"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="px-6 py-3 bg-[#5B47FB] text-white rounded-lg hover:bg-[#4936E8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}
