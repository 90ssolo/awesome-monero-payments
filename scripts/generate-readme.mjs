import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = yaml.load(fs.readFileSync(path.join(rootDir, 'data', 'gateways.yaml'), 'utf8'));

let md = `<p align="center">
  <img src="assets/hero-banner.svg" alt="Awesome Monero Payments" width="100%" />
</p>

# Awesome Monero Payments [![Awesome](https://awesome.re/badge.svg)](https://awesome.re) [![Validate Dataset](https://github.com/90ssolo/awesome-monero-payments/actions/workflows/validate.yml/badge.svg)](https://github.com/90ssolo/awesome-monero-payments/actions/workflows/validate.yml) [![License: CC0-1.0](https://img.shields.io/badge/License-CC0_1.0-lightgrey.svg)](LICENSE)

A practical comparison of **Monero (XMR) payment servers, browser tills, shop plugins and libraries** for merchants and developers.

Because Monero hides addresses and amounts on the blockchain, a shop cannot check payments by looking up a public address on a block explorer. Every tool that takes Monero has to scan blocks with a **view key** (in the browser, on your own server, or inside a library) or hand that job to a third party.

This list groups payment tools by how they handle keys and infrastructure, and records what each project's own code and documentation state as of the checked date. Where a project's docs do not answer a question, the field says \`unknown\`.

## Contents

- [How the setups differ](#how-the-setups-differ)
- [Comparison table](#comparison-table)
- [Detailed profiles](#detailed-profiles)
  - [1. Browser tills and local point-of-sale](#1-browser-tills-and-local-point-of-sale)
  - [2. Self-hosted payment servers](#2-self-hosted-payment-servers)
  - [3. Direct shop plugins and libraries](#3-direct-shop-plugins-and-libraries)
  - [4. Hosted processors](#4-hosted-processors)
- [Which setup fits your shop](#which-setup-fits-your-shop)
- [Things worth knowing before you take Monero](#things-worth-knowing-before-you-take-monero)
- [Related guides and tools](#related-guides-and-tools)
- [Notes on sources and disclosure](#notes-on-sources-and-disclosure)
- [Contributing](#contributing)

---

## How the setups differ

<p align="center">
  <img src="assets/trust-models.svg" alt="Monero payment setups and key custody" width="100%" />
</p>

| Setup | Spend key | View key | Needs a server? | Typical use |
|---|---|---|---|---|
| **1. Browser till / local wallet** | Yours only (kept offline or encrypted on the device) | On your phone, tablet or computer | No | Cafes, market stalls, counters, freelance invoices |
| **2. Self-hosted payment server** | Yours only (kept offline) | On your own VPS or container | Yes | Online shops that need 24/7 checkout and webhooks |
| **3. Direct shop plugin / library** | Yours only (kept offline) | On your web host or backend | Yes (your existing host + node/RPC) | WordPress shops without a separate container, or custom Rust/Node apps |
| **4. Hosted processor** | Held by the processor while settling | Held by the processor | No | Shops that trade privacy and self-custody for zero server upkeep |

---

## Comparison table

| Project | Type | Custody | Node / RPC needed | Fiat prices | Partial payments | Webhooks | Exports | License |
|---|---|---|---|---|---|---|---|---|
`;

for (const g of data.gateways) {
  const link = `[${g.name}](${g.repo_url || g.website_url})`;
  const m = g.matrix;
  md += `| **${link}** | ${m.category} | ${m.custody} | ${m.node_req} | ${m.fiat} | ${m.partial} | ${m.webhooks} | ${m.exports} | \`${g.license}\` |\n`;
}

md += `\n---\n\n## Detailed profiles\n\n`;

const sections = [
  {
    keys: ['browser_till'],
    title: '1. Browser tills and local point-of-sale',
    intro: 'Tools that run on a phone, tablet or computer at the counter without a backend server. Good for in-person sales and one-off payment requests.'
  },
  {
    keys: ['self_hosted_server'],
    title: '2. Self-hosted payment servers',
    intro: 'Small servers you run yourself with a **view-only wallet**. They hand out a fresh subaddress for every order, watch the chain, and send your shop a webhook when the payment arrives. Even if the server is compromised, it has no key to spend your coins.'
  },
  {
    keys: ['cms_plugin', 'library_engine'],
    title: '3. Direct shop plugins and libraries',
    intro: 'Plugins that run inside your shop software (such as WordPress/PHP) and libraries you embed straight into your own backend.'
  },
  {
    keys: ['hosted_custodial'],
    title: '4. Hosted processors',
    intro: 'Third-party services that run the node and checkout page for you, in exchange for fees, third-party custody during payout, and visibility into your sales.'
  }
];

for (const sec of sections) {
  const items = data.gateways.filter(g => sec.keys.includes(g.category));
  if (!items.length) continue;

  md += `### ${sec.title}\n\n${sec.intro}\n\n`;

  for (const item of items) {
    md += `#### ${item.name}\n\n`;
    if (item.affiliation_note) {
      md += `> [!NOTE]\n> **Disclosure:** ${item.affiliation_note}.\n\n`;
    }
    md += `| Field | Details |\n|---|---|\n`;
    md += `| **Repository** | [${item.repo_url}](${item.repo_url}) |\n`;
    md += `| **Website / docs** | [${item.website_url}](${item.website_url}) |\n`;
    md += `| **Status** | ${item.development_status} |\n`;
    md += `| **How it runs** | ${item.deployment_method} |\n`;
    md += `| **Spend key** | ${item.spend_key_control} |\n`;
    md += `| **View key** | ${item.view_key_control} |\n`;
    md += `| **Node / wallet-RPC** | ${item.node_rpc_requirements} |\n`;
    md += `| **Price conversion** | ${item.price_conversion} |\n`;
    md += `| **Invoices** | ${item.invoices} |\n`;
    md += `| **Confirmations** | ${item.confirmation_policy} |\n`;
    md += `| **Partial payments** | ${item.partial_payments} |\n`;
    md += `| **Webhooks** | ${item.webhooks} |\n`;
    md += `| **Exports** | ${item.exports} |\n`;
    md += `| **Integrations** | ${item.ecommerce_integrations.join(', ')} |\n`;
    md += `| **License** | \`${item.license}\` |\n`;
    md += `| **Checked** | \`${item.evidence.checked_date}\` — ${item.evidence.source_urls.map(u => `[source](${u})`).join(', ')} |\n\n`;
    if (item.evidence.notes) {
      md += `*Notes:* ${item.evidence.notes}\n\n`;
    }
  }
}

md += `---

## Which setup fits your shop

\`\`\`mermaid
flowchart TD
    Start["How do you take payments?"] --> Counter["At a counter or by invoice"]
    Start --> WebShop["Online shop (24/7 checkout)"]
    Start --> CustomCode["Your own backend app"]

    Counter --> UseTill["Browser till or payment links\n(MonkStash Till, Feather, Cake, Monero GUI)"]
    WebShop --> HasVPS{"Can you run a small VPS / Docker?"}
    HasVPS -->|"Yes"| ServerType{"Only Monero or many coins?"}
    ServerType -->|"Monero only"| Light["MonkStash Pay (no wallet-rpc needed)\nor MoneroPay / Pago / XMR-PAY"]
    ServerType -->|"Bitcoin + Monero"| FullSuite["BTCPay Server + Monero plugin"]
    HasVPS -->|"No"| SharedHost["Direct plugin (monerowp)\nor hosted processor (NOWPayments)"]

    CustomCode --> Stack{"Language"}
    Stack -->|"Rust"| UseRust["AcceptXMR"]
    Stack -->|"Any language"| UseAPI["REST API + webhooks\n(MonkStash Pay, MoneroPay, Pago)"]
\`\`\`

---

## Things worth knowing before you take Monero

1. **One subaddress per order.**
   Never match payments by amount alone—two customers can buy the same item at the same time. Give every order its own fresh subaddress (starts with \`8\` on mainnet) so you always know which order was paid.
2. **Keep accounts separate and watch the lookahead gap.**
   Monero wallets group subaddresses into numbered accounts (\`0\`, \`1\`, \`2\`...) and only scan 200 unused addresses ahead of the last paid one by default. Put your payment server on its own account (for example \`PAY_ACCOUNT=1\`) so it never hands out the same address as your desktop wallet or counter till. If your shop creates hundreds of unpaid invoices in a row, raise your wallet's \`subaddress-lookahead\` when restoring from seed.
3. **0-conf vs. confirmed payments.**
   An unconfirmed payment (\`0-conf\`, seen in the mempool within a few seconds) is fine when a customer is standing at your counter buying a coffee. Do not use \`0-conf\` for instant digital goods (downloads, gift cards, licence keys) or large orders—wait for 1 to 10 confirmations.
4. **Refunds need an address from the customer.**
   Monero uses one-time stealth addresses, so the sender's address is never on the blockchain. You cannot "send a refund back to the address it came from." Always ask the customer for a refund address and check proof of payment first.

---

## Related guides and tools

- **[Monero Merchant Starter Kit](https://github.com/90ssolo/monero-merchant-starter-kit):** Printable counter cards (\`.svg\`), invoice templates, cashier quick-start sheet, verification checklist, refund guide and daily sales CSV templates.
- **[Monero Public RPC Nodes](https://github.com/90ssolo/monero-rpc-nodes):** Checked Mainnet, Stagenet and Tor remote nodes with a script to test consensus and fee estimates.
- **[Official Monero URI Specification](https://github.com/monero-project/monero/blob/master/docs/URI_SCHEME.md):** How \`monero:\` payment links and QR codes are formatted.
- **[Accepting Monero as a Business](https://monkstash.com/accept-monero-payments):** Walkthrough of payment links, browser tills and self-hosted shop checkout.

---

## Notes on sources and disclosure

This repository is maintained by [MonkStash](https://monkstash.com). MonkStash's live browser till/payment links and its self-hosted payment server ([MonkStash Pay](https://github.com/90ssolo/monkstash/tree/main/apps/pay), currently in v0.1 testing) are listed using the same fields and rules as every other project.

Entries are compiled from each project's public code and documentation on the listed date, not from third-party audits or live transaction benchmarks.

---

## Contributing

To add a project or update an entry:

1. Edit [\`data/gateways.yaml\`](data/gateways.yaml) and link to the source documentation or code under \`evidence.source_urls\`.
2. Run \`npm test\` and \`npm run build\` to check the data and rebuild \`README.md\`.
3. Note any affiliation with the project in your pull request.

\`\`\`bash
npm install
npm test
npm run build
\`\`\`

## License

[CC0 1.0 Universal (Public Domain)](LICENSE).
`;

fs.writeFileSync(path.join(rootDir, 'README.md'), md, 'utf8');
console.log('Rebuilt README.md');
