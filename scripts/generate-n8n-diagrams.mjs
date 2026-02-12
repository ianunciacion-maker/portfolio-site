#!/usr/bin/env node

/**
 * Generates Mermaid flowchart diagrams from n8n workflow JSON files,
 * then renders them to PNG using @mermaid-js/mermaid-cli.
 *
 * Usage: node scripts/generate-n8n-diagrams.mjs
 */

import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEV_ROOT = resolve(__dirname, "../../");
const OUTPUT_DIR = resolve(__dirname, "../public/images/projects");
const TEMP_DIR = resolve(__dirname, "../.tmp-mermaid");

const WORKFLOWS = [
  {
    slug: "aia-sales-bot",
    file: resolve(DEV_ROOT, "aiasalesbot/Outbound Agent.json"),
    title: "AIA Sales Bot - Outbound Agent Workflow",
    simplify: true, // Large workflow - show key nodes only
  },
  {
    slug: "n8n-tuknang",
    file: resolve(DEV_ROOT, "n8n-tuknang/tuknang-daily-poster.json"),
    title: "Tuknang Daily Auto-Poster Workflow",
    simplify: false,
  },
];

// Map n8n node types to categories for color-coding
function getNodeCategory(type) {
  if (
    type.includes("trigger") ||
    type.includes("Trigger") ||
    type.includes("webhook") ||
    type.includes("Webhook")
  )
    return "trigger";
  if (
    type.includes("agent") ||
    type.includes("Agent") ||
    type.includes("langchain") ||
    type.includes("openAi") ||
    type.includes("ai") ||
    type.includes("perplexity")
  )
    return "ai";
  if (
    type.includes("if") ||
    type.includes("switch") ||
    type.includes("Switch") ||
    type.includes("splitInBatches") ||
    type.includes("merge") ||
    type.includes("Merge")
  )
    return "logic";
  if (
    type.includes("code") ||
    type.includes("Code")
  )
    return "code";
  return "action";
}

function getCategoryStyle(category) {
  switch (category) {
    case "trigger":
      return ":::trigger";
    case "ai":
      return ":::ai";
    case "logic":
      return ":::logic";
    case "code":
      return ":::code";
    default:
      return ":::action";
  }
}

function sanitizeLabel(name) {
  return name.replace(/"/g, "'").replace(/[[\](){}]/g, "").replace(/\n/g, " ").trim();
}

function sanitizeId(name) {
  return name
    .replace(/[^a-zA-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

// Filter to important nodes for large workflows
function filterKeyNodes(nodes) {
  const skipTypes = ["n8n-nodes-base.stickyNote", "n8n-nodes-base.noOp"];
  return nodes.filter((n) => !skipTypes.includes(n.type));
}

function simplifyLargeWorkflow(nodes, connections) {
  // For large workflows, group related nodes and show high-level flow
  const skipTypes = [
    "n8n-nodes-base.stickyNote",
    "n8n-nodes-base.noOp",
    "n8n-nodes-base.respondToWebhook",
  ];

  // Keep important nodes: triggers, AI, decisions, key actions
  const importantTypes = [
    "webhook",
    "Webhook",
    "trigger",
    "Trigger",
    "scheduleTrigger",
    "manualTrigger",
    "agent",
    "Agent",
    "if",
    "switch",
    "Switch",
    "code",
    "Code",
    "gmail",
    "Gmail",
    "twilio",
    "microsoftOutlook",
    "bitrix",
  ];

  const filtered = nodes.filter((n) => {
    if (skipTypes.includes(n.type)) return false;
    // Keep triggers, AI, decisions, and key integrations
    const typeLower = n.type.toLowerCase();
    return importantTypes.some((t) => typeLower.includes(t.toLowerCase()));
  });

  // If still too many, take top 25 by importance
  if (filtered.length > 25) {
    return filtered.slice(0, 25);
  }
  return filtered;
}

function generateMermaid(workflowData, config) {
  let nodes = workflowData.nodes || [];
  const connections = workflowData.connections || {};

  // Filter out sticky notes
  nodes = nodes.filter((n) => n.type !== "n8n-nodes-base.stickyNote");

  if (config.simplify && nodes.length > 20) {
    nodes = simplifyLargeWorkflow(nodes, connections);
  }

  // Build node ID map
  const nodeMap = new Map();
  nodes.forEach((node) => {
    const id = sanitizeId(node.name);
    nodeMap.set(node.name, { id, node });
  });

  let mmd = `flowchart TD\n`;

  // Add title as a comment
  mmd += `  %% ${config.title}\n\n`;

  // Add class definitions for styling
  mmd += `  classDef trigger fill:#22c55e,stroke:#16a34a,color:#fff,stroke-width:2px\n`;
  mmd += `  classDef ai fill:#a855f7,stroke:#9333ea,color:#fff,stroke-width:2px\n`;
  mmd += `  classDef action fill:#3b82f6,stroke:#2563eb,color:#fff,stroke-width:2px\n`;
  mmd += `  classDef logic fill:#6b7280,stroke:#4b5563,color:#fff,stroke-width:2px\n`;
  mmd += `  classDef code fill:#f59e0b,stroke:#d97706,color:#fff,stroke-width:2px\n\n`;

  // Add nodes
  for (const [name, { id, node }] of nodeMap) {
    const label = sanitizeLabel(name);
    const category = getNodeCategory(node.type);
    const style = getCategoryStyle(category);

    // Use different shapes based on category
    switch (category) {
      case "trigger":
        mmd += `  ${id}([${label}])${style}\n`;
        break;
      case "logic":
        mmd += `  ${id}{${label}}${style}\n`;
        break;
      default:
        mmd += `  ${id}[${label}]${style}\n`;
    }
  }

  mmd += `\n`;

  // Add connections
  for (const [sourceName, outputs] of Object.entries(connections)) {
    if (!nodeMap.has(sourceName)) continue;
    const sourceId = nodeMap.get(sourceName).id;

    // outputs is typically { main: [ [{node, type, index},...], ... ] }
    const mainOutputs = outputs.main || [];
    for (const outputConnections of mainOutputs) {
      if (!Array.isArray(outputConnections)) continue;
      for (const conn of outputConnections) {
        if (!nodeMap.has(conn.node)) continue;
        const targetId = nodeMap.get(conn.node).id;
        mmd += `  ${sourceId} --> ${targetId}\n`;
      }
    }
  }

  return mmd;
}

async function generateDiagram(config) {
  console.log(`\n📐 Generating diagram: ${config.slug}`);

  if (!fs.existsSync(config.file)) {
    console.log(`  ❌ Workflow file not found: ${config.file}`);
    return false;
  }

  try {
    const rawData = fs.readFileSync(config.file, "utf-8");
    const workflowData = JSON.parse(rawData);

    const mermaidCode = generateMermaid(workflowData, config);

    // Write .mmd file
    fs.mkdirSync(TEMP_DIR, { recursive: true });
    const mmdPath = resolve(TEMP_DIR, `${config.slug}.mmd`);
    fs.writeFileSync(mmdPath, mermaidCode, "utf-8");
    console.log(`  ✓ Mermaid file: ${mmdPath}`);
    console.log(`  Nodes in diagram: ${(mermaidCode.match(/:::/g) || []).length}`);

    // Write mermaid config for dark theme
    const mermaidConfig = resolve(TEMP_DIR, "mermaid-config.json");
    fs.writeFileSync(
      mermaidConfig,
      JSON.stringify({
        theme: "dark",
        themeVariables: {
          darkMode: true,
          background: "#1a1a2e",
          primaryColor: "#3b82f6",
          primaryTextColor: "#fff",
          primaryBorderColor: "#2563eb",
          lineColor: "#6b7280",
          secondaryColor: "#a855f7",
          tertiaryColor: "#22c55e",
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: "14px",
        },
        flowchart: {
          curve: "basis",
          padding: 20,
          nodeSpacing: 30,
          rankSpacing: 50,
          htmlLabels: true,
          useMaxWidth: false,
        },
      }),
      "utf-8"
    );

    // Render to PNG using mmdc
    const outputPath = resolve(OUTPUT_DIR, `${config.slug}.png`);
    const mmdcPath = resolve(__dirname, "../node_modules/.bin/mmdc");

    console.log(`  Rendering PNG...`);
    execSync(
      `"${mmdcPath}" -i "${mmdPath}" -o "${outputPath}" -c "${mermaidConfig}" -w 2880 -H 1800 -b "#0a0a1a"`,
      {
        cwd: resolve(__dirname, ".."),
        timeout: 60000,
        stdio: "pipe",
      }
    );

    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      console.log(`  ✅ Diagram saved: ${outputPath} (${(stats.size / 1024).toFixed(1)} KB)`);
      return true;
    } else {
      console.log(`  ❌ Output file not created`);
      return false;
    }
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log(`🎬 Generating ${WORKFLOWS.length} n8n workflow diagram(s)...`);

  const results = [];
  for (const config of WORKFLOWS) {
    const success = await generateDiagram(config);
    results.push({ slug: config.slug, success });
  }

  // Cleanup temp dir
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true });
  }

  console.log("\n📊 Results:");
  for (const r of results) {
    console.log(`  ${r.success ? "✅" : "❌"} ${r.slug}`);
  }

  const failed = results.filter((r) => !r.success);
  if (failed.length > 0) {
    console.log(`\n⚠ ${failed.length} diagram(s) failed`);
    process.exit(1);
  }

  console.log("\n🎉 All diagrams generated successfully!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
