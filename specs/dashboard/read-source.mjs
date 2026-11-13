// Prints a compact excerpt of a source, so that an agent reads numbers and lists instead of whole files:
// a LiaScript course file (header styling and imports, slides, images and whether they are credited), a folder
// (its LiaScript course files), a PowerPoint .pptx (per slide title, text, speaker notes, images; theme colours and
// fonts), a PDF (page count and metadata only – the content is read with the file-reading tool) and a web page
// (headings, paragraphs, list items, images with their target). Reads anywhere; writes only the images of a .pptx,
// into .cache/source/{slug}/ inside the current folder. Run from the course project root:
//   node specs/dashboard/read-source.mjs <file | folder | URL> [--json]
// Exit code 0: read · 2: invalid call, unknown format or not readable (one line reason).
import { readFileSync, readdirSync, statSync, existsSync, mkdirSync, writeFileSync, realpathSync } from "node:fs";
import { resolve, relative, isAbsolute, extname, basename, join, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { inflateRawSync, inflateSync } from "node:zlib";
import { headerOf } from "./journal-model.mjs";

const usage = `Usage: node specs/dashboard/read-source.mjs <file | folder | URL> [--json]
  .md (LiaScript): header styling and imports, slides, images with alt text, target and credit
  folder: the LiaScript course files in it · .pptx: slides, notes, images (unpacked to .cache/source/{slug}/),
  theme colours and fonts · .pdf: page count and metadata · .html or http(s) URL: headings, paragraphs, lists, images
Exit code 0: read · 2: invalid call, unknown format or not readable.`;
const TIMEOUT = 15000;
const WIDTH = 200;
const SKIP = new Set(["node_modules", "specs", "lia-templates"]);
const ARCHIVE = /^(backups?|archiv|archive)$/i;
const LIMIT = 50 * 1024 * 1024; // largest inflated ZIP entry or PDF object stream
const PAGE_LIMIT = 5 * 1024 * 1024; // largest web page
const ROWS = 300; // printed blocks and images of a web page (--json gives all)

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", auml: "ä", ouml: "ö", uuml: "ü", Auml: "Ä", Ouml: "Ö", Uuml: "Ü", szlig: "ß", ndash: "–", mdash: "—", hellip: "…", laquo: "«", raquo: "»", bdquo: "„", ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’", copy: "©", shy: "" };
const decode = text => String(text).replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (all, name) =>
  name[0] === "#" ? String.fromCodePoint(name[1].toLowerCase() === "x" ? parseInt(name.slice(2), 16) : Number(name.slice(1))) : ENTITIES[name] ?? all);
const clean = text => decode(String(text).replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
const cut = text => text.length > WIDTH ? `${text.slice(0, WIDTH - 1)}…` : text;

// ---- LiaScript ----

// Header styling (link: to a stylesheet or font service, @style/@custom … @end, theme imports), imports, slides and
// images of a LiaScript course. A theme block of ## Visual Identity is made of exactly these kinds.
const STYLESHEET = /\.css([?#]|$)|\/css2?\?|^https?:\/\/(fonts\.googleapis\.com|fonts\.bunny\.net|use\.typekit\.net)\//i;
export function readLiaScript(text) {
  const styling = [], imports = [];
  const entry = (key, values) => {
    const urls = values.join(" ").split(/\s+/).filter(Boolean);
    if (key === "import") for (const url of urls) {
      const kind = /theme|design/i.test(url) ? "theme" : "template";
      imports.push({ url, kind });
      if (kind === "theme") styling.push({ kind: "theme-import", lines: [`import: ${url}`] });
    }
    if (key === "link") for (const url of urls.filter(url => STYLESHEET.test(url))) styling.push({ kind: "link-css", lines: [`link: ${url}`] });
  };
  let key = null, values = [], block = null;
  for (const line of headerOf(text).split(/\r?\n/)) {
    const trimmed = line.trim();
    if (block) {
      block.lines.push(line);
      if (trimmed === "@end") { if (block.name === "style" || block.name === "custom") styling.push({ kind: block.name, lines: block.lines }); block = null; }
      continue;
    }
    const start = trimmed.match(/^@([\w.-]+)$/);
    const pair = line.match(/^\s*([\w-]+):(?:\s+|$)(.*)$/);
    if (start || pair || trimmed.startsWith("@")) { if (key) entry(key, values); key = null; values = []; }
    if (start) block = { name: start[1], lines: [line] };
    else if (pair) { key = pair[1]; values = [pair[2]]; }
    else if (key && trimmed) values.push(trimmed);
  }
  if (key) entry(key, values);

  // The body without the header; lines inside code fences are blanked (no slides, no images).
  const header = text.replace(/^\uFEFF/, "").match(/^\s*<!--[\s\S]*?-->/)?.[0] ?? "";
  let fence = null;
  const lines = text.replace(/^\uFEFF/, "").slice(header.length).split(/\r?\n/).map(line => {
    const mark = line.match(/^\s*(`{3,}|~{3,})/)?.[1];
    if (fence) { if (mark && mark[0] === fence[0] && mark.length >= fence.length) fence = null; return ""; }
    if (mark) { fence = mark; return ""; }
    return line;
  });
  const slides = [], images = [], bodies = [""];
  for (const line of lines) {
    const heading = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
    if (heading) {
      slides.push({ n: slides.length + 1, level: heading[1].length, title: clean(heading[2].replace(/<!--[\s\S]*?-->/g, "")) });
      bodies.push("");
      continue;
    }
    bodies[slides.length] += `${line}\n`;
    for (const match of line.matchAll(/(?<!\?)!\[([^\]]*)\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)) images.push({ slide: slides.length, alt: match[1].trim(), target: match[2] });
    for (const tag of line.matchAll(/<img\b[^>]*>/gi)) {
      const target = tag[0].match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1];
      if (target) images.push({ slide: slides.length, alt: tag[0].match(/\balt\s*=\s*["']([^"']*)["']/i)?.[1] ?? "", target });
    }
  }
  const creditPattern = /(bild|image|foto|photo).*(nachweis|credit|quelle|source)|^(quellen|sources|lizenz|licen[cs]e)/i;
  // File names compare decoded, with "_" as space and in lower case: "a%2C_b.jpg" is credited by "File:A,_b.jpg";
  // no letter or digit may stand right before or after the name ("1.png" is not credited by "11.png" or "1.png2").
  const plain = value => value.replace(/(%[0-9A-F]{2})+/gi, code => { try { return decodeURIComponent(code); } catch { return code; } }).replace(/_/g, " ").toLowerCase();
  // An image on a credit slide credits itself only with a caption on its line ("![](a.png) Foto: CC BY"); the markup
  // of an image standing alone there is left out.
  const markup = /(?<!\?)!\[[^\]]*\]\([^)]*\)|<img\b[^>]*>/gi;
  const credits = plain(slides.filter(slide => creditPattern.test(slide.title)).map(slide => bodies[slide.n]).join("\n")
    .split("\n").map(line => /[\p{L}\p{N}]/u.test(line.replace(markup, " ")) ? line : line.replace(markup, " ")).join("\n"));
  for (const image of images) {
    const name = plain(basename(image.target.split(/[?#]/)[0]));
    image.credit = Boolean(name) && new RegExp(`(?<![\\p{L}\\p{N}])${name.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}(?![\\p{L}\\p{N}])`, "u").test(credits);
  }
  return { header: { theme: styling.flatMap(item => item.lines), styling, imports }, slides, images };
}

// The LiaScript course files of a folder (.md with a header), relative and sorted; skips node_modules, specs,
// lia-templates, hidden folders (.git, .cache …), archive copies (folders starting with "_", backup(s), archiv(e)),
// symbolic links and journal.md.
export function listCourses(dir) {
  const found = [];
  (function walk(folder) {
    for (const item of readdirSync(folder, { withFileTypes: true })) {
      const path = join(folder, item.name);
      if (item.isDirectory() && !SKIP.has(item.name) && !/^[._]/.test(item.name) && !ARCHIVE.test(item.name)) walk(path);
      else if (item.isFile() && extname(item.name).toLowerCase() === ".md" && item.name !== "journal.md"
        && /^\s*(@?[\w-]+:|@[\w.-]+\s*$)/m.test(headerOf(readFileSync(path, "utf8")))) found.push(relative(dir, path).split(sep).join("/"));
    }
  })(dir);
  return found.sort((a, b) => a.localeCompare(b));
}

// ---- ZIP and PowerPoint ----

// The files of a ZIP archive (stored or deflated entries, each at most 50 MB inflated; no ZIP64), name → content.
export function unzip(buffer) {
  let end = -1;
  for (let index = buffer.length - 22; index >= Math.max(0, buffer.length - 65557); index--) if (buffer.readUInt32LE(index) === 0x06054b50) { end = index; break; }
  if (end < 0) throw new Error("not a ZIP archive");
  try { return entries(buffer, end); } catch (error) { throw new Error(`broken ZIP archive (${error.message})`); }
}
function entries(buffer, end) {
  const files = new Map();
  let at = buffer.readUInt32LE(end + 16);
  for (let count = buffer.readUInt16LE(end + 10); count > 0; count--) {
    if (buffer.readUInt32LE(at) !== 0x02014b50) throw new Error("broken ZIP directory");
    const method = buffer.readUInt16LE(at + 10), size = buffer.readUInt32LE(at + 20), nameLength = buffer.readUInt16LE(at + 28);
    const name = buffer.toString("utf8", at + 46, at + 46 + nameLength), local = buffer.readUInt32LE(at + 42);
    at += 46 + nameLength + buffer.readUInt16LE(at + 30) + buffer.readUInt16LE(at + 32);
    if (name.endsWith("/") || buffer.readUInt32LE(local) !== 0x04034b50) continue;
    const start = local + 30 + buffer.readUInt16LE(local + 26) + buffer.readUInt16LE(local + 28);
    if (start + size > buffer.length) throw new Error(`${name} runs past the end`);
    const data = buffer.subarray(start, start + size);
    if (method === 0) files.set(name, data);
    else if (method === 8) files.set(name, inflateRawSync(data, { maxOutputLength: LIMIT }));
  }
  return files;
}

const text = (files, name) => files.get(name)?.toString("utf8") ?? "";
const paragraphs = xml => [...xml.matchAll(/<a:p\b[^>]*>([\s\S]*?)<\/a:p>/g)]
  .map(match => decode([...match[1].matchAll(/<a:t>([^<]*)<\/a:t>/g)].map(t => t[1]).join("")).trim()).filter(Boolean);
const shapes = xml => [...xml.matchAll(/<p:sp\b[^>]*>[\s\S]*?<\/p:sp>/g)].map(match => ({ xml: match[0], type: match[0].match(/<p:ph\b[^>]*\btype="(\w+)"/)?.[1] ?? null }));
// The relationships of a part: id → { type, target as a path inside the archive }.
function rels(files, part) {
  const folder = part.split("/").slice(0, -1);
  const out = {};
  for (const match of text(files, `${folder.join("/")}/_rels/${part.split("/").pop()}.rels`).matchAll(/<Relationship\b[^>]*>/g)) {
    const attr = name => match[0].match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] ?? "";
    const path = [...folder];
    for (const step of attr("Target").split("/")) step === ".." ? path.pop() : step && step !== "." && path.push(step);
    out[attr("Id")] = { type: attr("Type").split("/").pop(), target: attr("Target").startsWith("/") ? attr("Target").slice(1) : path.join("/") };
  }
  return out;
}

// Slides in presentation order (title, text, speaker notes, image file names), theme colours and fonts of a .pptx
// (its bytes, or the files unzip() already read from it).
export function readPptx(input) {
  const files = input instanceof Map ? input : unzip(input);
  const number = name => Number(name.match(/(\d+)\.xml$/)?.[1] ?? 0);
  let order = [...files.keys()].filter(name => /^ppt\/slides\/slide\d+\.xml$/.test(name)).sort((a, b) => number(a) - number(b));
  const presentation = rels(files, "ppt/presentation.xml");
  const listed = [...text(files, "ppt/presentation.xml").matchAll(/<p:sldId\b[^>]*\br:id="([^"]+)"/g)].map(match => presentation[match[1]]?.target).filter(name => files.has(name));
  if (listed.length) order = listed;
  const slides = order.map((name, index) => {
    const xml = text(files, name), links = Object.values(rels(files, name));
    const title = shapes(xml).filter(item => /^(title|ctrTitle)$/.test(item.type ?? ""));
    const notesPart = links.find(link => link.type === "notesSlide")?.target ?? `ppt/notesSlides/notesSlide${number(name)}.xml`;
    const notes = shapes(text(files, notesPart));
    const body = notes.filter(item => item.type === "body");
    return {
      n: index + 1,
      title: title.flatMap(item => paragraphs(item.xml)).join(" "),
      text: paragraphs(title.reduce((rest, item) => rest.replace(item.xml, ""), xml)),
      notes: (body.length ? body : notes.filter(item => !/^(sldNum|sldImg|hdr|ftr|dt)$/.test(item.type ?? ""))).flatMap(item => paragraphs(item.xml)),
      images: [...new Set(links.filter(link => link.type === "image" || link.target.includes("/media/")).map(link => basename(link.target)))]
    };
  });
  const master = [...files.keys()].find(name => /^ppt\/slideMasters\/slideMaster\d+\.xml$/.test(name));
  const themePart = (master && Object.values(rels(files, master)).find(link => link.type === "theme")?.target)
    || [...files.keys()].filter(name => /^ppt\/theme\/theme\d+\.xml$/.test(name)).sort((a, b) => number(a) - number(b))[0];
  const theme = text(files, themePart ?? "");
  const colors = {};
  for (const match of (theme.match(/<a:clrScheme\b[\s\S]*?<\/a:clrScheme>/)?.[0] ?? "").matchAll(/<a:(dk1|lt1|dk2|lt2|accent[1-6]|hlink|folHlink)>([\s\S]*?)<\/a:\1>/g)) {
    const value = match[2].match(/<a:srgbClr\b[^>]*\bval="([0-9A-Fa-f]{6})"/)?.[1] ?? match[2].match(/\blastClr="([0-9A-Fa-f]{6})"/)?.[1];
    if (value) colors[match[1]] = `#${value.toUpperCase()}`;
  }
  const font = kind => theme.match(new RegExp(`<a:${kind}Font>[\\s\\S]*?<a:latin\\b[^>]*\\btypeface="([^"]*)"`))?.[1] || null;
  return { slides, theme: { colors, fonts: { major: font("major"), minor: font("minor") } } };
}

// ---- PDF ----

// A PDF string (literal "(…)" or hex "<…>") as text; UTF-16BE with byte order mark, else Latin-1.
function pdfString(raw) {
  let bytes;
  if (raw.startsWith("<")) bytes = Buffer.from(raw.slice(1, -1).replace(/\s/g, ""), "hex");
  else bytes = Buffer.from(raw.slice(1, -1).replace(/\\([nrtbf()\\]|[0-7]{1,3}|\r?\n)/g, (all, code) =>
    /^[0-7]/.test(code) ? String.fromCharCode(parseInt(code, 8)) : { n: "\n", r: "\r", t: "\t", b: "\b", f: "\f" }[code] ?? (/\n/.test(code) ? "" : code)), "latin1");
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return Buffer.from(bytes.subarray(2)).swap16().toString("utf16le").trim();
  return bytes.toString("latin1").trim();
}

// Page count, title and author of a PDF; compressed object streams (/Type /ObjStm, at most 50 MB each) are read
// as well, other streams (page content, images, fonts) are not.
export function readPdfInfo(buffer) {
  const raw = buffer.toString("latin1");
  if (!raw.startsWith("%PDF")) throw new Error("not a PDF file");
  let source = raw;
  for (const match of raw.matchAll(/(?<!end)stream\r?\n([\s\S]*?)endstream/g)) {
    const before = raw.slice(Math.max(0, match.index - 2000), match.index);
    if (!/\/Type\s*\/ObjStm\b/.test(before.slice(before.lastIndexOf("obj")))) continue;
    try { source += `\n${inflateSync(Buffer.from(match[1], "latin1"), { maxOutputLength: LIMIT }).toString("latin1")}`; } catch { /* not deflated or too large */ }
  }
  const counts = [...source.matchAll(/\/Type\s*\/Pages\b[^>]*?\/Count\s+(\d+)|\/Count\s+(\d+)[^>]*?\/Type\s*\/Pages\b/g)].map(match => Number(match[1] ?? match[2]));
  const pages = counts.length ? Math.max(...counts) : source.match(/\/Type\s*\/Page(?![a-zA-Z])/g)?.length ?? 0;
  const field = name => { const raw = source.match(new RegExp(`/${name}\\s*(\\((?:\\\\[\\s\\S]|[^\\\\)])*\\)|<[0-9A-Fa-f\\s]*>)`))?.[1]; return raw ? pdfString(raw) || null : null; };
  return { pages, title: field("Title"), author: field("Author") };
}

// ---- HTML ----

// Title, headings, paragraphs and list items in page order and images (absolute src) of a web page; script,
// style, nav and footer content is left out.
export function readHtml(html, baseUrl) {
  const page = String(html).replace(/<!--[\s\S]*?-->/g, "").replace(/<(script|style|nav|footer|noscript|template)\b[\s\S]*?<\/\1\s*>/gi, "");
  const title = page.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const body = page.replace(/<head\b[\s\S]*?<\/head\s*>/i, "").replace(/<title\b[\s\S]*?<\/title>/i, "");
  const blocks = [];
  for (const match of body.matchAll(/<(h[1-6]|p|li)\b[^>]*>([\s\S]*?)<\/\1\s*>/gi)) {
    const content = clean(match[2]), tag = match[1].toLowerCase();
    if (content) blocks.push(tag[0] === "h" ? { type: "h", level: Number(tag[1]), text: content } : { type: tag, text: content });
  }
  const images = [];
  for (const tag of body.matchAll(/<img\b[^>]*>/gi)) {
    const attr = name => tag[0].match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"))?.slice(1).find(value => value !== undefined);
    const src = attr("src") ?? attr("data-src");
    if (!src || src.startsWith("data:")) continue;
    try { images.push({ src: new URL(decode(src), baseUrl).href, alt: clean(attr("alt") ?? "") }); } catch { /* unusable address */ }
  }
  return { title: title ? clean(title) || null : null, blocks, images };
}

// ---- CLI ----

const say = lines => console.log(lines.join("\n"));
function printLiaScript(name, r) {
  const { imports, styling } = r.header;
  const themes = imports.filter(item => item.kind === "theme").length;
  say([`LiaScript course: ${name}`,
    `Header: ${imports.length} import(s) (${imports.length - themes} template, ${themes} theme), styling: ${styling.length ? styling.map(item => item.kind).join(", ") : "none"}`,
    ...imports.map(item => `  import (${item.kind}): ${item.url}`),
    ...styling.filter(item => item.kind !== "theme-import").map(item => item.kind === "style" || item.kind === "custom" ? `  ${item.kind}: @${item.kind} … @end (${item.lines.length} lines)` : `  ${item.kind}: ${item.lines[0]}`),
    `Slides: ${r.slides.length}`, ...r.slides.map(slide => `  ${slide.n} ${"#".repeat(slide.level)} ${cut(slide.title)}`),
    `Images: ${r.images.length} (${r.images.filter(image => image.credit).length} credited)`,
    ...r.images.map(image => `  slide ${image.slide} · ${image.alt ? `"${cut(image.alt)}"` : "(no alt text)"} · ${image.target} · ${image.credit ? "credit" : "no credit"}`)]);
}

async function main(args) {
  const json = args.includes("--json");
  const rest = args.filter(arg => arg !== "--json");
  if (rest[0] === "--help" || rest[0] === "-h") { console.log(usage); return 0; }
  if (rest.length !== 1 || rest[0].startsWith("-")) throw new Error(usage);
  const [target] = rest;
  const out = result => { if (json) console.log(JSON.stringify(result, null, 1)); return !json; };

  if (/^https?:\/\//i.test(target)) {
    let response;
    try { response = await fetch(target, { signal: AbortSignal.timeout(TIMEOUT), headers: { "user-agent": "read-source/1.0 (LiaScript course tooling)" } }); } catch (error) {
      throw new Error(error.name === "TimeoutError" ? `no answer within ${TIMEOUT / 1000} s` : `${error.message}${error.cause ? ` (${error.cause.code ?? error.cause.message})` : ""}`);
    }
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${target}`);
    const type = (response.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
    const readable = ["text/html", "application/xhtml+xml", "text/plain", "application/pdf"];
    if (!readable.includes(type)) throw new Error(`not a web page (${type || "no type"}) – save it into the project and read the file`);
    if (Number(response.headers.get("content-length") ?? 0) > PAGE_LIMIT) throw new Error("larger than 5 MB");
    const body = Buffer.from(await response.arrayBuffer());
    if (body.length > PAGE_LIMIT) throw new Error("larger than 5 MB");
    if (type === "application/pdf") { const r = readPdfInfo(body); if (out(r)) printPdf(target, r); return 0; }
    const r = readHtml(body.toString("utf8"), response.url || target);
    if (out(r)) printHtml(target, r);
    return 0;
  }
  const full = resolve(target);
  if (!existsSync(full)) throw new Error(`not found: ${target}`);
  if (statSync(full).isDirectory()) {
    const files = listCourses(full);
    const rows = files.map(file => { const r = readLiaScript(readFileSync(join(full, file), "utf8")); return { file, title: r.slides[0]?.title ?? "", slides: r.slides.length, images: r.images.length }; });
    if (out(rows)) say([`LiaScript course files in ${target}: ${rows.length}`, ...rows.map(row => `  ${row.file} · ${cut(row.title) || "(no title)"} · ${row.slides} slides · ${row.images} images`)]);
    return 0;
  }
  const type = extname(full).toLowerCase();
  if (type === ".md") {
    const source = readFileSync(full, "utf8"), r = readLiaScript(source);
    if (out(r)) { printLiaScript(target, r); if (!headerOf(source)) console.log("Note: no LiaScript header (plain Markdown)."); }
  } else if (type === ".pptx") {
    const files = unzip(readFileSync(full)), r = readPptx(files);
    const slug = basename(full, extname(full)).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "source";
    const root = realpathSync(process.cwd()), folder = join(root, ".cache", "source", slug);
    const media = [...files].filter(([name]) => /^ppt\/media\/[^/]+$/.test(name) && !/^\.\.?$/.test(basename(name)));
    if (media.length) {
      mkdirSync(folder, { recursive: true });
      const real = relative(root, realpathSync(folder));
      if (real.startsWith("..") || isAbsolute(real)) throw new Error(".cache/source points outside the current folder");
      for (const [name, data] of media) writeFileSync(join(folder, basename(name)), data);
    }
    if (out(r)) say([`PowerPoint: ${target} · ${r.slides.length} slides · images: ${media.length ? `${media.length} in .cache/source/${slug}/` : "none"}`,
      `Theme colours: ${Object.entries(r.theme.colors).map(([key, value]) => `${key} ${value}`).join(", ") || "none"}`,
      `Theme fonts: headings ${r.theme.fonts.major ?? "–"}, body ${r.theme.fonts.minor ?? "–"}`,
      ...r.slides.flatMap(slide => [`  ${slide.n} ${cut(slide.title) || "(no title)"}`,
        ...slide.text.map(line => `     - ${cut(line)}`), ...slide.notes.map(line => `     notes: ${cut(line)}`),
        ...(slide.images.length ? [`     images: ${slide.images.join(", ")}`] : [])])]);
  } else if (type === ".pdf") {
    const r = readPdfInfo(readFileSync(full));
    if (out(r)) printPdf(target, r);
  } else if (type === ".html" || type === ".htm") {
    const r = readHtml(readFileSync(full, "utf8"), pathToFileURL(full).href);
    if (out(r)) printHtml(target, r);
  } else throw new Error(`unknown format: ${type || basename(full)} (read: .md, .pptx, .pdf, .html, a folder or an http(s) URL)`);
  return 0;
}

function printPdf(name, r) {
  say([`PDF: ${name} · ${r.pages} pages`, `Title: ${r.title ?? "–"}`, `Author: ${r.author ?? "–"}`,
    "Read the content with the file-reading tool, at most 20 pages at a time."]);
}
// At most ROWS lines of a list, then "… n more".
const capped = (list, line) => [...list.slice(0, ROWS).map(line), ...(list.length > ROWS ? [`  … ${list.length - ROWS} more`] : [])];
function printHtml(name, r) {
  say([`Web page: ${name}`, `Title: ${r.title ?? "–"}`, `Blocks: ${r.blocks.length}`,
    ...capped(r.blocks, block => block.type === "h" ? `  ${"#".repeat(block.level)} ${cut(block.text)}` : `  ${block.type === "li" ? "-" : "¶"} ${cut(block.text)}`),
    `Images: ${r.images.length}`, ...capped(r.images, image => `  ${image.alt ? `"${cut(image.alt)}"` : "(no alt text)"} · ${image.src}`)]);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main(process.argv.slice(2)).then(code => { console.log(`Exit code: ${code}`); return code; }, error => {
    console.error(`read-source: ${String(error.message).split("\n")[0]}`);
    if (String(error.message).startsWith("Usage:")) console.error(usage.split("\n").slice(1).join("\n"));
    console.log("Exit code: 2");
    return 2;
  });
}
