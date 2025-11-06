import express from "express";
import puppeteer from "puppeteer";
import hljs from "highlight.js";

const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.send("✅ Code Image API is running");
});

app.post("/generate", async (req, res) => {
  const { code = "", language = "ruby", theme = "dark" } = req.body;

  const highlighted = hljs.highlight(code, { language }).value;

const html = `
<html>
  <head>
    <link rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
    <style>
      body {
        background: #0d0d18;
        margin: 0;
        display: flex;
        align-items: center;
        justify-content: center;
	padding-top: 1rem;
	padding-bottom: 1rem;
      }
      pre {
        font-family: 'Fira Code', monospace;
        font-size: 30px;
        padding: 2rem;
        border-radius: 12px;
        background: #1a1b27;
        color: #fff;
        box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      }
      code {
        white-space: pre-wrap;
      }
    </style>
  </head>
  <body>
    <pre><code class="language-${language}">${highlighted}</code></pre>
  </body>
</html>
`;


  try {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 540 });
    await page.setContent(html, { waitUntil: "networkidle0" });

    const image = await page.screenshot({ type: "png" });
    await browser.close();

    res.setHeader("Content-Type", "image/png");
    res.send(image);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating image");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Code Image API running on port ${PORT}`));
