const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require('./config.json');
initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

async function fixAdminDoc() {
    const adminData = {
        email: 'admin@cut.com',
        name: 'cut',
        password: '123456',
        contactNumber: '',
        image: '',
        isDemo: false
    };

    // Set the specific UID document
    await db.collection('admin').doc('z5ioswtKusMBuD6e5KVYT2uOlvc2').set(adminData, { merge: true });
    console.log('Admin document successfully set for UID z5ioswtKusMBuD6e5KVYT2uOlvc2');
}

fixAdminDoc();
