const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const envFiles = [
  ['backend/.env.example', 'backend/.env'],
  ['frontend/.env.example', 'frontend/.env.local'],
];

for (const [examplePath, targetPath] of envFiles) {
  const source = path.join(projectRoot, examplePath);
  const target = path.join(projectRoot, targetPath);

  if (fs.existsSync(target)) {
    console.log(`Kept existing ${targetPath}`);
    continue;
  }

  fs.copyFileSync(source, target);
  console.log(`Created ${targetPath}`);
}

console.log('\nSetup complete. Add the shared MongoDB password to backend/.env, then run:');
console.log('  npm run dev');
