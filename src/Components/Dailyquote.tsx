import React from 'react';
import { Quote } from 'lucide-react';
import type { Quote as QuoteType } from '../types/weather';

interface DailyQuoteProps {
  quote: QuoteType | null;
}

export const DailyQuote: React.FC<DailyQuoteProps> = ({ quote }) => {
  if (!quote) return null;

  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-8 mb-8 text-white transform hover:scale-[1.01] transition-all">
      <div className="flex items-start mb-4">
        <Quote className="text-white/90" size={28} />
      </div>
      <blockquote className="text-xl font-light italic mb-3 leading-relaxed">
        "{quote.text}"
      </blockquote>
      <cite className="block text-sm text-white/90 font-medium">
        — {quote.author}
      </cite>
    </div>
  );
};