import { Link, useParams } from 'react-router-dom';
import JourneyVisualization from '../components/JourneyVisualization';
import ParallaxBackground from '../components/ParallaxBackground';
import MarkdownDocumentContent from '../components/MarkdownDocumentContent';
import { findDocumentByPath } from '../data/documents';

const Document = () => {
  const params = useParams();
  const document = findDocumentByPath(params['*']);

  if (!document) {
    return (
      <div className="relative min-h-screen bg-[var(--paper)] px-4 py-16 text-[var(--accent)]">
        <ParallaxBackground color="var(--accent)" variant="lines" />
        <div className="relative z-10 mx-auto max-w-3xl border-4 border-[var(--accent)] bg-[var(--panel)] p-6">
          <p className="mb-6" style={{ fontFamily: '"Press Start 2P", cursive' }}>
            DOCUMENT NOT FOUND.
          </p>
          <Link to="/terminal" className="underline hover:text-[var(--ink)]">
            RETURN TO TERMINAL
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="relative min-h-screen bg-[var(--paper)] px-4 pb-28 pt-8 text-[var(--accent)] md:pt-14">
      <ParallaxBackground color="var(--accent)" variant="lines" />
      <div className="relative z-10 mx-auto max-w-4xl border-4 border-[var(--accent)] bg-[var(--panel)] p-5 shadow-[var(--glow-box)] md:p-8">
        <Link
          to="/terminal"
          className="mb-8 inline-block text-xs underline hover:text-[var(--ink)]"
          style={{ fontFamily: '"Press Start 2P", cursive' }}
        >
          {'< BACK TO TERMINAL'}
        </Link>

        <header className="mb-8 border-b-2 border-[var(--accent)] pb-6">
          <div className="mb-4 flex flex-wrap gap-2">
            {document.tags.map((tag) => (
              <span
                key={tag}
                className="border border-[var(--accent)] px-2 py-1 text-[0.55rem]"
                style={{ fontFamily: '"Press Start 2P", cursive' }}
              >
                {tag.toUpperCase()}
              </span>
            ))}
          </div>
          <h1 className="mb-4 text-2xl font-bold leading-tight md:text-4xl">{document.title}</h1>
          <p className="mb-4 text-sm leading-7 text-[var(--accent-dim)] md:text-base">{document.description}</p>
          <p className="text-xs text-[var(--accent-dim)]">
            {document.date} | {document.authors.join(', ')}
          </p>
        </header>

        {document.path === '/documents/lifestyle/journey' ? (
          <div className="h-[75vh]">
            <JourneyVisualization />
          </div>
        ) : (
          <MarkdownDocumentContent markdown={document.content} />
        )}

        <footer className="mt-10 border-t-2 border-[var(--accent)] pt-5 text-xs text-[var(--accent-dim)]">
          IMPORTED FROM {document.sourceFolder}
        </footer>
      </div>
    </article>
  );
};

export default Document;
