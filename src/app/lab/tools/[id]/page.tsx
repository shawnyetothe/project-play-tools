import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CineTile } from "@/components/lab/CineTile";
import { tools } from "@/lib/data";
import { hashSeed } from "@/lib/seed";

export function generateStaticParams() {
  return tools.map((tool) => ({ id: tool.id }));
}

export const dynamicParams = false;

export function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  return params.then(({ id }) => ({ title: tools.find((tool) => tool.id === id)?.plain ?? "Tool" }));
}

export default async function LabToolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tool = tools.find((item) => item.id === id);
  if (!tool) notFound();
  const count = typeof tool.projectCount === "number" ? tool.projectCount : null;
  const beginner = `${tool.plain} ${tool.what} ${tool.intro}`.toLowerCase().includes("beginner");
  const like = tool.what.split(/(?<=\.)\s/)[0] || tool.plain;

  return (
    <div className="wrap lab-page">
      <p className="quiet">
        <Link href="/lab/tools/">Creative index</Link>
        {" / "}
        {tool.plain}
      </p>
      <h1>{tool.plain}</h1>
      {tool.plain !== tool.name ? <p className="tech">{tool.name}</p> : null}
      <p>{like}</p>
      <CineTile kind={tool.sketch || "message"} seed={hashSeed([tool.id])} hot={false} reduced={false} />
      <p>
        {count == null ? "no data yet" : `${count} projects in the 2026-10-25 19:40 ET Art Blocks pull.`}
        {count != null && count < 10 ? " Few people make with this yet." : ""}
      </p>
      <p className="quiet">
        {tool.category ? `Medium: ${tool.category}. ` : "No medium listed. "}
        {beginner ? "The dataset calls this beginner-friendly. " : ""}
        {tool.sketch ? "This guide has a starter sketch." : "No starter sketch in this guide."}
      </p>
      <p>
        <Link href={`/tools/${tool.id}/`}>Full tool page</Link>
      </p>
    </div>
  );
}
