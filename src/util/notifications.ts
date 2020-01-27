import icon from '../../images/icon-48.png'

/**
 * Register service worker and cache the result.
 */
let registrationCache: ServiceWorkerRegistration
async function registerNotifications(): Promise<ServiceWorkerRegistration | undefined> {
  const swName = 'sw.js'
  if (!('serviceWorker' in navigator)) {
    return
  }

  return registrationCache =
    registrationCache ||
    await navigator.serviceWorker.register(swName)
}

/**
 * Show a notification.
 */
export async function showNotification(
  message: string,
) {
  const registration = await registerNotifications()
  if (!registration) {
    return
  }

  if ('granted' === (await Notification.requestPermission())) {
    registration?.showNotification('Timer Done', {
      body: message,
      icon,
    })
  }
}