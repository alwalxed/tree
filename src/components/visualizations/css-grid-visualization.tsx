export function CSSGridVisualization({ nodes }: { nodes: TreeNode[] }) {
  return (
    <div className="grid gap-4 grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 py-4">
      {gridItems.map((item) => (
        <a
          key={item.slug}
          href={`/learn/${item.slug}`}
          className="p-4 border rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <h2 className="text-base">{item.title}</h2>
        </a>
      ))}
    </div>
  );
}
