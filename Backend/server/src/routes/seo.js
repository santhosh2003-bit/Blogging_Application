import express from "express";
import { SitemapStream, streamToPromise } from "sitemap";
import { createGzip } from "zlib";
import Blog from "../models/Blog.js";

const router = express.Router();

let sitemap;

// Generate sitemap.xml
router.get("/sitemap.xml", async (req, res) => {
  res.header("Content-Type", "application/xml");
  res.header("Content-Encoding", "gzip");

  // If we have a cached sitemap and it's less than 1 hour old, serve it
  if (sitemap) {
    res.send(sitemap);
    return;
  }

  try {
    const smStream = new SitemapStream({
      hostname: process.env.FRONTEND_URL || "http://localhost:5173",
    });
    const pipeline = smStream.pipe(createGzip());

    // Add static pages
    smStream.write({ url: "/", changefreq: "daily", priority: 1.0 });
    smStream.write({ url: "/blogs", changefreq: "daily", priority: 0.9 });

    // Add dynamic blog pages
    const blogs = await Blog.find({ status: "published" }).select(
      "slug updatedAt"
    );
    blogs.forEach((blog) => {
      smStream.write({
        url: `/blog/${blog.slug}`,
        changefreq: "weekly",
        priority: 0.8,
        lastmod: blog.updatedAt.toISOString(),
      });
    });

    smStream.end();

    // Cache the sitemap
    sitemap = await streamToPromise(pipeline);
    res.send(sitemap);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error generating sitemap",
    });
  }
});

export default router;
