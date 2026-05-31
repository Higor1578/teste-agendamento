import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const output = join(root, ".vercel", "output");

if (!existsSync(join(dist, "config.json")) || !existsSync(join(dist, "client")) || !existsSync(join(dist, "server"))) {
  throw new Error("Build Vercel/Nitro incompleto: rode vite build antes de preparar a saida.");
}

rmSync(output, { recursive: true, force: true });
mkdirSync(join(output, "functions"), { recursive: true });

cpSync(join(dist, "config.json"), join(output, "config.json"));
cpSync(join(dist, "client"), join(output, "static"), { recursive: true });
cpSync(join(dist, "server"), join(output, "functions", "__server.func"), { recursive: true });
