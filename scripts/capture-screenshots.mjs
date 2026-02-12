#!/usr/bin/env node

/**
 * Captures screenshots of portfolio projects using Playwright.
 * Starts each project's dev server, waits for it, screenshots, then kills the server.
 *
 * Usage: node scripts/capture-screenshots.mjs [slug]
 *   - No args: capture all projects
 *   - With slug: capture only that project (e.g., "white-lotus")
 */

import { chromium } from "@playwright/test";
import { spawn } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import http from "http";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEV_ROOT = resolve(__dirname, "../../");
const OUTPUT_DIR = resolve(__dirname, "../public/images/projects");

const PROJECTS = [
  {
    slug: "aia-lead-extractor",
    dir: resolve(DEV_ROOT, "aia-lead"),
    command: "npm",
    args: ["run", "dev"],
    port: 3000,
    url: "http://localhost:3000",
    authBypass: {
      file: resolve(DEV_ROOT, "aia-lead/src/middleware.ts"),
      original: `  if (!user && !isPublicRoute) {\n    const url = request.nextUrl.clone();\n    url.pathname = "/login";\n    return NextResponse.redirect(url);\n  }`,
      replacement: `  // TEMP: Auth bypass for screenshot\n  // if (!user && !isPublicRoute) {\n  //   const url = request.nextUrl.clone();\n  //   url.pathname = "/login";\n  //   return NextResponse.redirect(url);\n  // }`,
    },
  },
  {
    slug: "white-lotus",
    dir: resolve(DEV_ROOT, "white-lotus"),
    command: "npm",
    args: ["run", "dev"],
    port: 5173,
    url: "http://localhost:5173",
  },
  {
    slug: "rp-partner-website",
    dir: resolve(DEV_ROOT, "rpwebsite"),
    command: "npx",
    args: ["next", "dev", "-p", "3001"],
    port: 3001,
    url: "http://localhost:3001",
  },
  {
    slug: "aiauto",
    dir: resolve(DEV_ROOT, "aiAuto"),
    command: "npx",
    args: ["serve", "-p", "8080", "-s"],
    port: 8080,
    url: "http://localhost:8080",
  },
  {
    slug: "autonoiq-website",
    dir: resolve(DEV_ROOT, "autonoiq-website/public"),
    command: "npx",
    args: ["serve", "-p", "8081", "-s"],
    port: 8081,
    url: "http://localhost:8081",
  },
  {
    slug: "hr-bot-aia",
    dir: resolve(DEV_ROOT, "hrbotaia/hrbot-frontend/dist"),
    command: "npx",
    args: ["serve", "-p", "8082", "-s"],
    port: 8082,
    url: "http://localhost:8082",
    // Uses localStorage auth - we'll login via Playwright
    loginSteps: async (page) => {
      // Navigate to login page and authenticate
      await page.goto("http://localhost:8082/login", {
        waitUntil: "networkidle",
        timeout: 15000,
      });
      await page.waitForTimeout(1000);

      // Try to find and fill login form
      try {
        const emailInput = page.locator(
          'input[type="email"], input[name="email"], input[placeholder*="email" i], input[placeholder*="user" i]'
        );
        const passwordInput = page.locator(
          'input[type="password"], input[name="password"]'
        );

        if ((await emailInput.count()) > 0 && (await passwordInput.count()) > 0) {
          await emailInput.fill("admin");
          await passwordInput.fill("123456");
          const submitBtn = page.locator(
            'button[type="submit"], button:has-text("Login"), button:has-text("Sign")'
          );
          if ((await submitBtn.count()) > 0) {
            await submitBtn.first().click();
            await page.waitForTimeout(2000);
          }
        }
      } catch (e) {
        console.log(`  ⚠ Could not auto-login for HR Bot, using current page`);
      }
    },
  },
];

function waitForServer(port, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const req = http.get(`http://localhost:${port}`, (res) => {
        res.resume();
        resolve();
      });
      req.on("error", () => {
        if (Date.now() - start > timeout) {
          reject(new Error(`Server on port ${port} did not start within ${timeout}ms`));
        } else {
          setTimeout(check, 500);
        }
      });
      req.setTimeout(2000, () => {
        req.destroy();
        if (Date.now() - start > timeout) {
          reject(new Error(`Server on port ${port} timed out`));
        } else {
          setTimeout(check, 500);
        }
      });
    };
    check();
  });
}

function applyAuthBypass(project) {
  if (!project.authBypass) return;
  const { file, original, replacement } = project.authBypass;
  const content = fs.readFileSync(file, "utf-8");
  if (content.includes(original)) {
    fs.writeFileSync(file, content.replace(original, replacement), "utf-8");
    console.log(`  🔓 Auth bypass applied: ${file}`);
  } else {
    console.log(`  ⚠ Auth bypass pattern not found in ${file} (may already be applied)`);
  }
}

function revertAuthBypass(project) {
  if (!project.authBypass) return;
  const { file, original, replacement } = project.authBypass;
  const content = fs.readFileSync(file, "utf-8");
  if (content.includes(replacement)) {
    fs.writeFileSync(file, content.replace(replacement, original), "utf-8");
    console.log(`  🔒 Auth bypass reverted: ${file}`);
  }
}

async function captureProject(project, browser) {
  console.log(`\n📸 Capturing: ${project.slug}`);
  console.log(`   Dir: ${project.dir}`);
  console.log(`   Port: ${project.port}`);

  // Check directory exists
  if (!fs.existsSync(project.dir)) {
    console.log(`  ❌ Directory not found: ${project.dir}`);
    return false;
  }

  // Apply auth bypass if needed
  applyAuthBypass(project);

  // Start dev server
  console.log(`  Starting server: ${project.command} ${project.args.join(" ")}`);
  const server = spawn(project.command, project.args, {
    cwd: project.dir,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, PORT: String(project.port), BROWSER: "none" },
    detached: true,
  });

  let serverOutput = "";
  server.stdout?.on("data", (d) => (serverOutput += d.toString()));
  server.stderr?.on("data", (d) => (serverOutput += d.toString()));

  try {
    // Wait for server to be ready
    console.log(`  Waiting for server on port ${project.port}...`);
    await waitForServer(project.port, 45000);
    console.log(`  ✓ Server ready`);

    // Create page and navigate
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    // Run login steps if needed
    if (project.loginSteps) {
      await project.loginSteps(page);
    }

    // Navigate to the main URL
    console.log(`  Navigating to ${project.url}...`);
    await page.goto(project.url, { waitUntil: "networkidle", timeout: 30000 });

    // Extra wait for animations/rendering
    await page.waitForTimeout(2500);

    // Take screenshot
    const outputPath = resolve(OUTPUT_DIR, `${project.slug}.png`);
    await page.screenshot({ path: outputPath, type: "png" });
    console.log(`  ✅ Screenshot saved: ${outputPath}`);

    await context.close();
    return true;
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    if (serverOutput) {
      console.error(`  Server output (last 500 chars): ${serverOutput.slice(-500)}`);
    }
    return false;
  } finally {
    // Kill server process group
    try {
      process.kill(-server.pid, "SIGTERM");
    } catch {
      try {
        server.kill("SIGTERM");
      } catch {}
    }

    // Revert auth bypass
    revertAuthBypass(project);

    // Wait a moment for port to be freed
    await new Promise((r) => setTimeout(r, 1500));
  }
}

async function main() {
  const targetSlug = process.argv[2];

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const projectsToCapture = targetSlug
    ? PROJECTS.filter((p) => p.slug === targetSlug)
    : PROJECTS;

  if (projectsToCapture.length === 0) {
    console.error(`No project found with slug: ${targetSlug}`);
    console.log(`Available: ${PROJECTS.map((p) => p.slug).join(", ")}`);
    process.exit(1);
  }

  console.log(`🎬 Capturing ${projectsToCapture.length} project(s)...`);

  const browser = await chromium.launch({ headless: true });

  const results = [];
  for (const project of projectsToCapture) {
    const success = await captureProject(project, browser);
    results.push({ slug: project.slug, success });
  }

  await browser.close();

  console.log("\n📊 Results:");
  for (const r of results) {
    console.log(`  ${r.success ? "✅" : "❌"} ${r.slug}`);
  }

  const failed = results.filter((r) => !r.success);
  if (failed.length > 0) {
    console.log(`\n⚠ ${failed.length} project(s) failed`);
    process.exit(1);
  }

  console.log("\n🎉 All screenshots captured successfully!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
