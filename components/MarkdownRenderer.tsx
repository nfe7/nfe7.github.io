import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="w-full max-w-4xl mx-auto pb-20">
      <div className="prose prose-slate prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-a:text-cyan-600 hover:prose-a:text-cyan-700 max-w-none">
        <ReactMarkdown
          components={{
            // Handle Code Blocks
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  style={atomOneDark}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{
                    margin: '1.5em 0',
                    borderRadius: '0.5rem',
                    padding: '1.5rem',
                    background: '#282c34', 
                  }}
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={`${className} bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono text-sm border border-slate-200`} {...props}>
                  {children}
                </code>
              );
            },
            // Handle Links securely
            a({ node, children, href, ...props }: any) {
               return (
                 <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                   {children}
                 </a>
               )
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default MarkdownRenderer;