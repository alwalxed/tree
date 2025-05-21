import { kawkabMonoArabic } from "@/app/fonts";
import { cn } from "@/lib/utils";

type Props = {
  content: string;
};

export function TreeDisplay({ content }: Props) {
  return (
    <div className="prose max-w-none bg-gray-50 rounded-xl p-4 overflow-x-auto text-sm bg-green-200">
      <pre className="m-0">
        <code
          className={cn(kawkabMonoArabic.className, "whitespace-pre text-base")}
        >
          {content}
        </code>
      </pre>
    </div>
  );
}
