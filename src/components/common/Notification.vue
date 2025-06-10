<template>
  <transition name="notification-fade">
    <div 
      v-if="show"
      :class="[
        'fixed z-50 p-4 rounded-lg shadow-lg flex items-center max-w-md',
        'transform transition-all duration-300',
        positionClass,
        typeClasses
      ]"
    >
      <div class="flex-shrink-0 mr-3">
        <i :class="iconClass"></i>
      </div>
      <div class="flex-1">
        <p v-if="title" class="font-medium">{{ title }}</p>
        <p class="text-sm">{{ message }}</p>
      </div>
      <div class="ml-3 flex-shrink-0">
        <button 
          @click="close"
          class="text-sm focus:outline-none"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </transition>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'Notification',
  props: {
    type: {
      type: String,
      default: 'info',
      validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
    },
    message: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    duration: {
      type: Number,
      default: 5000
    },
    position: {
      type: String,
      default: 'top-right',
      validator: (value) => ['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'].includes(value)
    },
    autoClose: {
      type: Boolean,
      default: true
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const show = ref(true)
    let timer = null

    const typeClasses = computed(() => {
      switch (props.type) {
        case 'success':
          return 'bg-green-50 text-green-800 border border-green-200'
        case 'error':
          return 'bg-red-50 text-red-800 border border-red-200'
        case 'warning':
          return 'bg-yellow-50 text-yellow-800 border border-yellow-200'
        case 'info':
        default:
          return 'bg-blue-50 text-blue-800 border border-blue-200'
      }
    })

    const iconClass = computed(() => {
      switch (props.type) {
        case 'success':
          return 'fas fa-check-circle text-green-500'
        case 'error':
          return 'fas fa-exclamation-circle text-red-500'
        case 'warning':
          return 'fas fa-exclamation-triangle text-yellow-500'
        case 'info':
        default:
          return 'fas fa-info-circle text-blue-500'
      }
    })

    const positionClass = computed(() => {
      switch (props.position) {
        case 'top-left':
          return 'top-4 left-4'
        case 'bottom-right':
          return 'bottom-4 right-4'
        case 'bottom-left':
          return 'bottom-4 left-4'
        case 'top-center':
          return 'top-4 left-1/2 -translate-x-1/2'
        case 'bottom-center':
          return 'bottom-4 left-1/2 -translate-x-1/2'
        case 'top-right':
        default:
          return 'top-4 right-4'
      }
    })

    const close = () => {
      show.value = false
      setTimeout(() => {
        emit('close')
      }, 300) // Wait for transition to complete
    }

    onMounted(() => {
      if (props.autoClose && props.duration > 0) {
        timer = setTimeout(() => {
          close()
        }, props.duration)
      }
    })

    onUnmounted(() => {
      if (timer) {
        clearTimeout(timer)
      }
    })

    return {
      show,
      close,
      typeClasses,
      iconClass,
      positionClass
    }
  }
}
</script>

<style scoped>
.notification-fade-enter-active,
.notification-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.notification-fade-enter-from,
.notification-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
