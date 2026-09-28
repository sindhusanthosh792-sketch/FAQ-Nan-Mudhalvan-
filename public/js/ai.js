// AI Chatbot Assistant Interface Logic

document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const clearChatBtn = document.getElementById('clear-chat-btn');

  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const userText = chatInput.value.trim();
      if (userText) {
        handleUserQuery(userText);
        chatInput.value = '';
      }
    });
  }

  if (clearChatBtn) {
    clearChatBtn.addEventListener('click', () => {
      clearChatHistory();
    });
  }
});

function sendQuickPrompt(promptText) {
  const chatInput = document.getElementById('chat-input');
  if (chatInput) {
    chatInput.value = promptText;
  }
  handleUserQuery(promptText);
}

async function handleUserQuery(questionText) {
  const messagesContainer = document.getElementById('chat-messages');
  if (!messagesContainer) return;

  // 1. Append User Bubble
  appendMessageBubble('user', questionText);
  scrollToBottom(messagesContainer);

  // 2. Show Typing Indicator Bubble
  const typingId = 'typing-' + Date.now();
  appendTypingIndicator(typingId);
  scrollToBottom(messagesContainer);

  try {
    const res = await apiCall('/ai/ask', {
      method: 'POST',
      body: { question: questionText }
    });

    // Remove Typing Indicator
    removeTypingIndicator(typingId);

    if (res.found) {
      let assistantMsg = `<div>${res.faq.answer}</div>`;

      // Related questions if any
      if (res.related && res.related.length > 0) {
        assistantMsg += `<div class="mt-3 pt-2 border-top small text-muted"><strong>Related FAQs:</strong><ul class="mb-0 mt-1 ps-3">`;
        res.related.forEach(rel => {
          assistantMsg += `<li><a href="#" onclick="sendQuickPrompt('${escapeHtml(rel.question)}'); return false;" class="text-primary text-decoration-none">${rel.question}</a></li>`;
        });
        assistantMsg += `</ul></div>`;
      }

      appendMessageBubble('assistant', assistantMsg, {
        category: res.faq.category ? res.faq.category.name : 'Matched FAQ',
        confidence: res.confidence
      });
    } else {
      appendMessageBubble('assistant', res.message, {
        category: 'Answer Not Found',
        confidence: null
      });
    }

    scrollToBottom(messagesContainer);
  } catch (err) {
    removeTypingIndicator(typingId);
    appendMessageBubble('assistant', `⚠️ Error communicating with AI FAQ server: ${err.message}`, {
      category: 'System Error',
      confidence: null
    });
    scrollToBottom(messagesContainer);
  }
}

function appendMessageBubble(sender, content, meta = {}) {
  const messagesContainer = document.getElementById('chat-messages');
  if (!messagesContainer) return;

  const bubbleDiv = document.createElement('div');
  const isUser = sender === 'user';
  bubbleDiv.className = `chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-assistant'}`;

  let badgeHtml = '';
  if (!isUser && meta.category) {
    const isErrorOrNotFound = meta.category.includes('Not Found') || meta.category.includes('Error');
    const badgeColor = isErrorOrNotFound ? 'bg-danger text-white' : 'bg-primary-subtle text-primary';
    const confHtml = meta.confidence ? `<span class="ms-2 opacity-75"><i class="fas fa-check-circle text-success me-1"></i>Match Confidence: ${meta.confidence}</span>` : '';
    badgeHtml = `<div class="mb-2"><span class="badge ${badgeColor}">${meta.category}</span> ${confHtml}</div>`;
  }

  bubbleDiv.innerHTML = `
    ${badgeHtml}
    <div>${content}</div>
    <div class="text-end mt-1" style="font-size: 0.7rem; opacity: 0.7;">
      ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </div>
  `;

  messagesContainer.appendChild(bubbleDiv);
}

function appendTypingIndicator(id) {
  const messagesContainer = document.getElementById('chat-messages');
  if (!messagesContainer) return;

  const typingDiv = document.createElement('div');
  typingDiv.id = id;
  typingDiv.className = 'chat-bubble chat-bubble-assistant text-muted py-3';
  typingDiv.innerHTML = `
    <div class="d-flex align-items-center gap-2">
      <div class="spinner-grow spinner-grow-sm text-primary" role="status"></div>
      <div class="spinner-grow spinner-grow-sm text-primary" style="animation-delay: 0.2s" role="status"></div>
      <div class="spinner-grow spinner-grow-sm text-primary" style="animation-delay: 0.4s" role="status"></div>
      <span class="ms-2 small">AI Assistant is analyzing FAQ database...</span>
    </div>
  `;
  messagesContainer.appendChild(typingDiv);
}

function removeTypingIndicator(id) {
  const elem = document.getElementById(id);
  if (elem) elem.remove();
}

function clearChatHistory() {
  const messagesContainer = document.getElementById('chat-messages');
  if (!messagesContainer) return;

  messagesContainer.innerHTML = `
    <div class="chat-bubble chat-bubble-assistant">
      <div class="mb-2"><span class="badge bg-success-subtle text-success">System Reset</span></div>
      Hello! I am your <strong>AI FAQ Assistant</strong>. I am trained on your institution's FAQ dataset. How can I assist you today?
    </div>
  `;
}

function scrollToBottom(elem) {
  elem.scrollTop = elem.scrollHeight;
}

function escapeHtml(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
