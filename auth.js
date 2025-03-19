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
    getStorage,
    ref as storageRef
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-storage.js";
import {
    PhoneAuthProvider,
    RecaptchaVerifier
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', function() {
    const auth = getAuth();

    onAuthStateChanged(auth, (user) => {
        if (!user) {
            if (!window.location.href.includes('login.html')) {
                window.location.href = 'login.html';
            }
        } else {
            if (window.location.href.includes('login.html')) {
                window.location.href = 'index.html';
            }
            updateUserUI(user);
        }
    });

    initAuthListeners();

    const recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
        'size': 'normal',
        'callback': (response) => {},
        'expired-callback': () => {}
    });
});

function updateUserUI(user) {
    const userEmailElement = document.getElementById('user-email');
    if (userEmailElement) {
        userEmailElement.textContent = user.email;
    }

    const emailVerifiedElement = document.getElementById('email-verified');
    if (emailVerifiedElement) {
        if (user.emailVerified) {
            emailVerifiedElement.textContent = 'Email vérifié';
            emailVerifiedElement.classList.add('verified');
            emailVerifiedElement.classList.remove('not-verified');
        } else {
            emailVerifiedElement.textContent = 'Email non vérifié';
            emailVerifiedElement.classList.add('not-verified');
            emailVerifiedElement.classList.remove('verified');

            const verifyEmailButton = document.getElementById('verify-email-button');
            if (verifyEmailButton) {
                verifyEmailButton.style.display = 'block';
                verifyEmailButton.addEventListener('click', () => {
                    sendEmailVerification(user)
                        .then(() => {
                            showMessage('Un email de vérification a été envoyé à votre adresse.', 'success');
                        })
                        .catch((error) => {
                            showMessage('Erreur lors de l\'envoi de l\'email de vérification.', 'error');
                            console.error('Erreur:', error);
                        });
                });
            }
        }
    }
}

function initAuthListeners() {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            const auth = getAuth();
            signOut(auth)
                .then(() => {
                    console.log('Déconnexion réussie');
                    window.location.href = 'login.html';
                })
                .catch((error) => {
                    console.error('Erreur de déconnexion:', error);
                    showMessage('Erreur lors de la déconnexion.', 'error');
                });
        });
    }
}
const resetPasswordForm = document.getElementById('reset-password-form');
if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const auth = getAuth();
        const email = document.getElementById('reset-email').value;

        sendPasswordResetEmail(auth, email)
            .then(() => {
                showMessage('Un email de réinitialisation a été envoyé.', 'success');
            })
            .catch((error) => {
                console.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
                showMessage('Erreur lors de l\'envoi de l\'email de réinitialisation.', 'error');
            });
    });
}

function showMessage(message, type) {
    const messageContainer = document.getElementById('message-container');
    if (!messageContainer) {
        const newMessageContainer = document.createElement('div');
        newMessageContainer.id = 'message-container';
        newMessageContainer.style.position = 'fixed';
        newMessageContainer.style.top = '20px';
        newMessageContainer.style.right = '20px';
        newMessageContainer.style.zIndex = '9999';
        document.body.appendChild(newMessageContainer);
    }

    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.classList.add('message', type);
    messageContainer.appendChild(messageElement);

    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}

const db = getDatabase();

function updateUserData(userId, data) {
    set(ref(db, 'users/' + userId), data);
}

function listenToUserData(userId, callback) {
    const userRef = ref(db, 'users/' + userId);
    onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        callback(data);
    });
}

function logUserActivity(userId, activity) {
    const activityRef = ref(db, 'activities/' + userId);
    const newActivityRef = push(activityRef);
    set(newActivityRef, {
        timestamp: new Date().toISOString(),
        activity: activity
    });
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        logUserActivity(user.uid, 'Login');
    }
});
