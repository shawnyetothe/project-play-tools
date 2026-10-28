import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { exampleBySlug, examples } from "@/lib/examples";
import { UseRule } from "@/components/workspace/UseRule";

export function generateStaticParams() {
  return examples.map((item) => ({ slug: item.slug }));
}

export const dynamicParams = false;

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => ({ title: exampleBySlug(slug)?.title ?? "Example" }));
}

export default async function ExamplePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const example = exampleBySlug(slug);
  if (!example) notFound();
  return (
    <article className="workspace wrap">
      <p><Link href="/examples/">Examples</Link></p>
      <h1>{example.title}</h1>
      <p>{example.summary}</p>
      {example.credit ? <p><a href={example.credit.href}>{example.credit.label}</a></p> : null}
      <UseRule rule={example.rule} />
    </article>
  );
}
