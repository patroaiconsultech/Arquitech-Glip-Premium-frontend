import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectDir = fileURLToPath(new URL("../", import.meta.url));
const testDir = path.join(projectDir, "tests");
const files = readdirSync(testDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith(".test.mjs"))
  .map((entry) => path.join(testDir, entry.name))
  .sort();

if (files.length === 0) {
  console.error("Nenhum teste .test.mjs encontrado em tests/.");
  process.exit(1);
}

const result = spawnSync(process.execPath, ["--test", ...files], {
  cwd: projectDir,
  stdio: "inherit",
  windowsHide: true
});

if (result.error) {
  console.error("Falha ao executar os testes:", result.error.message);
  process.exit(1);
}
if (result.signal) {
  console.error("Execucao dos testes interrompida:", result.signal);
  process.exit(1);
}
process.exit(result.status ?? 1);
