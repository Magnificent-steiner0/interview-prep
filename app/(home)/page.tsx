import Link from "next/link";
import { categories } from "@/lib/categories";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-16">
      <section className="mb-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Interview Prep Library
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-fd-muted-foreground">
          Deep, structured interview preparation guides — fundamentals,
          languages, frameworks, and AI engineering — each with code
          examples, comparison tables, and the &ldquo;interview trap&rdquo;
          questions that actually get asked.
        </p>
        <Link
          href="/docs"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-fd-primary px-6 py-2.5 text-sm font-semibold text-fd-primary-foreground transition-opacity hover:opacity-90"
        >
          Start browsing
        </Link>
      </section>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/docs/${category.slug}`}
            className="group rounded-xl border border-fd-border bg-fd-card p-6 transition-colors hover:border-fd-primary"
          >
            <h2 className="text-lg font-semibold group-hover:text-fd-primary">
              {category.title}
            </h2>
            <p className="mt-2 text-sm text-fd-muted-foreground">
              {category.description}
            </p>
          </Link>
        ))}
      </section>
    </main>
  );
}
