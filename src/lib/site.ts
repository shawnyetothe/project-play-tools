export const suggestEmail = process.env.NEXT_PUBLIC_SUGGEST_EMAIL ?? "";
export const githubRepo = process.env.NEXT_PUBLIC_GITHUB_REPO ?? "";

/** Turn a recorded site string into an absolute link. Leave typos and non-URLs as text. */
export function externalHref(value: string): string | null {
  const url = value.trim();
  if (!url || /\s/.test(url) || (url.includes("://") && !/^https?:\/\//i.test(url))) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (/^[a-z0-9.-]+\.[a-z]{2,}([/:?#].*)?$/i.test(url)) return `https://${url}`;
  return null;
}

export const suggestKinds = [
  { id: "tool", label: "Suggest a tool" },
  { id: "example", label: "Suggest an example" },
  { id: "fix", label: "Suggest a fix" },
  { id: "claim", label: "This is me: claim or edit this page" },
  { id: "removal", label: "Request removal" },
] as const;

export type SuggestKind = (typeof suggestKinds)[number]["id"];
