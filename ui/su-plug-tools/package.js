const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");

const rootDir = __dirname;
const srcDir = path.join(rootDir, "src", "YOOOOOO.AluPro");
const loaderFile = path.join(rootDir, "src", "YOOOOOO.AluPro.rb");
const mainFile = path.join(srcDir, "main.rb");

const readVersion = (filePath, pattern) => {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, "utf8");
  const match = content.match(pattern);
  return match ? match[1] : null;
};

const version =
  readVersion(loaderFile, /EXT_VERSION\s*=\s*"([^"]+)"/) ||
  readVersion(mainFile, /VERSION\s*=\s*"([^"]+)"/);

if (!version) {
  throw new Error("无法读取版本号");
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "alu-pro-"));
const bundleRoot = path.join(tmpDir, "YOOOOOO.AluPro");
fs.mkdirSync(bundleRoot, { recursive: true });

const copyDir = (from, to) => {
  fs.mkdirSync(to, { recursive: true });
  const entries = fs.readdirSync(from, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === ".DS_Store") continue;
    const srcPath = path.join(from, entry.name);
    const dstPath = path.join(to, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, dstPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, dstPath);
    }
  }
};

copyDir(srcDir, bundleRoot);

if (!fs.existsSync(loaderFile)) {
  throw new Error("缺少入口文件: YOOOOOO.AluPro.rb");
}
fs.copyFileSync(loaderFile, path.join(tmpDir, "YOOOOOO.AluPro.rb"));

const outputFile = path.join(rootDir, `AluPro-${version}.rbz`);

if (process.platform === "win32") {
  const psEscape = (value) => value.replace(/'/g, "''");
  const cmd = `Set-Location -Path '${psEscape(tmpDir)}'; Compress-Archive -Path 'YOOOOOO.AluPro','YOOOOOO.AluPro.rb' -DestinationPath '${psEscape(outputFile)}' -Force`;
  execFileSync("powershell", ["-NoProfile", "-Command", cmd], { stdio: "inherit" });
} else {
  execFileSync("zip", ["-r", outputFile, "YOOOOOO.AluPro", "YOOOOOO.AluPro.rb"], { cwd: tmpDir, stdio: "inherit" });
}

fs.rmSync(tmpDir, { recursive: true, force: true });
console.log(`生成完成: ${outputFile}`);
