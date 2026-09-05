"""Check SEO invariants in the production HTML after `npm run build`."""

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
    routes[route] = OUTPUT / ("index.html" if route == "/" else route[1:] + ".html")

titles, descriptions = {}, {}
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
        check(destination in routes or (ROOT / "public" / destination.lstrip("/")).is_file(), f"{route}: unresolved internal link {href}")

sitemap_path = OUTPUT / "sitemap.xml.body"
check(sitemap_path.exists(), "Missing sitemap output")
if sitemap_path.exists():
    sitemap = ElementTree.fromstring(sitemap_path.read_text())
    urls = [element.text for element in sitemap.findall("{*}url/{*}loc")]
    # Next serializes the root sitemap URL without the canonical trailing slash.
    check({url.rstrip("/") for url in urls} == {(ORIGIN + route).rstrip("/") for route in routes}, "Sitemap does not cover exactly the public pages")
    check(len(urls) == len(set(urls)), "Duplicate sitemap entries")

robots_path = OUTPUT / "robots.txt.body"
check(robots_path.exists(), "Missing robots.txt output")
if robots_path.exists():
    robots = robots_path.read_text()
    check("Allow: /" in robots and not re.search(r"Disallow:\s*/\s*$", robots, re.M), "robots.txt blocks the site")
    check(f"Sitemap: {ORIGIN}/sitemap.xml" in robots, "robots.txt sitemap reference is incorrect")

if ERRORS:
    print("SEO validation failed:\n- " + "\n- ".join(ERRORS))
    sys.exit(1)
print(f"SEO checks passed: {len(routes)} pages, unique metadata, canonicals, indexing, social images, structured data, {faq_count} FAQ answers, internal links, sitemap and robots.txt.")
