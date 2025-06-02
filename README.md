# Tree (Book Content Visualizer)

_**Tree**_ is an open-source educational website ([tree.alwalxed.com](https://tree.alwalxed.com)) designed to visualize the hierarchical structure of books. It leverages the recursive nature of book content to generate clear, navigable visualizations. We simply drop our content into a nested folder hierarchy, and _**Tree**_ renders it, automatically generating all the visualizations and sidebar links we need.

## Table of Contents

1. [Structure](#structure)
2. [Visualizations](#visualizations)
3. [Contributing](#contributing)
   1. [Content Contributions](#content-contributions)
   2. [Code Contributions](#code-contributions)
4. [License](#license)

## Structure

Books follow a recursive, tree-like organization: parts, chapters, sections, concepts, sub-concepts, and so on. _**Tree**_ mirrors this by reading our local folder structure:

```bash
subject/
└─ author/
   └─ book/
      └─ part/
         └─ section/
            └─ concept/
               └─ ...
```

See [`/content`](./content) to learn how we render the actual content.

## Visualizations

**Tree** supports multiple ways to render your content tree:

- Radial Sunburst
- Circle Pack
- Grid Layout
- Nested Boxes
- ASCII Tree
- Collapsible Tree
- Node-Link Diagram

We’re open to adding more. If you have ideas, please contribute.

## Contributing

### Content Contributions

Before adding new books, please email **hey@alwalxed.com** to ensure they fit our focus (foundational subjects like grammar, morphology, jurisprudence, logic, etc.).

1. Fork the repo.
2. Follow the folder pattern in [`/content`](./content) to add your book’s hierarchy.
3. Summarize or annotate each `index.md` as you like.
4. Submit a pull request.

### Code Contributions

Got a bug fix, a new visualization, or a handy feature?

1. Fork the repo.
2. Implement and test your change.
3. Open a pull request.

## License

This project is released under the **MIT License**. See [LICENSE](./LICENSE) for details.
