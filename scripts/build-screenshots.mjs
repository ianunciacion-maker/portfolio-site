/**
 * build-screenshots.mjs
 *
 * Builds standalone HTML screens for all 8 portfolio projects (5 screens each = 40 total),
 * then screenshots them with Playwright at 1440x900 @2x.
 */

import { chromium } from "playwright";
import { writeFileSync, mkdirSync, readFileSync, existsSync, statSync, copyFileSync } from "fs";
import { join, dirname, extname } from "path";
import { fileURLToPath } from "url";
import { tmpdir } from "os";
import { createServer } from "http";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, "..", "public", "images", "projects");
const FONT_LINK = `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">`;

// ─── Shared CSS Reset ──────────────────────────────────────────────────────

const CSS_RESET = `* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Inter', system-ui, sans-serif; min-height: 100vh; }`;

// ─── Shared n8n Workflow Builder ────────────────────────────────────────────

function buildN8nWorkflowHTML(title, subtitle, nodes, accentColor = "#ff6d5a") {
  const nodeEls = nodes.map(n => `
    <div style="position:absolute;left:${n.x}px;top:${n.y}px;background:${n.color || '#2d2d2d'};border:2px solid ${n.active ? accentColor : '#404040'};border-radius:12px;padding:14px 18px;min-width:160px;display:flex;align-items:center;gap:10px;box-shadow:0 4px 12px rgba(0,0,0,0.3);${n.active ? `box-shadow:0 0 20px ${accentColor}40;` : ''}">
      <div style="width:32px;height:32px;border-radius:8px;background:${n.iconBg || '#404040'};display:flex;align-items:center;justify-content:center;font-size:16px;">${n.icon}</div>
      <div><div style="font-size:13px;font-weight:600;color:#fff;">${n.label}</div><div style="font-size:11px;color:#888;margin-top:2px;">${n.type}</div></div>
    </div>`).join("");

  // Simple straight-line connections between sequential nodes
  const connSvg = nodes.slice(0, -1).map((n, i) => {
    const next = nodes[i + 1];
    const x1 = n.x + 160;
    const y1 = n.y + 25;
    const x2 = next.x;
    const y2 = next.y + 25;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#555" stroke-width="2" marker-end="url(#arrow)"/>`;
  }).join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINK}
<style>${CSS_RESET} body { background:#1a1a1a; color:#fff; }</style></head>
<body>
  <div style="background:#252525;border-bottom:1px solid #333;padding:16px 32px;display:flex;align-items:center;justify-content:space-between;">
    <div style="display:flex;align-items:center;gap:12px;">
      <div style="width:36px;height:36px;background:${accentColor};border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;">n8n</div>
      <div><div style="font-weight:600;font-size:16px;">${title}</div><div style="font-size:12px;color:#888;">${subtitle}</div></div>
    </div>
    <div style="display:flex;gap:8px;">
      <div style="padding:8px 16px;background:#333;border-radius:8px;font-size:13px;color:#aaa;">Inactive</div>
      <div style="padding:8px 16px;background:${accentColor};border-radius:8px;font-size:13px;color:#fff;font-weight:600;">Execute Workflow</div>
    </div>
  </div>
  <div style="position:relative;height:calc(100vh - 68px);overflow:hidden;">
    <svg style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;">
      <defs><marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#555"/></marker></defs>
      ${connSvg}
    </svg>
    ${nodeEls}
  </div>
</body></html>`;
}

// ─── Static File Server Helper ──────────────────────────────────────────────

const MIME_TYPES = {
  ".html": "text/html", ".css": "text/css", ".js": "application/javascript",
  ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".gif": "image/gif", ".svg": "image/svg+xml",
  ".ico": "image/x-icon", ".woff": "font/woff", ".woff2": "font/woff2",
  ".ttf": "font/ttf", ".webp": "image/webp", ".mp4": "video/mp4",
};

function startStaticServer(rootDir) {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let urlPath = req.url.split("?")[0];
      if (urlPath === "/") urlPath = "/index.html";
      const filePath = join(rootDir, urlPath);
      if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      const ext = extname(filePath).toLowerCase();
      res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
      res.end(readFileSync(filePath));
    });
    server.listen(0, () => {
      const port = server.address().port;
      resolve({ url: `http://localhost:${port}`, close: () => server.close() });
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// AIA LEAD EXTRACTOR — 5 Screens
// ═══════════════════════════════════════════════════════════════════════════

const AIA_LEAD_CSS = `
  body { background:#0f172a; color:#fff; }
  .header { background:#1e293b; border-bottom:1px solid rgba(255,255,255,0.1); padding:0 32px; height:64px; display:flex; align-items:center; justify-content:space-between; }
  .header-left { display:flex; align-items:center; gap:12px; }
  .logo-badge { width:32px; height:32px; background:#3b82f6; border-radius:8px; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:12px; }
  .tabs { display:flex; padding:0 32px; background:#0f172a; border-bottom:1px solid rgba(255,255,255,0.1); }
  .tab { padding:14px 24px; font-size:14px; font-weight:500; color:#94a3b8; border-bottom:2px solid transparent; }
  .tab.active { color:#3b82f6; border-bottom-color:#3b82f6; }
  .badge { display:inline-flex; align-items:center; gap:6px; padding:4px 12px; border-radius:9999px; font-size:13px; font-weight:500; }
  .badge-blue { background:rgba(59,130,246,0.15); color:#60a5fa; }
  .badge-green { background:rgba(34,197,94,0.15); color:#4ade80; }
  .badge-amber { background:rgba(245,158,11,0.15); color:#fbbf24; }
  .badge-red { background:rgba(239,68,68,0.15); color:#f87171; }
  .content { padding:24px 32px; }
  .btn { display:inline-flex; align-items:center; gap:8px; padding:8px 16px; border:1px solid rgba(255,255,255,0.1); border-radius:8px; background:transparent; color:#fff; font-size:13px; font-weight:500; cursor:pointer; }
  .btn-primary { background:#3b82f6; border-color:#3b82f6; }
  .table-container { border:1px solid rgba(255,255,255,0.1); border-radius:12px; overflow:hidden; }
  table { width:100%; border-collapse:collapse; }
  thead tr { background:#1e293b; }
  th { padding:12px 16px; text-align:left; font-size:13px; font-weight:500; color:#94a3b8; white-space:nowrap; }
  td { padding:10px 16px; font-size:14px; border-top:1px solid rgba(255,255,255,0.05); }
  .card { background:#1e293b; border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:20px; }
  .stat-value { font-size:28px; font-weight:700; margin-top:8px; }
  .stat-label { font-size:13px; color:#94a3b8; }
  input, select, textarea { background:#1e293b; border:1px solid rgba(255,255,255,0.15); border-radius:8px; padding:10px 14px; color:#fff; font-size:14px; font-family:inherit; outline:none; width:100%; }
  input:focus, select:focus { border-color:#3b82f6; }
  label { font-size:13px; font-weight:500; color:#94a3b8; display:block; margin-bottom:6px; }
`;

function aiaLeadWrap(tabActiveIndex, content) {
  const tabLabels = ["New Extraction", "History", "Admin"];
  const tabs = tabLabels.map((t, i) => `<div class="tab ${i === tabActiveIndex ? 'active' : ''}">${t}</div>`).join("");
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINK}<style>${CSS_RESET}${AIA_LEAD_CSS}</style></head><body>
    <div class="header"><div class="header-left"><div class="logo-badge">AIA</div><span style="font-weight:600;font-size:18px;">AI Lead Hunter</span></div>
    <div style="display:flex;align-items:center;gap:16px;"><span class="badge badge-blue">150 credits</span><span style="color:#94a3b8;font-size:14px;">ian@autonoiq.com</span></div></div>
    <div class="tabs">${tabs}</div>
    <div class="content">${content}</div></body></html>`;
}

// Screen 1: Dashboard — Results Table
function buildAIALead1() {
  const leads = [
    { name:"Sarah Chen", email:"sarah.chen@techcorp.io", title:"VP of Engineering", company:"TechCorp Solutions", phone:"+1 (415) 555-0142", industry:"Software" },
    { name:"Marcus Rivera", email:"m.rivera@cloudpeak.com", title:"Head of Product", company:"CloudPeak Analytics", phone:"+1 (212) 555-0198", industry:"Cloud Computing" },
    { name:"Emily Watson", email:"ewatson@datavault.io", title:"CTO", company:"DataVault Inc", phone:"+1 (650) 555-0176", industry:"Data Analytics" },
    { name:"James Okafor", email:"james.o@nexusai.co", title:"Director of Sales", company:"NexusAI", phone:"+1 (312) 555-0134", industry:"AI" },
    { name:"Lisa Park", email:"lpark@growtheng.com", title:"Marketing Director", company:"GrowthEngine", phone:"+1 (206) 555-0167", industry:"Marketing Tech" },
    { name:"David Mueller", email:"d.mueller@finscale.de", title:"CEO", company:"FinScale GmbH", phone:"+49 30 555 0123", industry:"FinTech" },
    { name:"Priya Sharma", email:"priya@automateflow.in", title:"VP Operations", company:"AutomateFlow", phone:"+91 98765 43210", industry:"Automation" },
    { name:"Tom Bradley", email:"tbradley@secureops.com", title:"CISO", company:"SecureOps Ltd", phone:"+1 (408) 555-0189", industry:"Cybersecurity" },
  ];
  const rows = leads.map((l, i) => `<tr${i%2===1?' style="background:rgba(30,41,59,0.3)"':''}><td style="color:#94a3b8;text-align:center;font-size:12px;">${i+1}</td><td>${l.name}</td><td>${l.email}</td><td>${l.title}</td><td>${l.company}</td><td>${l.phone}</td><td>${l.industry}</td></tr>`).join("");
  return aiaLeadWrap(0, `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
      <div style="display:flex;gap:12px;"><span class="badge badge-blue">47 leads found</span><span class="badge badge-amber">12 credits used</span></div>
      <button class="btn">Export CSV</button>
    </div>
    <div class="table-container"><table><thead><tr><th style="width:48px;text-align:center;">#</th><th>Full Name</th><th>Email</th><th>Title</th><th>Company</th><th>Phone</th><th>Industry</th></tr></thead><tbody>${rows}</tbody></table></div>`);
}

// Screen 2: Search Panel
function buildAIALead2() {
  return aiaLeadWrap(0, `
    <div style="max-width:720px;margin:0 auto;">
      <h2 style="font-size:20px;font-weight:600;margin-bottom:24px;">New Lead Extraction</h2>
      <div class="card" style="margin-bottom:20px;">
        <h3 style="font-size:15px;font-weight:600;margin-bottom:16px;">Source URL</h3>
        <input type="text" placeholder="https://www.linkedin.com/search/results/people/..." style="margin-bottom:16px;" />
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div><label>Industry</label><select><option>Technology</option></select></div>
          <div><label>Job Title</label><input type="text" placeholder="VP, Director, CTO..." /></div>
          <div><label>Company Size</label><select><option>50-200 employees</option></select></div>
          <div><label>Location</label><input type="text" placeholder="United States" /></div>
        </div>
      </div>
      <div class="card" style="margin-bottom:20px;">
        <h3 style="font-size:15px;font-weight:600;margin-bottom:16px;">Search Configuration</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div><label>Max Results</label><input type="number" value="50" /></div>
          <div><label>Enrichment Level</label><select><option>Full (email + phone + LinkedIn)</option></select></div>
        </div>
        <div style="margin-top:16px;display:flex;align-items:center;gap:8px;">
          <div style="width:18px;height:18px;background:#3b82f6;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:11px;">✓</div>
          <span style="font-size:14px;color:#94a3b8;">Auto-deduplicate results against previous extractions</span>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span class="badge badge-blue">Estimated cost: 15 credits</span>
        <button class="btn btn-primary" style="padding:12px 32px;font-size:15px;">Start Extraction</button>
      </div>
    </div>`);
}

// Screen 3: Extraction History
function buildAIALead3() {
  const history = [
    { date:"Feb 10, 2026", source:"LinkedIn Sales Nav", status:"Completed", leads:47, credits:12, duration:"3m 24s" },
    { date:"Feb 8, 2026", source:"Apollo.io Export", status:"Completed", leads:128, credits:32, duration:"8m 12s" },
    { date:"Feb 5, 2026", source:"LinkedIn Search", status:"Completed", leads:23, credits:6, duration:"1m 45s" },
    { date:"Feb 3, 2026", source:"Crunchbase List", status:"Failed", leads:0, credits:0, duration:"0m 12s" },
    { date:"Feb 1, 2026", source:"LinkedIn Sales Nav", status:"Completed", leads:89, credits:22, duration:"5m 38s" },
    { date:"Jan 28, 2026", source:"Custom CSV Upload", status:"Completed", leads:156, credits:39, duration:"10m 05s" },
    { date:"Jan 25, 2026", source:"LinkedIn Search", status:"Completed", leads:34, credits:9, duration:"2m 18s" },
  ];
  const statusBadge = (s) => s === "Completed" ? `<span class="badge badge-green">${s}</span>` : `<span class="badge badge-red">${s}</span>`;
  const rows = history.map((h, i) => `<tr${i%2===1?' style="background:rgba(30,41,59,0.3)"':''}><td>${h.date}</td><td>${h.source}</td><td>${statusBadge(h.status)}</td><td style="font-weight:600;">${h.leads}</td><td>${h.credits}</td><td style="color:#94a3b8;">${h.duration}</td><td><button class="btn" style="padding:4px 12px;font-size:12px;">View</button></td></tr>`).join("");
  return aiaLeadWrap(1, `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
      <h2 style="font-size:20px;font-weight:600;">Extraction History</h2>
      <div style="display:flex;gap:12px;"><span class="badge badge-blue">477 total leads</span><span class="badge badge-amber">120 credits used</span></div>
    </div>
    <div class="table-container"><table><thead><tr><th>Date</th><th>Source</th><th>Status</th><th>Leads</th><th>Credits</th><th>Duration</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`);
}

// Screen 4: Admin Dashboard
function buildAIALead4() {
  const barData = [65, 42, 89, 55, 128, 47, 78];
  const barLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const maxBar = Math.max(...barData);
  const bars = barData.map((v, i) => `<div style="display:flex;flex-direction:column;align-items:center;gap:8px;flex:1;">
    <div style="width:100%;height:${(v/maxBar)*200}px;background:linear-gradient(to top,#3b82f6,#60a5fa);border-radius:6px 6px 0 0;"></div>
    <span style="font-size:11px;color:#94a3b8;">${barLabels[i]}</span></div>`).join("");

  return aiaLeadWrap(2, `
    <h2 style="font-size:20px;font-weight:600;margin-bottom:20px;">Admin Dashboard</h2>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;">
      <div class="card"><div class="stat-label">Total Users</div><div class="stat-value" style="color:#60a5fa;">24</div></div>
      <div class="card"><div class="stat-label">Credits Sold</div><div class="stat-value" style="color:#4ade80;">12,450</div></div>
      <div class="card"><div class="stat-label">Extractions Today</div><div class="stat-value" style="color:#fbbf24;">38</div></div>
      <div class="card"><div class="stat-label">Leads Generated</div><div class="stat-value" style="color:#c084fc;">4,892</div></div>
    </div>
    <div class="card">
      <h3 style="font-size:15px;font-weight:600;margin-bottom:16px;">Extractions This Week</h3>
      <div style="display:flex;align-items:flex-end;gap:12px;height:240px;padding-top:20px;">${bars}</div>
    </div>`);
}

// Screen 5: Lead Detail / Export
function buildAIALead5() {
  const fields = [
    ["Full Name", "Sarah Chen"], ["Email", "sarah.chen@techcorp.io"], ["Phone", "+1 (415) 555-0142"],
    ["Job Title", "VP of Engineering"], ["Company", "TechCorp Solutions"], ["Industry", "Software / SaaS"],
    ["Company Size", "250-500 employees"], ["Location", "San Francisco, CA"], ["LinkedIn", "linkedin.com/in/sarachen"],
    ["Revenue", "$50M - $100M"], ["Funding", "Series C"], ["Technologies", "React, Node.js, AWS, Kubernetes"],
  ];
  const fieldEls = fields.map(([k, v]) => `<div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);"><span style="color:#94a3b8;font-size:14px;">${k}</span><span style="font-size:14px;font-weight:500;">${v}</span></div>`).join("");

  return aiaLeadWrap(0, `
    <div style="display:flex;gap:24px;">
      <div style="flex:1;">
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;">
          <div style="width:56px;height:56px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;">SC</div>
          <div><h2 style="font-size:20px;font-weight:600;">Sarah Chen</h2><p style="color:#94a3b8;font-size:14px;">VP of Engineering at TechCorp Solutions</p></div>
        </div>
        <div class="card">${fieldEls}</div>
      </div>
      <div style="width:320px;">
        <div class="card" style="margin-bottom:16px;">
          <h3 style="font-size:15px;font-weight:600;margin-bottom:16px;">Export Options</h3>
          <button class="btn btn-primary" style="width:100%;justify-content:center;margin-bottom:8px;">Export as CSV</button>
          <button class="btn" style="width:100%;justify-content:center;margin-bottom:8px;">Export as JSON</button>
          <button class="btn" style="width:100%;justify-content:center;">Copy to Clipboard</button>
        </div>
        <div class="card">
          <h3 style="font-size:15px;font-weight:600;margin-bottom:12px;">Lead Score</h3>
          <div style="text-align:center;">
            <div style="width:80px;height:80px;border-radius:50%;border:4px solid #4ade80;display:flex;align-items:center;justify-content:center;margin:0 auto 8px;"><span style="font-size:24px;font-weight:700;color:#4ade80;">92</span></div>
            <span class="badge badge-green">High Quality</span>
          </div>
        </div>
      </div>
    </div>`);
}

// ═══════════════════════════════════════════════════════════════════════════
// WHITE LOTUS — 5 Screens
// ═══════════════════════════════════════════════════════════════════════════

const WL_CSS = `
  body { background:#fafaf9; color:#1c1917; }
  .wl-header { background:white; border-bottom:1px solid #e7e5e4; padding:0 32px; height:72px; display:flex; align-items:center; justify-content:space-between; box-shadow:0 1px 3px rgba(0,0,0,0.05); }
  .wl-logo { display:flex; align-items:center; gap:12px; }
  .wl-logo-icon { width:40px; height:40px; background:linear-gradient(135deg,#16a34a,#4c8447); border-radius:10px; display:flex; align-items:center; justify-content:center; color:white; }
  .wl-cats { padding:20px 32px; display:flex; gap:8px; background:white; border-bottom:1px solid #e7e5e4; }
  .wl-cat { padding:10px 20px; border-radius:9999px; font-size:14px; font-weight:500; border:1px solid #d6d3d1; background:white; color:#57534e; }
  .wl-cat.active { background:#16a34a; color:white; border-color:#16a34a; }
  .wl-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; padding:32px; max-width:1200px; margin:0 auto; }
  .wl-card { background:white; border-radius:16px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.08); }
  .wl-card-img { width:100%; aspect-ratio:4/3; object-fit:cover; background:#e7e5e4; display:flex; align-items:center; justify-content:center; color:#a8a29e; font-size:40px; }
  .wl-card-info { padding:16px; display:flex; align-items:center; justify-content:space-between; }
  .wl-card-name { font-weight:600; font-size:15px; }
  .wl-card-price { font-weight:700; font-size:15px; color:#16a34a; }
  .wl-btn { background:#16a34a; color:white; border:none; border-radius:12px; padding:10px 20px; font-weight:600; font-size:14px; cursor:pointer; }
`;

function wlHeader(cartCount) {
  return `<div class="wl-header"><div class="wl-logo"><div class="wl-logo-icon">🪷</div><div><div style="font-family:Georgia,serif;font-size:20px;font-weight:700;">White Lotus</div><div style="font-size:11px;color:#78716c;letter-spacing:0.5px;">CHINESE RESTAURANT</div></div></div>
  <div style="display:flex;align-items:center;gap:16px;"><div style="background:#f5f5f4;border:1px solid #e7e5e4;border-radius:12px;padding:10px 16px;width:280px;font-size:14px;color:#a8a29e;">Search menu items...</div>
  <button class="wl-btn" style="position:relative;">Cart${cartCount > 0 ? `<span style="position:absolute;top:-6px;right:-6px;background:#ef4444;width:20px;height:20px;border-radius:50%;font-size:11px;display:flex;align-items:center;justify-content:center;">${cartCount}</span>` : ''}</button></div></div>`;
}

// Screen 1: Menu - Noodles
function buildWhiteLotus1() {
  const items = [
    { name:"Beef Chow Mein", price:"$13.99", emoji:"🍜" },
    { name:"Chicken Lo Mein", price:"$12.99", emoji:"🥡" },
    { name:"Shrimp Chow Fun", price:"$14.99", emoji:"🦐" },
    { name:"Dan Dan Noodles", price:"$11.99", emoji:"🌶️" },
    { name:"Wonton Noodle Soup", price:"$12.99", emoji:"🥟" },
    { name:"Singapore Noodles", price:"$13.49", emoji:"🍛" },
  ];
  const cats = ["All", "Noodles", "Rice Dishes", "Dim Sum", "Appetizers", "Soups", "Beverages"];
  const catTabs = cats.map((c, i) => `<button class="wl-cat ${i===1?'active':''}">${c}</button>`).join("");
  const cards = items.map(it => `<div class="wl-card"><div class="wl-card-img">${it.emoji}</div><div class="wl-card-info"><span class="wl-card-name">${it.name}</span><span class="wl-card-price">${it.price}</span></div></div>`).join("");
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINK}<style>${CSS_RESET}${WL_CSS}</style></head><body>
    ${wlHeader(3)}<div class="wl-cats">${catTabs}</div><div class="wl-grid">${cards}</div>
    <div style="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1c1917;color:white;border-radius:16px;padding:16px 32px;display:flex;align-items:center;gap:24px;box-shadow:0 20px 40px rgba(0,0,0,0.25);z-index:50;">
      <span style="color:#a8a29e;">3 items</span><button class="wl-btn">View Cart</button><span style="font-weight:700;font-size:17px;">$34.97</span></div></body></html>`;
}

// Screen 2: Menu - Dim Sum
function buildWhiteLotus2() {
  const items = [
    { name:"Har Gow (Shrimp)", price:"$8.99", emoji:"🥟" },
    { name:"Siu Mai (Pork)", price:"$7.99", emoji:"🥟" },
    { name:"Char Siu Bao", price:"$6.99", emoji:"🫓" },
    { name:"Cheung Fun", price:"$9.99", emoji:"🍥" },
    { name:"Turnip Cake", price:"$7.49", emoji:"🧁" },
    { name:"Egg Custard Tart", price:"$5.99", emoji:"🥮" },
  ];
  const cats = ["All", "Noodles", "Rice Dishes", "Dim Sum", "Appetizers", "Soups", "Beverages"];
  const catTabs = cats.map((c, i) => `<button class="wl-cat ${i===3?'active':''}">${c}</button>`).join("");
  const cards = items.map(it => `<div class="wl-card"><div class="wl-card-img">${it.emoji}</div><div class="wl-card-info"><span class="wl-card-name">${it.name}</span><span class="wl-card-price">${it.price}</span></div></div>`).join("");
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINK}<style>${CSS_RESET}${WL_CSS}</style></head><body>
    ${wlHeader(1)}<div class="wl-cats">${catTabs}</div><div class="wl-grid">${cards}</div></body></html>`;
}

// Screen 3: Cart / Checkout
function buildWhiteLotus3() {
  const cartItems = [
    { name:"Beef Chow Mein", qty:2, price:13.99 },
    { name:"Har Gow (Shrimp)", qty:1, price:8.99 },
    { name:"Dan Dan Noodles", qty:1, price:11.99 },
  ];
  const subtotal = cartItems.reduce((s, it) => s + it.qty * it.price, 0);
  const rows = cartItems.map(it => `<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 0;border-bottom:1px solid #e7e5e4;">
    <div style="display:flex;align-items:center;gap:16px;"><div style="width:60px;height:60px;background:#f5f5f4;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:28px;">🍜</div>
    <div><div style="font-weight:600;">${it.name}</div><div style="font-size:13px;color:#78716c;">Qty: ${it.qty}</div></div></div>
    <span style="font-weight:700;color:#16a34a;">$${(it.qty*it.price).toFixed(2)}</span></div>`).join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINK}<style>${CSS_RESET}${WL_CSS}</style></head><body>
    ${wlHeader(4)}
    <div style="max-width:960px;margin:0 auto;padding:32px;display:grid;grid-template-columns:1fr 360px;gap:32px;">
      <div><h2 style="font-size:22px;font-weight:700;margin-bottom:24px;">Your Cart</h2>${rows}</div>
      <div style="background:white;border-radius:16px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.08);height:fit-content;">
        <h3 style="font-size:16px;font-weight:600;margin-bottom:20px;">Order Summary</h3>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="color:#78716c;">Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="color:#78716c;">Tax</span><span>$${(subtotal*0.08).toFixed(2)}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="color:#78716c;">Delivery</span><span style="color:#16a34a;">Free</span></div>
        <div style="border-top:2px solid #e7e5e4;margin:16px 0;"></div>
        <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:700;margin-bottom:20px;"><span>Total</span><span>$${(subtotal*1.08).toFixed(2)}</span></div>
        <button class="wl-btn" style="width:100%;padding:14px;font-size:16px;border-radius:12px;">Proceed to Checkout</button>
      </div>
    </div></body></html>`;
}

// Screen 4: Order Tracking
function buildWhiteLotus4() {
  const steps = [
    { label:"Order Placed", time:"6:42 PM", done:true },
    { label:"Preparing", time:"6:45 PM", done:true },
    { label:"Ready for Pickup", time:"7:05 PM", done:true },
    { label:"Out for Delivery", time:"7:12 PM", done:false, active:true },
    { label:"Delivered", time:"Est. 7:25 PM", done:false },
  ];
  const timeline = steps.map((s, i) => `<div style="display:flex;gap:16px;align-items:flex-start;">
    <div style="display:flex;flex-direction:column;align-items:center;">
      <div style="width:24px;height:24px;border-radius:50%;background:${s.done ? '#16a34a' : s.active ? '#f59e0b' : '#d6d3d1'};display:flex;align-items:center;justify-content:center;font-size:12px;color:white;">${s.done ? '✓' : s.active ? '●' : ''}</div>
      ${i < steps.length-1 ? `<div style="width:2px;height:48px;background:${s.done ? '#16a34a' : '#e7e5e4'};"></div>` : ''}
    </div>
    <div style="padding-bottom:${i < steps.length-1 ? '32px' : '0'};"><div style="font-weight:${s.done || s.active ? '600' : '400'};color:${s.done || s.active ? '#1c1917' : '#a8a29e'};">${s.label}</div><div style="font-size:13px;color:#78716c;margin-top:2px;">${s.time}</div></div>
  </div>`).join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINK}<style>${CSS_RESET}${WL_CSS}</style></head><body>
    ${wlHeader(0)}
    <div style="max-width:720px;margin:0 auto;padding:40px 32px;">
      <h2 style="font-size:22px;font-weight:700;margin-bottom:8px;">Order #1847</h2>
      <p style="color:#78716c;margin-bottom:32px;">Estimated delivery: 7:25 PM</p>
      <div style="background:white;border-radius:16px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <div style="display:flex;gap:16px;align-items:center;margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid #e7e5e4;">
          <div style="width:48px;height:48px;background:#fef3c7;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;">🛵</div>
          <div><div style="font-weight:600;font-size:16px;">Your order is on the way!</div><div style="font-size:13px;color:#78716c;">Driver: Michael T. | ~13 min away</div></div>
        </div>
        ${timeline}
      </div>
    </div></body></html>`;
}

// Screen 5: Admin Dashboard
function buildWhiteLotus5() {
  const menuItems = [
    { name:"Beef Chow Mein", cat:"Noodles", price:"$13.99", orders:142, status:"Active" },
    { name:"Har Gow", cat:"Dim Sum", price:"$8.99", orders:98, status:"Active" },
    { name:"Kung Pao Chicken", cat:"Mains", price:"$15.99", orders:87, status:"Active" },
    { name:"Spring Rolls", cat:"Appetizers", price:"$6.99", orders:203, status:"Active" },
    { name:"Mango Pudding", cat:"Desserts", price:"$5.99", orders:56, status:"Sold Out" },
  ];
  const rows = menuItems.map(it => `<tr><td style="font-weight:500;">${it.name}</td><td style="color:#78716c;">${it.cat}</td><td style="font-weight:600;color:#16a34a;">${it.price}</td><td>${it.orders}</td><td><span style="padding:4px 12px;border-radius:9999px;font-size:12px;font-weight:500;${it.status==='Active'?'background:#dcfce7;color:#16a34a;':'background:#fee2e2;color:#ef4444;'}">${it.status}</span></td></tr>`).join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINK}<style>${CSS_RESET}${WL_CSS}
    .admin-card { background:white; border-radius:12px; padding:20px; box-shadow:0 1px 3px rgba(0,0,0,0.08); }
    .admin-stat { font-size:28px; font-weight:700; margin-top:8px; }
    table { width:100%; border-collapse:collapse; }
    th { padding:12px 16px; text-align:left; font-size:13px; font-weight:500; color:#78716c; border-bottom:2px solid #e7e5e4; }
    td { padding:12px 16px; font-size:14px; border-bottom:1px solid #f5f5f4; }
  </style></head><body>
    <div class="wl-header"><div class="wl-logo"><div class="wl-logo-icon">🪷</div><div><div style="font-family:Georgia,serif;font-size:20px;font-weight:700;">White Lotus</div><div style="font-size:11px;color:#78716c;">ADMIN DASHBOARD</div></div></div>
    <div style="display:flex;gap:8px;"><button style="padding:8px 16px;background:#f5f5f4;border:1px solid #e7e5e4;border-radius:8px;font-size:13px;">Menu</button><button style="padding:8px 16px;background:#16a34a;color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;">+ Add Item</button></div></div>
    <div style="padding:24px 32px;">
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;">
        <div class="admin-card"><div style="font-size:13px;color:#78716c;">Today's Orders</div><div class="admin-stat" style="color:#16a34a;">47</div></div>
        <div class="admin-card"><div style="font-size:13px;color:#78716c;">Revenue Today</div><div class="admin-stat">$1,284</div></div>
        <div class="admin-card"><div style="font-size:13px;color:#78716c;">Active Items</div><div class="admin-stat" style="color:#3b82f6;">32</div></div>
        <div class="admin-card"><div style="font-size:13px;color:#78716c;">Avg. Order Value</div><div class="admin-stat" style="color:#f59e0b;">$27.31</div></div>
      </div>
      <div class="admin-card"><h3 style="font-size:16px;font-weight:600;margin-bottom:16px;">Menu Items</h3>
      <table><thead><tr><th>Item</th><th>Category</th><th>Price</th><th>Orders (30d)</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>
    </div></body></html>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// HR BOT AIA — 5 Screens
// ═══════════════════════════════════════════════════════════════════════════

const HRBOT_CSS = `
  body { background:#f9fafb; color:#111827; display:flex; }
  .sidebar { width:260px; background:#111827; color:white; display:flex; flex-direction:column; flex-shrink:0; height:100vh; }
  .sidebar-header { padding:20px; border-bottom:1px solid rgba(255,255,255,0.1); }
  .sidebar-logo { display:flex; align-items:center; gap:10px; margin-bottom:16px; }
  .hr-logo { width:36px; height:36px; background:linear-gradient(135deg,#f97316,#ea580c); border-radius:10px; display:flex; align-items:center; justify-content:center; }
  .new-chat { width:100%; background:linear-gradient(135deg,#f97316,#ea580c); color:white; border:none; border-radius:10px; padding:12px; font-weight:600; font-size:14px; }
  .conv-list { flex:1; overflow-y:auto; padding:12px; }
  .conv-label { font-size:11px; text-transform:uppercase; color:#6b7280; font-weight:600; padding:8px 8px 4px; letter-spacing:0.5px; }
  .conv-item { padding:10px 12px; border-radius:8px; font-size:13px; color:#d1d5db; margin-bottom:2px; }
  .conv-item.active { background:rgba(249,115,22,0.15); color:#fb923c; }
  .chat-area { flex:1; display:flex; flex-direction:column; height:100vh; }
  .chat-header { background:white; border-bottom:1px solid #e5e7eb; padding:16px 24px; display:flex; align-items:center; justify-content:space-between; }
  .mode-badge { display:inline-flex; align-items:center; gap:6px; background:#eff6ff; color:#3b82f6; padding:6px 14px; border-radius:8px; font-size:13px; font-weight:600; }
  .messages { flex:1; overflow-y:auto; padding:24px; display:flex; flex-direction:column; gap:20px; }
  .msg { max-width:75%; display:flex; flex-direction:column; gap:4px; }
  .msg-user { align-self:flex-end; }
  .msg-bot { align-self:flex-start; }
  .bubble { padding:14px 18px; border-radius:16px; font-size:14px; line-height:1.6; }
  .msg-user .bubble { background:linear-gradient(135deg,#f97316,#ea580c); color:white; border-bottom-right-radius:4px; }
  .msg-bot .bubble { background:white; color:#374151; border:1px solid #e5e7eb; border-bottom-left-radius:4px; box-shadow:0 1px 3px rgba(0,0,0,0.05); }
  .msg-label { font-size:11px; color:#9ca3af; font-weight:500; }
  .chat-input-area { background:white; border-top:1px solid #e5e7eb; padding:16px 24px; display:flex; align-items:center; gap:12px; }
  .chat-input { flex:1; border:1px solid #d1d5db; border-radius:12px; padding:12px 16px; font-size:14px; outline:none; font-family:inherit; }
  .send-btn { width:48px; height:48px; border-radius:12px; background:linear-gradient(135deg,#f97316,#ea580c); border:none; display:flex; align-items:center; justify-content:center; color:white; font-size:20px; }
`;

function hrBotSidebar(activeIdx) {
  const convs = [["Interview Analysis","active"],["Position Card: Frontend",""],["Candidate Evaluation",""],["HR Policy Questions",""]];
  if (activeIdx !== undefined) convs.forEach((c,i) => c[1] = i === activeIdx ? 'active' : '');
  const convEls = convs.map(c => `<div class="conv-item ${c[1]}">${c[0]}</div>`).join("");
  return `<div class="sidebar"><div class="sidebar-header"><div class="sidebar-logo"><div class="hr-logo">👤</div><div><div style="font-weight:700;font-size:18px;">HRBot</div><div style="font-size:11px;color:#9ca3af;">AI HR Assistant</div></div></div><button class="new-chat">+ New Chat</button></div>
  <div class="conv-list"><div class="conv-label">Today</div>${convEls}</div></div>`;
}

function hrChatInput() {
  return `<div class="chat-input-area"><input class="chat-input" placeholder="Type your message..." /><button class="send-btn">➤</button></div>`;
}

// Screen 1: Chat - Interview Analysis
function buildHRBot1() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINK}<style>${CSS_RESET}${HRBOT_CSS}</style></head><body>
    ${hrBotSidebar(0)}
    <div class="chat-area">
      <div class="chat-header"><div style="display:flex;align-items:center;gap:12px;"><span class="mode-badge">📋 Interview Analysis</span><span style="font-weight:600;">Frontend Developer - Round 2</span></div>
      <div style="display:flex;background:#f3f4f6;border-radius:8px;overflow:hidden;"><button style="padding:6px 14px;font-size:12px;font-weight:600;border:none;background:#3b82f6;color:white;">EN</button><button style="padding:6px 14px;font-size:12px;font-weight:600;border:none;background:transparent;color:#6b7280;">PL</button></div></div>
      <div class="messages">
        <div class="msg msg-user"><div class="msg-label">You</div><div class="bubble">Can you help me analyze this interview transcript for the Frontend Developer position?</div></div>
        <div class="msg msg-bot"><div class="msg-label">HRBot</div><div class="bubble">I'd be happy to analyze the interview transcript. Here's my assessment:<br><br><strong style="color:#3b82f6;">Communication Skills</strong><br>The candidate demonstrates <strong>excellent verbal communication</strong> with clear, structured responses.<br><br><strong style="color:#3b82f6;">Technical Knowledge</strong><br><strong>Strong proficiency in React and TypeScript</strong> demonstrated through detailed architecture discussions.<br><br><strong style="color:#3b82f6;">Problem-Solving</strong><br>Approached the system design question methodically, <strong>breaking down complex problems</strong> into manageable components.</div></div>
        <div class="msg msg-user"><div class="msg-label">You</div><div class="bubble">What are the candidate's key strengths?</div></div>
        <div class="msg msg-bot"><div class="msg-label">HRBot</div><div class="bubble">Based on the transcript, key strengths:<br><br>1. <strong>React Expertise</strong> — Deep knowledge of hooks and RSC architecture<br>2. <strong>System Design</strong> — Excellent ability to architect scalable frontend systems<br>3. <strong>Team Collaboration</strong> — Led code reviews and mentored junior devs<br>4. <strong>Growth Mindset</strong> — Active in open-source<br><br><span style="display:inline-block;background:#dcfce7;color:#16a34a;padding:4px 12px;border-radius:6px;font-weight:700;font-size:13px;margin-top:4px;">Recommendation: Strong Hire</span></div></div>
      </div>
      ${hrChatInput()}
    </div></body></html>`;
}

// Screen 2: Chat - Position Card Generator
function buildHRBot2() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINK}<style>${CSS_RESET}${HRBOT_CSS}</style></head><body>
    ${hrBotSidebar(1)}
    <div class="chat-area">
      <div class="chat-header"><div style="display:flex;align-items:center;gap:12px;"><span class="mode-badge" style="background:#fef3c7;color:#d97706;">📝 Position Card Generator</span><span style="font-weight:600;">Senior Frontend Developer</span></div></div>
      <div class="messages">
        <div class="msg msg-user"><div class="msg-label">You</div><div class="bubble">Generate a position card for a Senior Frontend Developer role. React/TypeScript focused, remote, $120-150k range.</div></div>
        <div class="msg msg-bot"><div class="msg-label">HRBot</div><div class="bubble">
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:8px 0;">
            <div style="font-size:18px;font-weight:700;color:#1e293b;margin-bottom:4px;">Senior Frontend Developer</div>
            <div style="font-size:13px;color:#64748b;margin-bottom:16px;">Remote | Full-time | $120,000 - $150,000</div>
            <div style="font-weight:600;color:#3b82f6;margin-bottom:6px;">Requirements</div>
            <div style="font-size:13px;color:#475569;margin-bottom:12px;">• 5+ years React/TypeScript experience<br>• Strong system design skills<br>• Experience with Next.js and state management<br>• CI/CD and testing best practices</div>
            <div style="font-weight:600;color:#3b82f6;margin-bottom:6px;">Responsibilities</div>
            <div style="font-size:13px;color:#475569;">• Lead frontend architecture decisions<br>• Mentor junior developers<br>• Drive code quality through reviews<br>• Collaborate with product and design teams</div>
          </div>
          Position card generated! Would you like me to adjust any section?
        </div></div>
      </div>
      ${hrChatInput()}
    </div></body></html>`;
}

// Screen 3: Chat - Candidate Evaluation
function buildHRBot3() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINK}<style>${CSS_RESET}${HRBOT_CSS}</style></head><body>
    ${hrBotSidebar(2)}
    <div class="chat-area">
      <div class="chat-header"><div style="display:flex;align-items:center;gap:12px;"><span class="mode-badge" style="background:#fce7f3;color:#db2777;">🎯 Candidate Evaluation</span><span style="font-weight:600;">Alex Johnson - Backend Engineer</span></div></div>
      <div class="messages">
        <div class="msg msg-user"><div class="msg-label">You</div><div class="bubble">Evaluate this candidate for the Backend Engineer position. Score each competency.</div></div>
        <div class="msg msg-bot"><div class="msg-label">HRBot</div><div class="bubble">
          <strong>Candidate Evaluation: Alex Johnson</strong><br><br>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0;">
            <div style="background:#f0fdf4;padding:10px 14px;border-radius:8px;"><div style="font-size:12px;color:#16a34a;font-weight:600;">Technical Skills</div><div style="font-size:20px;font-weight:700;color:#16a34a;">8.5/10</div></div>
            <div style="background:#eff6ff;padding:10px 14px;border-radius:8px;"><div style="font-size:12px;color:#3b82f6;font-weight:600;">Communication</div><div style="font-size:20px;font-weight:700;color:#3b82f6;">7/10</div></div>
            <div style="background:#fef3c7;padding:10px 14px;border-radius:8px;"><div style="font-size:12px;color:#d97706;font-weight:600;">Problem Solving</div><div style="font-size:20px;font-weight:700;color:#d97706;">9/10</div></div>
            <div style="background:#fce7f3;padding:10px 14px;border-radius:8px;"><div style="font-size:12px;color:#db2777;font-weight:600;">Culture Fit</div><div style="font-size:20px;font-weight:700;color:#db2777;">8/10</div></div>
          </div>
          <br><strong>Overall Score: 8.1/10</strong><br>
          <span style="display:inline-block;background:#dcfce7;color:#16a34a;padding:4px 12px;border-radius:6px;font-weight:700;font-size:13px;margin-top:4px;">Recommendation: Proceed to Final Round</span>
        </div></div>
      </div>
      ${hrChatInput()}
    </div></body></html>`;
}

// Screen 4: Landing Page
function buildHRBot4() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINK}<style>${CSS_RESET}
    body { background:linear-gradient(135deg,#111827 0%,#1f2937 100%); color:white; }
  </style></head><body>
    <div style="padding:20px 48px;display:flex;align-items:center;justify-content:space-between;">
      <div style="display:flex;align-items:center;gap:10px;"><div style="width:36px;height:36px;background:linear-gradient(135deg,#f97316,#ea580c);border-radius:10px;display:flex;align-items:center;justify-content:center;">👤</div><span style="font-weight:700;font-size:18px;">HRBot AIA</span></div>
      <div style="display:flex;gap:32px;font-size:14px;color:#9ca3af;"><span>Features</span><span>Pricing</span><span>Demo</span></div>
      <button style="background:linear-gradient(135deg,#f97316,#ea580c);color:white;border:none;border-radius:10px;padding:10px 24px;font-weight:600;font-size:14px;">Get Started</button>
    </div>
    <div style="text-align:center;padding:80px 48px 60px;">
      <div style="display:inline-flex;background:rgba(249,115,22,0.15);color:#fb923c;padding:8px 20px;border-radius:9999px;font-size:13px;font-weight:600;margin-bottom:24px;">AI-Powered HR Assistant</div>
      <h1 style="font-size:52px;font-weight:700;line-height:1.1;margin-bottom:20px;">Automate Your<br><span style="background:linear-gradient(135deg,#f97316,#fbbf24);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">HR Processes</span> with AI</h1>
      <p style="font-size:18px;color:#9ca3af;max-width:600px;margin:0 auto 40px;line-height:1.6;">Interview analysis, candidate evaluation, and position card generation — all powered by intelligent AI assistants.</p>
      <div style="display:flex;gap:16px;justify-content:center;">
        <button style="background:linear-gradient(135deg,#f97316,#ea580c);color:white;border:none;border-radius:12px;padding:14px 32px;font-weight:600;font-size:16px;">Start Free Trial</button>
        <button style="background:rgba(255,255,255,0.1);color:white;border:1px solid rgba(255,255,255,0.2);border-radius:12px;padding:14px 32px;font-weight:600;font-size:16px;">Watch Demo</button>
      </div>
    </div>
    <div style="display:flex;justify-content:center;gap:48px;padding:0 48px;">
      <div style="text-align:center;"><div style="font-size:32px;font-weight:700;color:#f97316;">500+</div><div style="font-size:14px;color:#9ca3af;">Interviews Analyzed</div></div>
      <div style="text-align:center;"><div style="font-size:32px;font-weight:700;color:#f97316;">98%</div><div style="font-size:14px;color:#9ca3af;">Accuracy Rate</div></div>
      <div style="text-align:center;"><div style="font-size:32px;font-weight:700;color:#f97316;">2 min</div><div style="font-size:14px;color:#9ca3af;">Avg. Response Time</div></div>
    </div>
  </body></html>`;
}

// Screen 5: Features Section
function buildHRBot5() {
  const features = [
    { icon:"📋", title:"Interview Analysis", desc:"Upload transcripts and get detailed competency assessments with scoring." },
    { icon:"📝", title:"Position Card Generator", desc:"Generate professional job postings from simple role descriptions." },
    { icon:"🎯", title:"Candidate Evaluation", desc:"Score candidates across multiple competencies with AI-powered analysis." },
    { icon:"🌐", title:"Multilingual Support", desc:"Conduct HR operations in English and Polish with seamless switching." },
    { icon:"📊", title:"Analytics Dashboard", desc:"Track hiring metrics, team performance, and recruitment pipeline health." },
    { icon:"🔒", title:"Data Security", desc:"Enterprise-grade encryption and compliance with HR data regulations." },
  ];
  const cards = features.map(f => `<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:28px;">
    <div style="font-size:32px;margin-bottom:16px;">${f.icon}</div>
    <div style="font-size:16px;font-weight:600;margin-bottom:8px;">${f.title}</div>
    <div style="font-size:14px;color:#9ca3af;line-height:1.5;">${f.desc}</div>
  </div>`).join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINK}<style>${CSS_RESET}
    body { background:#111827; color:white; }
  </style></head><body>
    <div style="padding:60px 48px;text-align:center;">
      <div style="display:inline-flex;background:rgba(249,115,22,0.15);color:#fb923c;padding:8px 20px;border-radius:9999px;font-size:13px;font-weight:600;margin-bottom:16px;">Features</div>
      <h2 style="font-size:36px;font-weight:700;margin-bottom:12px;">Everything You Need for<br>Modern HR Operations</h2>
      <p style="font-size:16px;color:#9ca3af;max-width:500px;margin:0 auto 48px;">Powerful AI tools that streamline every step of your HR workflow.</p>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:1000px;margin:0 auto;">${cards}</div>
    </div></body></html>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// AIA SALES BOT — 5 Screens (n8n workflow style)
// ═══════════════════════════════════════════════════════════════════════════

// Screen 1: Main Workflow Overview
function buildSalesBot1() {
  return buildN8nWorkflowHTML("AIA Sales Bot — Outbound Agent", "Main workflow • 12 nodes", [
    { x:40, y:120, label:"Schedule Trigger", type:"Every 30 min", icon:"⏰", iconBg:"#6366f1" },
    { x:280, y:120, label:"Fetch Leads", type:"Bitrix24 CRM", icon:"📋", iconBg:"#3b82f6", active:true },
    { x:520, y:60, label:"Qualify Lead", type:"AI Agent", icon:"🤖", iconBg:"#8b5cf6" },
    { x:520, y:200, label:"Skip Low Score", type:"Filter", icon:"🔽", iconBg:"#94a3b8" },
    { x:760, y:60, label:"Voice Call", type:"ElevenLabs", icon:"📞", iconBg:"#16a34a" },
    { x:760, y:200, label:"Email Follow-up", type:"Gmail", icon:"✉️", iconBg:"#ea580c" },
    { x:1000, y:60, label:"Book Meeting", type:"Calendly", icon:"📅", iconBg:"#0ea5e9" },
    { x:1000, y:200, label:"Update CRM", type:"Bitrix24", icon:"💾", iconBg:"#3b82f6" },
  ], "#ff6d5a");
}

// Screen 2: Lead Qualification Flow
function buildSalesBot2() {
  return buildN8nWorkflowHTML("Lead Qualification Sub-workflow", "AI-powered scoring • 8 nodes", [
    { x:40, y:150, label:"Receive Lead", type:"Webhook", icon:"🔗", iconBg:"#6366f1", active:true },
    { x:280, y:80, label:"Enrich Data", type:"Clearbit API", icon:"🔍", iconBg:"#3b82f6" },
    { x:280, y:240, label:"Check History", type:"Bitrix24", icon:"📊", iconBg:"#0ea5e9" },
    { x:520, y:150, label:"AI Score", type:"Claude AI", icon:"🧠", iconBg:"#8b5cf6", active:true },
    { x:760, y:80, label:"High Score", type:"Score > 7", icon:"✅", iconBg:"#16a34a" },
    { x:760, y:240, label:"Low Score", type:"Score ≤ 7", icon:"❌", iconBg:"#ef4444" },
    { x:1000, y:80, label:"Add to Queue", type:"Redis", icon:"📥", iconBg:"#f59e0b" },
    { x:1000, y:240, label:"Nurture Email", type:"Gmail", icon:"✉️", iconBg:"#ea580c" },
  ], "#8b5cf6");
}

// Screen 3: Voice Call Dashboard
function buildSalesBot3() {
  const calls = [
    { name:"John Smith", company:"TechStart Inc", duration:"2:34", status:"Completed", outcome:"Meeting Booked" },
    { name:"Maria Garcia", company:"CloudFirst", duration:"1:47", status:"Completed", outcome:"Follow-up Scheduled" },
    { name:"David Lee", company:"DataSync", duration:"0:42", status:"No Answer", outcome:"Retry Queued" },
    { name:"Sarah Chen", company:"AI Solutions", duration:"3:12", status:"Completed", outcome:"Meeting Booked" },
    { name:"Tom Wilson", company:"Nexus Corp", duration:"1:55", status:"Completed", outcome:"Not Interested" },
  ];
  const rows = calls.map(c => `<tr><td style="font-weight:500;">${c.name}</td><td style="color:#888;">${c.company}</td><td>${c.duration}</td>
    <td><span style="padding:4px 10px;border-radius:6px;font-size:12px;font-weight:500;${c.status==='Completed'?'background:rgba(34,197,94,0.15);color:#4ade80;':'background:rgba(245,158,11,0.15);color:#fbbf24;'}">${c.status}</span></td>
    <td style="color:${c.outcome==='Meeting Booked'?'#4ade80':c.outcome==='Not Interested'?'#f87171':'#fbbf24'};">${c.outcome}</td></tr>`).join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINK}<style>${CSS_RESET}
    body { background:#1a1a1a; color:#fff; }
    table { width:100%; border-collapse:collapse; }
    th { padding:12px 16px; text-align:left; font-size:13px; color:#888; border-bottom:1px solid #333; }
    td { padding:12px 16px; font-size:14px; border-bottom:1px solid #222; }
  </style></head><body>
    <div style="background:#252525;border-bottom:1px solid #333;padding:16px 32px;display:flex;align-items:center;justify-content:space-between;">
      <div style="display:flex;align-items:center;gap:12px;"><div style="width:36px;height:36px;background:#ff6d5a;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;">n8n</div><div><div style="font-weight:600;">Voice Call Dashboard</div><div style="font-size:12px;color:#888;">ElevenLabs Integration</div></div></div>
      <div style="display:flex;gap:12px;"><span style="padding:6px 14px;background:rgba(34,197,94,0.15);color:#4ade80;border-radius:8px;font-size:13px;font-weight:500;">● Connected</span></div>
    </div>
    <div style="padding:24px 32px;">
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;">
        <div style="background:#252525;border:1px solid #333;border-radius:12px;padding:20px;"><div style="font-size:13px;color:#888;">Calls Today</div><div style="font-size:28px;font-weight:700;color:#4ade80;margin-top:8px;">23</div></div>
        <div style="background:#252525;border:1px solid #333;border-radius:12px;padding:20px;"><div style="font-size:13px;color:#888;">Meetings Booked</div><div style="font-size:28px;font-weight:700;color:#60a5fa;margin-top:8px;">8</div></div>
        <div style="background:#252525;border:1px solid #333;border-radius:12px;padding:20px;"><div style="font-size:13px;color:#888;">Avg. Duration</div><div style="font-size:28px;font-weight:700;color:#fbbf24;margin-top:8px;">2:14</div></div>
        <div style="background:#252525;border:1px solid #333;border-radius:12px;padding:20px;"><div style="font-size:13px;color:#888;">Success Rate</div><div style="font-size:28px;font-weight:700;color:#c084fc;margin-top:8px;">34.8%</div></div>
      </div>
      <div style="background:#252525;border:1px solid #333;border-radius:12px;overflow:hidden;"><table><thead><tr><th>Contact</th><th>Company</th><th>Duration</th><th>Status</th><th>Outcome</th></tr></thead><tbody>${rows}</tbody></table></div>
    </div></body></html>`;
}

// Screen 4: CRM Integration
function buildSalesBot4() {
  const stages = [
    { name:"New Lead", count:12, color:"#94a3b8" },
    { name:"Qualified", count:8, color:"#60a5fa" },
    { name:"Contacted", count:6, color:"#fbbf24" },
    { name:"Meeting Set", count:4, color:"#c084fc" },
    { name:"Proposal", count:2, color:"#4ade80" },
    { name:"Won", count:1, color:"#16a34a" },
  ];
  const pipeline = stages.map(s => `<div style="flex:1;text-align:center;">
    <div style="background:${s.color}20;border:1px solid ${s.color}40;border-radius:12px;padding:16px;margin-bottom:8px;">
      <div style="font-size:24px;font-weight:700;color:${s.color};">${s.count}</div>
    </div>
    <div style="font-size:12px;color:#888;font-weight:500;">${s.name}</div>
  </div>`).join(`<div style="color:#555;font-size:18px;padding-top:16px;">→</div>`);

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINK}<style>${CSS_RESET}
    body { background:#1a1a1a; color:#fff; }
  </style></head><body>
    <div style="background:#252525;border-bottom:1px solid #333;padding:16px 32px;display:flex;align-items:center;justify-content:space-between;">
      <div style="display:flex;align-items:center;gap:12px;"><div style="width:36px;height:36px;background:#3b82f6;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;">📊</div><div><div style="font-weight:600;">CRM Integration</div><div style="font-size:12px;color:#888;">Bitrix24 Deal Pipeline</div></div></div>
      <span style="padding:6px 14px;background:rgba(59,130,246,0.15);color:#60a5fa;border-radius:8px;font-size:13px;">Last synced: 2 min ago</span>
    </div>
    <div style="padding:24px 32px;">
      <h3 style="font-size:16px;font-weight:600;margin-bottom:20px;">Deal Pipeline</h3>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:32px;">${pipeline}</div>
      <div style="background:#252525;border:1px solid #333;border-radius:12px;padding:24px;">
        <h3 style="font-size:15px;font-weight:600;margin-bottom:16px;">Recent Contact: Sarah Chen</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div><span style="font-size:12px;color:#888;">Company</span><div style="margin-top:4px;">TechCorp Solutions</div></div>
          <div><span style="font-size:12px;color:#888;">Deal Value</span><div style="margin-top:4px;color:#4ade80;">$45,000</div></div>
          <div><span style="font-size:12px;color:#888;">Stage</span><div style="margin-top:4px;"><span style="padding:4px 10px;background:rgba(192,132,252,0.15);color:#c084fc;border-radius:6px;font-size:12px;">Meeting Set</span></div></div>
          <div><span style="font-size:12px;color:#888;">Next Action</span><div style="margin-top:4px;">Demo call on Feb 15</div></div>
        </div>
      </div>
    </div></body></html>`;
}

// Screen 5: Calendar Scheduling
function buildSalesBot5() {
  const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];
  const booked = [1, 3, 5]; // indices of booked slots
  const slots = timeSlots.map((t, i) => `<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:${booked.includes(i)?'rgba(34,197,94,0.1)':'#2d2d2d'};border:1px solid ${booked.includes(i)?'rgba(34,197,94,0.3)':'#333'};border-radius:8px;">
    <span style="font-size:14px;font-weight:500;width:80px;">${t}</span>
    ${booked.includes(i) ? `<span style="font-size:13px;color:#4ade80;font-weight:500;">● Booked — Demo Call</span>` : `<span style="font-size:13px;color:#666;">Available</span>`}
  </div>`).join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINK}<style>${CSS_RESET}
    body { background:#1a1a1a; color:#fff; }
  </style></head><body>
    <div style="background:#252525;border-bottom:1px solid #333;padding:16px 32px;display:flex;align-items:center;justify-content:space-between;">
      <div style="display:flex;align-items:center;gap:12px;"><div style="width:36px;height:36px;background:#0ea5e9;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;">📅</div><div><div style="font-weight:600;">Calendar Scheduling</div><div style="font-size:12px;color:#888;">Calendly Integration</div></div></div>
    </div>
    <div style="max-width:800px;margin:0 auto;padding:32px;">
      <div style="background:#252525;border:1px solid #333;border-radius:16px;padding:32px;margin-bottom:24px;">
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid #333;">
          <div style="width:48px;height:48px;background:#dcfce7;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;">✅</div>
          <div><div style="font-size:18px;font-weight:600;">Meeting Confirmed!</div><div style="font-size:14px;color:#888;margin-top:4px;">Sarah Chen has booked a demo call</div></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div><span style="font-size:12px;color:#888;">Date & Time</span><div style="margin-top:4px;font-weight:500;">Feb 15, 2026 — 10:00 AM EST</div></div>
          <div><span style="font-size:12px;color:#888;">Duration</span><div style="margin-top:4px;">30 minutes</div></div>
          <div><span style="font-size:12px;color:#888;">Attendee</span><div style="margin-top:4px;">sarah.chen@techcorp.io</div></div>
          <div><span style="font-size:12px;color:#888;">Meeting Type</span><div style="margin-top:4px;">Product Demo</div></div>
        </div>
      </div>
      <h3 style="font-size:15px;font-weight:600;margin-bottom:12px;">Today's Schedule — Feb 12, 2026</h3>
      <div style="display:flex;flex-direction:column;gap:8px;">${slots}</div>
    </div></body></html>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// RP PARTNER WEBSITE (Tuknang.com) — 5 Screens (HTML recreations)
// ═══════════════════════════════════════════════════════════════════════════

const TK_CSS = `
  body { background:#0a0a0a; color:#fafafa; }
  .tk-nav { padding:20px 48px; display:flex; align-items:center; justify-content:space-between; }
  .tk-btn { background:linear-gradient(135deg,#e5e5e5,#a3a3a3); color:#0a0a0a; border:none; border-radius:10px; padding:10px 24px; font-weight:600; font-size:14px; }
  .tk-btn-outline { background:transparent; color:#fafafa; border:1px solid rgba(255,255,255,0.2); border-radius:10px; padding:10px 24px; font-weight:600; font-size:14px; }
`;

// Screen 1: Hero
function buildTuknang1() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINK}<style>${CSS_RESET}${TK_CSS}</style></head><body>
    <div class="tk-nav"><div style="font-size:20px;font-weight:700;">Tuknang</div><div style="display:flex;gap:32px;font-size:14px;color:#a3a3a3;"><span>Features</span><span>Pricing</span><span>FAQ</span></div><button class="tk-btn">Get Started</button></div>
    <div style="text-align:center;padding:80px 48px;">
      <div style="display:inline-flex;background:rgba(255,255,255,0.1);padding:8px 20px;border-radius:9999px;font-size:13px;color:#a3a3a3;margin-bottom:24px;border:1px solid rgba(255,255,255,0.1);">Property Management Made Simple</div>
      <h1 style="font-size:56px;font-weight:700;line-height:1.1;margin-bottom:20px;background:linear-gradient(135deg,#d4d4d4,#fafafa,#a3a3a3);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Manage Your Rental<br>Properties with Ease</h1>
      <p style="font-size:18px;color:#a3a3a3;max-width:560px;margin:0 auto 40px;line-height:1.6;">The all-in-one platform for Filipino landlords to track tenants, collect rent, and manage properties effortlessly.</p>
      <div style="display:flex;gap:16px;justify-content:center;"><button class="tk-btn" style="padding:14px 32px;font-size:16px;">Start Free Trial</button><button class="tk-btn-outline" style="padding:14px 32px;font-size:16px;">Watch Demo</button></div>
    </div>
    <div style="display:flex;justify-content:center;gap:64px;padding:20px;">
      <div style="text-align:center;"><div style="font-size:32px;font-weight:700;">1,200+</div><div style="font-size:14px;color:#a3a3a3;">Properties Managed</div></div>
      <div style="text-align:center;"><div style="font-size:32px;font-weight:700;">500+</div><div style="font-size:14px;color:#a3a3a3;">Landlords</div></div>
      <div style="text-align:center;"><div style="font-size:32px;font-weight:700;">99.9%</div><div style="font-size:14px;color:#a3a3a3;">Uptime</div></div>
    </div></body></html>`;
}

// Screen 2: Features Showcase
function buildTuknang2() {
  const features = [
    { icon:"🏠", title:"Property Tracking", desc:"Manage multiple properties with detailed tracking for units, tenants, and maintenance." },
    { icon:"💰", title:"Rent Collection", desc:"Automated rent reminders and payment tracking with GCash and bank transfer support." },
    { icon:"👥", title:"Tenant Management", desc:"Complete tenant profiles with lease agreements, payment history, and communication logs." },
    { icon:"🔧", title:"Maintenance Requests", desc:"Streamlined maintenance workflow from request to resolution with status tracking." },
    { icon:"📊", title:"Financial Reports", desc:"Real-time dashboards showing income, expenses, occupancy rates, and ROI per property." },
    { icon:"📱", title:"Mobile Friendly", desc:"Full functionality on any device — manage your properties on the go." },
  ];
  const cards = features.map(f => `<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:28px;">
    <div style="font-size:32px;margin-bottom:16px;">${f.icon}</div><div style="font-size:16px;font-weight:600;margin-bottom:8px;">${f.title}</div><div style="font-size:14px;color:#a3a3a3;line-height:1.5;">${f.desc}</div></div>`).join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINK}<style>${CSS_RESET}${TK_CSS}</style></head><body>
    <div style="padding:60px 48px;text-align:center;">
      <div style="display:inline-flex;background:rgba(255,255,255,0.1);padding:8px 20px;border-radius:9999px;font-size:13px;color:#a3a3a3;margin-bottom:16px;">Features</div>
      <h2 style="font-size:36px;font-weight:700;margin-bottom:12px;">Everything You Need to<br>Manage Properties</h2>
      <p style="font-size:16px;color:#a3a3a3;max-width:500px;margin:0 auto 48px;">Powerful tools designed specifically for Filipino landlords and property managers.</p>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:1000px;margin:0 auto;">${cards}</div>
    </div></body></html>`;
}

// Screen 3: Pricing Section
function buildTuknang3() {
  const plans = [
    { name:"Starter", price:"Free", period:"forever", features:["Up to 3 properties","Basic tenant management","Email support","Monthly reports"], highlight:false },
    { name:"Professional", price:"₱499", period:"/month", features:["Up to 20 properties","Advanced analytics","Priority support","Automated reminders","GCash integration"], highlight:true },
    { name:"Enterprise", price:"₱999", period:"/month", features:["Unlimited properties","Custom branding","Dedicated account manager","API access","Multi-user support"], highlight:false },
  ];
  const planCards = plans.map(p => `<div style="background:${p.highlight?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.03)'};border:${p.highlight?'2px solid rgba(255,255,255,0.3)':'1px solid rgba(255,255,255,0.1)'};border-radius:20px;padding:32px;position:relative;${p.highlight?'transform:scale(1.05);':''}">
    ${p.highlight?'<div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#e5e5e5,#a3a3a3);color:#0a0a0a;padding:4px 16px;border-radius:9999px;font-size:12px;font-weight:700;">MOST POPULAR</div>':''}
    <div style="font-size:14px;font-weight:600;color:#a3a3a3;margin-bottom:8px;">${p.name}</div>
    <div style="font-size:40px;font-weight:700;margin-bottom:4px;">${p.price}<span style="font-size:16px;font-weight:400;color:#a3a3a3;">${p.period}</span></div>
    <div style="margin:24px 0;">
      ${p.features.map(f => `<div style="display:flex;align-items:center;gap:8px;padding:8px 0;font-size:14px;color:#d4d4d4;"><span style="color:#4ade80;">✓</span>${f}</div>`).join("")}
    </div>
    <button class="${p.highlight?'tk-btn':'tk-btn-outline'}" style="width:100%;padding:12px;">Get Started</button>
  </div>`).join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINK}<style>${CSS_RESET}${TK_CSS}</style></head><body>
    <div style="padding:60px 48px;text-align:center;">
      <div style="display:inline-flex;background:rgba(255,255,255,0.1);padding:8px 20px;border-radius:9999px;font-size:13px;color:#a3a3a3;margin-bottom:16px;">Pricing</div>
      <h2 style="font-size:36px;font-weight:700;margin-bottom:12px;">Simple, Transparent Pricing</h2>
      <p style="font-size:16px;color:#a3a3a3;margin-bottom:48px;">Start free. Upgrade when you're ready.</p>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:960px;margin:0 auto;align-items:center;">${planCards}</div>
    </div></body></html>`;
}

// Screen 4: FAQ Section
function buildTuknang4() {
  const faqs = [
    { q:"What is Tuknang?", a:"Tuknang is an all-in-one rental property management platform designed specifically for Filipino landlords and property managers." },
    { q:"How much does it cost?", a:"We offer a free Starter plan for up to 3 properties. Our Professional plan is ₱499/month and Enterprise is ₱999/month." },
    { q:"Can I collect rent through the platform?", a:"Yes! Tuknang integrates with GCash, bank transfers, and other popular Philippine payment methods for seamless rent collection." },
    { q:"Is my data secure?", a:"Absolutely. We use enterprise-grade encryption and comply with Philippine data privacy laws (RA 10173)." },
    { q:"Do you offer a mobile app?", a:"Tuknang is fully responsive and works perfectly on mobile browsers. A dedicated app is coming soon." },
  ];
  const faqEls = faqs.map((f, i) => `<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:20px 24px;${i===0?'background:rgba(255,255,255,0.08);border-color:rgba(255,255,255,0.2);':''}">
    <div style="display:flex;justify-content:space-between;align-items:center;"><span style="font-weight:600;font-size:15px;">${f.q}</span><span style="font-size:18px;color:#a3a3a3;">${i===0?'−':'+'}</span></div>
    ${i===0?`<p style="margin-top:12px;font-size:14px;color:#a3a3a3;line-height:1.6;">${f.a}</p>`:''}
  </div>`).join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINK}<style>${CSS_RESET}${TK_CSS}</style></head><body>
    <div style="padding:60px 48px;max-width:720px;margin:0 auto;">
      <div style="text-align:center;margin-bottom:48px;">
        <div style="display:inline-flex;background:rgba(255,255,255,0.1);padding:8px 20px;border-radius:9999px;font-size:13px;color:#a3a3a3;margin-bottom:16px;">FAQ</div>
        <h2 style="font-size:36px;font-weight:700;margin-bottom:12px;">Frequently Asked Questions</h2>
        <p style="font-size:16px;color:#a3a3a3;">Everything you need to know about Tuknang.</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;">${faqEls}</div>
    </div></body></html>`;
}

// Screen 5: Final CTA
function buildTuknang5() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINK}<style>${CSS_RESET}${TK_CSS}</style></head><body>
    <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;padding:48px;">
      <div style="text-align:center;max-width:640px;">
        <div style="width:80px;height:80px;background:rgba(255,255,255,0.1);border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:40px;margin:0 auto 32px;">🏠</div>
        <h2 style="font-size:44px;font-weight:700;line-height:1.1;margin-bottom:16px;background:linear-gradient(135deg,#d4d4d4,#fafafa,#a3a3a3);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Ready to Simplify Your Property Management?</h2>
        <p style="font-size:18px;color:#a3a3a3;margin-bottom:40px;line-height:1.6;">Join 500+ Filipino landlords who trust Tuknang to manage their rental properties. Start your free trial today.</p>
        <div style="display:flex;gap:16px;justify-content:center;"><button class="tk-btn" style="padding:16px 40px;font-size:16px;">Start Free Trial</button><button class="tk-btn-outline" style="padding:16px 40px;font-size:16px;">Contact Sales</button></div>
        <p style="margin-top:20px;font-size:13px;color:#525252;">No credit card required. Free forever on Starter plan.</p>
      </div>
    </div></body></html>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// n8n TUKNANG AUTO-POSTER — 5 Screens
// ═══════════════════════════════════════════════════════════════════════════

// Screen 1: Daily Poster Workflow
function buildN8nTuknang1() {
  return buildN8nWorkflowHTML("Tuknang Daily Poster", "Cron: 8 AM PHT daily • 9 nodes", [
    { x:40, y:150, label:"Cron Trigger", type:"8:00 AM PHT", icon:"⏰", iconBg:"#6366f1", active:true },
    { x:280, y:80, label:"Get Today's Content", type:"Google Sheets", icon:"📊", iconBg:"#16a34a" },
    { x:280, y:240, label:"Check if Posted", type:"IF Node", icon:"❓", iconBg:"#f59e0b" },
    { x:520, y:150, label:"Generate Caption", type:"Claude AI", icon:"🧠", iconBg:"#8b5cf6", active:true },
    { x:760, y:80, label:"Generate Image", type:"GPT-4 Vision", icon:"🎨", iconBg:"#ec4899" },
    { x:760, y:240, label:"Format Post", type:"Code Node", icon:"⚙️", iconBg:"#94a3b8" },
    { x:1000, y:80, label:"Post to Facebook", type:"Facebook API", icon:"📘", iconBg:"#3b82f6" },
    { x:1000, y:240, label:"Send Alert", type:"Gmail", icon:"✉️", iconBg:"#ea580c" },
  ], "#16a34a");
}

// Screen 2: Content Generator Workflow
function buildN8nTuknang2() {
  return buildN8nWorkflowHTML("Tuknang Content Generator", "Generates 30 days of content • 7 nodes", [
    { x:40, y:150, label:"Manual Trigger", type:"On click", icon:"▶️", iconBg:"#6366f1" },
    { x:280, y:80, label:"Generate Topics", type:"Claude AI", icon:"🧠", iconBg:"#8b5cf6", active:true },
    { x:280, y:240, label:"Pain Points List", type:"30 Taglish topics", icon:"📝", iconBg:"#f59e0b" },
    { x:520, y:150, label:"Loop Items", type:"Split In Batches", icon:"🔄", iconBg:"#94a3b8" },
    { x:760, y:80, label:"Write Caption", type:"Claude AI", icon:"✍️", iconBg:"#8b5cf6" },
    { x:760, y:240, label:"Generate Image", type:"DALL-E 3", icon:"🎨", iconBg:"#ec4899" },
    { x:1000, y:150, label:"Save to Sheet", type:"Google Sheets", icon:"💾", iconBg:"#16a34a" },
  ], "#8b5cf6");
}

// Screen 3: Generated Facebook Post Preview
function buildN8nTuknang3() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINK}<style>${CSS_RESET}
    body { background:#1a1a1a; color:#fff; }
  </style></head><body>
    <div style="background:#252525;border-bottom:1px solid #333;padding:16px 32px;display:flex;align-items:center;gap:12px;">
      <div style="width:36px;height:36px;background:#16a34a;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;">n8n</div>
      <div><div style="font-weight:600;">Generated Post Preview</div><div style="font-size:12px;color:#888;">Feb 12, 2026 — Day 15 of 30</div></div>
    </div>
    <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;color:#1c1917;">
      <div style="padding:16px 20px;display:flex;align-items:center;gap:12px;">
        <div style="width:44px;height:44px;background:#16a34a;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:14px;">TK</div>
        <div><div style="font-weight:600;font-size:15px;">Tuknang</div><div style="font-size:12px;color:#65676B;">February 12, 2026 · 🌐</div></div>
      </div>
      <div style="padding:0 20px 16px;font-size:15px;line-height:1.5;">
        Naku, nakakalimutan mo ba minsan kung sino ang hindi pa nagbabayad ng rent? 😅<br><br>
        With Tuknang, automatic ang reminders sa tenants mo. No more awkward follow-ups! ✅<br><br>
        Try mo na — libre lang i-sign up. Link sa bio! 🏠<br><br>
        #PropertyManagement #FilipinoLandlord #Tuknang #RentalProperty
      </div>
      <div style="width:100%;height:280px;background:linear-gradient(135deg,#16a34a,#065f46);display:flex;align-items:center;justify-content:center;">
        <div style="text-align:center;color:white;"><div style="font-size:48px;margin-bottom:12px;">🏠</div><div style="font-size:22px;font-weight:700;">Tuknang</div><div style="font-size:14px;opacity:0.8;">Never forget rent collection again</div></div>
      </div>
      <div style="padding:12px 20px;display:flex;justify-content:space-around;border-top:1px solid #e4e6eb;font-size:14px;font-weight:600;color:#65676B;">
        <span>👍 Like</span><span>💬 Comment</span><span>↗️ Share</span>
      </div>
    </div></body></html>`;
}

// Screen 4: Email Alert
function buildN8nTuknang4() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINK}<style>${CSS_RESET}
    body { background:#1a1a1a; color:#fff; }
  </style></head><body>
    <div style="background:#252525;border-bottom:1px solid #333;padding:16px 32px;display:flex;align-items:center;gap:12px;">
      <div style="width:36px;height:36px;background:#ea580c;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;">✉️</div>
      <div><div style="font-weight:600;">Email Alert Preview</div><div style="font-size:12px;color:#888;">Completion notification</div></div>
    </div>
    <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;color:#1c1917;box-shadow:0 4px 24px rgba(0,0,0,0.3);">
      <div style="background:linear-gradient(135deg,#16a34a,#065f46);padding:32px;text-align:center;color:white;">
        <div style="font-size:40px;margin-bottom:12px;">✅</div>
        <div style="font-size:22px;font-weight:700;">Daily Post Published!</div>
        <div style="font-size:14px;opacity:0.8;margin-top:4px;">Tuknang Auto-Poster</div>
      </div>
      <div style="padding:32px;">
        <div style="font-size:14px;color:#374151;line-height:1.8;">
          <p style="margin-bottom:16px;">Hi Ian,</p>
          <p style="margin-bottom:16px;">Your daily Facebook post for <strong>Tuknang</strong> has been published successfully.</p>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="color:#6b7280;">Date</span><strong>Feb 12, 2026</strong></div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="color:#6b7280;">Day #</span><strong>15 of 30</strong></div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="color:#6b7280;">Theme</span><strong>Pain Point — Rent Collection</strong></div>
            <div style="display:flex;justify-content:space-between;"><span style="color:#6b7280;">Status</span><strong style="color:#16a34a;">Published ✓</strong></div>
          </div>
          <p style="color:#6b7280;font-size:13px;">This is an automated message from your n8n workflow.</p>
        </div>
      </div>
    </div></body></html>`;
}

// Screen 5: Content Calendar
function buildN8nTuknang5() {
  const days = Array.from({length:30}, (_, i) => {
    const types = ["Pain Point", "Feature", "Testimonial", "Pain Point", "Feature"];
    const colors = { "Pain Point":"#f59e0b", "Feature":"#3b82f6", "Testimonial":"#8b5cf6" };
    const type = types[i % types.length];
    const posted = i < 15;
    return { day: i+1, type, color: colors[type], posted };
  });
  const grid = days.map(d => `<div style="background:${d.posted?'rgba(34,197,94,0.1)':'#2d2d2d'};border:1px solid ${d.posted?'rgba(34,197,94,0.2)':'#333'};border-radius:8px;padding:8px;text-align:center;position:relative;">
    <div style="font-size:16px;font-weight:600;${d.posted?'color:#4ade80;':'color:#fff;'}">${d.day}</div>
    <div style="font-size:9px;color:${d.color};font-weight:500;margin-top:4px;">${d.type}</div>
    ${d.posted?'<div style="position:absolute;top:4px;right:4px;font-size:8px;">✅</div>':''}
  </div>`).join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINK}<style>${CSS_RESET}
    body { background:#1a1a1a; color:#fff; }
  </style></head><body>
    <div style="background:#252525;border-bottom:1px solid #333;padding:16px 32px;display:flex;align-items:center;justify-content:space-between;">
      <div style="display:flex;align-items:center;gap:12px;"><div style="width:36px;height:36px;background:#16a34a;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;">n8n</div><div><div style="font-weight:600;">Content Calendar</div><div style="font-size:12px;color:#888;">February 2026 — 30-Day Campaign</div></div></div>
      <div style="display:flex;gap:12px;">
        <span style="padding:6px 14px;background:rgba(245,158,11,0.15);color:#fbbf24;border-radius:8px;font-size:12px;">● Pain Point</span>
        <span style="padding:6px 14px;background:rgba(59,130,246,0.15);color:#60a5fa;border-radius:8px;font-size:12px;">● Feature</span>
        <span style="padding:6px 14px;background:rgba(139,92,246,0.15);color:#c084fc;border-radius:8px;font-size:12px;">● Testimonial</span>
      </div>
    </div>
    <div style="padding:24px 32px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
        <h2 style="font-size:20px;font-weight:600;">February 2026</h2>
        <div style="display:flex;gap:16px;"><span style="color:#4ade80;font-weight:600;">15 posted</span><span style="color:#888;">15 remaining</span></div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:8px;margin-bottom:12px;">
        ${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => `<div style="text-align:center;font-size:12px;color:#888;font-weight:600;padding:8px;">${d}</div>`).join("")}
      </div>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:8px;">
        ${grid}
      </div>
    </div></body></html>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// CLOSEPILOT CRM — 7 Screens
// ═══════════════════════════════════════════════════════════════════════════

const CLOSEPILOT_CSS = `
  body { background:#f8fafc; color:#1e293b; }
  .cp-layout { display:flex; min-height:100vh; }
  .cp-sidebar { width:240px; background:#0f172a; color:#fff; display:flex; flex-direction:column; flex-shrink:0; }
  .cp-sidebar-logo { padding:20px 20px 24px; display:flex; align-items:center; gap:10px; }
  .cp-logo-icon { width:36px; height:36px; background:linear-gradient(135deg,#0ea5e9,#06b6d4); border-radius:10px; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:13px; color:#fff; }
  .cp-sidebar-nav { flex:1; padding:0 12px; }
  .cp-nav-item { display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:8px; font-size:14px; font-weight:500; color:#94a3b8; margin-bottom:2px; }
  .cp-nav-item.active { background:rgba(14,165,233,0.15); color:#38bdf8; }
  .cp-nav-item:hover:not(.active) { background:rgba(255,255,255,0.05); }
  .cp-nav-icon { width:20px; text-align:center; font-size:16px; }
  .cp-sidebar-user { padding:16px 20px; border-top:1px solid rgba(255,255,255,0.1); display:flex; align-items:center; gap:10px; }
  .cp-avatar-sm { width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg,#0ea5e9,#06b6d4); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:#fff; }
  .cp-main { flex:1; display:flex; flex-direction:column; overflow:hidden; }
  .cp-header { background:#fff; border-bottom:1px solid #e2e8f0; padding:0 32px; height:60px; display:flex; align-items:center; justify-content:space-between; }
  .cp-breadcrumb { font-size:14px; color:#64748b; }
  .cp-breadcrumb b { color:#1e293b; font-weight:600; }
  .cp-content { flex:1; padding:24px 32px; overflow-y:auto; }
  .cp-card { background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:20px; }
  .cp-stat-card { background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:20px; }
  .cp-stat-value { font-size:28px; font-weight:700; color:#0f172a; margin-top:6px; }
  .cp-stat-label { font-size:13px; color:#64748b; font-weight:500; }
  .cp-stat-change { font-size:12px; font-weight:600; margin-top:4px; }
  .cp-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:9999px; font-size:12px; font-weight:600; }
  .cp-badge-teal { background:#ecfdf5; color:#059669; }
  .cp-badge-blue { background:#eff6ff; color:#2563eb; }
  .cp-badge-amber { background:#fffbeb; color:#d97706; }
  .cp-badge-red { background:#fef2f2; color:#dc2626; }
  .cp-badge-purple { background:#faf5ff; color:#7c3aed; }
  .cp-badge-gray { background:#f1f5f9; color:#475569; }
  .cp-badge-cyan { background:#ecfeff; color:#0891b2; }
  .cp-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:8px; font-size:13px; font-weight:600; border:none; cursor:pointer; }
  .cp-btn-primary { background:#0ea5e9; color:#fff; }
  .cp-btn-outline { background:transparent; border:1px solid #e2e8f0; color:#475569; }
  .cp-table { width:100%; border-collapse:collapse; }
  .cp-table th { text-align:left; padding:10px 14px; font-size:12px; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; border-bottom:1px solid #e2e8f0; }
  .cp-table td { padding:10px 14px; font-size:14px; border-bottom:1px solid #f1f5f9; }
  .cp-score-a { background:linear-gradient(135deg,#059669,#10b981); color:#fff; width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:16px; }
  .cp-section-title { font-size:16px; font-weight:700; color:#0f172a; margin-bottom:16px; }
`;

function closePilotSidebar(activeIndex) {
  const navItems = [
    { icon:"📊", label:"Dashboard" },
    { icon:"👥", label:"Contacts" },
    { icon:"🔀", label:"Pipeline" },
    { icon:"🏠", label:"Listings" },
    { icon:"📧", label:"Campaigns" },
    { icon:"📋", label:"Transactions" },
    { icon:"📈", label:"Reports" },
  ];
  const items = navItems.map((n, i) => `<div class="cp-nav-item ${i === activeIndex ? 'active' : ''}"><span class="cp-nav-icon">${n.icon}</span>${n.label}</div>`).join("");
  return `<aside class="cp-sidebar">
    <div class="cp-sidebar-logo"><div class="cp-logo-icon">CP</div><span style="font-weight:700;font-size:17px;">ClosePilot</span></div>
    <nav class="cp-sidebar-nav">${items}</nav>
    <div class="cp-sidebar-user"><div class="cp-avatar-sm">SM</div><div><div style="font-size:13px;font-weight:600;">Sarah Martinez</div><div style="font-size:11px;color:#64748b;">Keller Williams</div></div></div>
  </aside>`;
}

function closePilotWrap(activeNavIndex, headerBreadcrumb, content) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${FONT_LINK}<style>${CSS_RESET}${CLOSEPILOT_CSS}</style></head><body>
    <div class="cp-layout">${closePilotSidebar(activeNavIndex)}
    <div class="cp-main">
      <div class="cp-header"><div class="cp-breadcrumb">${headerBreadcrumb}</div>
        <div style="display:flex;align-items:center;gap:16px;">
          <div style="position:relative;"><span style="font-size:18px;">🔔</span><span style="position:absolute;top:-4px;right:-6px;background:#ef4444;color:#fff;font-size:9px;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;">3</span></div>
          <div class="cp-avatar-sm" style="width:28px;height:28px;font-size:10px;">SM</div>
        </div>
      </div>
      <div class="cp-content">${content}</div>
    </div></div></body></html>`;
}

// Screen 1: Agent Dashboard
function buildClosePilot1() {
  return closePilotWrap(0, '<b>Dashboard</b>', `
    <!-- KPI Cards -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;">
      <div class="cp-stat-card"><div class="cp-stat-label">GCI (Year-to-Date)</div><div class="cp-stat-value" style="color:#059669;">$347,200</div><div class="cp-stat-change" style="color:#059669;">↑ 18% vs last year</div></div>
      <div class="cp-stat-card"><div class="cp-stat-label">Active Deals</div><div class="cp-stat-value">14</div><div class="cp-stat-change" style="color:#0ea5e9;">$8.2M pipeline</div></div>
      <div class="cp-stat-card"><div class="cp-stat-label">Closings This Month</div><div class="cp-stat-value">3</div><div class="cp-stat-change" style="color:#059669;">$1.24M volume</div></div>
      <div class="cp-stat-card"><div class="cp-stat-label">Speed-to-Lead</div><div class="cp-stat-value">3m 48s</div><div class="cp-stat-change" style="color:#059669;">↓ 22% faster</div></div>
    </div>
    <!-- Middle Row: Lead Sources + Pipeline -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
      <div class="cp-card">
        <div class="cp-section-title">Lead Sources</div>
        <div style="display:flex;align-items:center;gap:24px;">
          <!-- Donut chart mock -->
          <div style="position:relative;width:140px;height:140px;flex-shrink:0;">
            <svg viewBox="0 0 36 36" style="width:140px;height:140px;transform:rotate(-90deg);">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" stroke-width="4"/>
              <circle cx="18" cy="18" r="14" fill="none" stroke="#0ea5e9" stroke-width="4" stroke-dasharray="34 66" stroke-dashoffset="0"/>
              <circle cx="18" cy="18" r="14" fill="none" stroke="#8b5cf6" stroke-width="4" stroke-dasharray="22 78" stroke-dashoffset="-34"/>
              <circle cx="18" cy="18" r="14" fill="none" stroke="#f59e0b" stroke-width="4" stroke-dasharray="18 82" stroke-dashoffset="-56"/>
              <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" stroke-width="4" stroke-dasharray="15 85" stroke-dashoffset="-74"/>
              <circle cx="18" cy="18" r="14" fill="none" stroke="#f43f5e" stroke-width="4" stroke-dasharray="11 89" stroke-dashoffset="-89"/>
            </svg>
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;">142</div>
          </div>
          <div style="flex:1;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><span style="width:10px;height:10px;border-radius:50%;background:#0ea5e9;"></span><span style="font-size:13px;flex:1;">Zillow</span><span style="font-size:13px;font-weight:600;">34%</span></div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><span style="width:10px;height:10px;border-radius:50%;background:#8b5cf6;"></span><span style="font-size:13px;flex:1;">Realtor.com</span><span style="font-size:13px;font-weight:600;">22%</span></div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><span style="width:10px;height:10px;border-radius:50%;background:#f59e0b;"></span><span style="font-size:13px;flex:1;">Website IDX</span><span style="font-size:13px;font-weight:600;">18%</span></div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><span style="width:10px;height:10px;border-radius:50%;background:#10b981;"></span><span style="font-size:13px;flex:1;">Referral</span><span style="font-size:13px;font-weight:600;">15%</span></div>
            <div style="display:flex;align-items:center;gap:8px;"><span style="width:10px;height:10px;border-radius:50%;background:#f43f5e;"></span><span style="font-size:13px;flex:1;">Social</span><span style="font-size:13px;font-weight:600;">11%</span></div>
          </div>
        </div>
      </div>
      <div class="cp-card">
        <div class="cp-section-title">Pipeline Overview</div>
        <div style="display:flex;height:28px;border-radius:8px;overflow:hidden;margin-bottom:16px;">
          <div style="width:22%;background:#94a3b8;" title="New Lead (4)"></div>
          <div style="width:16%;background:#0ea5e9;" title="Contacted (3)"></div>
          <div style="width:11%;background:#8b5cf6;" title="Qualified (2)"></div>
          <div style="width:17%;background:#f59e0b;" title="Showing (3)"></div>
          <div style="width:6%;background:#f97316;" title="Offer (1)"></div>
          <div style="width:11%;background:#06b6d4;" title="Under Contract (2)"></div>
          <div style="width:6%;background:#10b981;" title="Clear to Close (1)"></div>
          <div style="width:11%;background:#059669;" title="Closed (2)"></div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          <span style="font-size:11px;display:flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:2px;background:#94a3b8;"></span>New (4)</span>
          <span style="font-size:11px;display:flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:2px;background:#0ea5e9;"></span>Contacted (3)</span>
          <span style="font-size:11px;display:flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:2px;background:#8b5cf6;"></span>Qualified (2)</span>
          <span style="font-size:11px;display:flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:2px;background:#f59e0b;"></span>Showing (3)</span>
          <span style="font-size:11px;display:flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:2px;background:#f97316;"></span>Offer (1)</span>
          <span style="font-size:11px;display:flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:2px;background:#06b6d4;"></span>Contract (2)</span>
          <span style="font-size:11px;display:flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:2px;background:#10b981;"></span>Closed (2)</span>
        </div>
      </div>
    </div>
    <!-- Bottom Row: Tasks + Activity -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      <div class="cp-card">
        <div class="cp-section-title">Today's Tasks</div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <div style="display:flex;align-items:center;gap:12px;padding:10px 12px;background:#f8fafc;border-radius:8px;"><span style="width:20px;height:20px;border:2px solid #e2e8f0;border-radius:4px;"></span><div><div style="font-size:13px;font-weight:600;">Call back Sarah Chen</div><div style="font-size:12px;color:#64748b;">Re: 4812 Elm Creek Dr showing feedback</div></div><span class="cp-badge cp-badge-red" style="margin-left:auto;">Overdue</span></div>
          <div style="display:flex;align-items:center;gap:12px;padding:10px 12px;background:#f8fafc;border-radius:8px;"><span style="width:20px;height:20px;border:2px solid #e2e8f0;border-radius:4px;"></span><div><div style="font-size:13px;font-weight:600;">Showing at 4812 Elm Creek Dr</div><div style="font-size:12px;color:#64748b;">2:30 PM — Sarah Chen (Buyer)</div></div><span class="cp-badge cp-badge-amber" style="margin-left:auto;">2:30 PM</span></div>
          <div style="display:flex;align-items:center;gap:12px;padding:10px 12px;background:#f8fafc;border-radius:8px;"><span style="width:20px;height:20px;border:2px solid #e2e8f0;border-radius:4px;"></span><div><div style="font-size:13px;font-weight:600;">Send CMA to David Lee</div><div style="font-size:12px;color:#64748b;">Seller listing appointment prep</div></div><span class="cp-badge cp-badge-blue" style="margin-left:auto;">4:00 PM</span></div>
          <div style="display:flex;align-items:center;gap:12px;padding:10px 12px;background:#f8fafc;border-radius:8px;"><span style="width:20px;height:20px;border:2px solid #e2e8f0;border-radius:4px;"></span><div><div style="font-size:13px;font-weight:600;">Follow up — Marcus Williams</div><div style="font-size:12px;color:#64748b;">Offer review on 2301 Oak Hollow Ln</div></div><span class="cp-badge cp-badge-gray" style="margin-left:auto;">5:00 PM</span></div>
        </div>
      </div>
      <div class="cp-card">
        <div class="cp-section-title">Recent Activity</div>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div style="display:flex;gap:12px;"><div style="width:8px;height:8px;border-radius:50%;background:#0ea5e9;margin-top:6px;flex-shrink:0;"></div><div><div style="font-size:13px;"><b>New lead from Zillow:</b> John Park — $500K–$750K, South Austin</div><div style="font-size:11px;color:#64748b;">2 min ago</div></div></div>
          <div style="display:flex;gap:12px;"><div style="width:8px;height:8px;border-radius:50%;background:#10b981;margin-top:6px;flex-shrink:0;"></div><div><div style="font-size:13px;"><b>Deal closed:</b> 7201 Canyon Ridge — $425,000</div><div style="font-size:11px;color:#64748b;">1 hour ago</div></div></div>
          <div style="display:flex;gap:12px;"><div style="width:8px;height:8px;border-radius:50%;background:#f59e0b;margin-top:6px;flex-shrink:0;"></div><div><div style="font-size:13px;"><b>Appraisal ordered:</b> 4812 Elm Creek Dr — $549,000</div><div style="font-size:11px;color:#64748b;">3 hours ago</div></div></div>
          <div style="display:flex;gap:12px;"><div style="width:8px;height:8px;border-radius:50%;background:#8b5cf6;margin-top:6px;flex-shrink:0;"></div><div><div style="font-size:13px;"><b>Realtor.com lead:</b> Amy Nguyen — $300K–$400K, North Dallas</div><div style="font-size:11px;color:#64748b;">5 hours ago</div></div></div>
          <div style="display:flex;gap:12px;"><div style="width:8px;height:8px;border-radius:50%;background:#06b6d4;margin-top:6px;flex-shrink:0;"></div><div><div style="font-size:13px;"><b>Showing confirmed:</b> Marcus Williams — 2301 Oak Hollow Ln</div><div style="font-size:11px;color:#64748b;">Yesterday</div></div></div>
        </div>
      </div>
    </div>
  `);
}

// Screen 2: Contact Detail / Lead Profile
function buildClosePilot2() {
  return closePilotWrap(1, 'Contacts / <b>Sarah Chen</b>', `
    <!-- Header -->
    <div style="display:flex;align-items:flex-start;gap:20px;margin-bottom:24px;">
      <div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#0ea5e9,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;color:#fff;flex-shrink:0;">SC</div>
      <div style="flex:1;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px;">
          <h1 style="font-size:24px;font-weight:700;">Sarah Chen</h1>
          <div class="cp-score-a">A</div>
          <span style="font-size:13px;color:#64748b;font-weight:500;">92/100</span>
          <span class="cp-badge cp-badge-blue" style="margin-left:8px;">🏠 Zillow Premier Agent</span>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <span class="cp-badge cp-badge-cyan">Buyer</span>
          <span class="cp-badge cp-badge-teal">Pre-Approved</span>
          <span class="cp-badge cp-badge-purple">$500K–$750K</span>
          <span class="cp-badge cp-badge-amber">South Austin</span>
          <span class="cp-badge cp-badge-gray">Relocating</span>
        </div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="cp-btn cp-btn-primary">📞 Call</button>
        <button class="cp-btn cp-btn-outline">✉️ Email</button>
        <button class="cp-btn cp-btn-outline">💬 SMS</button>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
      <!-- Left Column -->
      <div>
        <!-- Key Info -->
        <div class="cp-card" style="margin-bottom:20px;">
          <div class="cp-section-title">Key Information</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div><div style="font-size:12px;color:#64748b;margin-bottom:4px;">Budget Range</div><div style="font-size:14px;font-weight:600;">$500,000 – $750,000</div></div>
            <div><div style="font-size:12px;color:#64748b;margin-bottom:4px;">Pre-Approval</div><div style="font-size:14px;font-weight:600;">Chase — $625,000</div></div>
            <div><div style="font-size:12px;color:#64748b;margin-bottom:4px;">Move-in Timeline</div><div style="font-size:14px;font-weight:600;">60 days</div></div>
            <div><div style="font-size:12px;color:#64748b;margin-bottom:4px;">Preferred Areas</div><div style="font-size:14px;font-weight:600;">South Austin, Buda, Kyle</div></div>
            <div><div style="font-size:12px;color:#64748b;margin-bottom:4px;">Bed / Bath</div><div style="font-size:14px;font-weight:600;">4 bed / 3 bath min</div></div>
            <div><div style="font-size:12px;color:#64748b;margin-bottom:4px;">Phone</div><div style="font-size:14px;font-weight:600;">+1 (512) 555-0184</div></div>
          </div>
        </div>
        <!-- Property Interests -->
        <div class="cp-card">
          <div class="cp-section-title">Property Interests</div>
          <div style="display:flex;flex-direction:column;gap:12px;">
            ${[
              { addr:"4812 Elm Creek Dr, Austin TX", price:"$549,000", beds:"4bd/3ba", sqft:"2,840 sqft", views:3 },
              { addr:"2301 Oak Hollow Ln, Austin TX", price:"$625,000", beds:"4bd/3.5ba", sqft:"3,100 sqft", views:2 },
              { addr:"1509 Ridgeline Blvd, Buda TX", price:"$489,000", beds:"4bd/3ba", sqft:"2,650 sqft", views:1 },
            ].map(p => `<div style="display:flex;gap:12px;padding:12px;background:#f8fafc;border-radius:8px;">
              <div style="width:80px;height:60px;background:linear-gradient(135deg,#e2e8f0,#cbd5e1);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:24px;">🏠</div>
              <div style="flex:1;"><div style="font-size:13px;font-weight:600;">${p.addr}</div><div style="font-size:15px;font-weight:700;color:#0ea5e9;margin-top:2px;">${p.price}</div><div style="font-size:12px;color:#64748b;">${p.beds} · ${p.sqft}</div></div>
              <div style="text-align:right;"><div style="font-size:12px;color:#64748b;">${p.views}x viewed</div><div style="font-size:18px;margin-top:4px;">♡</div></div>
            </div>`).join("")}
          </div>
        </div>
      </div>
      <!-- Right Column -->
      <div>
        <!-- Action Plan -->
        <div class="cp-card" style="margin-bottom:20px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <div class="cp-section-title" style="margin-bottom:0;">Action Plan</div>
            <span class="cp-badge cp-badge-teal">Day 8 of 21</span>
          </div>
          <div style="font-size:14px;font-weight:600;margin-bottom:8px;">New Buyer Drip</div>
          <div style="height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;margin-bottom:4px;"><div style="height:100%;width:38%;background:linear-gradient(90deg,#0ea5e9,#06b6d4);border-radius:4px;"></div></div>
          <div style="font-size:12px;color:#64748b;">38% complete — next step: Email "New listings match"</div>
        </div>
        <!-- Activity Timeline -->
        <div class="cp-card">
          <div class="cp-section-title">Activity Timeline</div>
          <div style="display:flex;flex-direction:column;gap:0;">
            ${[
              { icon:"👁️", text:'Viewed 4812 Elm Creek Dr (3x)', time:"Today, 10:15 AM", color:"#0ea5e9" },
              { icon:"📧", text:'Opened "New Listings" email', time:"Today, 9:30 AM", color:"#8b5cf6" },
              { icon:"📞", text:"Call — 4 min 22s — discussed budget", time:"Yesterday, 3:45 PM", color:"#10b981" },
              { icon:"💾", text:"Saved 2301 Oak Hollow Ln", time:"Yesterday, 11:20 AM", color:"#f59e0b" },
              { icon:"📱", text:'SMS: "Thanks for the listings!"', time:"Feb 8, 2:10 PM", color:"#f43f5e" },
              { icon:"🏠", text:"Showing — 1509 Ridgeline Blvd", time:"Feb 7, 1:00 PM", color:"#06b6d4" },
              { icon:"📧", text:'Opened "Welcome" email', time:"Feb 5, 9:00 AM", color:"#8b5cf6" },
            ].map((a, i) => `<div style="display:flex;gap:12px;padding:8px 0;${i < 6 ? 'border-left:2px solid #e2e8f0;margin-left:9px;padding-left:20px;' : 'margin-left:9px;padding-left:20px;'}position:relative;">
              <div style="position:absolute;left:-7px;top:10px;width:12px;height:12px;border-radius:50%;background:${a.color};border:2px solid #fff;"></div>
              <div style="flex:1;"><div style="font-size:13px;">${a.icon} ${a.text}</div><div style="font-size:11px;color:#64748b;">${a.time}</div></div>
            </div>`).join("")}
          </div>
        </div>
      </div>
    </div>
  `);
}

// Screen 3: Pipeline / Deals Kanban
function buildClosePilot3() {
  const columns = [
    { title:"New Lead", count:4, color:"#94a3b8", cards:[
      { name:"John Park", addr:"TBD — South Austin", price:"$500K–$750K", type:"Buyer", days:0, gci:"—" },
      { name:"Amy Nguyen", addr:"TBD — North Dallas", price:"$300K–$400K", type:"Buyer", days:1, gci:"—" },
    ]},
    { title:"Contacted", count:3, color:"#0ea5e9", cards:[
      { name:"Lisa Huang", addr:"TBD — Scottsdale", price:"$600K–$800K", type:"Buyer", days:3, gci:"—" },
    ]},
    { title:"Qualified", count:2, color:"#8b5cf6", cards:[
      { name:"Robert Kim", addr:"1842 Sunset Ter", price:"$475,000", type:"Seller", days:5, gci:"$14,250" },
    ]},
    { title:"Showing", count:3, color:"#f59e0b", cards:[
      { name:"Sarah Chen", addr:"4812 Elm Creek Dr", price:"$549,000", type:"Buyer", days:3, gci:"$16,470" },
    ]},
    { title:"Offer", count:1, color:"#f97316", cards:[
      { name:"Marcus Williams", addr:"2301 Oak Hollow Ln", price:"$825,000", type:"Buyer", days:12, gci:"$24,750" },
    ]},
    { title:"Under Contract", count:2, color:"#06b6d4", cards:[
      { name:"Chen Family", addr:"903 Birch Park Ave", price:"$389,000", type:"Buyer", days:18, gci:"$11,670" },
    ]},
    { title:"Clear to Close", count:1, color:"#10b981", cards:[
      { name:"The Johnsons", addr:"5547 Maple Ridge", price:"$715,000", type:"Seller", days:42, gci:"$21,450" },
    ]},
    { title:"Closed", count:2, color:"#059669", cards:[
      { name:"David Torres", addr:"7201 Canyon Ridge", price:"$425,000", type:"Buyer", days:67, gci:"$12,750" },
    ]},
  ];

  const cols = columns.map(col => `
    <div style="min-width:190px;flex:1;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;padding:0 4px;">
        <span style="width:10px;height:10px;border-radius:50%;background:${col.color};"></span>
        <span style="font-size:13px;font-weight:700;">${col.title}</span>
        <span style="font-size:12px;color:#64748b;background:#f1f5f9;border-radius:9999px;padding:1px 8px;">${col.count}</span>
      </div>
      ${col.cards.map(c => `
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:12px;margin-bottom:8px;border-left:3px solid ${col.color};">
          <div style="font-size:13px;font-weight:600;margin-bottom:4px;">${c.name}</div>
          <div style="font-size:12px;color:#64748b;margin-bottom:6px;">${c.addr}</div>
          <div style="font-size:14px;font-weight:700;color:#0f172a;margin-bottom:6px;">${c.price}</div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span class="cp-badge ${c.type === 'Buyer' ? 'cp-badge-blue' : 'cp-badge-purple'}" style="font-size:11px;">${c.type === 'Buyer' ? '🔑' : '🏷️'} ${c.type}</span>
            <span style="font-size:11px;color:#64748b;">${c.days}d</span>
          </div>
          ${c.gci !== '—' ? `<div style="font-size:12px;color:#059669;font-weight:600;margin-top:6px;">GCI: ${c.gci}</div>` : ''}
        </div>
      `).join("")}
    </div>
  `).join("");

  return closePilotWrap(2, '<b>Pipeline</b>', `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
      <div style="display:flex;gap:16px;">
        <div style="font-size:14px;"><span style="color:#64748b;">Pipeline Value:</span> <b>$8.2M</b></div>
        <div style="font-size:14px;"><span style="color:#64748b;">Active Deals:</span> <b>14</b></div>
        <div style="font-size:14px;"><span style="color:#64748b;">Closing This Month:</span> <b style="color:#059669;">3</b></div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="cp-btn cp-btn-primary">+ Add Deal</button>
        <button class="cp-btn cp-btn-outline">Filter</button>
      </div>
    </div>
    <div style="display:flex;gap:12px;overflow-x:auto;padding-bottom:12px;">${cols}</div>
  `);
}

// Screen 4: Active Listings Dashboard
function buildClosePilot4() {
  const listings = [
    { addr:"4812 Elm Creek Dr, Austin TX 78745", price:"$549,000", mls:"25-003284", beds:4, baths:3, sqft:"2,840", status:"Active", statusColor:"#059669", dom:12, showings:8, inquiries:14, openHouse:"Feb 15, 1-3 PM" },
    { addr:"1842 Sunset Terrace, Scottsdale AZ 85260", price:"$475,000", mls:"25-004891", beds:3, baths:2, sqft:"2,100", status:"Active", statusColor:"#059669", dom:28, showings:15, inquiries:22, openHouse:"Feb 16, 11-1 PM" },
    { addr:"903 Birch Park Ave, Denver CO 80220", price:"$389,000", mls:"25-002156", beds:3, baths:2.5, sqft:"1,950", status:"Under Contract", statusColor:"#d97706", dom:35, showings:21, inquiries:18, openHouse:"—" },
    { addr:"5547 Maple Ridge Dr, Nashville TN 37211", price:"$715,000", mls:"25-001873", beds:5, baths:4, sqft:"3,600", status:"Coming Soon", statusColor:"#2563eb", dom:0, showings:0, inquiries:5, openHouse:"Feb 22, 2-4 PM" },
    { addr:"2210 Harbor View Ct, San Diego CA 92109", price:"$1,250,000", mls:"25-005102", beds:4, baths:3.5, sqft:"3,200", status:"Active", statusColor:"#059669", dom:7, showings:4, inquiries:9, openHouse:"Feb 15, 10-12 PM" },
    { addr:"8844 Willow Creek Rd, Raleigh NC 27615", price:"$425,000", mls:"25-003947", beds:4, baths:3, sqft:"2,450", status:"Active", statusColor:"#059669", dom:19, showings:11, inquiries:16, openHouse:"—" },
  ];

  const cards = listings.map(l => `
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <div style="height:140px;background:linear-gradient(135deg,#e2e8f0 0%,#cbd5e1 50%,#94a3b8 100%);display:flex;align-items:center;justify-content:center;position:relative;">
        <span style="font-size:48px;opacity:0.4;">🏡</span>
        <span style="position:absolute;top:10px;right:10px;background:${l.statusColor};color:#fff;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:700;">${l.status}</span>
      </div>
      <div style="padding:14px;">
        <div style="font-size:14px;font-weight:700;margin-bottom:4px;">${l.addr}</div>
        <div style="font-size:20px;font-weight:800;color:#0ea5e9;margin-bottom:4px;">${l.price}</div>
        <div style="font-size:12px;color:#64748b;margin-bottom:8px;">MLS# ${l.mls}</div>
        <div style="font-size:13px;color:#475569;margin-bottom:10px;">${l.beds} bd / ${l.baths} ba · ${l.sqft} sqft</div>
        <div style="display:flex;gap:12px;font-size:12px;color:#64748b;border-top:1px solid #f1f5f9;padding-top:10px;">
          <span>${l.dom} DOM</span>
          <span>${l.showings} showings</span>
          <span>${l.inquiries} inquiries</span>
        </div>
        ${l.openHouse !== '—' ? `<div style="margin-top:8px;font-size:12px;color:#0ea5e9;font-weight:600;">🗓️ Open House: ${l.openHouse}</div>` : ''}
      </div>
    </div>
  `).join("");

  return closePilotWrap(3, '<b>Listings</b>', `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
      <div style="display:flex;gap:8px;">
        <button class="cp-btn cp-btn-primary" style="background:#0f172a;">Active (6)</button>
        <button class="cp-btn cp-btn-outline">Pending (2)</button>
        <button class="cp-btn cp-btn-outline">Sold (12)</button>
        <button class="cp-btn cp-btn-outline">Expired (1)</button>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="cp-btn cp-btn-outline">🗺️ Map View</button>
        <button class="cp-btn cp-btn-primary">+ Add Listing</button>
      </div>
    </div>
    <div style="display:flex;gap:20px;margin-bottom:20px;">
      <div style="font-size:14px;"><span style="color:#64748b;">Avg DOM:</span> <b>28 days</b></div>
      <div style="font-size:14px;"><span style="color:#64748b;">List-to-Sale:</span> <b>97.2%</b></div>
      <div style="font-size:14px;"><span style="color:#64748b;">Total Volume:</span> <b>$4.8M</b></div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">${cards}</div>
  `);
}

// Screen 5: Communication / Drip Campaigns
function buildClosePilot5() {
  const campaigns = [
    { name:"New Buyer Welcome (21-day)", status:"Active", contacts:342, color:"#059669" },
    { name:"Zillow Lead Speed-to-Lead", status:"Active", contacts:89, color:"#059669" },
    { name:"Seller Nurture — Home Values", status:"Active", contacts:156, color:"#059669" },
    { name:"Past Client Anniversary", status:"Paused", contacts:210, color:"#d97706" },
  ];

  const steps = [
    { day:1, type:"Email", label:"Welcome to ClosePilot", icon:"📧", color:"#0ea5e9" },
    { day:2, type:"SMS", label:"Quick intro text", icon:"💬", color:"#10b981" },
    { day:3, type:"Task", label:"Call — personal intro", icon:"📞", color:"#f59e0b" },
    { day:5, type:"Email", label:"New listings match", icon:"📧", color:"#0ea5e9" },
    { day:8, type:"SMS", label:"Still looking?", icon:"💬", color:"#10b981" },
    { day:14, type:"Email", label:"Market update", icon:"📧", color:"#0ea5e9" },
    { day:21, type:"Task", label:"Call — check in", icon:"📞", color:"#f59e0b" },
  ];

  const campaignList = campaigns.map((c, i) => `
    <div style="padding:14px 16px;border-bottom:1px solid #f1f5f9;${i === 0 ? 'background:#eff6ff;border-left:3px solid #0ea5e9;' : ''}display:flex;align-items:center;justify-content:space-between;cursor:pointer;">
      <div>
        <div style="font-size:14px;font-weight:600;">${c.name}</div>
        <div style="font-size:12px;color:#64748b;margin-top:2px;">${c.contacts} contacts</div>
      </div>
      <span class="cp-badge" style="background:${c.status === 'Active' ? '#ecfdf5' : '#fffbeb'};color:${c.color};font-size:11px;">${c.status}</span>
    </div>
  `).join("");

  const stepEls = steps.map((s, i) => `
    <div style="display:flex;align-items:center;gap:16px;position:relative;">
      ${i < steps.length - 1 ? '<div style="position:absolute;left:19px;top:40px;width:2px;height:40px;background:#e2e8f0;"></div>' : ''}
      <div style="width:40px;height:40px;border-radius:50%;background:${s.color}15;display:flex;align-items:center;justify-content:center;font-size:18px;border:2px solid ${s.color};flex-shrink:0;">${s.icon}</div>
      <div style="flex:1;">
        <div style="font-size:13px;font-weight:600;">${s.label}</div>
        <div style="font-size:12px;color:#64748b;">Day ${s.day} · ${s.type}</div>
      </div>
    </div>
  `).join("");

  return closePilotWrap(4, '<b>Campaigns</b>', `
    <div style="display:grid;grid-template-columns:320px 1fr;gap:20px;">
      <!-- Campaign List -->
      <div class="cp-card" style="padding:0;overflow:hidden;">
        <div style="padding:16px;border-bottom:1px solid #e2e8f0;">
          <div style="font-size:15px;font-weight:700;">Campaigns</div>
        </div>
        ${campaignList}
      </div>
      <!-- Campaign Detail -->
      <div>
        <div class="cp-card" style="margin-bottom:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
            <div>
              <div style="font-size:18px;font-weight:700;">New Buyer Welcome (21-day)</div>
              <div style="font-size:13px;color:#64748b;margin-top:4px;">Automated drip sequence for new buyer leads</div>
            </div>
            <div style="display:flex;gap:8px;">
              <button class="cp-btn cp-btn-outline">Edit</button>
              <button class="cp-btn cp-btn-primary">Pause</button>
            </div>
          </div>
          <!-- Metrics Bar -->
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;padding:16px;background:#f8fafc;border-radius:10px;margin-bottom:24px;">
            <div><div style="font-size:12px;color:#64748b;">Open Rate</div><div style="font-size:20px;font-weight:700;">24.3%</div></div>
            <div><div style="font-size:12px;color:#64748b;">Click Rate</div><div style="font-size:20px;font-weight:700;">8.7%</div></div>
            <div><div style="font-size:12px;color:#64748b;">SMS Response</div><div style="font-size:20px;font-weight:700;">41%</div></div>
            <div><div style="font-size:12px;color:#64748b;">Appts Set</div><div style="font-size:20px;font-weight:700;color:#059669;">12</div></div>
          </div>
          <!-- Steps -->
          <div class="cp-section-title">Sequence Steps</div>
          <div style="display:flex;flex-direction:column;gap:20px;">${stepEls}</div>
        </div>
      </div>
    </div>
  `);
}

// Screen 6: Transaction Management
function buildClosePilot6() {
  const timeline = [
    { label:"Contract Executed", date:"Feb 1, 2026", done:true },
    { label:"Earnest Money Deposited", date:"Feb 3, 2026", done:true },
    { label:"Inspection Period", date:"Feb 5–12, 2026", done:true },
    { label:"Appraisal Ordered", date:"Feb 10, 2026", done:true },
    { label:"Appraisal Complete", date:"Feb 18, 2026", done:false, active:true },
    { label:"Title Commitment", date:"Feb 22, 2026", done:false },
    { label:"Final Walkthrough", date:"Mar 12, 2026", done:false },
    { label:"Closing", date:"Mar 15, 2026", done:false },
  ];

  const docs = [
    { name:"Purchase Agreement", done:true },
    { name:"Earnest Money Receipt", done:true },
    { name:"Inspection Report", done:true },
    { name:"Appraisal Report", done:false },
    { name:"Title Commitment", done:false },
    { name:"Closing Disclosure", done:false },
  ];

  const timelineEls = timeline.map((t, i) => `
    <div style="display:flex;gap:16px;position:relative;">
      ${i < timeline.length - 1 ? `<div style="position:absolute;left:15px;top:32px;width:2px;height:calc(100% - 8px);background:${t.done ? '#0ea5e9' : '#e2e8f0'};"></div>` : ''}
      <div style="width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;${t.done ? 'background:#0ea5e9;color:#fff;' : t.active ? 'background:#fff;border:3px solid #0ea5e9;color:#0ea5e9;' : 'background:#f1f5f9;color:#94a3b8;border:2px solid #e2e8f0;'}">${t.done ? '✓' : t.active ? '●' : (i + 1)}</div>
      <div style="flex:1;padding-bottom:24px;">
        <div style="font-size:14px;font-weight:${t.done || t.active ? '600' : '500'};${t.active ? 'color:#0ea5e9;' : !t.done ? 'color:#94a3b8;' : ''}">${t.label}${t.active ? ' ← Current' : ''}</div>
        <div style="font-size:12px;color:#64748b;margin-top:2px;">${t.date}</div>
      </div>
    </div>
  `).join("");

  const docEls = docs.map(d => `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#f8fafc;border-radius:8px;">
      <span style="font-size:16px;">${d.done ? '✅' : '⬜'}</span>
      <span style="font-size:13px;${d.done ? '' : 'color:#64748b;'}">${d.name}</span>
      <span style="margin-left:auto;font-size:12px;color:${d.done ? '#059669' : '#d97706'};font-weight:600;">${d.done ? 'Received' : 'Pending'}</span>
    </div>
  `).join("");

  return closePilotWrap(5, 'Transactions / <b>4812 Elm Creek Dr</b>', `
    <!-- Transaction Header -->
    <div class="cp-card" style="margin-bottom:20px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <div style="font-size:22px;font-weight:700;">4812 Elm Creek Dr, Austin TX 78745</div>
          <div style="font-size:16px;color:#64748b;margin-top:4px;">$549,000 · Buyer: Sarah Chen</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <span class="cp-badge cp-badge-cyan" style="font-size:13px;padding:6px 14px;">Under Contract</span>
          <span style="font-size:14px;color:#64748b;">Close: <b>Mar 15, 2026</b></span>
        </div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
      <!-- Left: Timeline -->
      <div class="cp-card">
        <div class="cp-section-title">Transaction Timeline</div>
        ${timelineEls}
      </div>
      <!-- Right: Docs + Commission -->
      <div>
        <div class="cp-card" style="margin-bottom:20px;">
          <div class="cp-section-title">Document Checklist</div>
          <div style="display:flex;flex-direction:column;gap:8px;">${docEls}</div>
        </div>
        <div class="cp-card" style="background:linear-gradient(135deg,#0f172a,#1e293b);color:#fff;border:none;">
          <div class="cp-section-title" style="color:#fff;">Commission Breakdown</div>
          <div style="display:flex;flex-direction:column;gap:10px;">
            <div style="display:flex;justify-content:space-between;font-size:14px;"><span style="color:#94a3b8;">Sale Price</span><span style="font-weight:600;">$549,000</span></div>
            <div style="display:flex;justify-content:space-between;font-size:14px;"><span style="color:#94a3b8;">Commission (3%)</span><span style="font-weight:600;">$16,470</span></div>
            <div style="display:flex;justify-content:space-between;font-size:14px;"><span style="color:#94a3b8;">Brokerage Split (70/30)</span><span style="font-weight:600;">$11,529</span></div>
            <div style="display:flex;justify-content:space-between;font-size:14px;"><span style="color:#94a3b8;">Transaction Fee</span><span style="font-weight:600;color:#f87171;">−$395</span></div>
            <div style="border-top:1px solid rgba(255,255,255,0.2);padding-top:10px;display:flex;justify-content:space-between;font-size:16px;"><span style="font-weight:700;">Net to Agent</span><span style="font-weight:800;color:#4ade80;font-size:20px;">$11,134</span></div>
          </div>
        </div>
      </div>
    </div>
  `);
}

// Screen 7: Reporting & Analytics
function buildClosePilot7() {
  // GCI chart bars (monthly)
  const months = ["Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb"];
  const values = [28, 32, 38, 25, 42, 55, 48, 35];
  const maxVal = 55;
  const goalLine = 40;

  const bars = months.map((m, i) => {
    const h = (values[i] / maxVal) * 160;
    const isGoalAbove = values[i] >= goalLine;
    return `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
      <div style="font-size:11px;font-weight:600;color:${isGoalAbove ? '#059669' : '#64748b'};">$${values[i]}K</div>
      <div style="width:40px;height:${h}px;background:${isGoalAbove ? 'linear-gradient(180deg,#0ea5e9,#06b6d4)' : '#e2e8f0'};border-radius:6px 6px 0 0;"></div>
      <div style="font-size:11px;color:#64748b;">${m}</div>
    </div>`;
  }).join("");

  // Lead source ROI table
  const sources = [
    { name:"Zillow", leads:48, conv:"2.8%", cpl:"$450", cpc:"$16,071", roi:"312%" },
    { name:"Realtor.com", leads:31, conv:"3.4%", cpl:"$280", cpc:"$8,235", roi:"428%" },
    { name:"Facebook Ads", leads:24, conv:"1.2%", cpl:"$120", cpc:"$10,000", roi:"186%" },
    { name:"Website IDX", leads:26, conv:"4.1%", cpl:"$0", cpc:"$0", roi:"∞" },
    { name:"Referral", leads:13, conv:"22%", cpl:"$0", cpc:"$0", roi:"∞" },
  ];

  const sourceRows = sources.map(s => `<tr>
    <td style="font-weight:600;">${s.name}</td>
    <td>${s.leads}</td>
    <td>${s.conv}</td>
    <td>${s.cpl}</td>
    <td>${s.cpc}</td>
    <td style="font-weight:700;color:#059669;">${s.roi}</td>
  </tr>`).join("");

  // Conversion funnel
  const funnel = [
    { label:"Leads", count:142, width:"100%", color:"#94a3b8" },
    { label:"Contacted", count:98, width:"69%", color:"#0ea5e9" },
    { label:"Qualified", count:45, width:"32%", color:"#8b5cf6" },
    { label:"Showing", count:28, width:"20%", color:"#f59e0b" },
    { label:"Offer", count:12, width:"8.5%", color:"#f97316" },
    { label:"Closed", count:8, width:"5.6%", color:"#059669" },
  ];

  const funnelEls = funnel.map((f, i) => {
    const dropoff = i > 0 ? Math.round((1 - f.count / funnel[i-1].count) * 100) : 0;
    return `<div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
      <div style="width:80px;font-size:13px;font-weight:600;text-align:right;">${f.label}</div>
      <div style="flex:1;height:28px;background:#f1f5f9;border-radius:6px;overflow:hidden;">
        <div style="height:100%;width:${f.width};background:${f.color};border-radius:6px;display:flex;align-items:center;padding-left:8px;">
          <span style="font-size:12px;font-weight:700;color:#fff;">${f.count}</span>
        </div>
      </div>
      ${i > 0 ? `<span style="font-size:11px;color:#ef4444;width:50px;">-${dropoff}%</span>` : '<span style="width:50px;"></span>'}
    </div>`;
  }).join("");

  return closePilotWrap(6, '<b>Reports</b>', `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
      <!-- GCI Tracker -->
      <div class="cp-card">
        <div class="cp-section-title">Monthly GCI</div>
        <div style="position:relative;display:flex;align-items:flex-end;justify-content:space-around;height:220px;padding-top:20px;">
          <!-- Goal line -->
          <div style="position:absolute;left:0;right:0;bottom:${(goalLine / maxVal) * 160 + 30}px;border-top:2px dashed #ef4444;"></div>
          <div style="position:absolute;right:4px;bottom:${(goalLine / maxVal) * 160 + 34}px;font-size:10px;color:#ef4444;font-weight:600;">$40K goal</div>
          ${bars}
        </div>
      </div>
      <!-- Conversion Funnel -->
      <div class="cp-card">
        <div class="cp-section-title">Conversion Funnel</div>
        <div style="padding-top:8px;">${funnelEls}</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:2fr 1fr;gap:20px;">
      <!-- Lead Source ROI -->
      <div class="cp-card">
        <div class="cp-section-title">Lead Source ROI</div>
        <table class="cp-table">
          <thead><tr><th>Source</th><th>Leads</th><th>Conv %</th><th>Cost/Lead</th><th>Cost/Close</th><th>ROI</th></tr></thead>
          <tbody>${sourceRows}</tbody>
        </table>
      </div>
      <!-- Agent Activity -->
      <div class="cp-card">
        <div class="cp-section-title">Agent Activity (30 days)</div>
        <div style="display:flex;flex-direction:column;gap:16px;padding-top:8px;">
          <div style="display:flex;justify-content:space-between;align-items:center;"><span style="font-size:14px;color:#64748b;">📞 Calls</span><span style="font-size:24px;font-weight:700;">847</span></div>
          <div style="display:flex;justify-content:space-between;align-items:center;"><span style="font-size:14px;color:#64748b;">💬 Texts</span><span style="font-size:24px;font-weight:700;">1,204</span></div>
          <div style="display:flex;justify-content:space-between;align-items:center;"><span style="font-size:14px;color:#64748b;">📧 Emails</span><span style="font-size:24px;font-weight:700;">2,340</span></div>
          <div style="display:flex;justify-content:space-between;align-items:center;"><span style="font-size:14px;color:#64748b;">📅 Appointments</span><span style="font-size:24px;font-weight:700;color:#059669;">23</span></div>
        </div>
      </div>
    </div>
  `);
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN: Build HTML + Server Captures + Screenshot with Playwright
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  console.log("Building screenshot HTML files...\n");

  mkdirSync(OUTPUT_DIR, { recursive: true });
  const tmpDir = join(tmpdir(), "portfolio-screenshots");
  mkdirSync(tmpDir, { recursive: true });

  // ── HTML Builder Screens ──────────────────────────────────────────────
  const htmlScreens = [
    // ClosePilot CRM
    { slug: "closepilot-crm-1", html: buildClosePilot1(), label: "ClosePilot — Dashboard" },
    { slug: "closepilot-crm-2", html: buildClosePilot2(), label: "ClosePilot — Contact Detail" },
    { slug: "closepilot-crm-3", html: buildClosePilot3(), label: "ClosePilot — Pipeline Kanban" },
    { slug: "closepilot-crm-4", html: buildClosePilot4(), label: "ClosePilot — Listings" },
    { slug: "closepilot-crm-5", html: buildClosePilot5(), label: "ClosePilot — Campaigns" },
    { slug: "closepilot-crm-6", html: buildClosePilot6(), label: "ClosePilot — Transactions" },
    { slug: "closepilot-crm-7", html: buildClosePilot7(), label: "ClosePilot — Reports" },
    // AIA Lead Extractor
    { slug: "aia-lead-extractor-1", html: buildAIALead1(), label: "AIA Lead — Dashboard" },
    { slug: "aia-lead-extractor-2", html: buildAIALead2(), label: "AIA Lead — Search Panel" },
    { slug: "aia-lead-extractor-3", html: buildAIALead3(), label: "AIA Lead — History" },
    { slug: "aia-lead-extractor-4", html: buildAIALead4(), label: "AIA Lead — Admin" },
    { slug: "aia-lead-extractor-5", html: buildAIALead5(), label: "AIA Lead — Lead Detail" },
    // White Lotus
    { slug: "white-lotus-1", html: buildWhiteLotus1(), label: "White Lotus — Noodles Menu" },
    { slug: "white-lotus-2", html: buildWhiteLotus2(), label: "White Lotus — Dim Sum Menu" },
    { slug: "white-lotus-3", html: buildWhiteLotus3(), label: "White Lotus — Cart/Checkout" },
    { slug: "white-lotus-4", html: buildWhiteLotus4(), label: "White Lotus — Order Tracking" },
    { slug: "white-lotus-5", html: buildWhiteLotus5(), label: "White Lotus — Admin Dashboard" },
    // HR Bot AIA
    { slug: "hr-bot-aia-1", html: buildHRBot1(), label: "HR Bot — Interview Analysis" },
    { slug: "hr-bot-aia-2", html: buildHRBot2(), label: "HR Bot — Position Card" },
    { slug: "hr-bot-aia-3", html: buildHRBot3(), label: "HR Bot — Candidate Eval" },
    { slug: "hr-bot-aia-4", html: buildHRBot4(), label: "HR Bot — Landing Page" },
    { slug: "hr-bot-aia-5", html: buildHRBot5(), label: "HR Bot — Features" },
    // AIA Sales Bot
    { slug: "aia-sales-bot-1", html: buildSalesBot1(), label: "Sales Bot — Main Workflow" },
    { slug: "aia-sales-bot-2", html: buildSalesBot2(), label: "Sales Bot — Lead Qualification" },
    { slug: "aia-sales-bot-3", html: buildSalesBot3(), label: "Sales Bot — Voice Dashboard" },
    { slug: "aia-sales-bot-4", html: buildSalesBot4(), label: "Sales Bot — CRM Integration" },
    { slug: "aia-sales-bot-5", html: buildSalesBot5(), label: "Sales Bot — Calendar" },
    // RP Partner Website (Tuknang.com)
    { slug: "rp-partner-website-1", html: buildTuknang1(), label: "Tuknang — Hero" },
    { slug: "rp-partner-website-2", html: buildTuknang2(), label: "Tuknang — Features" },
    { slug: "rp-partner-website-3", html: buildTuknang3(), label: "Tuknang — Pricing" },
    { slug: "rp-partner-website-4", html: buildTuknang4(), label: "Tuknang — FAQ" },
    { slug: "rp-partner-website-5", html: buildTuknang5(), label: "Tuknang — CTA" },
    // n8n Tuknang Auto-Poster
    { slug: "n8n-tuknang-1", html: buildN8nTuknang1(), label: "n8n Tuknang — Daily Poster" },
    { slug: "n8n-tuknang-2", html: buildN8nTuknang2(), label: "n8n Tuknang — Content Generator" },
    { slug: "n8n-tuknang-3", html: buildN8nTuknang3(), label: "n8n Tuknang — FB Post Preview" },
    { slug: "n8n-tuknang-4", html: buildN8nTuknang4(), label: "n8n Tuknang — Email Alert" },
    { slug: "n8n-tuknang-5", html: buildN8nTuknang5(), label: "n8n Tuknang — Content Calendar" },
  ];

  // Write HTML files
  const htmlFiles = htmlScreens.map((s) => {
    const path = join(tmpDir, `${s.slug}.html`);
    writeFileSync(path, s.html, "utf-8");
    console.log(`  ✓ Built HTML: ${s.label}`);
    return { ...s, path };
  });

  // ── Launch Playwright ─────────────────────────────────────────────────
  console.log("\nLaunching Playwright...\n");
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  // Screenshot HTML builder screens
  for (const { slug, path, label } of htmlFiles) {
    const page = await context.newPage();
    await page.goto(`file://${path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    const outputPath = join(OUTPUT_DIR, `${slug}.png`);
    await page.screenshot({ path: outputPath, fullPage: false });
    console.log(`  ✓ Screenshot: ${label} → ${slug}.png`);
    await page.close();
  }

  // ── Copy thumbnail for ClosePilot (screen 1 = card image) ───────────
  copyFileSync(join(OUTPUT_DIR, "closepilot-crm-1.png"), join(OUTPUT_DIR, "closepilot-crm.png"));
  console.log("  ✓ Copied closepilot-crm-1.png → closepilot-crm.png (thumbnail)");

  // ── Static Server Captures: aiAuto ────────────────────────────────────
  console.log("\n  Starting aiAuto static server...");
  const aiAutoDir = join(__dirname, "..", "..", "aiAuto");
  if (existsSync(aiAutoDir)) {
    const aiAutoServer = await startStaticServer(aiAutoDir);
    const aiAutoPages = [
      { slug: "aiauto-1", path: "/index.html", label: "aiAuto — Landing Page" },
      { slug: "aiauto-2", path: "/tools.html", label: "aiAuto — Tools Page" },
      { slug: "aiauto-3", path: "/tools/blog-generator.html", label: "aiAuto — Blog Generator" },
      { slug: "aiauto-4", path: "/tools/social-captions.html", label: "aiAuto — Social Captions" },
      { slug: "aiauto-5", path: "/user/dashboard.html", label: "aiAuto — User Dashboard" },
    ];
    for (const { slug, path, label } of aiAutoPages) {
      const page = await context.newPage();
      try {
        await page.goto(`${aiAutoServer.url}${path}`, { waitUntil: "networkidle", timeout: 10000 });
        await page.waitForTimeout(2000);
        const outputPath = join(OUTPUT_DIR, `${slug}.png`);
        await page.screenshot({ path: outputPath, fullPage: false });
        console.log(`  ✓ Screenshot: ${label} → ${slug}.png`);
      } catch (e) {
        console.log(`  ⚠ Skipped: ${label} (${e.message})`);
      }
      await page.close();
    }
    aiAutoServer.close();
  } else {
    console.log("  ⚠ aiAuto directory not found, skipping server captures");
  }

  // ── Static Server Captures: AutonoIQ Website ─────────────────────────
  console.log("\n  Starting AutonoIQ static server...");
  const autonoiqDir = join(__dirname, "..", "..", "autonoiq-website", "public");
  if (existsSync(autonoiqDir)) {
    const autonoiqServer = await startStaticServer(autonoiqDir);
    const autonoiqPages = [
      { slug: "autonoiq-website-1", path: "/index.html", label: "AutonoIQ — Landing Page" },
      { slug: "autonoiq-website-2", path: "/chatbots.html", label: "AutonoIQ — Chatbots" },
      { slug: "autonoiq-website-3", path: "/portfolio.html", label: "AutonoIQ — Portfolio" },
      { slug: "autonoiq-website-4", path: "/pricing.html", label: "AutonoIQ — Pricing" },
      { slug: "autonoiq-website-5", path: "/blog.html", label: "AutonoIQ — Blog" },
    ];
    for (const { slug, path, label } of autonoiqPages) {
      const page = await context.newPage();
      try {
        await page.goto(`${autonoiqServer.url}${path}`, { waitUntil: "networkidle", timeout: 10000 });
        await page.waitForTimeout(2000);
        const outputPath = join(OUTPUT_DIR, `${slug}.png`);
        await page.screenshot({ path: outputPath, fullPage: false });
        console.log(`  ✓ Screenshot: ${label} → ${slug}.png`);
      } catch (e) {
        console.log(`  ⚠ Skipped: ${label} (${e.message})`);
      }
      await page.close();
    }
    autonoiqServer.close();
  } else {
    console.log("  ⚠ AutonoIQ directory not found, skipping server captures");
  }

  await browser.close();
  console.log(`\nDone! Screenshots saved to public/images/projects/`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
