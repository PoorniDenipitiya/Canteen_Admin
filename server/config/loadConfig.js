const fs = require("fs");
const yaml = require("js-yaml");
const path = require("path");

function loadConfig() {
  const configPath = path.join(__dirname, "application.yaml");
  try {
    return yaml.load(fs.readFileSync(configPath, "utf8"));
  } catch (err) {
    console.error("Failed to load config:", err);
    return {};
  }
}

module.exports = loadConfig();
