const { db } = require('../firebase');

const COLLECTION = 'menu';

async function fetchAllMenuItems() {
  const snapshot = await db.collection(COLLECTION).orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function addMenuItemToDB(itemData) {
  const docRef = await db.collection(COLLECTION).add({
    ...itemData,
    createdAt: new Date().toISOString()
  });
  const doc = await docRef.get();
  return { id: doc.id, ...doc.data() };
}

async function updateMenuItemInDB(itemId, updates) {
  const docRef = db.collection(COLLECTION).doc(itemId);
  const doc = await docRef.get();
  if (!doc.exists) throw new Error('Menu item not found');
  await docRef.update({ ...updates, updatedAt: new Date().toISOString() });
  const updated = await docRef.get();
  return { id: updated.id, ...updated.data() };
}

async function deleteMenuItemFromDB(itemId) {
  const docRef = db.collection(COLLECTION).doc(itemId);
  const doc = await docRef.get();
  if (!doc.exists) throw new Error('Menu item not found');
  await docRef.delete();
  return { id: itemId };
}

module.exports = {
  fetchAllMenuItems,
  addMenuItemToDB,
  updateMenuItemInDB,
  deleteMenuItemFromDB
};
