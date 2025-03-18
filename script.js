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
    popup.classList.add('fade-out');
    setTimeout(() => {
      popup.style.display = 'none';
      popup.classList.remove('fade-out');
    }, 300);
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

function checkAuth() {
  const auth = window.firebase?.auth?.();
  if (auth) {
    auth.onAuthStateChanged((user) => {
      if (!user) {
        window.location.href = 'login.html';
      }
    });
  } else {
    const token = localStorage.getItem('authToken');
    if (!token) {
      window.location.href = 'login.html';
    }
  }
}

function logoutUser() {
  const auth = window.firebase?.auth?.();
  if (auth) {
    auth.signOut().then(() => {
      localStorage.removeItem('authToken');
      window.location.href = 'login.html';
    }).catch((error) => {
      console.error('Erreur de déconnexion :', error);
    });
  } else {
    localStorage.removeItem('authToken');
    window.location.href = 'login.html';
  }
}

function loadHistory() {
  const historyList = document.getElementById('history-list');
  const history = JSON.parse(localStorage.getItem('chatHistory')) || [];
  historyList.innerHTML = '';
  history.forEach((chat, index) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${chat.name || `Discussion ${index + 1}`}</span>`;
    li.dataset.index = index;
    li.addEventListener('click', () => loadChat(index));
    historyList.appendChild(li);
  });
}

function sendMessage() {
  const userInput = document.getElementById('user-input');
  const message = userInput.value.trim();
  if (!message) return;
  
  addMessageToChat('user', message);
  userInput.value = '';
  
  const chatBox = document.getElementById('chat-box');
  const previousMessages = Array.from(chatBox.children);
  let history = "Ceci est notre premier message";

  if (previousMessages.length > 0) {
    history = "Historique de notre discussion:";
    previousMessages.forEach((msgElement) => {
      const sender = msgElement.classList.contains('ai') ? 'Toi' : 'Moi';
      const msgContent = msgElement.textContent.trim();
      history += ` -${sender}: ${msgContent}`;
    });
  }

  const aiMessage = `Tu es une IA nommée Cosmos, créée par Noé Besançon en 2025. Voici l'historique de notre discussion: ${history}. Voici ma demande: ${message}`;
  
  fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer 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',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-specdec",
      messages: [{ role: "user", content: aiMessage }],
      max_tokens: 6000,
      stream: false
    })
  })
  .then(response => response.json())
  .then(data => {
    let generatedResponse = data.choices?.[0]?.message?.content?.trim() || "";
    if (generatedResponse) {
      generatedResponse = generatedResponse.replace(/<think>.*?<\/think>/g, '').replace(/\n/g, '<br>');
      addMessageToChat('ai', generatedResponse);
    }
  })
  .catch(error => console.error('Erreur:', error));
}

function addMessageToChat(sender, message) {
  const chatBox = document.getElementById('chat-box');
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', sender);
  messageElement.textContent = message;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}

window.addEventListener('load', () => {
  checkAuth();
  loadHistory();
  document.body.classList.add('fade-in');
  setTimeout(() => {
    document.body.classList.remove('fade-in');
  }, 500);
});

document.getElementById('logout-button')?.addEventListener('click', logoutUser);
