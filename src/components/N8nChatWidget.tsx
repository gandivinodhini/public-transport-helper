import React, { useEffect } from 'react';

declare global {
  interface Window {
    _n8nChatInitialized?: boolean;
    _openN8nChat?: () => void;
  }
}

export const N8nChatWidget: React.FC = () => {
  useEffect(() => {
    if (window._n8nChatInitialized) return;

    const initN8nChat = async () => {
      try {
        // Dynamically import official n8n chat ES module bundle
        // @ts-ignore
        const { createChat } = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js');

        createChat({
          webhookUrl: 'https://vinodhinigandi.app.n8n.cloud/webhook/63447486-08b3-4d54-b2d2-92d603749124/chat',
          webhookConfig: {
            headers: {
              'X-Instance-Id': '4bcb533f4bb552b83720acd62438c63fdcd25edeb0e0c141e4fd0aca70e7ebe4',
            },
          },
          mode: 'window',
          showWelcomeScreen: false,
          loadPreviousSession: true,
          initialMessages: [
            'Hi there! 👋',
            'My name is Nathan, your TransitMate AI Assistant. How can I help with your routes, stops, or travel questions today?',
          ],
          i18n: {
            en: {
              title: 'TransitMate AI Assistant',
              subtitle: 'Nathan • Powered by n8n',
              footer: '',
              getStarted: 'New Conversation',
              inputPlaceholder: 'Ask Nathan about routes, bus lines, delays...',
              closeButtonTooltip: 'Minimize Assistant',
            },
          },
          enableStreaming: false,
        });

        window._n8nChatInitialized = true;
      } catch (err) {
        console.warn('Could not initialize n8n chat widget:', err);
      }
    };

    initN8nChat();
  }, []);

  return (
    <style>{`
      /* Custom theme styling for n8n floating chat */
      :root {
        --chat--color-primary: #2563EB;
        --chat--color-primary-shade-50: #1D4ED8;
        --chat--color-primary-shade-100: #1E40AF;
        --chat--color-white: #FFFFFF;
        --chat--color-light: #F8FAFC;
        --chat--color-dark: #0F172A;
      }
      .chat-window {
        z-index: 9999 !important;
        font-family: inherit !important;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
        border-radius: 1.5rem !important;
        overflow: hidden !important;
      }
      .chat-toggle {
        z-index: 9998 !important;
        background-color: #2563EB !important;
        box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.4) !important;
        transition: transform 0.2s ease, box-shadow 0.2s ease !important;
      }
      .chat-toggle:hover {
        transform: scale(1.08) !important;
        box-shadow: 0 14px 20px -3px rgba(37, 99, 235, 0.5) !important;
      }
      .chat-header {
        background: linear-gradient(135deg, #1E40AF, #2563EB) !important;
      }
    `}</style>
  );
};

// Global helper to trigger or focus the n8n chat toggle button
export const openN8nChat = () => {
  const toggleBtn = document.querySelector('.chat-toggle') as HTMLElement | null;
  if (toggleBtn) {
    toggleBtn.click();
  }
};
