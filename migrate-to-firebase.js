// migrate-to-firebase.js
const fs = require('fs');
const admin = require('firebase-admin');

const serviceAccount = require('./serviceAccountKey.json'); // ضع ملف الخدمة هنا
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://bright-house-e1c41-default-rtdb.firebaseio.com/' // عدّل للـ DB url بتاعك
});

const db = admin.database();
const raw = JSON.parse(fs.readFileSync('./bright-house-e1c41-default-rtdb-export (2).json','utf8'));
const productsNode = raw.products || [];

function genId() { return '-' + Math.random().toString(36).substr(2,16); }

async function run(){
  const migrated = {};
  if (Array.isArray(productsNode)) {
    productsNode.forEach(item => {
      const key = (item.id && !/^prod\d+$/.test(item.id)) ? item.id : genId();
      migrated[key] = { ...item, id: key, images: item.images || (item.image ? [item.image] : []) };
    });
  } else {
    Object.keys(productsNode).forEach(k=>{
      const item = productsNode[k];
      if (!item || typeof item !== 'object') return;
      const originalId = item.id && String(item.id).trim() ? String(item.id).trim() : null;
      const key = (originalId && !/^prod\d+$/.test(originalId)) ? originalId : genId();
      migrated[key] = { ...item, id: key, images: item.images || (item.image ? [item.image] : []) };
    });
  }

  // Create backup of current /products node
  const backupRef = db.ref('backups/products-backup-' + Date.now());
  await backupRef.set(productsNode);
  console.log('Backup saved.');

  // Set migrated products (this will overwrite /products)
  await db.ref('products').set(migrated);
  console.log('Migration complete. Wrote', Object.keys(migrated).length, 'products.');
  process.exit(0);
}

run().catch(err=>{ console.error(err); process.exit(1); });
