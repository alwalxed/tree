export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div
      className="prose-code:bg-gray-100 prose-code:p-1 prose-code:rounded"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
