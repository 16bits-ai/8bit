const videoExtensions = ['.mp4', '.mov', '.webm', '.avi', '.mkv'];

const isVideoSource = (src: string) => videoExtensions.some((extension) => src.toLowerCase().split('?')[0].endsWith(extension));

const renderInline = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);

  return parts.map((part, index) => {
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a key={index} href={linkMatch[2]} className="underline hover:text-[var(--ink)]">
          {linkMatch[1]}
        </a>
      );
    }

    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="border border-[var(--accent-dim)] bg-[var(--accent-soft)] px-1">
          {part.slice(1, -1)}
        </code>
      );
    }

    return part;
  });
};

const isTableDivider = (line: string) => /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);

const splitTableRow = (line: string) =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());

interface MarkdownDocumentContentProps {
  markdown: string;
  compact?: boolean;
}

const MarkdownDocumentContent = ({ markdown, compact = false }: MarkdownDocumentContentProps) => {
  const lines = markdown.split('\n');
  const nodes: React.ReactNode[] = [];
  let index = 0;
  const paragraphClass = compact
    ? 'mb-4 text-[0.65rem] leading-6 text-[var(--accent)] md:text-xs'
    : 'mb-5 text-sm leading-7 text-[var(--accent)] md:text-base';
  const headingClass = compact
    ? 'mb-3 mt-7 text-xs font-bold text-[var(--accent)] md:text-sm'
    : 'mb-4 mt-10 text-base font-bold text-[var(--accent)] md:text-xl';

  const consumeParagraph = () => {
    const paragraph: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].startsWith('#') &&
      !lines[index].startsWith('>') &&
      !lines[index].startsWith('```') &&
      !lines[index].match(/^!\[[^\]]*\]\([^)]+\)$/) &&
      !lines[index].match(/^[-*]\s+/) &&
      !lines[index].match(/^\d+\.\s+/) &&
      !(lines[index].includes('|') && index + 1 < lines.length && isTableDivider(lines[index + 1]))
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }

    if (paragraph.length) {
      nodes.push(
        <p key={nodes.length} className={paragraphClass}>
          {renderInline(paragraph.join(' '))}
        </p>
      );
    }
  };

  while (index < lines.length) {
    const trimmed = lines[index].trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (trimmed.startsWith('```')) {
      const language = trimmed.slice(3).trim();
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith('```')) {
        code.push(lines[index]);
        index += 1;
      }
      index += 1;
      nodes.push(
        <pre key={nodes.length} className="mb-6 overflow-x-auto border-2 border-[var(--accent)] bg-[var(--panel)] p-4 text-xs text-[var(--accent)]">
          {language && <div className="mb-3 text-[var(--accent-dim)]">{language.toUpperCase()}</div>}
          <code>{code.join('\n')}</code>
        </pre>
      );
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const HeadingTag = `h${Math.min(level + 1, 4)}` as keyof JSX.IntrinsicElements;
      nodes.push(
        <HeadingTag key={nodes.length} className={headingClass}>
          {heading[2].toUpperCase()}
        </HeadingTag>
      );
      index += 1;
      continue;
    }

    const image = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (image) {
      const src = image[2];
      nodes.push(
        isVideoSource(src) ? (
          <video key={nodes.length} src={src} controls className="my-6 w-full rounded-sm border-2 border-[var(--accent)] bg-[var(--panel)]" />
        ) : (
          <img
            key={nodes.length}
            src={src}
            alt={image[1]}
            className="my-6 w-full rounded-sm border-2 border-[var(--accent)] bg-[var(--panel)] object-cover"
          />
        )
      );
      index += 1;
      continue;
    }

    if (trimmed.includes('|') && index + 1 < lines.length && isTableDivider(lines[index + 1])) {
      const headers = splitTableRow(trimmed);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
        rows.push(splitTableRow(lines[index]));
        index += 1;
      }
      nodes.push(
        <div key={nodes.length} className="my-8 overflow-x-auto border-2 border-[var(--accent)]">
          <table className="w-full border-collapse text-left text-xs md:text-sm">
            <thead className="bg-[var(--accent)] text-[var(--paper)]">
              <tr>
                {headers.map((header) => (
                  <th key={header} className="p-3">
                    {header.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t border-[var(--accent)]">
                  {row.map((cell, cellIndex) => (
                    <td key={`${rowIndex}-${cellIndex}`} className="p-3 align-top text-[var(--accent)]">
                      {cell.match(/^!\[[^\]]*\]\([^)]+\)$/) ? (
                        <MarkdownDocumentContent markdown={cell} compact={compact} />
                      ) : (
                        renderInline(cell)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    if (trimmed.match(/^[-*]\s+/) || trimmed.match(/^\d+\.\s+/)) {
      const ordered = Boolean(trimmed.match(/^\d+\.\s+/));
      const items: string[] = [];
      while (
        index < lines.length &&
        (lines[index].trim().match(/^[-*]\s+/) || lines[index].trim().match(/^\d+\.\s+/))
      ) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, ''));
        index += 1;
      }
      const ListTag = ordered ? 'ol' : 'ul';
      nodes.push(
        <ListTag
          key={nodes.length}
          className={`mb-6 space-y-3 pl-6 text-sm leading-7 text-[var(--accent)] md:text-base ${
            ordered ? 'list-decimal' : 'list-disc'
          }`}
        >
          {items.map((item) => (
            <li key={item}>{renderInline(item)}</li>
          ))}
        </ListTag>
      );
      continue;
    }

    if (trimmed.startsWith('>')) {
      const quote: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith('>')) {
        quote.push(lines[index].trim().replace(/^>\s?/, ''));
        index += 1;
      }
      nodes.push(
        <blockquote key={nodes.length} className="mb-6 border-l-4 border-[var(--accent)] bg-[var(--accent-soft)] p-4 text-sm leading-7 text-[var(--accent)] md:text-base">
          {renderInline(quote.join(' '))}
        </blockquote>
      );
      continue;
    }

    consumeParagraph();
  }

  return <>{nodes}</>;
};

export default MarkdownDocumentContent;
