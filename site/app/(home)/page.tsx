import Link from 'next/link';
import { categories } from '@/lib/taxonomy';

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-16">
      <h1 className="text-3xl font-semibold">Cafe Javva</h1>
      <p className="mt-3 text-fd-muted-foreground">
        A notebook of NCL writeups for the Marymount Cyber Club. The first set is the harder challenges from the 2026 NCL individual competition.
        Open a category, or search every writeup in the finder. Inside the docs, Ctrl+K searches the full text.
      </p>
      <p className="mt-6 flex gap-4">
        <Link href="/docs" className="font-medium underline">
          Open the docs
        </Link>
        <Link href="/docs/finder" className="font-medium underline">
          Find a challenge
        </Link>
      </p>
      <ul className="mt-10 space-y-4">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link href={`/docs/categories/${category.slug}`} className="font-medium underline">
              {category.title}
            </Link>
            <p className="text-sm text-fd-muted-foreground">{category.summary}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
