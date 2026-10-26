import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Legend, Tags } from "@/components/Tags";
import { artistBySlug, artists, claimById, projectBySlug, relatedById } from "@/lib/data";
import { externalHref } from "@/lib/site";

export function generateStaticParams() {
  return artists.map((artist) => ({ slug: artist.slug }));
}

export const dynamicParams = false;

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => ({ title: artistBySlug.get(slug)?.name ?? "Artist" }));
}

export default async function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artist = artistBySlug.get(slug);
  if (!artist) notFound();
  const projects = artist.projectSlugs.map((id) => projectBySlug.get(id)).filter((item) => item != null);
  const claims = artist.claimIds.map((id) => claimById.get(id)).filter((item) => item != null);
  const related = artist.relatedIds.map((id) => relatedById.get(id)).filter((item) => item != null);
  const collabs = artist.collabSlugs.map((id) => artistBySlug.get(id)).filter((item) => item != null);

  return (
    <div className="wrap">
      <p className="quiet">
        <Link href="/">Home</Link> / <Link href="/artists/">Artists</Link> / {artist.name}
      </p>
      <h1>{artist.name}</h1>
      {artist.aliases ? <p>Also listed as {artist.aliases}.</p> : null}
      <p>
        <a href={`?suggest=claim&about=${encodeURIComponent(artist.name)}#suggest`}>
          This is me: claim or edit this page
        </a>
      </p>
      <p className="quiet">
        This page is built from the public Art Blocks record. A claim or edit is reviewed before anything changes. We do not feature anyone beyond that record without consent.
      </p>
      <dl className="facts">
        <div>
          <dt>Projects</dt>
          <dd>
            {artist.count} · {artist.first || "no date"} to {artist.latest || "no date"}
          </dd>
        </div>
        <div>
          <dt>Tiers</dt>
          <dd>{artist.tiers.join(", ") || "—"}</dd>
        </div>
        <div>
          <dt>Chains</dt>
          <dd>{artist.chains.join(", ") || "—"}</dd>
        </div>
        <div>
          <dt>Libraries</dt>
          <dd>{artist.libraries.join(", ") || "—"}</dd>
        </div>
        <div>
          <dt>Mints</dt>
          <dd>{artist.mints.toLocaleString()}</dd>
        </div>
        {artist.wallets.length ? (
          <div>
            <dt>Wallets on the projects</dt>
            <dd>
              {artist.wallets.map((wallet) => (
                <span key={wallet} className="tech">
                  {wallet}{" "}
                </span>
              ))}
            </dd>
          </div>
        ) : null}
        {artist.websites.length ? (
          <div>
            <dt>Links from the project records</dt>
            <dd>
              <ul className="link-list">
                {artist.websites.map((url) => {
                  const href = externalHref(url);
                  return (
                    <li key={url}>
                      {href ? <a href={href}>{url.replace(/^https?:\/\//, "")}</a> : url}
                    </li>
                  );
                })}
              </ul>
            </dd>
          </div>
        ) : null}
      </dl>

      <h2>Tools over time</h2>
      <Legend />
      <ol className="timeline">
        {projects.map((project) => (
          <li key={project.slug}>
            <time dateTime={project.date || undefined}>{project.date || "No date in the API"}</time>
            <Link href={`/projects/${project.slug}/`}>{project.name}</Link>
            <p className="quiet">
              {project.tier} · {project.chain} · {project.library || "no library"} · {project.invocations.toLocaleString()} minted
            </p>
            <Tags tags={project.tags} />
          </li>
        ))}
      </ol>

      <h2>Verified claims</h2>
      {claims.length ? (
        <div className="scroll">
          <table>
            <caption className="quiet">Claims checked against a source. Confidence is high or medium, as recorded.</caption>
            <thead>
              <tr>
                <th scope="col">Claim</th>
                <th scope="col">Project</th>
                <th scope="col">Category</th>
                <th scope="col">Date</th>
                <th scope="col">Confidence</th>
                <th scope="col">Source</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim.id}>
                  <td>{claim.tool}</td>
                  <td>
                    {claim.projectSlug ? (
                      <Link href={`/projects/${claim.projectSlug}/`}>{claim.project}</Link>
                    ) : (
                      claim.project || "Artist practice"
                    )}
                  </td>
                  <td>{claim.category}</td>
                  <td>{claim.date || "undated"}</td>
                  <td>{claim.confidence}</td>
                  <td>
                    <a href={claim.url}>{claim.url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]}</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No verified claim in this dataset. Most artists have not been researched yet.</p>
      )}

      {related.length ? (
        <>
          <h2>Related work, off Art Blocks</h2>
          <p className="quiet">Not in the Art Blocks API. Not counted in the on-chain totals.</p>
          {related.map((work) => (
            <article key={work.id} className="related">
              <h3>{work.name}</h3>
              <p>{work.description}</p>
              <p>
                {work.kind}. {work.date}. {work.status}
              </p>
              <p className="quiet">{work.makerNote}</p>
              <p>
                Maker: {work.makerSlug ? <Link href={`/artists/${work.makerSlug}/`}>{work.maker}</Link> : work.maker}
                {work.cross.length
                  ? work.cross.map((person) => (
                      <span key={person.name}>
                        {" "}
                        · also linked:{" "}
                        {person.slug ? <Link href={`/artists/${person.slug}/`}>{person.name}</Link> : person.name}
                      </span>
                    ))
                  : null}
              </p>
              <ul className="tags">
                {work.claims.map((claim) => (
                  <li key={claim.tool} className={claim.sourceType === "owner note" ? "tag tag-guessed tag-owner" : "tag tag-verified"}>
                    <span className="tag-kind">{claim.sourceType === "owner note" ? "Owner note" : "Verified"}</span> {claim.tool}: {claim.claim}
                    {claim.url ? (
                      <>
                        {" "}
                        <a href={claim.url}>source</a>
                      </>
                    ) : (
                      <> ({claim.source})</>
                    )}
                    {" · "}
                    {claim.confidence}
                  </li>
                ))}
              </ul>
              <p className="links">
                {work.sources.map((url) => (
                  <a key={url} href={url}>
                    {url.replace(/^https?:\/\//, "")}
                  </a>
                ))}
              </p>
            </article>
          ))}
        </>
      ) : null}

      {collabs.length ? (
        <>
          <h2>Collaboration entries</h2>
          <p className="quiet">Linked, not merged. Same name rule as the v0.1 dataset.</p>
          <ul className="link-list">
            {collabs.map((person) => (
              <li key={person.slug}>
                <Link href={`/artists/${person.slug}/`}>{person.name}</Link>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <p>
        <a href="?suggest=removal#suggest">Request removal</a>
      </p>
    </div>
  );
}
