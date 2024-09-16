import NodeClam from "clamscan";

export default async (nodeClam: NodeClam) => {
  const version = await nodeClam.getVersion();
  return version.match(/\/(\d+)\//)?.[1] || "unknown";
};
