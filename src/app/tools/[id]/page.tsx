import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AgentPrompt } from "@/components/AgentPrompt";
import { PublishWithAbx } from "@/components/PublishWithAbx";
import { Rich } from "@/components/RichText";
import { SketchPad } from "@/components/SketchPad";
import { STARTERS } from "@/components/sketches";
import { ToolFigure } from "@/components/ToolFigure";
import { ToolLink } from "@/components/ToolLink";
import { meta, toolById, tools } from "@/lib/data";

export function generateStaticParams() {
  return tools.map((tool) => ({ id: tool.id }));
}

export const dynamicParams = false;

export function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  return params.then(({ id }) => ({ title: toolById.get(id)?.plain ?? "Tool" }));
}

function swatch(tier: string) {
  if (tier.startsWith("Mature")) return "swatch swatch-mature";
  if (tier.startsWith("Emergent")) return "swatch swatch-emergent";
  if (tier.startsWith("Under")) return "swatch swatch-under";
  return "swatch swatch-unused";
}

export default async function ToolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tool = toolById.get(id);
  if (!tool) notFound();
  const row = meta.maturity.find((item) => item.name === tool.maturityRow);
  const sketch = tool.sketch ? STARTERS[tool.sketch] : "";
  const counts = tool.evidenceCounts;

  const licenseNotes = tool.image.status === "verified" && tool.image.caption
    ? `Starter sketches in this guide are original and are not an artist's project. Example: ${tool.image.caption}. ${tool.image.license || "No license line."} Do not reproduce that image.`
    : "No verified example image. Starter sketches in this guide are original and are not an artist's project.";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    applicationCategory: tool.category,
    description: tool.what,
    isPartOf: "PlayTools",
    ...(tool.image.status === "verified" && tool.image.caption
      ? { citation: tool.image.caption, license: tool.image.license }
      : {}),
  };

  return (
    <div className="wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <p className="quiet">
        <Link href="/">Home</Link> / <Link href="/tools/">Tools</Link> / {tool.plain}
      </p>
      <h1>{tool.plain}</h1>
      {tool.plain !== tool.name ? <p className="tech">{tool.name}</p> : null}
      <p>{tool.what}</p>
      <AgentPrompt
        name={tool.name}
        plain={tool.plain}
        category={tool.category}
        firstProject={tool.firstProject}
        starter={`/tools/${tool.id}/`}
        licenseNotes={licenseNotes}
      />
      <div className="hero-layout">
        <ToolFigure image={tool.image} toolName={tool.name} />
        <div>
          <h2>Introduction</h2>
          <p>
            <Rich text={tool.intro} />
          </p>
          <h2>History</h2>
          {tool.history.length ? (
            <ul className="steps">
              {tool.history.map((line) => (
                <li key={`${line.date}-${line.text.slice(0, 24)}`}>
                  <strong>{line.date}. </strong>
                  <Rich text={line.text} />{" "}
                  {line.source ? (
                    <a href={line.source}>
                      [{line.tag || "sourced"}]
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p>No outside history line we could source. See the dataset dates below.</p>
          )}
          {row ? (
            <p className="quiet">
              Maturity map, earliest found: <Rich text={row.earliest} />
            </p>
          ) : null}
        </div>
      </div>

      <h2>Getting started</h2>
      {tool.care === "short" ? (
        <p className="quiet">Short entry in the dataset: intro, history, and steps. Fuller notes are not in the source yet.</p>
      ) : null}
      {tool.steps.length ? (
        <ol className="steps">
          {tool.steps.map((step) => (
            <li key={step}>
              <Rich text={step} />
            </li>
          ))}
        </ol>
      ) : (
        <p>No getting-started steps in the dataset.</p>
      )}
      {tool.firstProject ? (
        <>
          <h3>First project to try</h3>
          <p>
            <Rich text={tool.firstProject} />
          </p>
        </>
      ) : null}
      <h3>Rough starter cost</h3>
      <p>{tool.starterCost ? <Rich text={tool.starterCost} /> : "No cost is sourced in the dataset."}</p>
      {tool.links.length ? (
        <>
          <h3>Learn more</h3>
          <p className="quiet">Links checked October 25, 2026. Each returned HTTP 200.</p>
          <ul className="link-list">
            {tool.links.map((link) => (
              <li key={link.url}>
                <a href={link.url}>{link.label}</a>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {sketch ? (
        <>
          <h3>Try it here</h3>
          <SketchPad kind={tool.sketch!} initial={sketch} />
        </>
      ) : null}

      {tool.physical ? (
        <>
          <h3>What you need</h3>
          <ul className="steps">
            <li>{tool.starterCost ? <Rich text={tool.starterCost} /> : "No cost is sourced in the dataset."}</li>
            {tool.steps.map((step) => (
              <li key={`need-${step}`}>
                <Rich text={step} />
              </li>
            ))}
          </ul>
          <h3>Common beginner gotcha</h3>
          <p>
            From the getting-started notes: <Rich text={tool.gotcha} />
          </p>
        </>
      ) : null}

      <h2>Ways to express more humanity</h2>
      <p className="quiet">
        Prompts for putting a person into the work. Our suggestions. Named examples come from this dataset or the linked sources.
      </p>
      {tool.humanity.length ? (
        <ul className="steps">
          {tool.humanity.map((line) => (
            <li key={line}>
              <Rich text={line} />
            </li>
          ))}
        </ul>
      ) : (
        <p>No humanity prompts in the dataset for this tool.</p>
      )}

      <h2>From the dataset</h2>
      {row ? (
        <div className="panel">
          <p>
            <span className={swatch(row.tier)} aria-hidden="true" />
            <strong>{row.tier}</strong>
            {row.tierSrb && row.tierSrb !== row.tier ? ` · SRB: ${row.tierSrb}` : ""}
          </p>
          <p>
            Our call: <Rich text={row.call} />
          </p>
          <p className="quiet">
            Art Blocks: <Rich text={row.abTrend} />
          </p>
          {row.example1 ? (
            <p>
              Examples: {row.example1Url ? <a href={row.example1Url}>{row.example1}</a> : row.example1}
              {row.example2 ? (
                <>
                  {" · "}
                  {row.example2Url ? <a href={row.example2Url}>{row.example2}</a> : row.example2}
                </>
              ) : null}
            </p>
          ) : null}
          {row.barrier ? (
            <p>
              Main barrier: <Rich text={row.barrier} />
            </p>
          ) : null}
          {row.disagree ? (
            <p>
              Where this call differs: <Rich text={row.disagree} />
            </p>
          ) : null}
        </div>
      ) : (
        <p>Not a maturity-map row. This is a dataset tag.</p>
      )}
      <p>
        {tool.projectCount
          ? `${tool.projectCount} matching project${tool.projectCount === 1 ? "" : "s"}: ${counts.verified} verified, ${counts.inferred} inferred, ${counts.guessed} guessed.`
          : "No tagged Art Blocks projects for this tool in our data."}
      </p>
      {tool.projects.length ? (
        <>
          <ul className="steps">
            {tool.projects.map((project) => (
              <li key={project.slug}>
                <Link href={`/projects/${project.slug}/`}>{project.name}</Link>
                {" · "}
                <Link href={`/artists/${project.artistSlug}/`}>{project.artist}</Link>
                {" · "}
                {project.date || "no date"}
                {" · "}
                {project.mints.toLocaleString()} minted
                {" · "}
                <span className={`tag tag-${project.evidence}`}>{project.evidence}</span>
              </li>
            ))}
          </ul>
          {tool.projectCount > tool.projects.length ? (
            <p>
              <Link href={`/explore/?tool=${tool.id}`}>See all {tool.projectCount} in Explore the data</Link>
            </p>
          ) : null}
        </>
      ) : tool.match.startsWith("H:") ? (
        <p>Not an on-chain tag. See the related work mio (Generative Goods) on that artist page.</p>
      ) : null}
      {tool.relatedIds.length ? (
        <>
          <h3>Related tools</h3>
          <p>
            {tool.relatedIds.map((rel) => (
              <ToolLink key={rel} id={rel} />
            ))}
          </p>
        </>
      ) : null}
      {tool.categoryIds.length ? (
        <>
          <h3>More in {tool.category}</h3>
          <p>
            {tool.categoryIds.map((rel) => (
              <ToolLink key={rel} id={rel} />
            ))}
          </p>
        </>
      ) : null}
      <p>
        <Link href="/tools/">All tools</Link>
      </p>
      {tool.id === "abx" ? <PublishWithAbx /> : null}
    </div>
  );
}
