import { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@shared/ui';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Navigate to search results or Quran page
      navigate(`/quran?search=${encodeURIComponent(query)}`);
    }
  };

  const handleAISearch = () => {
    navigate('/ai');
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      {/* Search Input */}
      <div className="flex-1 relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по Корану, книгам, урокам..."
          className="
            w-full h-12 pl-12 pr-4
            glass rounded-lg
            text-text-primary placeholder-text-tertiary
            border border-card-border
            focus:outline-none focus-ring
            transition-all duration-base
          "
        />
      </div>

      {/* AI Search Button */}
      <Button
        type="button"
        variant="primary"
        onClick={handleAISearch}
        className="h-12 px-6 shrink-0"
      >
        <Sparkles className="w-5 h-5" />
        <span className="hidden sm:inline">AI Поиск</span>
      </Button>
    </form>
  );
}
