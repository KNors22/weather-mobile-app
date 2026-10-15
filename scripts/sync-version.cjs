const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const packagePath = path.join(root, 'package.json');
const appPath = path.join(root, 'app.json');

const { version } = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const app = JSON.parse(fs.readFileSync(appPath, 'utf8'));

app.expo.version = version;

fs.writeFileSync(appPath, JSON.stringify(app, null, 2) + '\n');
console.log(`App version updated to ${version}`);