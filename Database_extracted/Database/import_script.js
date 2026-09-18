const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, GeoPoint } = require('firebase-admin/firestore');
const fs = require('fs');

const serviceAccount = require('./config.json');
const data = JSON.parse(fs.readFileSync('./database.json', 'utf8'));

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

function transform(val) {
    if (val === null || val === undefined) return val;
    if (typeof val === 'object') {
        if (val.__datatype__ === 'timestamp') {
            return new Timestamp(val.value._seconds, val.value._nanoseconds);
        }
        if (val.__datatype__ === 'geopoint') {
            return new GeoPoint(val.value._latitude, val.value._longitude);
        }
        if (Array.isArray(val)) {
            return val.map(transform);
        }
        const res = {};
        for (const k of Object.keys(val)) {
            if (k === '__collections__') continue;
            res[k] = transform(val[k]);
        }
        return res;
    }
    return val;
}

async function importCollection(colRef, colData) {
    for (const docId of Object.keys(colData)) {
        const rawDocData = colData[docId];
        const docRef = colRef.doc(docId);
        const transformed = transform(rawDocData);
        await docRef.set(transformed, { merge: true });
        console.log(`Imported doc: ${colRef.path}/${docId}`);

        if (rawDocData.__collections__) {
            for (const subColName of Object.keys(rawDocData.__collections__)) {
                await importCollection(docRef.collection(subColName), rawDocData.__collections__[subColName]);
            }
        }
    }
}

async function run() {
    const rootCollections = data.__collections__ || {};
    for (const colName of Object.keys(rootCollections)) {
        console.log(`Starting collection: ${colName}`);
        await importCollection(db.collection(colName), rootCollections[colName]);
    }
    console.log("Database import finished successfully!");
}

run().catch(err => {
    console.error("Import error:", err);
    process.exit(1);
});
