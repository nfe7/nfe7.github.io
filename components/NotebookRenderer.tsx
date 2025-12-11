import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { NotebookCell, JupyterNotebook } from '../types';

interface NotebookRendererProps {
  notebook: JupyterNotebook;
}

const CellRenderer: React.FC<{ cell: NotebookCell; index: number }> = ({ cell, index }) => {
  const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source || '';

  if (cell.cell_type === 'markdown') {
    return (
      <div className="mb-6 p-6 bg-transparent text-slate-800 prose prose-slate max-w-none">
        <ReactMarkdown>{source}</ReactMarkdown>
      </div>
    );
  }

  if (cell.cell_type === 'code') {
    return (
      <div className="mb-8 rounded-lg overflow-hidden border border-slate-200 bg-[#282c34] shadow-md">
        {/* Code Input */}
        <div className="relative group">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500/50 group-hover:bg-cyan-500 transition-colors" />
          <div className="absolute right-2 top-2 text-xs font-mono text-slate-500 select-none">
            In [{cell.execution_count || ' '}]
          </div>
          <div className="pl-4">
             <SyntaxHighlighter 
              language="python" 
              style={atomOneDark} 
              customStyle={{ background: 'transparent', padding: '1rem', margin: 0, fontSize: '0.9rem' }}
            >
              {source}
            </SyntaxHighlighter>
          </div>
        </div>

        {/* Outputs */}
        {cell.outputs && cell.outputs.length > 0 && (
          <div className="border-t border-slate-700 bg-white">
            {cell.outputs.map((output, i) => {
              // Handle Stream text
              if (output.text) {
                const textContent = Array.isArray(output.text) ? output.text.join('') : output.text;
                return (
                  <pre key={i} className="p-4 text-sm font-mono text-slate-600 whitespace-pre-wrap overflow-x-auto bg-slate-50 border-b border-slate-100 last:border-0">
                    {textContent}
                  </pre>
                );
              }
              
              // Handle Images (PNG/JPEG)
              if (output.data) {
                const imageKey = Object.keys(output.data).find(key => key.startsWith('image/'));
                if (imageKey) {
                   // @ts-ignore
                   const base64Img = output.data[imageKey];
                   // Handle potential array of strings for base64
                   const imgSrc = Array.isArray(base64Img) ? base64Img.join('').replace(/\n/g, '') : base64Img;
                   
                   return (
                    <div key={i} className="p-4 bg-slate-50 border-b border-slate-100 last:border-0 flex justify-center">
                      <img 
                        src={`data:${imageKey};base64,${imgSrc}`} 
                        alt="Cell Output" 
                        className="max-w-full h-auto rounded shadow-sm"
                      />
                    </div>
                  );
                }
                
                // Handle HTML data (simple rendering)
                if (output.data['text/html']) {
                    const htmlContent = Array.isArray(output.data['text/html']) ? output.data['text/html'].join('') : output.data['text/html'];
                    // Sanitize if this was a real production app
                    return <div key={i} className="p-4 bg-white text-slate-800 overflow-auto border-b border-slate-100 last:border-0" dangerouslySetInnerHTML={{__html: htmlContent}} />
                }

                 // Handle Plain Text data
                 if (output.data['text/plain']) {
                    const plainText = Array.isArray(output.data['text/plain']) ? output.data['text/plain'].join('') : output.data['text/plain'];
                    return <pre key={i} className="p-4 text-sm font-mono text-slate-600 whitespace-pre-wrap bg-slate-50 border-b border-slate-100 last:border-0">{plainText}</pre>
                }
              }
              return null;
            })}
          </div>
        )}
      </div>
    );
  }

  return null;
};

const NotebookRenderer: React.FC<NotebookRendererProps> = ({ notebook }) => {
  if (!notebook || !notebook.cells) return <div className="text-red-500">Invalid Notebook Format</div>;

  return (
    <div className="w-full max-w-4xl mx-auto pb-20">
      {notebook.cells.map((cell, idx) => (
        <CellRenderer key={idx} cell={cell} index={idx} />
      ))}
    </div>
  );
};

export default NotebookRenderer;