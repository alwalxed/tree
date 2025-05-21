import { ReactNode } from "react";

type SectionProps = {
  children: ReactNode;
};

type SectionTitleProps = {
  children: ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
};

type SectionPProps = {
  children: ReactNode;
};

function Section({ children }: SectionProps) {
  return (
    <section className="flex gap-6 flex-col">
      {children}
      <div className="w-full h-2 border-t border-zinc-200"></div>
    </section>
  );
}

Section.H = function SectionTitle({ children, level = 2 }: SectionTitleProps) {
  const Tag = `h${level}` as const;

  const sizeMap = {
    1: "text-4xl",
    2: "text-3xl",
    3: "text-2xl",
    4: "text-xl",
    5: "text-lg",
    6: "text-base",
  };

  return <Tag className={`${sizeMap[level]} font-bold`}>{children}</Tag>;
};

Section.P = function SectionParagraph({ children }: SectionPProps) {
  return <p className="text-lg">{children}</p>;
};

export { Section };
