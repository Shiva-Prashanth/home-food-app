const { db } = require('../firebase');
const { FieldValue } = require('firebase-admin/firestore');

let cachedStatus = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5000;

const timeMap = {
  low: "20–30 mins",
  medium: "30–45 mins",
  high: "45–60 mins"
};

const getStatusInternal = async () => {
    const now = Date.now();
    if (cachedStatus && (now - lastFetchTime < CACHE_DURATION)) {
        return { status: cachedStatus, estimatedTime: timeMap[cachedStatus] };
    }

    try {
        const docRef = db.collection('settings').doc('kitchenStatus');
        const doc = await docRef.get();

        if (!doc.exists) {
            const defaultData = { status: "low", updatedAt: FieldValue.serverTimestamp() };
            await docRef.set(defaultData);
            cachedStatus = "low";
            lastFetchTime = Date.now();
            return { status: "low", estimatedTime: timeMap["low"] };
        }

        cachedStatus = doc.data().status || "low";
        lastFetchTime = Date.now();
        return { status: cachedStatus, estimatedTime: timeMap[cachedStatus] || "20-30 mins" };
    } catch (err) {
        console.error("Error internally fetching kitchen status:", err);
        throw err;
    }
};

const getStatus = async (req, res) => {
    try {
        const data = await getStatusInternal();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error while fetching kitchen status' });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['low', 'medium', 'high'];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid config. Status must be low, medium, or high.' });
        }

        const docRef = db.collection('settings').doc('kitchenStatus');
        await docRef.set({
            status: status,
            updatedAt: FieldValue.serverTimestamp()
        }, { merge: true });

        cachedStatus = status;
        lastFetchTime = Date.now();

        res.status(200).json({ status, estimatedTime: timeMap[status] });
    } catch (error) {
        console.error("Error updating kitchen status:", error);
        res.status(500).json({ error: 'Internal server error while updating kitchen status' });
    }
};

module.exports = {
    getStatus,
    updateStatus,
    getStatusInternal
};
