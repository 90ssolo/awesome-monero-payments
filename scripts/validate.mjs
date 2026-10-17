import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const yamlPath = path.join(rootDir, 'data', 'gateways.yaml');
const data = yaml.load(fs.readFileSync(yamlPath, 'utf8'));

const requiredFields = [
  'id',
  'name',
  'repo_url',
  'website_url',
  'category',
  'category_label',
  'license',
  'development_status',
  'deployment_method',
  'spend_key_control',
  'view_key_control',
  'node_rpc_requirements',
  'price_conversion',
  'invoices',
  'confirmation_policy',
  'partial_payments',
  'webhooks',
  'exports',
  'ecommerce_integrations',
  'matrix',
  'evidence'
];

const validCategories = ['browser_till', 'self_hosted_server', 'cms_plugin', 'library_engine', 'hosted_custodial'];

if (!Array.isArray(data.gateways) || data.gateways.length < 8) {
  throw new Error('Dataset must contain at least 8 gateway entries.');
}

const ids = new Set();
for (const entry of data.gateways) {
  for (const field of requiredFields) {
    if (entry[field] === undefined || entry[field] === null || entry[field] === '') {
      throw new Error(`Entry "${entry.id || entry.name}" is missing required field: ${field}`);
    }
  }
  if (ids.has(entry.id)) {
    throw new Error(`Duplicate gateway id: ${entry.id}`);
  }
  ids.add(entry.id);
  if (!validCategories.includes(entry.category)) {
    throw new Error(`Invalid category "${entry.category}" on entry "${entry.id}"`);
  }
  if (!entry.evidence.checked_date || !Array.isArray(entry.evidence.source_urls) || entry.evidence.source_urls.length === 0) {
    throw new Error(`Entry "${entry.id}" must include evidence.checked_date and at least one source URL.`);
  }
  for (const u of [entry.repo_url, entry.website_url, ...entry.evidence.source_urls]) {
    if (!u.startsWith('https://')) {
      throw new Error(`Invalid URL "${u}" in entry "${entry.id}" (must use https://)`);
    }
  }
}

for (const svgFile of ['assets/hero-banner.svg', 'assets/trust-models.svg']) {
  const fullPath = path.join(rootDir, svgFile);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Missing required SVG asset: ${svgFile}`);
  }
  const svg = fs.readFileSync(fullPath, 'utf8');
  if (!svg.includes('<svg') || !svg.includes('</svg>')) {
    throw new Error(`Invalid SVG structure in ${svgFile}`);
  }
}

console.log(`Validated ${data.gateways.length} gateway entries and 2 SVG assets successfully.`);
