import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Legend, Tags } from "@/components/Tags";
import { projectBySlug, projects } from "@/lib/data";
import { externalHref } from "@/lib/site";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export const dynamicParams = false;

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => ({ title: projectBySlug.get(slug)?.name ?? "Project" }));
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projectBySlug.get(slug);
  if (!project) notFound();
  const edition =
    project.maxInvocations == null
      ? `${project.invocations.toLocaleString()} minted · edition size not in the API`
      : `${project.invocations.toLocaleString()} of ${project.maxInvocations.toLocaleString()} minted`;
  const siteHref = project.website ? externalHref(project.website) : null;

  return (
    <div className="wrap">
      <p className="quiet">
        <Link href="/">Home</Link> / <Link href={`/artists/${project.artistSlug}/`}>{project.artist}</Link> / {project.name}
      </p>
      <h1>{project.name}</h1>
      <p>
        <Link href={`/artists/${project.artistSlug}/`}>{project.artist}</Link>
        {project.apiName && project.apiName !== project.artist ? <span className="quiet"> · API name {project.apiName}</span> : null}
      </p>
      <p>
        <a href={project.artblocks}>Art Blocks page</a>
        {project.website ? (
          <>
            {" · "}
            {siteHref ? (
              <a href={siteHref}>Artist site on the record</a>
            ) : (
              <span>Site on the record: {project.website}</span>
            )}
          </>
        ) : null}
      </p>
      <dl className="facts">
        <Row label="Tier" value={project.tier} />
        <Row label="Chain" value={`${project.chain}${project.contractLayer ? ` · ${project.contractLayer}` : ""}`} />
        <Row label="Token" value={project.tokenStandard} />
        <Row label="Library" value={[project.library, project.scriptType].filter(Boolean).join(" · ")} />
        <Row label="Minter" value={project.minter || "No minter type in the API"} />
        <Row label="Edition" value={edition} />
        <Row label="License" value={project.license || "No license in the API"} />
        <Row label="First mint (ET)" value={project.firstMint || "No first mint in the API"} />
        <Row label="Mint start (ET)" value={project.mintStart} />
        <Row label="Activated (ET)" value={project.activated} />
        <Row label="Completed (ET)" value={project.completed} />
      </dl>
      {project.legacyActivation ? (
        <p className="quiet">
          Activated dates for legacy V0 and V1 contracts reflect indexing, so first mint is the better launch date.
        </p>
      ) : null}
      {project.notes ? <p>{project.notes}</p> : null}
      <h2>Tools on this project</h2>
      <Legend />
      <Tags tags={project.tags} />
      <p>
        <a href={`?suggest=fix&about=${encodeURIComponent(project.name)}#suggest`}>Suggest a fix</a>
        {" · "}
        <a href="?suggest=removal#suggest">Request removal</a>
      </p>
    </div>
  );
}
