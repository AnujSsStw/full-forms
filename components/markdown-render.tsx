import React from "react";
import ReactMarkdown from "react-markdown";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";

const MarkdownRenderer = ({ content }: { content: string }) => {
  if (!content) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
        No markdown content provided
      </div>
    );
  }

  return (
    <article className="prose prose-slate max-w-none">
      <ReactMarkdown
        components={{
          // Style headers
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl font-bold " {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl font-bold " {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xl font-bold " {...props} />
          ),

          // Style paragraphs
          p: ({ node, ...props }) => (
            <p className="mb-4 leading-relaxed" {...props} />
          ),

          // Style lists
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-6 " {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-6 " {...props} />
          ),

          // Style links
          a: ({ node, ...props }) => (
            <a
              className="text-blue-600 hover:text-blue-800 underline"
              {...props}
            />
          ),

          // Style blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-gray-300 pl-4 italic "
              {...props}
            />
          ),

          // Style tables
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table
                className="min-w-full divide-y divide-gray-200"
                {...props}
              />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-2 bg-gray-50 font-semibold" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-2 border-t" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
};

export default MarkdownRenderer;
