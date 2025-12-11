import React from 'react';
import { Star, GitFork, BookOpen, ExternalLink, Code2, Database } from 'lucide-react';
import { GitHubRepo } from '../types';

interface RepoCardProps {
  repo: GitHubRepo;
  onClick: (repo: GitHubRepo) => void;
}

const RepoCard: React.FC<RepoCardProps> = ({ repo, onClick }) => {
  return (
    <div 
      onClick={() => onClick(repo)}
      className="tech-card group relative flex flex-col justify-between p-6 cursor-pointer overflow-hidden"
    >
      {/* Decorative Corner Brackets (CSS handled) */}
      <div className="corner-brackets"></div>
      
      {/* Top Decoration Bar */}
      <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2 text-cyan-600">
          <Database size={14} />
          <span className="font-mono text-xs uppercase tracking-wider">REP-ID.{repo.id.toString().slice(-4)}</span>
        </div>
        <div className="text-xs font-mono text-slate-400">
          {new Date(repo.updated_at).toISOString().split('T')[0]}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-cyan-600 transition-colors truncate font-mono">
          {repo.name}
        </h3>
        
        <p className="text-slate-500 text-sm mb-6 line-clamp-3 h-12 leading-relaxed">
          {repo.description || "No system description available."}
        </p>
      </div>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-xs font-mono text-slate-500 bg-slate-50 px-2 py-1 border border-slate-100">
            <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
            <span>{repo.language || 'N/A'}</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-400 text-xs font-mono">
            <span className="flex items-center space-x-1">
              <Star size={12} />
              <span>{repo.stargazers_count}</span>
            </span>
            <span className="flex items-center space-x-1">
              <GitFork size={12} />
              <span>{repo.forks_count}</span>
            </span>
          </div>
        </div>
        
        <button className="text-slate-400 hover:text-cyan-600 transition-colors">
          <ExternalLink size={16} />
        </button>
      </div>
      
      {/* Hover visual artifact */}
      <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-tl from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
    </div>
  );
};

export default RepoCard;