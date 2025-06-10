<template>
  <div>
    <div 
      v-for="position in positions" 
      :key="position"
      :class="[
        'fixed z-50',
        positionClass(position)
      ]"
    >
      <Notification
        v-for="notification in getNotificationsByPosition(position)"
        :key="notification.id"
        :type="notification.type"
        :message="notification.message"
        :title="notification.title"
        :duration="notification.duration"
        :position="notification.position"
        @close="removeNotification(notification.id)"
      />
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { notificationService } from '@/composables/useNotification'
import Notification from './Notification.vue'

export default {
  name: 'NotificationContainer',
  components: {
    Notification
  },
  setup() {
    const { notifications, removeNotification } = notificationService
    
    const positions = ['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center']
    
    const getNotificationsByPosition = (position) => {
      return notifications.filter(notification => notification.position === position)
    }
    
    const positionClass = (position) => {
      switch (position) {
        case 'top-left':
          return 'top-0 left-0 p-4 flex flex-col space-y-2'
        case 'bottom-right':
          return 'bottom-0 right-0 p-4 flex flex-col-reverse space-y-reverse space-y-2'
        case 'bottom-left':
          return 'bottom-0 left-0 p-4 flex flex-col-reverse space-y-reverse space-y-2'
        case 'top-center':
          return 'top-0 left-1/2 transform -translate-x-1/2 p-4 flex flex-col space-y-2 items-center'
        case 'bottom-center':
          return 'bottom-0 left-1/2 transform -translate-x-1/2 p-4 flex flex-col-reverse space-y-reverse space-y-2 items-center'
        case 'top-right':
        default:
          return 'top-0 right-0 p-4 flex flex-col space-y-2'
      }
    }
    
    return {
      notifications,
      positions,
      getNotificationsByPosition,
      positionClass,
      removeNotification
    }
  }
}
</script>
