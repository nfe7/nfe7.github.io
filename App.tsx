import React, { useState, useEffect } from 'react';
import { 
  Github, 
  ArrowLeft, 
  Code, 
  FileJson, 
  FileText, 
  Loader2, 
  Folder,
  User,
  ExternalLink,
  Cpu,
  Terminal,
  Activity,
  Search,
  Database,
  ImageIcon
} from 'lucide-react';
import { fetchUserRepos, fetchRepoContents, fetchRawFile } from './services/githubService';
import RepoCard from './components/RepoCard';
import NotebookRenderer from './components/NotebookRenderer';
import MarkdownRenderer from './components/MarkdownRenderer';
import { GitHubRepo, GitHubFile, JupyterNotebook } from './types';

// --- PERSONAL CONFIGURATION ---
const PERSONAL_INFO = {
  name: "Nick Feng",
  githubUsername: "nfe7",
  bio: "Passionate developer focusing on clean code, scalable architecture, and building intuitive user experiences.",
  // INSTRUCTIONS FOR PROFILE PICTURE:
  // Option 1 (Easiest): Place 'profile.jpg' in the 'public' folder of this website repo, then set this to "/profile.jpg"
  // Option 2 (External): Upload image to any public URL (or another GitHub repo) and paste the raw link here.
  profileImage: "", 
  social: {
    linkedin: "https://linkedin.com",
    github: "https://github.com/nfe7"
  }
};

const SKILLS = [
  { name: "PYTHON", version: "3.12", status: "OPTIMIZED" },
  { name: "TYPESCRIPT", version: "5.3", status: "ACTIVE" },
  { name: "REACT", version: "19.0", status: "ACTIVE" },
  { name: "TENSORFLOW", version: "2.15", status: "LOADING" },
  { name: "TAILWIND", version: "3.4", status: "STABLE" },
  { name: "NEXT.JS", version: "14.1", status: "DETECTED" },
];

// --- LOGO COMPONENT ---
const Logo = ({ className = "h-10 w-10" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="15" y="10" width="20" height="80" rx="2" fill="#334155" />
    <path d="M 35 15 L 65 85 L 50 85 L 35 15 Z" fill="#334155" />
    <rect x="55" y="10" width="20" height="80" rx="2" fill="#0284c7" />
    <path d="M 75 10 H 95 V 30 H 75 V 10 Z" fill="#0284c7" />
    <path d="M 70 10 Q 75 10 75 15 V 25 Q 75 30 70 30 Z" fill="#0284c7" />
    <path d="M 75 45 H 90 V 60 H 75 V 45 Z" fill="#0284c7" />
    <rect x="55" y="10" width="20" height="80" rx="2" fill="url(#blue-gradient)" fillOpacity="0.2" />
    <defs>
      <linearGradient id="blue-gradient" x1="55" y1="10" x2="75" y2="90" gradientUnits="userSpaceOnUse">
        <stop stopColor="white" stopOpacity="0.3"/>
        <stop offset="1" stopColor="black" stopOpacity="0.1"/>
      </linearGradient>
    </defs>
  </svg>
);

// --- PROFILE IMAGE COMPONENT ---
const ProfileImage = () => (
  <div className="relative inline-block group">
    <div className="w-32 h-32 md:w-40 md:h-40 mx-auto border-2 border-slate-200 bg-slate-50 relative overflow-hidden group-hover:border-cyan-400 transition-colors shadow-inner rounded-full md:rounded-lg">
      {PERSONAL_INFO.profileImage ? (
        <>
          <img src={PERSONAL_INFO.profileImage} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="Profile" />
          {/* Scanning line effect */}
          <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-scan opacity-0 group-hover:opacity-100"></div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-slate-300">
          <User size={48} strokeWidth={1} />
          <span className="text-[10px] font-mono mt-2 tracking-widest text-slate-400">NO_IMAGE</span>
        </div>
      )}
      {/* Tech overlays */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none mix-blend-overlay"></div>
    </div>
  </div>
);

// --- HELPER COMPONENTS ---

const Loading = ({ text = "INITIALIZING..." }: { text?: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] text-cyan-600 animate-in fade-in duration-500">
    <div className="relative mb-6">
      <Loader2 className="h-12 w-12 animate-spin absolute text-cyan-200" />
      <Logo className="h-12 w-12 animate-pulse relative z-10" />
    </div>
    <span className="font-mono text-sm tracking-[0.2em] uppercase animate-pulse text-slate-500">{text}</span>
  </div>
);

const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="p-4 rounded-none border-l-4 border-red-500 bg-red-50 text-red-700 font-mono my-8">
    <span className="font-bold mr-2">[ERROR]</span> {message}
  </div>
);

// --- MAIN APP COMPONENT ---

function App() {
  const [activeSection, setActiveSection] = useState<'landing' | 'projects' | 'about'>('landing');
  const [projectState, setProjectState] = useState<'list' | 'detail' | 'notebook' | 'markdown'>('list');
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [repoFiles, setRepoFiles] = useState<GitHubFile[]>([]);
  const [repoReadme, setRepoReadme] = useState<string | null>(null);
  const [repoCoverImage, setRepoCoverImage] = useState<string | null>(null);
  const [selectedNotebook, setSelectedNotebook] = useState<JupyterNotebook | null>(null);
  const [selectedMarkdown, setSelectedMarkdown] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRepos(PERSONAL_INFO.githubUsername);
  }, []);

  const loadRepos = async (userToFetch: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUserRepos(userToFetch);
      setRepos(data);
    } catch (err) {
      console.error(err);
      setError("Could not retrieve portfolio data.");
    } finally {
      setLoading(false);
    }
  };

  const loadRepoContents = async (repo: GitHubRepo, path: string = '') => {
    setLoading(true);
    setError(null);
    setRepoReadme(null);
    setRepoCoverImage(null);
    try {
      const files = await fetchRepoContents(repo.owner.login, repo.name, path);
      setRepoFiles(files);
      setProjectState('detail');
      setCurrentPath(path);

      // Fetch README
      const readmeFile = files.find(f => f.name.toLowerCase() === 'readme.md');
      if (readmeFile && readmeFile.download_url) {
        fetchRawFile(readmeFile.download_url).then(text => setRepoReadme(text)).catch(console.warn);
      }

      // Detect Cover Image (preview.png, cover.jpg, etc)
      const coverFile = files.find(f => 
        ['preview.png', 'preview.jpg', 'cover.png', 'cover.jpg'].includes(f.name.toLowerCase())
      );
      if (coverFile && coverFile.download_url) {
        setRepoCoverImage(coverFile.download_url);
      }

    } catch (err) {
      console.error(err);
      setError("Access denied: Could not load contents.");
    } finally {
      setLoading(false);
    }
  };

  const handleRepoClick = async (repo: GitHubRepo) => {
    setSelectedRepo(repo);
    loadRepoContents(repo, '');
  };

  const handleFolderClick = async (path: string) => {
    if (!selectedRepo) return;
    loadRepoContents(selectedRepo, path);
  };

  const handleFileClick = async (file: GitHubFile) => {
    if (file.type === 'dir') {
      handleFolderClick(file.path);
      return;
    }
    // If user clicks the preview image file, just view it as an image or ignore (optional)
    // For now we treat it as a file download or ignore if we want.
    // Let's allow downloading/viewing code for standard files.
    if (!file.download_url) return;

    setLoading(true);
    setError(null);

    try {
      // Check if image
      if (file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
         // Just show the image in markdown viewer style
         setSelectedMarkdown(`![${file.name}](${file.download_url})`);
         setProjectState('markdown');
         setLoading(false);
         return;
      }

      const raw = await fetchRawFile(file.download_url);
      if (file.name.endsWith('.ipynb')) {
        try {
          const json = JSON.parse(raw);
          setSelectedNotebook(json);
          setProjectState('notebook');
        } catch (e) { setError("Failed to parse notebook JSON."); }
      } else if (file.name.endsWith('.md')) {
        setSelectedMarkdown(raw);
        setProjectState('markdown');
      } else {
        const extension = file.name.split('.').pop() || 'text';
        setSelectedMarkdown("```" + extension + "\n" + raw + "\n```");
        setProjectState('markdown');
      }
    } catch (err) {
      console.error(err);
      setError("Could not download file.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (projectState === 'notebook' || projectState === 'markdown') {
      setProjectState('detail');
      setSelectedNotebook(null);
      setSelectedMarkdown('');
    } else if (projectState === 'detail') {
      if (currentPath) {
        const parentPath = currentPath.split('/').slice(0, -1).join('/');
        if (selectedRepo) loadRepoContents(selectedRepo, parentPath);
      } else {
        setProjectState('list');
        setSelectedRepo(null);
        setRepoFiles([]);
      }
    }
  };

  // --- VIEWS ---

  const renderLanding = () => (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center px-4 animate-in zoom-in-95 duration-700">
      
      {/* Tech Identity Card */}
      <div className="relative group p-12 bg-white/50 backdrop-blur-md border border-slate-200 shadow-xl max-w-3xl w-full">
        <div className="corner-brackets"></div>
        
        <div className="absolute top-4 left-4 flex gap-2">
           <div className="h-2 w-2 bg-red-400 rounded-full animate-pulse"></div>
           <div className="h-2 w-2 bg-yellow-400 rounded-full"></div>
           <div className="h-2 w-2 bg-green-400 rounded-full"></div>
        </div>

        {/* PROFILE PICTURE REGION */}
        <div className="mb-8">
           <ProfileImage />
        </div>
        
        <div className="font-mono text-cyan-600 text-sm tracking-[0.3em] mb-4 uppercase">System Online</div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
          {PERSONAL_INFO.name}
        </h1>
        
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto mb-8"></div>
        
        <p className="text-xl text-slate-600 max-w-xl mx-auto mb-10 leading-relaxed font-light">
          {PERSONAL_INFO.bio}
          <span className="typing-cursor text-cyan-500 font-bold ml-1">|</span>
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button 
            onClick={() => setActiveSection('projects')}
            className="group relative px-8 py-3 bg-slate-900 text-white font-mono text-sm overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            <div className="absolute inset-0 w-full h-full bg-cyan-600/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="relative flex items-center gap-2">
              <Folder size={16} /> ACCESS PROJECTS
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-8 duration-500 pb-20">
      <div className="bg-white/80 backdrop-blur border border-slate-200 p-8 relative overflow-hidden mb-8">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500"></div>
        <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3 font-mono">
          <span className="text-cyan-500">01.</span> PROFILE_DATA
        </h2>
        
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-8">
          <div className="flex-shrink-0">
             <ProfileImage />
          </div>
          <div className="prose prose-slate max-w-none text-lg leading-relaxed">
            <p>
              I'm <span className="font-bold text-slate-900">{PERSONAL_INFO.name}</span>, a developer engineered to build efficient software solutions.
              This interface connects directly to the GitHub API, ensuring real-time synchronization with my repository database.
            </p>
          </div>
        </div>

        {/* SYSTEM MODULES (TECH STACK) */}
        <h3 className="font-mono text-sm text-slate-500 mb-4 tracking-wider flex items-center gap-2">
           <Cpu size={14} /> INSTALLED_MODULES
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {SKILLS.map((skill, idx) => (
             <div key={idx} className="bg-slate-50 border border-slate-200 p-3 flex justify-between items-center group hover:border-cyan-400 transition-colors">
                <span className="font-bold text-slate-700 text-sm">{skill.name}</span>
                <span className="font-mono text-[10px] text-cyan-600 bg-cyan-50 px-1.5 py-0.5 rounded">{skill.version}</span>
             </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: "GITHUB LINK", icon: Github, link: PERSONAL_INFO.social.github, desc: "Source Code Database" },
          { title: "LINKEDIN FEED", icon: User, link: PERSONAL_INFO.social.linkedin, desc: "Professional Network" }
        ].map((item, i) => (
          <a 
            key={i}
            href={item.link}
            target="_blank"
            rel="noreferrer"
            className="group block bg-white border border-slate-200 p-6 hover:border-cyan-400 transition-all hover:translate-x-1"
          >
            <div className="flex justify-between items-start mb-4">
              <item.icon className="text-slate-700 group-hover:text-cyan-600 transition-colors" size={24} />
              <ExternalLink size={16} className="text-slate-300 group-hover:text-cyan-400" />
            </div>
            <h3 className="font-mono font-bold text-slate-900 mb-1">{item.title}</h3>
            <p className="text-sm text-slate-500">{item.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );

  const renderProjects = () => {
    if (projectState === 'list') {
      const filteredRepos = repos.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );

      return (
        <div className="animate-in fade-in duration-500 pb-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-slate-200 pb-4 gap-4">
            <div className="flex items-center gap-4">
               <Activity className="text-cyan-500" />
               <span className="font-mono text-sm text-slate-500">DETECTED REPOSITORIES: <span className="text-slate-900 font-bold">{filteredRepos.length}</span></span>
            </div>

            {/* SEARCH BAR */}
            <div className="relative w-full md:w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
               <input 
                 type="text" 
                 placeholder="QUERY_DATABASE..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 text-sm font-mono focus:border-cyan-500 focus:outline-none transition-colors placeholder:text-slate-300"
               />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRepos.map(repo => (
              <RepoCard key={repo.id} repo={repo} onClick={handleRepoClick} />
            ))}
            {filteredRepos.length === 0 && !loading && (
               <div className="col-span-full py-20 text-center text-slate-400 font-mono">
                  NO MATCHING DATA FOUND
               </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col animate-in slide-in-from-right-8 duration-300">
        {/* Tech Navbar */}
        <div className="flex items-center space-x-4 mb-6 p-4 bg-white border border-slate-200 sticky top-0 z-20 shadow-sm">
          <button 
            onClick={handleBack}
            className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-cyan-600 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 font-mono text-sm">
            <span className="text-slate-400">root</span>
            <span className="text-slate-300 mx-2">/</span>
            <span className="font-bold text-slate-900">{selectedRepo?.name}</span>
            {currentPath && (
              <>
                <span className="text-slate-300 mx-2">/</span>
                <span className="text-cyan-600">{currentPath}</span>
              </>
            )}
          </div>
          {selectedRepo?.html_url && (
             <a href={selectedRepo.html_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-900">
               <Github size={20} />
             </a>
          )}
        </div>

        <div className="flex-1 pb-10">
          {loading ? <Loading text="FETCHING DATA..." /> : error ? <ErrorDisplay message={error} /> : (
            <>
              {projectState === 'detail' && (
                <div className="space-y-6">
                  {/* PROJECT COVER IMAGE - If detected in repo files */}
                  {repoCoverImage && (
                    <div className="relative w-full h-48 md:h-64 rounded-none overflow-hidden border border-slate-200 bg-slate-50 mb-6 group">
                      <div className="absolute inset-0 bg-tech-grid opacity-50 z-0"></div>
                      <img 
                        src={repoCoverImage} 
                        className="w-full h-full object-cover relative z-10 transition-transform duration-700 group-hover:scale-105" 
                        alt="Project Cover" 
                      />
                      <div className="absolute bottom-0 left-0 bg-white/90 px-3 py-1 text-xs font-mono text-cyan-600 z-20 border-t border-r border-slate-200">
                        PREVIEW_MODE
                      </div>
                    </div>
                  )}

                  <div className="bg-white border border-slate-200 overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 p-3 bg-slate-50 border-b border-slate-200 text-xs font-mono text-slate-500 uppercase">
                      <div className="col-span-8 pl-4">Filename</div>
                      <div className="col-span-4 text-right pr-4">Size</div>
                    </div>
                    <div className="divide-y divide-slate-100 font-mono text-sm">
                      {repoFiles.map((file) => (
                        <div 
                          key={file.path}
                          onClick={() => handleFileClick(file)}
                          className="grid grid-cols-12 gap-4 p-3 hover:bg-cyan-50/30 cursor-pointer transition-colors group items-center"
                        >
                          <div className="col-span-8 flex items-center space-x-3 overflow-hidden">
                            {file.type === 'dir' ? (
                              <Folder size={16} className="text-cyan-600" />
                            ) : file.name.endsWith('.ipynb') ? (
                              <FileJson size={16} className="text-orange-500" />
                            ) : file.name.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                              <ImageIcon size={16} className="text-purple-500" />
                            ) : file.name.endsWith('.md') ? (
                              <FileText size={16} className="text-slate-400" />
                            ) : (
                              <Code size={16} className="text-slate-300" />
                            )}
                            <span className="truncate text-slate-700 group-hover:text-cyan-700">{file.name}</span>
                          </div>
                          <div className="col-span-4 text-right text-xs text-slate-400 pr-2">
                            {file.size > 0 ? (file.size / 1024).toFixed(1) + ' KB' : '-'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {repoReadme && (
                    <div className="border border-slate-200 bg-white p-8 relative">
                       <div className="absolute top-0 right-0 bg-slate-100 text-xs font-mono px-2 py-1 text-slate-500">README.md</div>
                       <MarkdownRenderer content={repoReadme} />
                    </div>
                  )}
                </div>
              )}

              {projectState === 'notebook' && selectedNotebook && (
                <div className="bg-white border border-slate-200 p-1 shadow-sm min-h-[500px]">
                   <NotebookRenderer notebook={selectedNotebook} />
                </div>
              )}

              {projectState === 'markdown' && selectedMarkdown && (
                 <div className="bg-white border border-slate-200 p-8 shadow-sm min-h-[500px] font-mono text-sm">
                   <MarkdownRenderer content={selectedMarkdown} />
                 </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-tech-grid text-slate-800 font-sans flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => { setActiveSection('landing'); setProjectState('list'); }}>
            <Logo className="h-8 w-8" />
          </div>
          
          <nav className="flex space-x-1">
            {[
              { id: 'projects', label: 'PROJECTS' },
              { id: 'about', label: 'ABOUT' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id as any);
                  if(item.id === 'projects') setProjectState('list');
                }}
                className={`px-4 py-2 text-xs font-mono font-bold tracking-wider transition-all border-b-2 
                  ${activeSection === item.id 
                    ? 'border-cyan-500 text-cyan-700 bg-cyan-50' 
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 relative z-10 max-w-7xl mx-auto w-full px-6 pt-8">
        {activeSection === 'landing' && renderLanding()}
        {activeSection === 'about' && renderAbout()}
        {activeSection === 'projects' && renderProjects()}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2 opacity-30">
             <Logo className="h-6 w-6 grayscale" />
          </div>
          <div className="text-slate-400 text-xs font-mono text-center md:text-right">
            <p>&copy; {new Date().getFullYear()} Nick Feng. All systems nominal.</p>
            <p className="mt-1 opacity-60">Website interface generated by Google Gemini.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;