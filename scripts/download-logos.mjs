import fs from "node:fs";
import path from "node:path";
import { resources } from "../src/data/resources.js";

const outDir = path.resolve("./public/logos");
fs.mkdirSync(outDir, { recursive: true });

for (const resource of resources) {
  let domain = "";
  try {
    domain = new URL(resource.website).hostname;
  } catch {
    domain = "";
  }

  if (!domain) {
    console.log(`Skipped ${resource.id} (invalid website URL)`);
    continue;
  }

  const urls = [
    `https://logo.clearbit.com/${domain}`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
  ];

  let saved = false;
  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: { "user-agent": "Mozilla/5.0" },
      });
      if (!response.ok) {
        continue;
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("image")) {
        continue;
      }

      const bytes = Buffer.from(await response.arrayBuffer());

      fs.writeFileSync(path.join(outDir, `${resource.id}.png`), bytes);
      saved = true;
      break;
    } catch {
      // Try next candidate URL.
    }
  }

  if (saved) {
    console.log(`Saved ${resource.id}.png`);
  } else {
    console.log(`No logo found for ${resource.id}`);
  }
}
