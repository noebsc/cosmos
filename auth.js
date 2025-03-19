// Firebase Authentication Helper
import { getAuth, signOut, onAuthStateChanged, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider, sendEmailVerification } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

// Vérifier si l'utilisateur est connecté à chaque chargement de page
document.addEventListener('DOMContentLoaded', function() {
    const auth = getAuth();
    
    // Vérifier l'état de l'authentification
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            // Si l'utilisateur n'est pas connecté et qu'on n'est pas sur la page de connexion
            if (!window.location.href.includes('login.html')) {
                window.location.href = 'login.html';
            }
        } else {
            // Si l'utilisateur est connecté et qu'on est sur la page de connexion
            if (window.location.href.includes('login.html')) {
                window.location.href = 'index.html';
            }
            
            // Mettre à jour l'interface utilisateur avec les informations de l'utilisateur
            updateUserUI(user);
        }
    });
    
    // Initialiser les écouteurs d'événements
    initAuthListeners();
});

// Mettre à jour l'interface utilisateur avec les informations de l'utilisateur
function updateUserUI(user) {
    // Ajouter l'email de l'utilisateur à l'interface si l'élément existe
    const userEmailElement = document.getElementById('user-email');
    if (userEmailElement) {
        userEmailElement.textContent = user.email;
    }
    
    // Vérifier si l'email est vérifié
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
            
            // Ajouter un bouton pour renvoyer l'email de vérification si nécessaire
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

// Initialiser les écouteurs d'événements pour l'authentification
function initAuthListeners() {
    // Bouton de déconnexion
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
    
    // Formulaire de modification d'email
    const updateEmailForm = document.getElementById('update-email-form');
    if (updateEmailForm) {
        updateEmailForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const auth = getAuth();
            const user = auth.currentUser;
            
            if (user) {
                const newEmail = document.getElementById('new-email').value;
                const password = document.getElementById('current-password-for-email').value;
                
                // Réauthentifier l'utilisateur avant de modifier l'email
                const credential = EmailAuthProvider.credential(user.email, password);
                
                reauthenticateWithCredential(user, credential)
                    .then(() => {
                        return updateEmail(user, newEmail);
                    })
                    .then(() => {
                        showMessage('Email mis à jour avec succès.', 'success');
                        updateEmailForm.reset();
                        updateUserUI(user);
                    })
                    .catch((error) => {
                        console.error('Erreur de mise à jour de l\'email:', error);
                        showMessage('Erreur lors de la mise à jour de l\'email.', 'error');
                    });
            }
        });
    }
    
    // Formulaire de modification de mot de passe
    const updatePasswordForm = document.getElementById('update-password-form');
    if (updatePasswordForm) {
        updatePasswordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const auth = getAuth();
            const user = auth.currentUser;
            
            if (user) {
                const currentPassword = document.getElementById('current-password').value;
                const newPassword = document.getElementById('new-password').value;
                const confirmPassword = document.getElementById('confirm-new-password').value;
                
                if (newPassword !== confirmPassword) {
                    showMessage('Les mots de passe ne correspondent pas.', 'error');
                    return;
                }
                
                // Réauthentifier l'utilisateur avant de modifier le mot de passe
                const credential = EmailAuthProvider.credential(user.email, currentPassword);
                
                reauthenticateWithCredential(user, credential)
                    .then(() => {
                        return updatePassword(user, newPassword);
                    })
                    .then(() => {
                        showMessage('Mot de passe mis à jour avec succès.', 'success');
                        updatePasswordForm.reset();
                    })
                    .catch((error) => {
                        console.error('Erreur de mise à jour du mot de passe:', error);
                        showMessage('Erreur lors de la mise à jour du mot de passe.', 'error');
                    });
            }
        });
    }
}

// Afficher un message à l'utilisateur
function showMessage(message, type) {
    const messageContainer = document.getElementById('message-container');
    if (!messageContainer) {
        // Créer un conteneur de message s'il n'existe pas
        const newMessageContainer = document.createElement('div');
        newMessageContainer.id = 'message-container';
        newMessageContainer.style.position = 'fixed';
        newMessageContainer.style.top = '20px';
        newMessageContainer.style.right = '20px';
        newMessageContainer.style.zIndex = '9999';
        document.body.appendChild(newMessageContainer);
        
        // Utiliser le nouveau conteneur
        showMessage(message, type);
        return;
    }
    
    // Créer l'élément de message
    const messageElement = document.
