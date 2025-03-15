
document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keydown', function(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

document.getElementById('settings-button').addEventListener('click', () => {
    const popup = document.getElementById('settings-popup');
    if (popup.style.display === 'block') {
      // Ajoutez une classe pour l'animation de fermeture
      popup.classList.add('fade-out');
      // Attendez la fin de l'animation pour masquer le pop-up
      setTimeout(() => {
        popup.style.display = 'none';
        popup.classList.remove('fade-out');
      }, 300); // Assurez-vous que ce délai correspond à la durée de votre animation
    } else {
      popup.style.display = 'block';
    }
  });

document.querySelector('.close-button').addEventListener('click', () => {
  document.getElementById('settings-popup').style.display = 'none';
});

document.getElementById('theme-select').addEventListener('change', function() {
  const theme = this.value;
  document.body.className = '';
  document.body.classList.add(theme + '-theme');
  localStorage.setItem('selectedTheme', theme);
});

function loadHistory() {
  const historyList = document.getElementById('history-list');
  const history = JSON.parse(localStorage.getItem('chatHistory')) || [];
  historyList.innerHTML = '';
  history.forEach((chat, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${chat.name || `Discussion ${index + 1}`}</span>
      <button class="rename-button">Renommer</button>
    `;
    li.dataset.index = index;
    li.querySelector('.rename-button').addEventListener('click', (event) => {
      event.stopPropagation();
      const newName = prompt('Nommez cette discussion :', chat.name || `Discussion ${index + 1}`);
      if (newName) {
        chat.name = newName;
        localStorage.setItem('chatHistory', JSON.stringify(history));
        loadHistory();
      }
    });
    li.addEventListener('click', () => loadChat(index));
    historyList.appendChild(li);
  });
}

function saveChat(name) {
  const chatBox = document.getElementById('chat-box');
  const messages = Array.from(chatBox.children).map(message => message.outerHTML);
  const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
  const existingChatIndex = chatHistory.findIndex(chat => chat.name === name);

  if (existingChatIndex !== -1) {
    chatHistory[existingChatIndex].messages = messages;
  } else {
    chatHistory.unshift({ name, messages });
  }

  localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  loadHistory();
}

function displayCode(code, language) {
  // Créez un élément <pre> et <code>
  const pre = document.createElement('pre');
  const codeElement = document.createElement('code');

  // Ajoutez la classe pour le langage spécifié
  codeElement.classList.add(`language-${language}`);

  // Ajoutez le code à l'élément <code>
  codeElement.textContent = code;

  // Ajoutez l'élément <code> à l'élément <pre>
  pre.appendChild(codeElement);

  // Ajoutez l'élément <pre> au corps du document ou à un conteneur spécifique
  document.body.appendChild(pre);

  // Re-appliquer la coloration syntaxique de Prism
  Prism.highlightElement(codeElement);
}


function loadChat(index) {
  const chatHistory = JSON.parse(localStorage.getItem('chatHistory'));
  const chat = chatHistory[index];
  const chatBox = document.getElementById('chat-box');
  chatBox.innerHTML = chat.messages.join('');
  chatBox.scrollTop = chatBox.scrollHeight; // Assurez-vous que le conteneur défile vers le bas
  document.getElementById('user-input').focus();
}

const forbiddenWords = [
    'abruti', 'andouille', 'bâtard', 'bouffon', 'connard', 'con', 'crétin', 'débile', 'enculé', 
    'fdp', 'grognasse', 'idiot', 'imbécile', 'merde', 'naze', 'pute', 'salopard', 'salope', 'tapette', 
    'abrutis', 'batards', 'bouffons', 'connards', 'cons', 'crétins', 'débiles', 'enculés', 'merdes', 
    'salopards', 'salopes', 'tapettes', 'fils de pute', 'ntm', 'pd', 'schlag', 'clochard', 'raclure',
    
    'asshole', 'bastard', 'bitch', 'cunt', 'dumbass', 'fuck', 'motherfucker', 'nigga', 'nigger', 
    'retard', 'shit', 'slut', 'whore', 'wanker', 'jerk', 'douchebag', 'moron', 'idiot', 'imbecile', 
    'prick', 'twat', 'loser', 'scumbag', 'dipshit', 'cracker', 'coon', 'spic', 'chink', 'gook', 'wetback', 
    'faggot', 'tranny', 'dyke','nigga','nigger','nazi','hitler','shoa','enculer','baiser','niquer','bite',
    'sucer','teub','teube','beteu','baise', 'putain'
  ]; // Liste des mots interdits

  function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
  
    // Vérifier si le message contient des mots interdits
    const containsForbiddenWord = forbiddenWords.some(word => message.includes(word));
    if (containsForbiddenWord) {
      alert('Votre message contient un mot interdit. Veillez à votre langage.');
    }
  
    if (message) {
      addMessageToChat('user', message);
      userInput.value = '';
  
      // Construire l'historique de la discussion
      const chatBox = document.getElementById('chat-box');
      const previousMessages = Array.from(chatBox.children);
      let history = "Ceci est notre premier message";
  
      if (previousMessages.length > 0) {
        history = "Historique de notre discussion:";
        previousMessages.forEach((msgElement, index) => {
          const sender = msgElement.classList.contains('ai') ? 'Toi' : 'Moi';
          const msgContent = msgElement.textContent.trim();
          history += ` -${sender}: ${msgContent}`;
        });
      }
  
      // Construire le message à envoyer à l'IA - Début de requête envoyée à COSMOS AI.
      const aiMessage = `Tu es une IA nommée Cosmos, créée par Noé Besançon en 2025. Réponds uniquement en français sauf si je te demande explicitement de parler une autre langue dans ma demande. Voici l'historique de notre discussion suivie de ma demande, pas besoin de rappeler notre ancienne discussion, utilise l'historique de notre discussion si besoin mais tu n'as pas besoin de tout le temps l'utiliser. Essaie de répondre simplement et avec seulement la réponse à ma demande. ${history}. Voici ma demande: ${message}`;
  
      // Appel à l'API IA pour générer la réponse - Envoi de la demande au serveur de Cosmos AI via une requête Groq.
      fetch('https://api.groq.com/openai/v1/chat/completions', { // Serveur Cosmos public, via Groq pour une requête rapide
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-specdec", // Utilisation du modèle llama70b en priorité pour une première analyse textuelle
          messages: [{ role: "user", content: aiMessage }],
          max_tokens: 6000,
          stream: false
        })
      })
      .then(response => response.json())
      .then(data => {
        // Supprimer le contenu entre <think> et </think>
        let generatedResponse = data.choices[0].message.content;
        generatedResponse = generatedResponse.replace(/<think>[\s\S]*?<\/think>/g, '');
  
        // Remplacer les sauts de ligne par des balises <br>
        generatedResponse = generatedResponse.replace(/\n/g, '<br>');
  
        // Ajouter la réponse de l'IA à la discussion
        addMessageToChat('ai', generatedResponse);
  
        // Sauvegarder la discussion
        const chatName = prompt("Nommez cette discussion :", `Discussion ${historyList.children.length + 1}`);
        saveChat(chatName);
      })
      .catch(error => {
        addMessageToChat('ai', "🟥 Les serveurs de Cosmos rencontrent des difficultés, veuillez réessayer plus tard.");
      });
    }
  }
  

  function addMessageToChat(sender, message) {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
  
    // On vérifie d'abord s'il y a des blocs de code dans le message
    if (message.includes('```')) {
      // Regex améliorée pour capturer tous les blocs de code, même ceux sans language spécifié
      const codeBlockRegex = /```([\w]*)\n?([\s\S]*?)```/g;
      let lastIndex = 0;
      let processedMessage = '';
      let match;
  
      while ((match = codeBlockRegex.exec(message)) !== null) {
        // Ajouter le texte avant le bloc de code (avec formatage standard)
        const textBeforeCode = message.substring(lastIndex, match.index);
        processedMessage += formatTextContent(textBeforeCode);
  
        // Extraire le langage et le code
        const language = match[1].trim() || 'plaintext';
        let code = match[2].trim();
  
        // Remplacer les balises <br> par des sauts de ligne
        code = code.replace(/<br\s*\/?>/gi, '\n');
  
        // Créer le bloc de code avec coloration syntaxique et bouton "Copier"
        const codeHTML = `
          <div class="code-block-container">
            <div class="code-header">
              ${language}
              <button class="copy-button" data-code="${escapeHTML(code)}">Copier</button>
            </div>
            <pre class="code-block"><code class="language-${language}">${escapeHTML(code)}</code></pre>
          </div>
        `;
  
        processedMessage += codeHTML;
        lastIndex = match.index + match[0].length;
      }
  
      // Ajouter le reste du texte après le dernier bloc de code
      const textAfterCode = message.substring(lastIndex);
      processedMessage += formatTextContent(textAfterCode);
  
      messageElement.innerHTML = processedMessage;
  
      // Appliquer Prism pour la coloration syntaxique
      messageElement.querySelectorAll('code').forEach(block => {
        Prism.highlightElement(block);
      });
  
      // Ajouter l'écouteur d'événement pour le bouton "Copier"
      messageElement.querySelectorAll('.copy-button').forEach(button => {
        button.addEventListener('click', () => {
          const codeToCopy = button.getAttribute('data-code');
          navigator.clipboard.writeText(codeToCopy).then(() => {
            alert('Code copié dans le presse-papiers !');
          }).catch(err => {
            console.error('Erreur lors de la copie : ', err);
          });
        });
      });
    } else {
      // Pas de code, juste formater le texte normalement
      messageElement.innerHTML = formatTextContent(message);
    }
  
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Assurez-vous que le conteneur défile vers le bas
  }
  
  // Fonction pour échapper les caractères HTML dans les blocs de code
  function escapeHTML(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  
  
  // Fonction pour échapper les caractères HTML dans les blocs de code
  function escapeHTML(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  
  // Fonction pour échapper les caractères HTML dans les blocs de code
  function escapeHTML(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  
  
  // Fonction pour échapper les caractères HTML dans les blocs de code
  function escapeHTML(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  
  
  // Fonction pour échapper les caractères HTML dans les blocs de code
  function escapeHTML(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  
  

// Fonction pour formater le texte normal (pas du code)
function formatTextContent(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/__(.+?)__/g, '<u>$1</u>')
    .replace(/\*(.+?)\*/g, '<i>$1</i>')
    .replace(/\n/g, '<br>');
}

// Fonction pour échapper les caractères HTML dans les blocs de code
function escapeHTML(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Charger l'historique au chargement de la page
window.addEventListener('load', () => {
  loadHistory();
  const selectedTheme = localStorage.getItem('selectedTheme') || 'light';
  document.body.classList.add(selectedTheme + '-theme');
  document.getElementById('theme-select').value = selectedTheme;
});

document.getElementById('newChatButton').addEventListener('click', function() {
  const chatBox = document.getElementById('chat-box');
  chatBox.innerHTML = '';
  document.getElementById('user-input').focus();
});

window.addEventListener('load', () => {
  const selectedTheme = localStorage.getItem('selectedTheme') || 'light';
  document.body.classList.add(selectedTheme + '-theme');
  document.getElementById('theme-select').value = selectedTheme;

  // Appliquer un effet de fondu
  document.body.classList.add('fade-in');
  setTimeout(() => {
    document.body.classList.remove('fade-in');
  }, 500); // Durée de l'effet de fondu en millisecondes
});
