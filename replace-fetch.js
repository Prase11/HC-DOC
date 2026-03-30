import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function wrapFetch(filePath, importPath) {
    const fullPath = path.join(__dirname, filePath);
    if (!fs.existsSync(fullPath)) return;

    let content = fs.readFileSync(fullPath, 'utf8');
    if (content.includes('apiFetch(')) return; // Already wrapped

    content = content.replace(/fetch\(/g, 'apiFetch(');

    if (filePath.endsWith('.vue')) {
        content = content.replace('<script setup>', `<script setup>\nimport { apiFetch } from '${importPath}';`);
    } else {
        content = `import { apiFetch } from '${importPath}';\n` + content;
    }

    fs.writeFileSync(fullPath, content);
    console.log(`✅ Wrapped fetch in ${filePath}`);
}

wrapFetch('src/stores/dossierStore.js', '../utils/api.js');
wrapFetch('src/pages/EmployeeDossierPage.vue', '../utils/api.js');
wrapFetch('src/components/modals/EditEmployeeModal.vue', '../../utils/api.js');
wrapFetch('src/components/modals/SettingsModal.vue', '../../utils/api.js');
