// Validates the escaping and path-containment helpers in scripts/build-blog.js.
// The helpers are evaluated from the real source file so this checks shipped
// code rather than a copy of it. Run: node tools/check-build-blog.js
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const REPO = path.resolve(__dirname, "..");
const SCRIPT = path.join(REPO, "scripts", "build-blog.js");
const BLOG_DIR = path.join(REPO, "blog");

const src = fs.readFileSync(SCRIPT, "utf-8");
const helpers = src.slice(src.indexOf("const HTML_ESCAPES"), src.indexOf("async function buildBlog"));
if (!helpers) {
  console.error("Could not locate helpers in " + SCRIPT);
  process.exit(1);
}

const ctx = { path, __dirname: path.join(REPO, "scripts"), BLOG_DIR };
vm.createContext(ctx);
vm.runInContext(helpers, ctx);

let pass = 0;
let fail = 0;
const ok = (name, cond) => {
  cond ? pass++ : fail++;
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${name}`);
};

console.log("--- slug sanitisation ---");
for (const [raw, expect] of [
  ["normal-post", "normal-post"],
  ["../../index", "index"],
  ["../../../tmp/pwned", "tmp-pwned"],
  ["a/b", "a-b"],
  ["Already Nice Slug", "already-nice-slug"]
]) {
  const got = ctx.safeSlug(raw, "fallback-id");
  ok(`safeSlug(${JSON.stringify(raw)}) -> ${JSON.stringify(got)}`, got === expect);
}

console.log("--- output path containment ---");
for (const raw of ["../../index", "../../../tmp/pwned", "a/b", "normal"]) {
  const slug = ctx.safeSlug(raw, "id");
  let inside = false;
  try {
    inside = path.dirname(ctx.resolvePostPath(slug)) === BLOG_DIR;
  } catch (err) {
    inside = false;
  }
  ok(`${JSON.stringify(raw)} writes inside blog/`, inside);
}
let threw = false;
try {
  ctx.resolvePostPath("../../index");
} catch (err) {
  threw = true;
}
ok("resolvePostPath rejects a raw traversal slug", threw);

console.log("--- HTML escaping ---");
const hostileTitle = 'Ops & "Systems" </title><script>alert(1)</script>';
const escaped = ctx.escapeHtml(hostileTitle);
ok("no raw < remains", !escaped.includes("<"));
ok('no raw " remains', !escaped.includes('"'));
ok("ampersand encoded first (no double-encoding)", ctx.escapeHtml("&amp;") === "&amp;amp;");

console.log("--- $-pattern safety ---");
const dollar = "Save $5,000 $& more";
const out = "{{TITLE}}".replace(/{{TITLE}}/g, () => ctx.escapeHtml(dollar));
ok("$& not expanded to the match", !out.includes("{{TITLE}}"));
ok("text preserved (with & encoded)", out === "Save $5,000 $&amp; more");
const buggy = "{{TITLE}}".replace(/{{TITLE}}/g, dollar);
ok("old string form did expand $& (regression guard)", buggy.includes("{{TITLE}}"));

console.log("--- existing published slugs are unaffected ---");
for (const file of fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".html") && !f.startsWith("_") && f !== "index.html")) {
  const slug = file.replace(/\.html$/, "");
  ok(`${slug} round-trips unchanged`, ctx.safeSlug(slug, "x") === slug);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
