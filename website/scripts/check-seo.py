"""Check SEO invariants in the production HTML after `npm run build`.

Static pages are found from app/(marketing)/**/page.tsx. The blog's dynamic pages (posts, categories, authors, and
`?page=N` archives) are found from the prerendered HTML under .next/server/app/blog, so build with data available:
    BLOG_FIXTURES=1 npm run build && npm run check:seo      (from website/; or `npm run build:website` from the root)
A build with no blog data has no blog posts to check; the blog index and authors pages are still checked.
"""

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse
from xml.etree import ElementTree


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / ".next/server/app"
ORIGIN = "https://www.easner.com"
ERRORS = []


def check(condition, message):
    if not condition:
        ERRORS.append(message)


class Page(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.meta = {}
        self.canonicals = []
        self.links = []
        self.h1_count = 0
        self.titles = []
        self.schemas = []
        self.text = []
        self.capture = None
        self.buffer = []
        self.script = False
        self.images = []
        self.chrome = 0
        self.alternates = []
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "meta":
            key = attrs.get("name", attrs.get("property"))
            self.meta.setdefault(key, []).append(attrs.get("content", ""))
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonicals.append(attrs.get("href"))
        if tag == "a" and attrs.get("href"):
            self.links.append(attrs["href"])
        # Site chrome (the fixed header and the footer) is shared by every page and not the blog's content.
        if (tag == "header" and "fixed" in attrs.get("class", "")) or tag == "footer":
            self.chrome += 1
        if tag == "img" and not self.chrome:
            self.images.append(attrs)
        if tag == "link" and attrs.get("rel") == "alternate":
            self.alternates.append(attrs)
        if tag == "h1":
            self.h1_count += 1
        if tag == "title":
            self.capture, self.buffer = "title", []
        if tag == "script":
            self.script = True
            if attrs.get("type") == "application/ld+json":
                self.capture, self.buffer = "schema", []

    def handle_data(self, text):
        if self.capture:
            self.buffer.append(text)
        elif not self.script:
            self.text.append(text)

    def handle_endtag(self, tag):
        if self.chrome and tag in ("header", "footer"):
            self.chrome -= 1
        if tag == "title" and self.capture == "title":
            self.titles.append("".join(self.buffer))
            self.capture = None
        if tag == "script":
            if self.capture == "schema":
                data = json.loads("".join(self.buffer))
                self.schemas.extend(data if isinstance(data, list) else [data])
                self.capture = None
            self.script = False


def normalize(text):
    return " ".join(text.split())


routes = {}
for source in (ROOT / "app/(marketing)").rglob("page.tsx"):
    route = "/" + source.parent.relative_to(ROOT / "app/(marketing)").as_posix()
    route = "/" if route == "/." else route
    if "[" in route:
        continue  # dynamic: found below from the prerendered output
    routes[route] = OUTPUT / ("index.html" if route == "/" else route[1:] + ".html")

# Blog pages: posts, categories, authors and ?page=N archives, from the prerendered HTML.
PAGE_ROUTE = re.compile(r"^(.*)/page/(\d+)$")
for html_file in sorted((OUTPUT / "blog").rglob("*.html")) if (OUTPUT / "blog").exists() else []:
    rel = html_file.relative_to(OUTPUT).with_suffix("").as_posix()
    match = PAGE_ROUTE.match(rel)
    route = f"/{match.group(1)}?page={match.group(2)}" if match else "/" + rel
    routes[route] = html_file

BLOG = {route: path for route, path in routes.items() if route == "/blog" or route.startswith("/blog/") or route.startswith("/blog?")}


def path_of(route):
    return route.split("?")[0]


def blog_kind(route):
    base = path_of(route)
    if base == "/blog":
        return "index"
    if base == "/blog/authors":
        return "authors"
    if base.startswith("/blog/categories/"):
        return "category"
    if base.startswith("/blog/authors/"):
        return "author"
    return "post"


author_pages = {path_of(r) for r in BLOG if blog_kind(r) == "author"}
noindex_routes = set()

def generated_file(destination):
    """A route handler's prerendered output: feeds, share images, and /blog/<slug>.md (a rewrite to /api/blog/markdown)."""
    if destination.endswith(".md"):
        return (OUTPUT / "api/blog/markdown" / (destination[len("/blog/"):-3] + ".body")).exists()
    return (OUTPUT / (destination.lstrip("/") + ".body")).exists()


posts_seen = []


def blog_checks(route, path, page, types, description):
    kind = blog_kind(route)
    html = path.read_text()
    content = normalize(" ".join(page.text))
    base = path_of(route)
    # Every image: alt text and explicit dimensions (no layout shift).
    for img in page.images:
        check("alt" in img, f"{route}: <img> without alt: {img.get('src', '')[:80]}")
        check(bool(img.get("width")) and bool(img.get("height")), f"{route}: <img> without width/height: {img.get('src', '')[:80]}")
    check(any(a.get("type") == "application/rss+xml" for a in page.alternates), f"{route}: missing RSS <link rel=alternate>")
    if kind in ("index", "category", "authors"):
        check("CollectionPage" in types, f"{route}: archive needs CollectionPage schema")
    if kind == "author":
        check("ProfilePage" in types, f"{route}: author page needs ProfilePage schema")
    if kind == "post":
        posts_seen.append(base)
        check(page.meta.get("og:type") == ["article"], f"{route}: og:type must be article")
        check("article:published_time" in page.meta, f"{route}: missing article:published_time")
        check("WebPage" in types and "BlogPosting" in types, f"{route}: needs WebPage and BlogPosting schema")
        check(any(a.get("type") == "text/markdown" for a in page.alternates), f"{route}: missing text/markdown alternate")
        check((OUTPUT / "api/blog/markdown" / (base[len("/blog/"):] + ".body")).exists(), f"{route}: Markdown version /blog/{base[6:]}.md was not generated")
        for schema in page.schemas:
            if schema.get("@type") != "BlogPosting":
                continue
            for field in ("headline", "description", "image", "datePublished", "dateModified", "author", "publisher", "mainEntityOfPage"):
                check(bool(schema.get(field)), f"{route}: BlogPosting missing {field}")
            check(schema.get("publisher", {}).get("@id") == ORIGIN + "/#organization", f"{route}: BlogPosting publisher must be /#organization")
            check(schema.get("mainEntityOfPage", {}).get("@id") == ORIGIN + base + "#webpage", f"{route}: mainEntityOfPage must point at the WebPage node")
            check(schema.get("headline") and normalize(schema["headline"]) in content, f"{route}: headline not visible in HTML")
            authors = schema.get("author", [])
            for author in authors if isinstance(authors, list) else [authors]:
                url = author.get("url", "")
                check(url.startswith(ORIGIN) and url[len(ORIGIN):] in author_pages, f"{route}: author {author.get('name')} has no author page")
            for image in schema.get("image", []):
                u = urlparse(image)
                check(u.scheme == "https" and u.netloc == "www.easner.com", f"{route}: BlogPosting image not on www.easner.com: {image}")
                check(generated_file(unquote(u.path)), f"{route}: BlogPosting image not generated: {u.path}")
        if "aeo-answer" in html:
            check(any(s.get("@type") == "WebPage" and s.get("speakable") for s in page.schemas), f"{route}: Summary present but WebPage has no speakable selector")
        for schema in page.schemas:
            if schema.get("@type") == "FAQPage":
                check("<details" in html, f"{route}: FAQ not rendered as visible Q&A")


titles, descriptions = {}, {}
PAGES = {}
faq_count = 0
for route, path in sorted(routes.items()):
    check(path.exists(), f"{route}: production HTML missing; run the build first")
    if not path.exists():
        continue
    try:
        page = Page(path.read_text())
    except (ValueError, TypeError) as error:
        ERRORS.append(f"{route}: invalid structured data: {error}")
        continue
    PAGES[route] = page
    check(len(page.titles) == 1 and bool(page.titles[0]), f"{route}: needs one nonempty title")
    title = page.titles[0] if page.titles else ""
    check(title not in titles, f"{route}: duplicate title with {titles.get(title)}")
    titles[title] = route
    check(title.count("Easner") == 1, f"{route}: brand must appear once in title")
    description = page.meta.get("description", [])
    check(len(description) == 1 and bool(description[0]), f"{route}: needs one description")
    description = description[0] if description else ""
    check(description not in descriptions, f"{route}: duplicate description with {descriptions.get(description)}")
    descriptions[description] = route
    canonical = ORIGIN + (route if route != "/" else "")
    check(page.canonicals == [canonical], f"{route}: incorrect or duplicate canonical")
    check(page.h1_count == 1, f"{route}: expected one H1, found {page.h1_count}")
    robots = ",".join(page.meta.get("robots", []) + page.meta.get("googlebot", [])).lower()
    if route in BLOG and "noindex" in robots:
        # Only thin category archives and author pages with no posts yet may be noindex; they must also be absent from the sitemap (checked below).
        noindex_routes.add(route)
        check(blog_kind(route) in ("category", "author"), f"{route}: only thin category archives and empty author pages may be noindex, found noindex here")
        check(not re.search(r"\b(nofollow|none|nosnippet)\b", robots), f"{route}: snippet/follow restriction: {robots}")
    else:
        check("index" in robots and not re.search(r"\b(noindex|nofollow|none|nosnippet)\b", robots), f"{route}: indexing/snippet restriction: {robots}")
    for key, value in [("og:title", title), ("twitter:title", title), ("og:description", description), ("twitter:description", description), ("og:url", canonical)]:
        check(page.meta.get(key) == [value], f"{route}: {key} does not match page metadata")
    for key in ["og:image", "twitter:image"]:
        images = page.meta.get(key, [])
        check(bool(images), f"{route}: missing {key}")
        for image in images:
            url = urlparse(image)
            check(url.scheme == "https" and url.netloc == "www.easner.com", f"{route}: invalid {key} URL")
            body = OUTPUT / (unquote(url.path).lstrip("/") + ".body")
            check(body.exists() and body.stat().st_size > 0, f"{route}: missing generated social image: {url.path}")
    types = [schema.get("@type") for schema in page.schemas]
    check("Organization" in types and "WebSite" in types, f"{route}: missing company/site schema")
    if route in BLOG:
        blog_checks(route, path, page, types, description)
    answer_routes = {
        "/",
        "/about",
        "/personal",
        "/business",
        "/checkout",
        "/payment-links",
        "/invoicing",
        "/payroll",
        "/connect",
        "/stablecoin",
        "/cards",
        "/white-label",
        "/developers",
        "/answers",
    }
    if route in answer_routes:
        check("WebPage" in types, f"{route}: missing WebPage answer-engine schema")
    if route == "/answers":
        check("aeo-answer" in path.read_text(), f"{route}: missing visible answer-engine copy")
        check("FAQPage" in types, f"{route}: missing FAQPage schema")
        check("DefinedTermSet" in types, f"{route}: missing glossary schema")
    content = normalize(" ".join(page.text))
    for schema in page.schemas:
        check(schema.get("@context") == "https://schema.org", f"{route}: invalid schema context")
        if schema.get("@type") == "Service":
            check(schema.get("url") == ORIGIN + route, f"{route}: service URL differs from canonical")
            check(schema.get("description") == description, f"{route}: stale service description")
            check(schema.get("provider", {}).get("@id") == ORIGIN + "/#organization", f"{route}: inconsistent service provider")
        if schema.get("@type") == "FAQPage":
            for question in schema["mainEntity"]:
                faq_count += 1
                check(normalize(question["name"]) in content, f"{route}: FAQ question absent from HTML")
                check(normalize(question["acceptedAnswer"]["text"]) in content, f"{route}: FAQ answer absent from HTML")
        if schema.get("@type") == "WebPage" and schema.get("speakable"):
            selectors = schema["speakable"].get("cssSelector", [])
            html = path.read_text()
            for selector in selectors:
                classname = selector.lstrip(".")
                check(classname in html, f"{route}: speakable selector {selector} missing from HTML")
        if schema.get("@type") == "DefinedTerm":
            check(normalize(schema.get("description", "")) in content, f"{route}: DefinedTerm missing from HTML")
        if schema.get("@type") == "DefinedTermSet":
            for term in schema.get("hasDefinedTerm", []):
                check(normalize(term.get("description", "")) in content, f"{route}: glossary term missing from HTML")
        if schema.get("@type") == "HowTo":
            for step in schema.get("step", []):
                check(normalize(step.get("name", "")) in content, f"{route}: HowTo step name absent from HTML")
                check(normalize(step.get("text", "")) in content, f"{route}: HowTo step text absent from HTML")
        if schema.get("@type") == "BreadcrumbList":
            items = schema["itemListElement"]
            check(items[-1]["item"] == ORIGIN + route, f"{route}: breadcrumb destination differs from canonical")
    for href in page.links:
        url = urlparse(href)
        if url.netloc and url.netloc != "www.easner.com":
            continue
        if url.scheme and url.scheme not in ("http", "https"):
            continue
        destination = unquote(url.path).rstrip("/") or "/"
        check(
            destination in routes
            or (ROOT / "public" / destination.lstrip("/")).is_file()
            or (destination.startswith("/blog/") and generated_file(destination)),
            f"{route}: unresolved internal link {href}",
        )

# Related reading: on product pages (up to 3 latest posts, section absent when none) and at the end of each post.
def related_links(route, section_id):
    html = routes[route].read_text()
    match = re.search(r'<section[^>]*aria-labelledby="%s".*?</section>' % section_id, html, re.S)
    if not match:
        return None
    return [unquote(urlparse(h).path).rstrip("/") for h in re.findall(r'<a[^>]*href="([^"]+)"', match.group(0))]


PRODUCT_ROUTES = ["/personal", "/business", "/checkout", "/payment-links", "/invoicing", "/payroll", "/connect", "/stablecoin", "/cards", "/developers", "/white-label"]
for route in PRODUCT_ROUTES:
    if route not in routes or not routes[route].exists():
        continue
    links = related_links(route, "product-related-reading")
    if links is None:
        continue  # hidden entirely when no post is linked to the page: no empty state
    check(1 <= len(links) <= 3, f"{route}: Related reading must list 1 to 3 posts, found {len(links)}")
    check(len(links) == len(set(links)), f"{route}: Related reading links a post twice")
    for href in links:
        check(href in {path_of(r) for r in BLOG if blog_kind(r) == "post"}, f"{route}: Related reading link {href} is not a blog post")
# With the fixtures, these product pages have linked posts and must show them (guards against the section silently vanishing).
FIXTURE_PRODUCT_POSTS = {
    "/payroll": "/blog/payroll-now-pays-contractors-in-local-currency",
    "/checkout": "/blog/checkout-or-payment-links-which-one-fits-your-business",
    "/stablecoin": "/blog/what-stablecoin-settlement-changes-for-a-payment-to-kenya",
}
for route, post_path in FIXTURE_PRODUCT_POSTS.items():
    if post_path in {path_of(r) for r in BLOG}:
        check(post_path in (related_links(route, "product-related-reading") or []), f"{route}: Related reading missing {post_path}")
for route in BLOG:
    if blog_kind(route) != "post":
        continue
    links = related_links(route, "related-reading")
    if links is None:
        continue
    check(len(links) <= 3, f"{route}: more than 3 related posts")
    check(path_of(route) not in links, f"{route}: related posts include the post itself")
    check(len(links) == len(set(links)), f"{route}: related posts link a post twice")

sitemap_path = OUTPUT / "sitemap.xml.body"
check(sitemap_path.exists(), "Missing sitemap output")
if sitemap_path.exists():
    sitemap = ElementTree.fromstring(sitemap_path.read_text())
    urls = [element.text for element in sitemap.findall("{*}url/{*}loc")]
    # Next serializes the root sitemap URL without the canonical trailing slash.
    # Paginated archives (?page=N) are crawlable but not listed; thin (noindex) archives are neither indexed nor listed.
    expected = {(ORIGIN + route).rstrip("/") for route in routes if "?" not in route and route not in noindex_routes}
    check({url.rstrip("/") for url in urls} == expected, "Sitemap does not cover exactly the indexable public pages: " + str(sorted(({u.rstrip("/") for u in urls} ^ expected))[:6]))
    for route in noindex_routes:
        check((ORIGIN + route).rstrip("/") not in {u.rstrip("/") for u in urls}, f"{route}: noindex archive must not be in the sitemap")
    check(len(urls) == len(set(urls)), "Duplicate sitemap entries")

llms_path = OUTPUT / "llms.txt.body"
check(llms_path.exists(), "Missing llms.txt output")
if llms_path.exists():
    llms = llms_path.read_text()
    for post in posts_seen:
        check(ORIGIN + post in llms, f"llms.txt does not list {post}")
    check(not posts_seen or "## Blog" in llms, "llms.txt has no ## Blog section")
check((OUTPUT / "llms-full.txt.body").exists(), "Missing llms-full.txt output")
for feed in ["blog/feed.xml.body"]:
    check((OUTPUT / feed).exists() or not posts_seen, f"Missing {feed}")

robots_path = OUTPUT / "robots.txt.body"
check(robots_path.exists(), "Missing robots.txt output")
if robots_path.exists():
    robots = robots_path.read_text()
    check("Allow: /" in robots and not re.search(r"Disallow:\s*/\s*$", robots, re.M), "robots.txt blocks the site")
    check(f"Sitemap: {ORIGIN}/sitemap.xml" in robots, "robots.txt sitemap reference is incorrect")

# ---------------------------------------------------------------------------------------------------------------
# Blog structured data in depth: no duplicate nodes, references that resolve, values Google can parse.
# ---------------------------------------------------------------------------------------------------------------
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime


def parse_iso(value):
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        return None


SINGLETON_TYPES = ("Organization", "WebSite", "BreadcrumbList", "BlogPosting", "FAQPage", "HowTo", "ProfilePage", "CollectionPage", "WebPage")
post_routes = {path_of(r) for r in BLOG if blog_kind(r) == "post"}
for route in sorted(BLOG):
    page = PAGES.get(route)
    if page is None:
        continue
    kind = blog_kind(route)
    ids = [s.get("@id") for s in page.schemas if s.get("@id")]
    dupes = sorted({i for i in ids if ids.count(i) > 1})
    check(not dupes, f"{route}: JSON-LD has two nodes with the same @id: {dupes}")
    for t in SINGLETON_TYPES:
        count = sum(1 for s in page.schemas if s.get("@type") == t)
        check(count <= 1, f"{route}: {count} {t} JSON-LD nodes, expected at most one")
    known = set(ids) | {ORIGIN + "/#organization", ORIGIN + "/#website"}
    for schema in page.schemas:
        for key in ("isPartOf", "publisher", "mainEntityOfPage", "about"):
            ref = schema.get(key)
            if isinstance(ref, dict) and set(ref) == {"@id"}:
                check(ref["@id"] in known, f"{route}: {schema.get('@type')}.{key} points at {ref['@id']}, which is not on the page")
        if schema.get("@type") == "BreadcrumbList":
            items = schema.get("itemListElement", [])
            check(len(items) >= 2, f"{route}: breadcrumb needs at least 2 items")
            check([i.get("position") for i in items] == list(range(1, len(items) + 1)), f"{route}: breadcrumb positions are not 1..n")
            check(all(i.get("name") and i.get("item", "").startswith(ORIGIN) for i in items), f"{route}: breadcrumb item without name or absolute URL")
        if schema.get("@type") == "CollectionPage":
            entity = schema.get("mainEntity", {})
            listed = entity.get("itemListElement", [])
            check(entity.get("numberOfItems") == len(listed), f"{route}: ItemList numberOfItems does not match its items")
            allowed = {path_of(r) for r in BLOG if blog_kind(r) == "author"} if kind == "authors" else post_routes
            for item in listed:
                check(urlparse(item.get("url", "")).path in allowed, f"{route}: ItemList entry does not exist: {item.get('url')}")
        if schema.get("@type") == "ProfilePage":
            person = schema.get("mainEntity", {})
            check(person.get("@type") == "Person" and bool(person.get("name")) and bool(person.get("url")), f"{route}: ProfilePage needs a Person with name and url")
        if schema.get("@type") == "BlogPosting":
            published, modified = parse_iso(schema.get("datePublished")), parse_iso(schema.get("dateModified"))
            check(published is not None and modified is not None, f"{route}: BlogPosting dates are not ISO 8601")
            if published and modified:
                check(modified >= published, f"{route}: dateModified is before datePublished")
                check(published <= datetime.now(timezone.utc), f"{route}: BlogPosting is dated in the future")
                check(page.meta.get("article:published_time") == [schema["datePublished"]], f"{route}: article:published_time differs from datePublished")
                check(page.meta.get("article:modified_time") == [schema["dateModified"]], f"{route}: article:modified_time differs from dateModified")
            check(schema.get("wordCount", 0) > 0, f"{route}: BlogPosting wordCount missing")
    if kind == "post":
        check(page.meta.get("twitter:card") == ["summary_large_image"], f"{route}: twitter:card must be summary_large_image")
        check(bool(page.meta.get("article:author")), f"{route}: missing article:author")

# Sitemap: posts carry a lastmod that matches the page's own modified time.
if sitemap_path.exists():
    lastmods = {e.findtext("{*}loc").rstrip("/"): e.findtext("{*}lastmod") for e in sitemap.findall("{*}url")}
    for route in BLOG:
        if blog_kind(route) != "post" or route in noindex_routes:
            continue
        loc = ORIGIN + route
        mod = parse_iso(lastmods.get(loc))
        check(mod is not None, f"{route}: sitemap entry has no valid lastmod")
        page = PAGES.get(route)
        if mod and page and page.meta.get("article:modified_time"):
            page_mod = parse_iso(page.meta["article:modified_time"][0])
            check(page_mod is not None and abs((page_mod - mod).total_seconds()) < 1, f"{route}: sitemap lastmod {lastmods[loc]} differs from article:modified_time")

# RSS and Atom-in-RSS feeds: the main feed, every category and author feed.
RFC822 = re.compile(r"^[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT$")
feed_files = [OUTPUT / "blog/feed.xml.body"] + sorted((OUTPUT / "blog/categories").glob("*/feed.xml.body")) + sorted((OUTPUT / "blog/authors").glob("*/feed.xml.body"))
for feed_file in feed_files:
    if not feed_file.exists():
        continue
    name = "/" + feed_file.relative_to(OUTPUT).as_posix().removesuffix(".body")
    try:
        root = ElementTree.fromstring(feed_file.read_text())
    except ElementTree.ParseError as error:
        ERRORS.append(f"{name}: feed is not well-formed XML: {error}")
        continue
    check(root.tag == "rss" and root.get("version") == "2.0", f"{name}: root must be <rss version=2.0>")
    channel = root.find("channel")
    if channel is None:
        ERRORS.append(f"{name}: no <channel>")
        continue
    for field in ("title", "link", "description", "language", "lastBuildDate"):
        check(bool((channel.findtext(field) or "").strip()), f"{name}: channel is missing <{field}>")
    self_link = [l for l in channel.findall("{http://www.w3.org/2005/Atom}link") if l.get("rel") == "self"]
    check(len(self_link) == 1 and self_link[0].get("href") == ORIGIN + name, f"{name}: needs exactly one atom:link rel=self equal to its own URL")
    check(RFC822.match(channel.findtext("lastBuildDate") or "") is not None, f"{name}: lastBuildDate is not RFC 822")
    guids, newest = [], None
    for item in channel.findall("item"):
        link = (item.findtext("link") or "").strip()
        guid = (item.findtext("guid") or "").strip()
        check(urlparse(link).path in post_routes, f"{name}: item link is not a published post: {link}")
        check(bool(guid) and bool((item.findtext("title") or "").strip()) and bool((item.findtext("description") or "").strip()), f"{name}: item missing title, guid or description: {link}")
        check(RFC822.match(item.findtext("pubDate") or "") is not None, f"{name}: item pubDate is not RFC 822: {link}")
        if RFC822.match(item.findtext("pubDate") or ""):
            when = parsedate_to_datetime(item.findtext("pubDate"))
            newest = when if newest is None or when > newest else newest
        guids.append(guid)
    check(len(guids) == len(set(guids)), f"{name}: duplicate item guids")
    if newest and RFC822.match(channel.findtext("lastBuildDate") or ""):
        check(parsedate_to_datetime(channel.findtext("lastBuildDate")) >= newest, f"{name}: lastBuildDate is older than the newest item")
    check("\x00" not in feed_file.read_text(), f"{name}: contains a NUL byte")

# The Markdown twin of each post and the LLM text files.
llms_full = (OUTPUT / "llms-full.txt.body").read_text() if (OUTPUT / "llms-full.txt.body").exists() else ""
for base in sorted(post_routes):
    md_file = OUTPUT / "api/blog/markdown" / (base[len("/blog/"):] + ".body")
    if not md_file.exists():
        continue
    md = md_file.read_text()
    check(md.startswith("# "), f"{base}.md: must start with an H1")
    check(f"Source: {ORIGIN}{base}" in md, f"{base}.md: missing the Source: canonical line")
    check(len(md) > 200, f"{base}.md: suspiciously short")
    check(not re.search(r"<[a-z]+[ >]", md.split("```")[0]), f"{base}.md: raw HTML leaked into the Markdown")
    check(f"Source: {ORIGIN}{base}" in llms_full, f"llms-full.txt does not include the post {base}")

# Noindex rules that the static output cannot show: draft previews and archives.
preview_route = (ROOT / "app/api/blog/preview/route.ts").read_text()
check("X-Robots-Tag" in preview_route and "noindex" in preview_route, "/api/blog/preview must send X-Robots-Tag: noindex")
check("noindex: post.noindex || draft" in (ROOT / "app/(marketing)/blog/[slug]/page.tsx").read_text(), "post page must be noindex in draft preview")
check("no-store" in preview_route, "/api/blog/preview must be no-store")
check(".txt\", destination: \"/api/indexnow-key/:key" in (ROOT / "next.config.mjs").read_text(), "IndexNow: next.config.mjs must rewrite /<key>.txt to /api/indexnow-key (IndexNow fetches the key at the site root)")
check("blog:post:" in (ROOT / "lib/blog/config.ts").read_text(), "blog reads must carry blog:post:<slug> cache tags")

if ERRORS:
    print("SEO validation failed:\n- " + "\n- ".join(ERRORS))
    sys.exit(1)
print(f"SEO checks passed: {len(routes)} pages ({len(posts_seen)} blog posts), unique metadata, canonicals, indexing, social images, structured data, {faq_count} FAQ answers, answer-engine markup, internal links, sitemap and robots.txt.")
