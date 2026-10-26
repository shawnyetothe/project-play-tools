import type { Metadata } from "next";
import Link from "next/link";
import { artists, meta } from "@/lib/data";

export const metadata: Metadata = { title: "Artists" };

function bucket(name: string): string {
  const ch = name.trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(ch) ? ch : "#";
}

export default function ArtistsPage() {
  const groups = new Map<string, typeof artists>();
  for (const artist of artists) {
    const key = bucket(artist.name);
    const list = groups.get(key) ?? [];
    list.push(artist);
    groups.set(key, list);
  }
  const letters = [...groups.keys()].sort();
  return (
    <div className="wrap">
      <p className="quiet">
        <Link href="/">Home</Link> / Artists
      </p>
      <h1>Artists</h1>
      <p>
        {meta.counts.artists.toLocaleString()} people and studios with a project in the public Art Blocks record, pulled {meta.pulledLabel}. Collaborations stay as their own entries.
      </p>
      <p className="quiet">
        We list them from that public record. We do not feature anyone beyond it without consent.{" "}
        <Link href="/explore/">Filter the data</Link>.
      </p>
      {letters.map((letter) => (
        <section key={letter}>
          <h2>{letter}</h2>
          <ul className="link-list">
            {groups
              .get(letter)!
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((artist) => (
                <li key={artist.slug}>
                  <Link href={`/artists/${artist.slug}/`}>{artist.name}</Link>
                  {artist.aliases ? <span className="quiet"> aka {artist.aliases}</span> : null}
                  <span className="quiet">
                    {" "}
                    · {artist.count} project{artist.count === 1 ? "" : "s"}
                    {artist.claimIds.length ? ` · ${artist.claimIds.length} verified` : ""}
                  </span>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
