const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");
const marked = require("marked");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const n2m = new NotionToMarkdown({ notionClient: notion });
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

// Notion fields are author-supplied text. They are interpolated into HTML and
// into an output path, so both need escaping before use.
const BLOG_DIR = path.resolve(__dirname, "..", "blog");

const HTML_ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

// Reduce a Notion slug to a single safe filename segment. Anything that could
// walk out of blog/ (slashes, dots, backslashes) collapses to a hyphen.
// JSON-LD lives inside a <script> block, where the HTML parser does not decode
// entities. HTML-escaping there would leave "&amp;" visible in search results,
// so encode as JSON and neutralise the sequences that could end the script.
function jsonForScript(value) {
  return JSON.stringify(String(value))
    .replace(/</g, "\\u003C")
    .replace(/>/g, "\\u003E")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function safeSlug(rawSlug, fallback) {
  const cleaned = String(rawSlug)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || String(fallback).replace(/[^a-z0-9]+/gi, "-");
}

// Belt and braces: even with a sanitised slug, refuse to write outside blog/.
function resolvePostPath(slug) {
  const target = path.resolve(BLOG_DIR, `${slug}.html`);
  if (path.dirname(target) !== BLOG_DIR) {
    throw new Error(`Refusing to write outside blog/: ${target}`);
  }
  return target;
}

async function buildBlog() {
  console.log("Fetching posts from Notion...");
  const response = await notion.dataSources.query({
    data_source_id: DATABASE_ID,
    filter: {
      property: "Status",
      status: {
        equals: "Published"
      }
    },
    sorts: [
      {
        property: "Date",
        direction: "descending"
      }
    ]
  });

  const posts = response.results;
  console.log(`Found ${posts.length} published posts.`);

  const templatePath = path.join(__dirname, "../blog/_template.html");
  let template = "";
  if (fs.existsSync(templatePath)) {
    template = fs.readFileSync(templatePath, "utf-8");
  } else {
    console.error("Template not found at " + templatePath);
    return;
  }

  let indexCardsHtml = "";

  for (const post of posts) {
    const title = post.properties.Name?.title[0]?.plain_text || "Untitled";
    const slug = safeSlug(post.properties.Slug?.rich_text[0]?.plain_text || post.id, post.id);
    const excerpt = post.properties.Excerpt?.rich_text[0]?.plain_text || "";
    const rawDate = post.properties.Date?.date?.start || "";
    let dateStr = rawDate;
    // ISO form for article:published_time and the Article schema. Falls back to
    // the empty string, which the template blanks out rather than emitting a
    // half-formed date.
    let dateIso = "";

    // Format date nicely (e.g., "April 2025")
    if (dateStr) {
      const d = new Date(dateStr);
      // Adding UTC offset workaround so local timezone doesn't shift the day backwards
      const utcDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
      dateIso = utcDate.toISOString().slice(0, 10);
      dateStr = utcDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
    
    const readTime = post.properties["Read Time"]?.rich_text[0]?.plain_text || "5 min read";

    console.log(`Processing: ${title}`);

    const mdblocks = await n2m.pageToMarkdown(post.id);
    const mdString = n2m.toMarkdownString(mdblocks);
    const contentHtml = marked.parse(mdString.parent || "");

    let postHtml = template
      .replace(/{{TITLE}}/g, () => escapeHtml(title))
      .replace(/{{EXCERPT}}/g, () => escapeHtml(excerpt))
      .replace(/{{SLUG}}/g, () => escapeHtml(slug))
      .replace(/{{DATE}}/g, () => escapeHtml(dateStr))
      .replace(/{{DATE_ISO}}/g, () => escapeHtml(dateIso))
      // JSON-LD values: encoded as JSON, not HTML (see jsonForScript).
      .replace(/{{TITLE_JSON}}/g, () => jsonForScript(title))
      .replace(/{{EXCERPT_JSON}}/g, () => jsonForScript(excerpt))
      .replace(/{{READ_TIME}}/g, () => escapeHtml(readTime))
      // CONTENT is already HTML from marked, so it is inserted as-is. The
      // function form still avoids $-pattern expansion.
      .replace(/{{CONTENT}}/g, () => contentHtml);

    fs.writeFileSync(resolvePostPath(slug), postHtml);

    indexCardsHtml += `
    <a href="/blog/${slug}.html" class="article-card sr">
      <span class="read-time">${escapeHtml(readTime)}</span>
      <h3>${escapeHtml(title)}</h3>
      <p class="excerpt">${escapeHtml(excerpt)}</p>
      <span class="read-link">Read Article <span class="arrow">→</span></span>
    </a>\n`;
  }

  // Update blog/index.html
  const indexPath = path.join(__dirname, "../blog/index.html");
  if (fs.existsSync(indexPath)) {
    let indexHtml = fs.readFileSync(indexPath, "utf-8");
    const gridRegex = /<section class="blog-grid">[\s\S]*?<\/section>/;
    const newGrid = `<section class="blog-grid">\n${indexCardsHtml}  </section>`;
    indexHtml = indexHtml.replace(gridRegex, () => newGrid);
    fs.writeFileSync(indexPath, indexHtml);
    console.log("Updated blog/index.html successfully.");
  } else {
    console.error("blog/index.html not found!");
  }

  console.log("Blog build complete!");
}

buildBlog().catch(console.error);
