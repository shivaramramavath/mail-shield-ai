
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({
  content,
}: MarkdownRendererProps) {
  return (
    <article className="prose prose-neutral max-w-none break-words dark:prose-invert prose-headings:font-semibold prose-a:underline prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-pre:border prose-pre:bg-muted">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
