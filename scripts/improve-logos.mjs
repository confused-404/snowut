import fs from "node:fs";
import path from "node:path";
import { resources } from "../src/data/resources.js";

const logosDir = path.resolve("./public/logos");
fs.mkdirSync(logosDir, { recursive: true });

const MIN_BYTES_FOR_OK_LOGO = 3000;
const MAX_BYTES_FOR_LOGO = 2_000_000;

function getExistingLogoPath(resourceId) {
  const png = path.join(logosDir, `${resourceId}.png`);
  const svg = path.join(logosDir, `${resourceId}.svg`);
  if (fs.existsSync(png)) return png;
  if (fs.existsSync(svg)) return svg;
  return null;
}

function currentLogoNeedsUpgrade(resourceId) {
  const existing = getExistingLogoPath(resourceId);
  if (!existing) return true;
  const size = fs.statSync(existing).size;
  if (size > MAX_BYTES_FOR_LOGO) return true;
  if (existing.endsWith(".svg")) return false;
  return size < MIN_BYTES_FOR_OK_LOGO;
}

function absoluteUrl(baseUrl, maybeRelative) {
  try {
    return new URL(maybeRelative, baseUrl).toString();
  } catch {
    return "";
  }
}

function extractAssetCandidates(html, baseUrl) {
  const candidates = [];
  const push = (url) => {
    if (!url) return;
    if (/^data:/i.test(url)) return;
    const resolved = absoluteUrl(baseUrl, url);
    if (!resolved) return;
    if (!candidates.includes(resolved)) candidates.push(resolved);
  };

  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/gi,
    /<link[^>]+rel=["'][^"']*apple-touch-icon[^"']*["'][^>]+href=["']([^"']+)["']/gi,
    /<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']+)["']/gi,
    /<img[^>]+(?:class|id)=["'][^"']*(?:logo|brand)[^"']*["'][^>]+src=["']([^"']+)["']/gi,
  ];

  for (const pattern of patterns) {
    let match = pattern.exec(html);
    while (match) {
      push(match[1]);
      match = pattern.exec(html);
    }
  }

  return candidates;
}

function extensionFromContentType(contentType, fallbackUrl = "") {
  const type = (contentType ?? "").toLowerCase();
  if (type.includes("image/svg")) return ".svg";
  if (type.includes("image/webp")) return ".webp";
  if (type.includes("image/jpeg")) return ".jpg";
  if (type.includes("image/x-icon") || type.includes("image/vnd.microsoft.icon")) {
    return ".ico";
  }
  if (type.includes("image/png")) return ".png";

  const pathname = (() => {
    try {
      return new URL(fallbackUrl).pathname.toLowerCase();
    } catch {
      return "";
    }
  })();
  if (pathname.endsWith(".svg")) return ".svg";
  if (pathname.endsWith(".webp")) return ".webp";
  if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg")) return ".jpg";
  if (pathname.endsWith(".ico")) return ".ico";
  return ".png";
}

function scoreAsset(url, bytes, contentType) {
  let score = bytes;
  const lower = url.toLowerCase();
  const type = (contentType ?? "").toLowerCase();
  if (type.includes("svg")) score += 60000;
  if (lower.includes("logo")) score += 12000;
  if (lower.includes("apple-touch-icon")) score += 8000;
  if (lower.includes("favicon")) score -= 8000;
  if (lower.includes("sprite")) score -= 12000;
  return score;
}

async function fetchPage(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "Mozilla/5.0" },
    redirect: "follow",
  });
  if (!response.ok) throw new Error(`Page request failed: ${response.status}`);
  const html = await response.text();
  return { html, resolvedUrl: response.url };
}

async function fetchBestAsset(candidates) {
  let best = null;
  for (const url of candidates.slice(0, 25)) {
    try {
      const response = await fetch(url, {
        headers: { "user-agent": "Mozilla/5.0" },
        redirect: "follow",
      });
      if (!response.ok) continue;
      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.toLowerCase().includes("image")) continue;
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length > MAX_BYTES_FOR_LOGO) continue;
      if (bytes.length < 700) continue;
      const score = scoreAsset(url, bytes.length, contentType);
      if (!best || score > best.score) {
        best = { bytes, url, contentType, score };
      }
    } catch {
      // Keep evaluating candidates.
    }
  }
  return best;
}

function removeOldFiles(resourceId) {
  [".png", ".svg", ".webp", ".jpg", ".ico"].forEach((ext) => {
    const p = path.join(logosDir, `${resourceId}${ext}`);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  });
}

for (const resource of resources) {
  if (!currentLogoNeedsUpgrade(resource.id)) {
    console.log(`Kept ${resource.id} (already good)`);
    continue;
  }

  let page;
  try {
    page = await fetchPage(resource.website);
  } catch {
    console.log(`Could not load page for ${resource.id}`);
    continue;
  }

  const candidates = extractAssetCandidates(page.html, page.resolvedUrl);
  const directDomainCandidates = [];
  try {
    const domain = new URL(resource.website).hostname;
    directDomainCandidates.push(`https://logo.clearbit.com/${domain}`);
    directDomainCandidates.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=256`);
  } catch {
    // Ignore parse failures.
  }
  const allCandidates = [...candidates, ...directDomainCandidates];
  const best = await fetchBestAsset(allCandidates);
  if (!best) {
    console.log(`No better asset found for ${resource.id}`);
    continue;
  }

  const ext = extensionFromContentType(best.contentType, best.url);
  removeOldFiles(resource.id);
  const outPath = path.join(logosDir, `${resource.id}${ext}`);
  fs.writeFileSync(outPath, best.bytes);
  console.log(`Upgraded ${resource.id} -> ${path.basename(outPath)} (${best.bytes.length} bytes)`);
}
