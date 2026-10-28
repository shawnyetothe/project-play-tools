"use client";

import { useWorkspace } from "./Workspace";

export function UseRule({ rule }: { rule: string }) {
  const { setState, href } = useWorkspace();
  return (
    <p>
      <button type="button" onClick={() => setState({ rule, interacted: true })}>Use this rule</button>
      {" · "}
      <a href={href("/generate/")}>Open Generate</a>
    </p>
  );
}
