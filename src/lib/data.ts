import artistsJson from "@/generated/artists.json";
import claimsJson from "@/generated/claims.json";
import metaJson from "@/generated/meta.json";
import projectsJson from "@/generated/projects.json";
import toolsJson from "@/generated/tools.json";
import type { Artist, Claim, Meta, Project, Tool } from "./types";

export const tools = toolsJson as Tool[];
export const artists = artistsJson as Artist[];
export const projects = projectsJson as Project[];
export const claims = claimsJson as Claim[];
export const meta = metaJson as Meta;

export const toolById = new Map(tools.map((tool) => [tool.id, tool]));
export const artistBySlug = new Map(artists.map((artist) => [artist.slug, artist]));
export const projectBySlug = new Map(projects.map((project) => [project.slug, project]));
export const claimById = new Map(claims.map((claim) => [claim.id, claim]));
export const relatedById = new Map(meta.related.map((work) => [work.id, work]));
export const recipeBySlug = new Map(meta.recipes.map((recipe) => [recipe.slug, recipe]));
export const pathBySlug = new Map(meta.paths.map((path) => [path.slug, path]));

export function toolName(id: string): string {
  return toolById.get(id)?.name ?? id;
}
