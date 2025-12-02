import { remove, copy } from "fs-extra";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const srcDir = resolve(__dirname, "out");
const destDir = resolve(__dirname, "../backend/wwwroot");

async function deploy() {
  try {
    console.log("🧹 Deleting old wwwroot...");
    await remove(destDir);

    console.log("📦 Copying new static files...");
    await copy(srcDir, destDir, { overwrite: true });

    console.log("✅ Deployed to backend/wwwroot");
  } catch (err) {
    console.error("❌ Deployment failed:", err);
  }
}

deploy().catch((err) => {
  console.error("Unexpected error:", err);
});
