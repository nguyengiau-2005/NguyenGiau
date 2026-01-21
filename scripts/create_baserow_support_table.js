/*
  Script to create a Support table in Baserow.
  Usage: node scripts/create_baserow_support_table.js <database_id>
  It uses CONFIG.BASEROW_TOKEN from api/config.ts or environment variable BASEROW_TOKEN.

  Fields created:
  - Subject (text)
  - Message (long_text)
  - Product (link_row to product table) [optional if PRODUCT_TABLE_ID present in config]
  - User Contact (text)
  - Status (single_select) with options: Open, Pending, In Progress, Closed
  - Created At (last_modified or created)

  After running, note the printed table id and set SUPPORT_TABLE_ID in api/config.ts
*/

const fetch = require('node-fetch');
const path = require('path');

(async () => {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: node scripts/create_baserow_support_table.js <database_id>');
    process.exit(1);
  }
  const databaseId = args[0];

  // Try to load token from config file
  let token = process.env.BASEROW_TOKEN;
  try {
    const config = require(path.join(__dirname, '..', 'api', 'config.js'));
    token = token || config.CONFIG?.BASEROW_TOKEN;
  } catch (e) {
    // ignore
  }

  if (!token) {
    console.error('No BASEROW_TOKEN found. Set env BASEROW_TOKEN or put token in api/config.ts');
    process.exit(1);
  }

  const base = 'https://api.baserow.io/api';

  try {
    // 1) Create table
    const createTableRes = await fetch(`${base}/database/tables/database/${databaseId}/`, {
      method: 'POST',
      headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Support Requests' })
    });
    if (!createTableRes.ok) {
      const txt = await createTableRes.text();
      throw new Error('Create table failed: ' + createTableRes.status + ' ' + txt);
    }
    const table = await createTableRes.json();
    console.log('Created table:', table);
    const tableId = table.id;

    // 2) Create fields
    // Helper to create field
    const createField = async (type, name, options) => {
      const body = { type, name };
      if (options) Object.assign(body, options);
      const res = await fetch(`${base}/database/fields/table/${tableId}/`, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Create field ${name} failed: ${res.status} ${t}`);
      }
      return res.json();
    };

    await createField('text', 'Subject');
    await createField('long_text', 'Message');

    // If product table exists in config, create link_row field
    let productTableId = null;
    try {
      const cfg = require(path.join(__dirname, '..', 'api', 'config.js'));
      productTableId = cfg.CONFIG?.PRODUCT_TABLE_ID || null;
    } catch (e) {}

    if (productTableId) {
      await createField('link_row', 'Product', { link_row_table_id: productTableId });
    }

    await createField('text', 'User Contact');

    // single_select options
    const statusField = await createField('single_select', 'Status');
    // statusField.id
    const optionsRes = await fetch(`${base}/database/fields/${statusField.id}/select_options/`, {
      method: 'POST',
      headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ options: ['Open', 'Pending', 'In Progress', 'Closed'].map((v, i) => ({ value: v, color: null })) })
    });
    if (!optionsRes.ok) {
      console.warn('Warning: failed to create select options', await optionsRes.text());
    } else {
      console.log('Created status options');
    }

    console.log('Support table created with ID:', tableId);
    console.log('Add SUPPORT_TABLE_ID =', tableId, 'to api/config.ts');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
