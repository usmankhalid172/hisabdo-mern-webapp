import fs from "node:fs";

const filesToAudit = [
  "src/app/(dashboard)/dashboard/page.tsx",
  "src/components/dashboard/IncomeExpenseChart.tsx",
  "src/components/dashboard/RecentActivity.tsx",
  "src/components/dashboard-analytics/CashFlowChart.tsx",
  "src/components/dashboard-analytics/SummaryCards.tsx",
];

const patterns = [
  { name: "hisab-card", regex: /\bhisab-card\b/g },
  { name: "btn-", regex: /\bbtn-[a-zA-Z0-9_-]+\b/g },
  { name: "bg-hisab", regex: /\bbg-hisab[a-zA-Z0-9_-]*\b/g },
  { name: "brand-", regex: /\bbrand-[a-zA-Z0-9_-]+\b/g },
  { name: "hardcoded-hex", regex: /#[0-9a-fA-F]{3,8}\b/g },
  { name: "arbitrary-var", regex: /\[var\(--[a-zA-Z0-9_-]+\)\]/g },
];

console.log("================ DASHBOARD DESIGN-SYSTEM AUDIT ================\n");

let totalIssues = 0;
const resultsByFile = {};

for (const file of filesToAudit) {
  if (!fs.existsSync(file)) continue;
  const content = fs.readFileSync(file, "utf8");
  const lines = content.split("\n");

  resultsByFile[file] = {};

  for (const { name, regex } of patterns) {
    const matches = [];
    lines.forEach((line, lineIdx) => {
      const lineMatches = line.match(regex);
      if (lineMatches) {
        lineMatches.forEach((m) => {
          matches.push({ line: lineIdx + 1, match: m, text: line.trim() });
        });
      }
    });

    resultsByFile[file][name] = matches;
    totalIssues += matches.length;
  }
}

for (const [file, pMap] of Object.entries(resultsByFile)) {
  console.log(`FILE: ${file}`);
  for (const [pName, matches] of Object.entries(pMap)) {
    if (matches.length > 0) {
      console.log(`  Pattern '${pName}': ${matches.length} occurrences`);
      matches.forEach((m) => {
        console.log(`    Line ${m.line}: '${m.match}' -> ${m.text.slice(0, 80)}...`);
      });
    } else {
      console.log(`  Pattern '${pName}': 0 occurrences`);
    }
  }
  console.log("");
}

console.log(`TOTAL OCCURRENCES FOUND: ${totalIssues}`);
