const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const serviceAccount = require('./config.json');
initializeApp({
    credential: cert(serviceAccount)
});

const auth = getAuth();

async function createAdminUser() {
    const email = 'admin@cut.com';
    const password = '123456';

    try {
        const user = await auth.getUserByEmail(email);
        console.log('User already exists in Firebase Auth:', user.uid);
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            const newUser = await auth.createUser({
                email: email,
                password: password,
                emailVerified: true,
            });
            console.log('Admin user created successfully in Firebase Auth with UID:', newUser.uid);
        } else {
            console.error('Error checking user:', error);
        }
    }
}

createAdminUser();
