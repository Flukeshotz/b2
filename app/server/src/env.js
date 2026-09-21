// Minimal .env loader -- mirrors config.py::_load_dotenv in "QP Editorial AI"
// rather than adding a dependency for fifteen lines. Environment always wins
// over the file, so a shell export or a real secret manager overrides .env.
const fs = require("fs");
const path = require("path");

module.exports = function loadEnv(file = path.join(__dirname, "..", ".env")) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#") || !t.includes("=")) continue;
    const i = t.indexOf("=");
    const key = t.slice(0, i).trim();
    const val = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = val;
  }
};
