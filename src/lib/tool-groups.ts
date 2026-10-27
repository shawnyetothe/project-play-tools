export type ToolGroup = {
  id: string;
  label: string;
  /** Maturity-map category names. */
  categories?: string[];
  /** Tool ids, when the shortcut is not a category. */
  ids?: string[];
};

export const toolGroups: ToolGroup[] = [
  { id: "sound", label: "Sound", categories: ["Sound, performance & time"] },
  {
    id: "image",
    label: "Image",
    ids: ["p5", "glsl", "canvas2d", "vanilla", "svg", "paper", "regl", "pjs", "jslegacy"],
  },
  { id: "plot", label: "Pen and plotter", categories: ["Physical: drawing & print"] },
  { id: "3d", label: "3D", ids: ["three", "babylon", "zdog", "aframe", "xr"] },
  { id: "textile", label: "Textile", categories: ["Physical: textile"] },
  { id: "hardware", label: "Hardware", categories: ["Display & hardware"] },
  { id: "agents", label: "Tokens and agents", categories: ["Tokens as agents"] },
];

export function groupsFor(tool: { id: string; category: string }): string[] {
  return toolGroups
    .filter((group) => group.ids?.includes(tool.id) || group.categories?.includes(tool.category))
    .map((group) => group.id);
}
