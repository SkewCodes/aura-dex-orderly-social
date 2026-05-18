import * as fs from "fs";
import * as path from "path";
import translations from "./translations";

// Create the target directory if it doesn't exist
const targetDir = path.join(process.cwd(), "public", "locales", "extend");
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Initialize translation objects
const enTranslations: Record<string, string> = {};
const koTranslations: Record<string, string> = {};

// Convert the translations
Object.entries(translations).forEach(([key, value]) => {
  enTranslations[key] = value.EN;
  koTranslations[key] = value.KO;
});

// Write the JSON files
const enFilePath = path.join(targetDir, "en.json");
const koFilePath = path.join(targetDir, "ko.json");

fs.writeFileSync(enFilePath, JSON.stringify(enTranslations, null, 2), "utf8");
fs.writeFileSync(koFilePath, JSON.stringify(koTranslations, null, 2), "utf8");

console.log("✅ Translation files converted successfully!");
console.log(`📁 English translations: ${enFilePath}`);
console.log(`📁 Korean translations: ${koFilePath}`);
console.log(`📊 Total keys converted: ${Object.keys(translations).length}`);
