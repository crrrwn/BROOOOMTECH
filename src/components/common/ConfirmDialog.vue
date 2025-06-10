<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click="handleBackdropClick"
  >
    <div
      class="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-200 scale-100"
      @click.stop
    >
      <!-- Header -->
      <div class="p-6 pb-4">
        <div class="flex items-center space-x-3">
          <div :class="iconClass">
            <i :class="iconName" class="text-xl"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">
            {{ title }}
          </h3>
        </div>
      </div>
      
      <!-- Content -->
      <div class="px-6 pb-6">
        <p class="text-gray-600 leading-relaxed">
          {{ message }}
        </p>
      </div>
      
      <!-- Actions -->
      <div class="px-6 pb-6 flex space-x-3 justify-end">
        <button
          @click="handleCancel"
          class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200"
        >
          {{ cancelText }}
        </button>
        <button
          @click="handleConfirm"
          :class="confirmButtonClass"
          class="px-4 py-2 rounded-lg font-medium transition-colors duration-200"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'ConfirmDialog',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Confirm Action'
    },
    message: {
      type: String,
      default: 'Are you sure you want to proceed?'
    },
    confirmText: {
      type: String,
      default: 'Confirm'
    },
    cancelText: {
      type: String,
      default: 'Cancel'
    },
    type: {
      type: String,
      default: 'warning', // warning, danger, info, success
      validator: (value) => ['warning', 'danger', 'info', 'success'].includes(value)
    },
    closeOnBackdrop: {
      type: Boolean,
      default: true
    }
  },
  emits: ['confirm', 'cancel', 'close'],
  setup(props, { emit }) {
    const iconClass = computed(() => {
      const classes = {
        warning: 'w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center',
        danger: 'w-10 h-10 bg-red-100 rounded-full flex items-center justify-center',
        info: 'w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center',
        success: 'w-10 h-10 bg-green-100 rounded-full flex items-center justify-center'
      }
      return classes[props.type]
    })
    
    const iconName = computed(() => {
      const icons = {
        warning: 'fas fa-exclamation-triangle text-yellow-600',
        danger: 'fas fa-trash-alt text-red-600',
        info: 'fas fa-info-circle text-blue-600',
        success: 'fas fa-check-circle text-green-600'
      }
      return icons[props.type]
    })
    
    const confirmButtonClass = computed(() => {
      const classes = {
        warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
        danger: 'bg-red-600 hover:bg-red-700 text-white',
        info: 'bg-blue-600 hover:bg-blue-700 text-white',
        success: 'bg-green-600 hover:bg-green-700 text-white'
      }
      return classes[props.type]
    })
    
    const handleConfirm = () => {
      emit('confirm')
      emit('close')
    }
    
    const handleCancel = () => {
      emit('cancel')
      emit('close')
    }
    
    const handleBackdropClick = () => {
      if (props.closeOnBackdrop) {
        handleCancel()
      }
    }
    
    return {
      iconClass,
      iconName,
      confirmButtonClass,
      handleConfirm,
      handleCancel,
      handleBackdropClick
    }
  }
}
</script>
