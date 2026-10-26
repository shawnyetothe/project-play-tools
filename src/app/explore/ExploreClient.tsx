"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Rich } from "@/components/RichText";
import { Legend } from "@/components/Tags";
import explore from "@/generated/explore.json";

const PAGE = 20;

type View = "artists" | "projects" | "map" | "whitespace" | "usage";

function swatch(tier: string) {
  if (tier.startsWith("Mature")) return "swatch swatch-mature";
  if (tier.startsWith("Emergent")) return "swatch swatch-emergent";
  if (tier.startsWith("Under")) return "swatch swatch-under";
  return "swatch swatch-unused";
}

export function ExploreClient() {
  const params = useSearchParams();
  const [view, setView] = useState<View>("artists");
  const [q, setQ] = useState("");
  const [tier, setTier] = useState("all");
  const [chain, setChain] = useState("all");
  const [library, setLibrary] = useState("all");
  const [tool, setTool] = useState(params.get("tool") || "all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [mapTier, setMapTier] = useState("all");
  const [mapCat, setMapCat] = useState("all");
  const [usageCat, setUsageCat] = useState("all");

  const tiers = useMemo(
    () => [...new Set(explore.projects.map((project) => project.tier))].sort(),
    [],
  );
  const chains = useMemo(
    () => [...new Set(explore.projects.map((project) => project.chain))].sort(),
    [],
  );
  const libraries = useMemo(
    () => [...new Set(explore.projects.map((project) => project.library).filter(Boolean))].sort(),
    [],
  );
  const toolOptions = useMemo(
    () => [...explore.tools].sort((a, b) => a.plain.localeCompare(b.plain)),
    [],
  );
  const mapTiers = useMemo(() => [...new Set(explore.maturity.map((row) => row.tier))], []);
  const mapCats = useMemo(() => [...new Set(explore.maturity.map((row) => row.category))].sort(), []);
  const usageCats = useMemo(() => [...new Set(explore.usage.map((row) => row.category))].sort(), []);

  const needle = q.trim().toLowerCase();
  const toolArtists = useMemo(() => {
    if (tool === "all") return null;
    return new Set(
      explore.projects.filter((project) => project.toolIds.includes(tool)).map((project) => project.artistSlug),
    );
  }, [tool]);

  const artists = explore.artists.filter((artist) => {
    if (tier !== "all" && !artist.tiers.includes(tier)) return false;
    if (chain !== "all" && !artist.chains.includes(chain)) return false;
    if (library !== "all" && !artist.libraries.includes(library)) return false;
    if (toolArtists && !toolArtists.has(artist.slug)) return false;
    if (verifiedOnly && artist.verified.length === 0) return false;
    if (!needle) return true;
    const blob = `${artist.name} ${artist.aliases} ${artist.projects}`.toLowerCase();
    return blob.includes(needle);
  });

  const projects = explore.projects.filter((project) => {
    if (tier !== "all" && project.tier !== tier) return false;
    if (chain !== "all" && project.chain !== chain) return false;
    if (library !== "all" && project.library !== library) return false;
    if (tool !== "all" && !project.toolIds.includes(tool)) return false;
    if (verifiedOnly && project.verified.length === 0) return false;
    if (!needle) return true;
    return `${project.name} ${project.artist} ${project.library}`.toLowerCase().includes(needle);
  });

  const mapRows = explore.maturity.filter((row) => {
    if (mapTier !== "all" && row.tier !== mapTier) return false;
    if (mapCat !== "all" && row.category !== mapCat) return false;
    if (!needle) return true;
    return `${row.name} ${row.call} ${row.category}`.toLowerCase().includes(needle);
  });

  const usageRows = explore.usage.filter((row) => {
    if (usageCat !== "all" && row.category !== usageCat) return false;
    if (!needle) return true;
    return `${row.tag} ${row.category} ${row.notes}`.toLowerCase().includes(needle);
  });

  const list = view === "artists" ? artists : projects;
  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  const safePage = Math.min(page, pages - 1);
  const slice = list.slice(safePage * PAGE, safePage * PAGE + PAGE);

  function resetPage() {
    setPage(0);
  }

  return (
    <div>
      <div className="row" role="tablist" aria-label="Data views">
        {(
          [
            ["artists", "Artists"],
            ["projects", "Projects"],
            ["map", "Maturity map"],
            ["whitespace", "Whitespace"],
            ["usage", "Usage"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={view === id ? undefined : "ghost"}
            aria-pressed={view === id}
            onClick={() => {
              setView(id);
              resetPage();
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {view === "artists" || view === "projects" ? (
        <div className="filters">
          <div>
            <label htmlFor="q">Search</label>
            <input
              id="q"
              value={q}
              onChange={(event) => {
                setQ(event.target.value);
                resetPage();
              }}
              placeholder="Name, alias, or project"
            />
          </div>
          <div>
            <label htmlFor="tier">Tier</label>
            <select id="tier" value={tier} onChange={(event) => { setTier(event.target.value); resetPage(); }}>
              <option value="all">All tiers</option>
              {tiers.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="chain">Chain</label>
            <select id="chain" value={chain} onChange={(event) => { setChain(event.target.value); resetPage(); }}>
              <option value="all">All chains</option>
              {chains.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="library">Library</label>
            <select id="library" value={library} onChange={(event) => { setLibrary(event.target.value); resetPage(); }}>
              <option value="all">All libraries</option>
              {libraries.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="tool">Tool</label>
            <select id="tool" value={tool} onChange={(event) => { setTool(event.target.value); resetPage(); }}>
              <option value="all">All tools</option>
              {toolOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.plain}
                </option>
              ))}
            </select>
          </div>
          <label className="check">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(event) => {
                setVerifiedOnly(event.target.checked);
                resetPage();
              }}
            />
            <span>Verified claims only</span>
          </label>
        </div>
      ) : null}

      <p role="status">
        {view === "artists" && `${artists.length.toLocaleString()} artists`}
        {view === "projects" && `${projects.length.toLocaleString()} projects`}
        {view === "map" && `${mapRows.length} map rows`}
        {view === "whitespace" && `${explore.whitespace.length} picks`}
        {view === "usage" && `${usageRows.length} usage rows`}
        {" · pulled "}
        {explore.pulledLabel}
      </p>
      <Legend />

      {view === "artists" ? (
        artists.length ? (
          <ul className="steps">
            {(slice as typeof explore.artists).map((artist) => (
              <li key={artist.slug}>
                <Link href={`/artists/${artist.slug}/`}>{artist.name}</Link>
                {artist.aliases ? <span className="quiet"> aka {artist.aliases}</span> : null}
                <span className="quiet">
                  {" "}
                  · {artist.count} · {artist.first || "?"} to {artist.latest || "?"} · {artist.libraries.slice(0, 3).join(", ")}
                  {artist.verified.length ? ` · verified ${artist.verified.length}` : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nothing matches. Clear a filter or try a shorter word.</p>
        )
      ) : null}

      {view === "projects" ? (
        projects.length ? (
          <ul className="steps">
            {(slice as typeof explore.projects).map((project) => (
              <li key={project.slug}>
                <Link href={`/projects/${project.slug}/`}>{project.name}</Link>
                {" · "}
                <Link href={`/artists/${project.artistSlug}/`}>{project.artist}</Link>
                <span className="quiet">
                  {" "}
                  · {project.date || "no date"} · {project.tier} · {project.chain} · {project.library} · {project.mints.toLocaleString()} minted
                  {project.verified.length ? ` · verified ${project.verified.join(", ")}` : ""}
                  {project.guessed.length ? ` · guessed ${project.guessed.join(", ")}` : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nothing matches. Clear a filter or try a shorter word.</p>
        )
      ) : null}

      {view === "artists" || view === "projects" ? (
        <div className="pager">
          <button type="button" onClick={() => setPage(Math.max(0, safePage - 1))} disabled={safePage === 0}>
            Previous
          </button>
          <span>
            Page {safePage + 1} of {pages}
          </span>
          <button type="button" onClick={() => setPage(Math.min(pages - 1, safePage + 1))} disabled={safePage >= pages - 1}>
            Next
          </button>
        </div>
      ) : null}

      {view === "map" ? (
        <>
          <div className="filters">
            <div>
              <label htmlFor="map-tier">Our tier</label>
              <select id="map-tier" value={mapTier} onChange={(event) => setMapTier(event.target.value)}>
                <option value="all">All tiers</option>
                {mapTiers.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="map-cat">Category</label>
              <select id="map-cat" value={mapCat} onChange={(event) => setMapCat(event.target.value)}>
                <option value="all">All categories</option>
                {mapCats.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="map-q">Search the map</label>
              <input id="map-q" value={q} onChange={(event) => setQ(event.target.value)} />
            </div>
          </div>
          <p className="quiet">
            <span className="swatch swatch-mature" /> Mature{" "}
            <span className="swatch swatch-emergent" /> Emergent{" "}
            <span className="swatch swatch-under" /> Under-explored{" "}
            <span className="swatch swatch-unused" /> Unused means nothing was found
          </p>
          <div className="card-grid">
            {mapRows.map((row) => (
              <article key={row.name} className="card">
                <h3>
                  <span className={swatch(row.tier)} aria-hidden="true" />
                  {row.toolId ? <Link href={`/tools/${row.toolId}/`}>{row.name}</Link> : row.name}
                </h3>
                <p>
                  {row.tier} · {row.category}
                </p>
                <p>
                  <Rich text={row.call} />
                </p>
                <p className="quiet">
                  <Rich text={row.abTrend} />
                </p>
              </article>
            ))}
          </div>
        </>
      ) : null}

      {view === "whitespace" ? (
        <div className="card-grid">
          {explore.whitespace.map((row) => (
            <article key={row.pick} className="card">
              <h3>{row.rank === "0" ? "Unranked" : `Rank ${row.rank}`}</h3>
              <p>{row.pick}</p>
              <p className="quiet">
                SRB {row.srbRank === "0" ? "unranked" : `#${row.srbRank}`} · {row.confidence}
              </p>
              <p>
                <Rich text={row.why} />
              </p>
              <p>
                Cheap test: <Rich text={row.test} />
              </p>
              <p className="quiet">{row.data}</p>
            </article>
          ))}
        </div>
      ) : null}

      {view === "usage" ? (
        <>
          <div>
            <label htmlFor="usage-cat">Category</label>
            <select id="usage-cat" value={usageCat} onChange={(event) => setUsageCat(event.target.value)}>
              <option value="all">All categories</option>
              {usageCats.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="scroll">
            <table>
              <caption className="quiet">
                Counts from this dataset. A project can be verified and also inferred in the source tally; guessed-only means the keyword was the only evidence.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Tag</th>
                  <th scope="col">Projects</th>
                  <th scope="col">Verified</th>
                  <th scope="col">Inferred</th>
                  <th scope="col">Guessed only</th>
                  <th scope="col">Trend</th>
                </tr>
              </thead>
              <tbody>
                {usageRows.map((row) => (
                  <tr key={`${row.category}-${row.tag}`}>
                    <td>
                      {row.tag}
                      <span className="quiet"> · {row.category}</span>
                      {row.mostlyGuessed === "YES" ? <span className="tag tag-guessed">mostly guessed</span> : null}
                      {row.notes ? <span className="quiet"> {row.notes}</span> : null}
                    </td>
                    <td>{row.projects}</td>
                    <td>{row.verified}</td>
                    <td>{row.inferred}</td>
                    <td>{row.guessedOnly}</td>
                    <td>{row.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
}
