import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
    getAuth,
    signOut,
    onAuthStateChanged,
    updateEmail,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    sendEmailVerification,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import {
    getDatabase,
    ref,
    set,
    onValue,
    push
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";
import {
    getStorage
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-storage.js";

// 🔥 Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAF2d6Z6AGVpbs_MySepZ55zkSp4x5JmII",
    authDomain: "cosmos-fr.firebaseapp.com",
    databaseURL: "https://cosmos-fr-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "cosmos-fr",
    storageBucket: "cosmos-fr.firebasestorage.app",
    messagingSenderId: "480509265804",
    appId: "1:480509265804:web:e55805b53401a209a4f8a9",
    measurementId: "G-VKK7HMCCJS"
};

// ✅ Initialisation Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

// ✅ Vérifier l'état de connexion
onAuthStateChanged(auth, (user) => {
    console.log("🔍 Vérification de l'auth :", user);
    
    if (!user) {
        // 🔥 Redirection vers login si l'utilisateur n'est pas connecté
        if (!window.location.href.includes('login.html')) {
            console.log("🚪 Redirection vers login...");
            window.location.href = 'login.html';
        }
    } else {
        // 🔄 Si l'utilisateur est sur login.html, on le redirige vers l'index
        if (window.location.href.includes('login.html')) {
            console.log("✅ Utilisateur connecté, redirection vers index.html...");
            window.location.href = 'index.html';
        }
        updateUserUI(user);
    }
});

// ✅ Initialiser Recaptcha (si présent dans la page)
document.addEventListener('DOMContentLoaded', function() {
    const recaptchaContainer = document.getElementById('recaptcha-container');
    if (recaptchaContainer) {
        new RecaptchaVerifier(recaptchaContainer, {
            'size': 'normal',
            'callback': (response) => {},
            'expired-callback': () => {}
        });
    }
});

// ✅ Mettre à jour l'interface utilisateur avec les infos Firebase
function updateUserUI(user) {
    const userEmailElement = document.getElementById('user-email');
    if (userEmailElement) {
        userEmailElement.textContent = user.email;
    }

    const emailVerifiedElement = document.getElementById('email-verified');
    if (emailVerifiedElement) {
        emailVerifiedElement.textContent = user.emailVerified ? '✔️ Email vérifié' : '❌ Email non vérifié';
        emailVerifiedElement.classList.toggle('verified', user.emailVerified);
        emailVerifiedElement.classList.toggle('not-verified', !user.emailVerified);
        
        // ✅ Vérifier si l'email doit être validé
        const verifyEmailButton = document.getElementById('verify-email-button');
        if (verifyEmailButton) {
            verifyEmailButton.style.display = user.emailVerified ? "none" : "block";
            
            if (!verifyEmailButton.dataset.listener) { // Évite d'ajouter plusieurs fois l'event
                verifyEmailButton.addEventListener('click', () => {
                    sendEmailVerification(user)
                        .then(() => showMessage('📧 Un email de vérification a été envoyé.', 'success'))
                        .catch((error) => {
                            console.error('Erreur lors de l\'envoi de l\'email de vérification:', error);
                            showMessage('❌ Erreur lors de l\'envoi de l\'email.', 'error');
                        });
                });
                verifyEmailButton.dataset.listener = "true"; // Marque que l'event est ajouté
            }
        }
    }
}

// ✅ Gestion de la déconnexion
function initAuthListeners() {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            signOut(auth)
                .then(() => {
                    console.log('🚪 Déconnexion réussie');
                    window.location.href = 'login.html';
                })
                .catch((error) => {
                    console.error('❌ Erreur de déconnexion:', error);
                    showMessage('Erreur lors de la déconnexion.', 'error');
                });
        });
    }
}

// ✅ Réinitialisation du mot de passe
const resetPasswordForm = document.getElementById('reset-password-form');
if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('reset-email').value;
        sendPasswordResetEmail(auth, email)
            .then(() => showMessage('📩 Un email de réinitialisation a été envoyé.', 'success'))
            .catch((error) => {
                console.error('❌ Erreur de réinitialisation:', error);
                showMessage('Erreur lors de l\'envoi de l\'email.', 'error');
            });
    });
}

// ✅ Fonction pour afficher un message utilisateur
function showMessage(message, type) {
    const messageContainer = document.getElementById('message-container') || document.createElement('div');
    messageContainer.id = 'message-container';
    messageContainer.style.position = 'fixed';
    messageContainer.style.top = '20px';
    messageContainer.style.right = '20px';
    messageContainer.style.zIndex = '9999';
    document.body.appendChild(messageContainer);

    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.classList.add('message', type);
    messageContainer.appendChild(messageElement);

    setTimeout(() => messageElement.remove(), 3000);
}

// ✅ Enregistrer les activités des utilisateurs
function logUserActivity(userId, activity) {
    const activityRef = ref(db, 'activities/' + userId);
    const newActivityRef = push(activityRef);
    set(newActivityRef, {
        timestamp: new Date().toISOString(),
        activity: activity
    });
}

// 🔍 Suivre l'activité de connexion
onAuthStateChanged(auth, (user) => {
    if (user) {
        logUserActivity(user.uid, 'Login');
    }
});
