// Simple Express server to manage writing dummy JSON files (ESM)
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.FILE_MANAGER_PORT ? Number(process.env.FILE_MANAGER_PORT) : 3001;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

function getDummyPath() {
  const projectRoot = process.cwd();
  return path.resolve(projectRoot, 'src', 'feature', 'warehouse', 'data', 'dummies', 'warehouse.dummy.json');
}

function getProductDummyPath() {
  const projectRoot = process.cwd();
  return path.resolve(projectRoot, 'src', 'feature', 'product', 'data', 'dummies', 'product.dummy.json');
}

app.post('/api/dummy/warehouses', async (req, res) => {
  try {
    const warehouses = Array.isArray(req.body?.warehouses) ? req.body.warehouses : [];
    const payload = { success: true, data: { warehouses }, message: '' };
    const filePath = getDummyPath();
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), { encoding: 'utf8' });
    return res.json({ ok: true, path: filePath, count: warehouses.length });
  } catch (err) {
    console.error('[file_manager] write error:', err && err.message ? err.message : err);
    return res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
  }
});

// Read all warehouses
app.get('/api/dummy/warehouses', async (req, res) => {
  try {
    const filePath = getDummyPath();
    if (!fs.existsSync(filePath)) {
      return res.json({ success: true, data: { warehouses: [] }, message: '' });
    }
    const raw = fs.readFileSync(filePath, { encoding: 'utf8' });
    if (!raw || raw.trim() === '') {
      return res.json({ success: true, data: { warehouses: [] }, message: '' });
    }
    const json = JSON.parse(raw);
    return res.json(json);
  } catch (err) {
    console.error('[file_manager] read error:', err && err.message ? err.message : err);
    return res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
  }
});

// Upsert single warehouse by id_server
app.post('/api/dummy/warehouse', async (req, res) => {
  try {
    const item = req.body || {};
    const idServer = item && (item.id_server ?? item.idServer);
    if (idServer === undefined || idServer === null) {
      return res.status(400).json({ ok: false, error: 'id_server is required' });
    }
    const filePath = getDummyPath();
    let warehouses = [];
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, { encoding: 'utf8' });
        const json = raw ? JSON.parse(raw) : { success: true, data: { warehouses: [] }, message: '' };
        warehouses = Array.isArray(json?.data?.warehouses) ? json.data.warehouses : [];
      } catch {}
    }
    const idx = warehouses.findIndex(w => (w?.id_server ?? w?.idServer) === idServer);
    if (idx >= 0) {
      warehouses[idx] = { ...warehouses[idx], ...item };
    } else {
      warehouses.push(item);
    }
    const payload = { success: true, data: { warehouses }, message: '' };
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), { encoding: 'utf8' });
    return res.json({ ok: true, path: filePath, count: warehouses.length });
  } catch (err) {
    console.error('[file_manager] upsert error:', err && err.message ? err.message : err);
    return res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
  }
});

app.get('/health', (req, res) => res.json({ ok: true }));

// ===== Product endpoints =====

// Merge (append/upsert) all products by id_server (fallback to id)
app.post('/api/dummy/products', async (req, res) => {
  try {
    const incoming = Array.isArray(req.body?.products) ? req.body.products : [];
    const filePath = getProductDummyPath();
    let existing = [];
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, { encoding: 'utf8' });
        const json = raw ? JSON.parse(raw) : { success: true, data: { products: [] }, message: '' };
        existing = Array.isArray(json?.data?.products) ? json.data.products : [];
      } catch {}
    }
    const byId = new Map();
    for (const p of existing) {
      const id = (p?.id_server ?? p?.id);
      if (id !== undefined && id !== null) byId.set(id, p);
    }
    for (const p of incoming) {
      const id = (p?.id_server ?? p?.id);
      if (id === undefined || id === null) continue;
      const prev = byId.get(id) || {};
      byId.set(id, { ...prev, ...p });
    }
    const merged = Array.from(byId.values());
    const payload = { success: true, data: { products: merged }, message: '' };
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), { encoding: 'utf8' });
    return res.json({ ok: true, path: filePath, count: merged.length, added: incoming.length, mode: 'merge' });
  } catch (err) {
    console.error('[file_manager] product write error:', err && err.message ? err.message : err);
    return res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
  }
});

// Read all products
app.get('/api/dummy/products', async (req, res) => {
  try {
    const filePath = getProductDummyPath();
    if (!fs.existsSync(filePath)) {
      return res.json({ success: true, data: { products: [] }, message: '' });
    }
    const raw = fs.readFileSync(filePath, { encoding: 'utf8' });
    if (!raw || raw.trim() === '') {
      return res.json({ success: true, data: { products: [] }, message: '' });
    }
    const json = JSON.parse(raw);
    return res.json(json);
  } catch (err) {
    console.error('[file_manager] product read error:', err && err.message ? err.message : err);
    return res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
  }
});

// Upsert single product by id_server (fallback to id)
app.post('/api/dummy/product', async (req, res) => {
  try {
    const item = req.body || {};
    const prodId = item && (item.id_server ?? item.id);
    if (prodId === undefined || prodId === null) {
      return res.status(400).json({ ok: false, error: 'id_server is required' });
    }
    const filePath = getProductDummyPath();
    let products = [];
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, { encoding: 'utf8' });
        const json = raw ? JSON.parse(raw) : { success: true, data: { products: [] }, message: '' };
        products = Array.isArray(json?.data?.products) ? json.data.products : [];
      } catch {}
    }
    const idx = products.findIndex(p => ((p?.id_server ?? p?.id) === prodId));
    if (idx >= 0) {
      products[idx] = { ...products[idx], ...item };
    } else {
      products.push(item);
    }
    const payload = { success: true, data: { products }, message: '' };
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), { encoding: 'utf8' });
    return res.json({ ok: true, path: filePath, count: products.length });
  } catch (err) {
    console.error('[file_manager] product upsert error:', err && err.message ? err.message : err);
    return res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`[file_manager] listening on http://localhost:${PORT}`);
});
