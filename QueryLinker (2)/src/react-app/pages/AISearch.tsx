import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Clock, BookOpen, FileText, ExternalLink, Sparkles } from 'lucide-react';
import { performSearch, useRecentSearches, useMutation, incrementArticleViews } from '@/react-app/hooks/useApi';



const quickFilters = [
  { name: 'All Sources', value: 'all', active: true },
  { name: 'Knowledge Base', value: 'kb', active: false },
  { name: 'Tickets', value: 'tickets', active: false },
  { name: 'Documentation', value: 'docs', active: false },
  { name: 'Recent', value: 'recent', active: false }
];

export default function AISearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [filters, setFilters] = useState(quickFilters);
  const { data: recentSearches, refetch: refetchRecentSearches } = useRecentSearches();
  const { mutate: search, loading: isSearching } = useMutation(performSearch);
  const { mutate: incrementViews } = useMutation(incrementArticleViews);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setHasSearched(true);
    const result = await search({
      query: query.trim(),
      limit: 20
    });
    
    if (result) {
      setSearchResults(result.results || []);
      await refetchRecentSearches();
    }
  };

  const handleResultClick = async (result: any) => {
    if (result.source === 'knowledge_base' && result.id) {
      await incrementViews(result.id);
    }
    // Open result in new tab or navigate to detail view
    window.open(`#/knowledge/${result.id}`, '_blank');
  };

  const updateFilter = (value: string) => {
    setFilters(filters.map(f => ({ ...f, active: f.value === value })));
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <BookOpen className="w-4 h-4" />;
      case 'ticket':
        return <FileText className="w-4 h-4" />;
      case 'documentation':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Sparkles className="w-8 h-8 text-purple-400" />
          <h1 className="text-3xl font-bold text-white">AI Search</h1>
        </div>
        <p className="text-gray-300 text-lg">Search across all your connected systems with AI-powered intelligence</p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="relative max-w-3xl mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
            placeholder="Ask anything about your systems, tickets, or knowledge base..."
            className="w-full pl-12 pr-16 py-4 bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 backdrop-blur-sm text-lg"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSearch(searchQuery)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl text-white font-medium hover:shadow-lg transition-all duration-200"
          >
            Search
          </motion.button>
        </div>
      </motion.div>

      {/* Quick Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-center space-x-2 mb-8 flex-wrap gap-2"
      >
        <Filter className="w-4 h-4 text-gray-400 mr-2" />
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => updateFilter(filter.value)}
            className={`px-4 py-2 rounded-xl transition-all duration-200 ${
              filter.active
                ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30'
                : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            {filter.name}
          </button>
        ))}
      </motion.div>

      {!hasSearched && (
        <>
          {/* Recent Searches */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-gray-400" />
              <span>Recent Searches</span>
            </h3>
            <div className="flex flex-wrap gap-3">
              {(recentSearches || []).map((search, index) => (
                <motion.button
                  key={search}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  onClick={() => {
                    setSearchQuery(search);
                    handleSearch(search);
                  }}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  {search}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Search Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Search Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
              <div>
                <h4 className="font-medium text-white mb-2">Natural Language</h4>
                <p className="text-sm">"How do I reset a password in Jira?"</p>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Specific Tickets</h4>
                <p className="text-sm">"Show me ticket JIRA-1234"</p>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Error Messages</h4>
                <p className="text-sm">"Connection timeout error 500"</p>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">System Status</h4>
                <p className="text-sm">"What's the status of GitHub integration?"</p>
              </div>
            </div>
          </motion.div>
        </>
      )}

      {/* Search Results */}
      {isSearching && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-300">Searching across all systems...</p>
        </motion.div>
      )}

      {hasSearched && !isSearching && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">
              Found {searchResults.length} results for "{searchQuery}"
            </h3>
            <p className="text-gray-400 text-sm">Search completed in 0.8s</p>
          </div>

          {searchResults.map((result, index) => (
            <motion.div
              key={result.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-200 cursor-pointer"
              onClick={() => handleResultClick(result)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-black/20 text-purple-400`}>
                    {getSourceIcon(result.source === 'knowledge_base' ? 'article' : 'documentation')}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold hover:text-purple-400 cursor-pointer">
                      {result.title}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                      <span className="text-purple-400">{result.source.replace('_', ' ')}</span>
                      <span>•</span>
                      <span className="text-green-400">{result.rating || 4.5}★</span>
                      {result.views && (
                        <>
                          <span>•</span>
                          <span>{result.views} views</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              
              <p className="text-gray-300 mb-4 line-clamp-2">{result.content}</p>
              
              <div className="flex items-center space-x-2">
                {result.category && (
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                    {result.category}
                  </span>
                )}
                {typeof result.tags === 'string' && JSON.parse(result.tags || '[]').map((tag: string) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
