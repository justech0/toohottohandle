import { gzipSync } from "node:zlib";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const directory = join(process.cwd(), ".next", "static", "chunks");
const markers = ["SVGLoader", "thth-3d-disabled"];
const files = readdirSync(directory)
  .filter((name) => name.endsWith(".js"))
  .map((name) => ({ name, source: readFileSync(join(directory, name)) }))
  .filter(({ source }) => markers.some((marker) => source.includes(Buffer.from(marker))));

if (files.length === 0) throw new Error("3D parçası bulunamadı; önce production build çalıştırın.");
const bytes = files.reduce((total, { source }) => total + gzipSync(source, { level: 9 }).length, 0);
const limit = 180 * 1024;
console.log(`3D gzip: ${(bytes / 1024).toFixed(1)} KB / 180 KB (${files.map(({ name }) => name).join(", ")})`);
if (bytes > limit) process.exitCode = 1;
