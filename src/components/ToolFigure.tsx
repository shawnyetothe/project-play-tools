"use client";

import { useState } from "react";
import type { ToolImage } from "@/lib/types";

export function ToolFigure({ image, toolName }: { image: ToolImage; toolName: string }) {
  const [failed, setFailed] = useState(false);
  const placeholder = image.status !== "verified" || !image.url;

  return (
    <figure className="hero-figure">
      {placeholder || failed ? (
        <div className="placeholder" role="img" aria-label="No verified image yet">
          <p>No verified image yet</p>
          {image.caption ? <p>{image.caption}</p> : null}
        </div>
      ) : (
        <img
          src={image.url}
          alt={image.caption || `Example of ${toolName}`}
          onError={() => setFailed(true)}
        />
      )}
      <figcaption>
        {image.caption ? <p>{image.caption}</p> : null}
        {image.credit ? <p>{image.credit}</p> : null}
        <p>{image.license ? `License: ${image.license}` : "No separate license line in the dataset."}</p>
        <p className="quiet">
          {image.checked ? `Image URL checked ${image.checked}. ` : ""}
          Loaded from the original address. Not rehosted.
        </p>
        <p className="links">
          {image.url ? (
            <a href={image.url}>
              Image file
            </a>
          ) : null}
          {image.source ? (
            <a href={image.source}>Source page</a>
          ) : null}
          {image.artistSlug ? <a href={`/artists/${image.artistSlug}/`}>Artist</a> : null}
          <a href="?suggest=removal#suggest">Request removal</a>
        </p>
      </figcaption>
    </figure>
  );
}
