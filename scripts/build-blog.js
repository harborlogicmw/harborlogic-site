const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");
const marked = require("marked");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const n2m = new NotionToMarkdown({ notionClient: notion });
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

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
    const slug = post.properties.Slug?.rich_text[0]?.plain_text || post.id;
    const excerpt = post.properties.Excerpt?.rich_text[0]?.plain_text || "";
    let dateStr = post.properties.Date?.date?.start || "";
    
    // Format date nicely (e.g., "April 2025")
    if (dateStr) {
      const d = new Date(dateStr);
      // Adding UTC offset workaround so local timezone doesn't shift the day backwards
      const utcDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
      dateStr = utcDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
    
    const readTime = post.properties["Read Time"]?.rich_text[0]?.plain_text || "5 min read";

    console.log(`Processing: ${title}`);

    const mdblocks = await n2m.pageToMarkdown(post.id);
    const mdString = n2m.toMarkdownString(mdblocks);
    const contentHtml = marked.parse(mdString.parent || "");

    let postHtml = template
      .replace(/{{TITLE}}/g, title)
      .replace(/{{EXCERPT}}/g, excerpt)
      .replace(/{{SLUG}}/g, slug)
      .replace(/{{DATE}}/g, dateStr)
      .replace(/{{READ_TIME}}/g, readTime)
      .replace(/{{CONTENT}}/g, contentHtml);

    fs.writeFileSync(path.join(__dirname, `../blog/${slug}.html`), postHtml);

    indexCardsHtml += `
    <a href="/blog/${slug}.html" class="article-card sr">
      <span class="read-time">${readTime}</span>
      <h3>${title}</h3>
      <p class="excerpt">${excerpt}</p>
      <span class="read-link">Read Article <span class="arrow">→</span></span>
    </a>\n`;
  }

  // Update blog/index.html
  const indexPath = path.join(__dirname, "../blog/index.html");
  if (fs.existsSync(indexPath)) {
    let indexHtml = fs.readFileSync(indexPath, "utf-8");
    const gridRegex = /<section class="blog-grid">[\s\S]*?<\/section>/;
    const newGrid = `<section class="blog-grid">\n${indexCardsHtml}  </section>`;
    indexHtml = indexHtml.replace(gridRegex, newGrid);
    fs.writeFileSync(indexPath, indexHtml);
    console.log("Updated blog/index.html successfully.");
  } else {
    console.error("blog/index.html not found!");
  }

  console.log("Blog build complete!");
}

buildBlog().catch(console.error);
