// Copie les bibliothèques (versions exactes de package.json) dans vendor/
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const out = path.join(root, "vendor");
fs.mkdirSync(out, { recursive: true });

const files = [
  "node_modules/xlsx/dist/xlsx.full.min.js",
  "node_modules/jspdf/dist/jspdf.umd.min.js",
  "node_modules/jspdf-autotable/dist/jspdf.plugin.autotable.min.js",
];

for (const f of files) {
  const src = path.join(root, f);
  const dst = path.join(out, path.basename(f));
  fs.copyFileSync(src, dst);
  console.log("copié :", path.relative(root, dst), fs.statSync(dst).size, "octets");
}
