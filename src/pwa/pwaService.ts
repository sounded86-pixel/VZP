import { HelpItem, WebhookConfig } from './types';

// Storage keys
const WEBHOOK_STORAGE_KEY = 'vzaimo_webhook_config';
const NOTIFICATION_DISMISSED_KEY = 'vzaimo_push_dismissed';

// Global deferred prompt for PWA installation
let deferredInstallPrompt: any = null;

// Setup install prompt listener
export function initInstallPromptListener(onCanInstall: () => void) {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    onCanInstall();
  });
}

// Trigger browser PWA install dialog
export async function promptPwaInstall(): Promise<boolean> {
  if (!deferredInstallPrompt) {
    return false;
  }
  try {
    deferredInstallPrompt.prompt();
    const choiceResult = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    return choiceResult.outcome === 'accepted';
  } catch (err) {
    console.warn('Install prompt error:', err);
    return false;
  }
}

// Check if app is running in standalone mode (already installed)
export function isRunningStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

// Push notification support check
export function isPushNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

// Get current push permission status
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission;
}

// Request Push Notification permission with user village tagging
export async function requestPushPermission(villageName?: string): Promise<boolean> {
  if (!isPushNotificationSupported()) return false;

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Show confirmation notification
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        reg.showNotification('Уведомления включены! ✅', {
          body: villageName
            ? `Вы будете первыми узнавать о новых просьбах в: ${villageName}`
            : 'Вы будете получать важные оповещения о взаимопомощи.',
          icon: '/icon-192.png',
          badge: '/icon-192.png'
        });
      }

      // OneSignal tag integration if OneSignal is present
      if ((window as any).OneSignal) {
        try {
          (window as any).OneSignal.push(() => {
            (window as any).OneSignal.setExternalUserId?.(Date.now().toString());
            if (villageName) {
              (window as any).OneSignal.sendTags({
                village: villageName,
                notification_preference: 'all'
              });
            }
          });
        } catch (e) {
          console.warn('OneSignal tag error:', e);
        }
      }

      return true;
    }
    return false;
  } catch (error) {
    console.warn('Notification permission error:', error);
    return false;
  }
}

// Dismiss notification prompt
export function dismissPushPrompt() {
  localStorage.setItem(NOTIFICATION_DISMISSED_KEY, 'true');
}

export function isPushPromptDismissed(): boolean {
  return localStorage.getItem(NOTIFICATION_DISMISSED_KEY) === 'true';
}

// Webhook config management (Make.com, n8n, Google Sheets, Airtable)
export function getWebhookConfig(): WebhookConfig {
  try {
    const raw = localStorage.getItem(WEBHOOK_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse webhook config');
  }
  return {
    url: '',
    enabled: false
  };
}

export function saveWebhookConfig(config: WebhookConfig) {
  localStorage.setItem(WEBHOOK_STORAGE_KEY, JSON.stringify(config));
}

// Send item to external webhook (Make.com / n8n / Zapier / Google Apps Script)
export async function dispatchToWebhook(item: HelpItem): Promise<boolean> {
  const config = getWebhookConfig();
  if (!config.enabled || !config.url) {
    return false;
  }

  const payload = {
    source: 'vzaimopomosh_pwa',
    timestamp: new Date(item.createdAt).toISOString(),
    event: 'new_entry',
    data: {
      id: item.id,
      type: item.type === 'request' ? 'Нужна помощь' : 'Могу помочь',
      typeCode: item.type,
      category: item.category,
      settlement: item.settlement,
      description: item.description,
      author: item.author,
      phone: item.phone,
      telegram: item.telegram || '',
      whatsapp: item.whatsapp || '',
      status: item.status
    }
  };

  try {
    // Attempt webhook POST (using no-cors if needed for Google Apps Script or standard POST for Make/n8n)
    await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    // Update lastSent
    saveWebhookConfig({ ...config, lastSent: Date.now() });
    return true;
  } catch (err) {
    console.warn('Webhook dispatch info:', err);
    // Don't fail the user action if external webhook endpoint has CORS or is offline
    return false;
  }
}

// Share item via Web Share API or copy link to clipboard
export async function shareHelpItem(item: HelpItem): Promise<{ method: 'share' | 'clipboard'; success: boolean }> {
  const title = item.type === 'request' ? `🆘 Нужна помощь в с. ${item.settlement}` : `🤝 Могу помочь в с. ${item.settlement}`;
  const text = `${title}\n${item.description}\nКонтакты: ${item.phone} (${item.author})\nПриложение: Взаимопомощь`;

  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url: window.location.origin
      });
      return { method: 'share', success: true };
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        console.warn('Share error:', e);
      }
    }
  }

  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(text);
    return { method: 'clipboard', success: true };
  } catch (e) {
    console.warn('Clipboard write error:', e);
    return { method: 'clipboard', success: false };
  }
}
