import { reactive } from "vue"

// Create a unique ID for each notification
let notificationId = 0

// Create a reactive state to store notifications
const notifications = reactive([])

// Add a new notification
const notify = ({ type = "info", message, title = "", duration = 5000, position = "top-right" }) => {
  const id = ++notificationId

  // Add notification to the array
  notifications.push({
    id,
    type,
    message,
    title,
    duration,
    position,
  })

  // Auto-remove notification after duration
  if (duration > 0) {
    setTimeout(() => {
      removeNotification(id)
    }, duration)
  }

  return id
}

// Helper methods for different notification types
const success = (message, options = {}) => {
  return notify({ type: "success", message, ...options })
}

const error = (message, options = {}) => {
  return notify({ type: "error", message, ...options })
}

const warning = (message, options = {}) => {
  return notify({ type: "warning", message, ...options })
}

const info = (message, options = {}) => {
  return notify({ type: "info", message, ...options })
}

// Remove a notification by ID
const removeNotification = (id) => {
  const index = notifications.findIndex((notification) => notification.id === id)
  if (index !== -1) {
    notifications.splice(index, 1)
  }
}

export function useNotification() {
  return {
    notifications,
    notify,
    success,
    error,
    warning,
    info,
    removeNotification,
  }
}

// Create a singleton instance
export const notificationService = useNotification()
