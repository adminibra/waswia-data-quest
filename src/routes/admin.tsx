import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin-shell";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [
    { title: "Administration — WASWIA" },
    { name: "description", content: "Administration des sondages et données WASWIA." },
    { property: "og:title", content: "Administration — WASWIA" },
    { property: "og:description", content: "Administration des sondages et données WASWIA." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AdminShell,
});