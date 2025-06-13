<template>
  <div class="bg-white p-4 rounded-lg shadow">
    <h3 class="text-lg font-medium mb-2">{{ title }}</h3>
    <p class="text-sm text-gray-500 mb-4">{{ description }}</p>
    
    <div v-if="existingUrl" class="mb-4">
      <div class="relative">
        <img 
          :src="existingUrl" 
          alt="Uploaded photo" 
          class="w-full h-auto rounded-lg"
        />
        <div class="absolute bottom-0 left-0 right-0 bg-green-500 bg-opacity-80 text-white p-2 rounded-b-lg">
          <div class="flex items-center">
            <i class="fas fa-check-circle mr-2"></i>
            <span>Photo uploaded successfully</span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else>
      <div 
        v-if="previewUrl" 
        class="mb-4 relative"
      >
        <img 
          :src="previewUrl" 
          alt="Preview" 
          class="w-full h-auto rounded-lg"
        />
        <button 
          @click="clearPreview" 
          class="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div v-else class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <i class="fas fa-camera text-3xl text-gray-400 mb-2"></i>
        <p class="text-gray-500 mb-4">Take a photo or upload from your device</p>
        
        <div class="flex flex-col sm:flex-row justify-center gap-3">
          <button 
            @click="takePhoto" 
            class="btn-primary"
          >
            <i class="fas fa-camera mr-2"></i>
            Take Photo
          </button>
          
          <label class="btn-secondary cursor-pointer">
            <i class="fas fa-upload mr-2"></i>
            Upload Photo
            <input 
              type="file" 
              accept="image/*" 
              class="hidden" 
              @change="handleFileUpload"
            />
          </label>
        </div>
      </div>
      
      <div v-if="previewUrl" class="mt-4">
        <button 
          @click="uploadPhoto" 
          class="btn-primary w-full"
          :disabled="uploading"
        >
          <span v-if="uploading">
            <i class="fas fa-spinner fa-spin mr-2"></i>
            Uploading...
          </span>
          <span v-else>
            <i class="fas fa-cloud-upload-alt mr-2"></i>
            Upload Photo
          </span>
        </button>
      </div>
    </div>
    
    <!-- Camera modal -->
    <div v-if="showCamera" class="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
      <div class="bg-white rounded-lg w-full max-w-lg">
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-medium">Take Photo</h3>
          <button @click="closeCamera" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="relative">
          <video 
            ref="videoElement" 
            class="w-full h-auto"
            autoplay
            playsinline
          ></video>
          
          <div v-if="countdown > 0" class="absolute inset-0 flex items-center justify-center">
            <div class="w-24 h-24 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
              <span class="text-white text-5xl font-bold">{{ countdown }}</span>
            </div>
          </div>
        </div>
        
        <div class="p-4 flex justify-center">
          <button 
            @click="capturePhoto" 
            class="btn-primary"
          >
            <i class="fas fa-camera mr-2"></i>
            Capture
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onUnmounted } from 'vue'
import { notificationService } from '@/composables/useNotification'
import { useSupabase } from '@/composables/useSupabase'

export default {
  name: 'PhotoUploader',
  props: {
    title: {
      type: String,
      default: 'Upload Photo'
    },
    description: {
      type: String,
      default: 'Take a photo or upload from your device'
    },
    orderId: {
      type: [Number, String],
      required: true
    },
    type: {
      type: String,
      required: true,
      validator: (value) => ['pickup', 'delivery'].includes(value)
    },
    required: {
      type: Boolean,
      default: false
    },
    existingUrl: {
      type: String,
      default: ''
    }
  },
  emits: ['upload-success'],
  setup(props, { emit }) {
    const { supabase } = useSupabase()
    
    const previewUrl = ref('')
    const showCamera = ref(false)
    const videoElement = ref(null)
    const uploading = ref(false)
    const countdown = ref(0)
    
    let stream = null
    let photoBlob = null
    let photoMetadata = {}
    
    const takePhoto = async () => {
      try {
        // Check if browser supports getUserMedia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          notificationService.error('Your browser does not support camera access')
          return
        }
        
        showCamera.value = true
        
        // Wait for the DOM to update
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Get camera stream
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        })
        
        // Connect stream to video element
        if (videoElement.value) {
          videoElement.value.srcObject = stream
          videoElement.value.play()
        }
      } catch (error) {
        console.error('Error accessing camera:', error)
        notificationService.error('Failed to access camera')
        showCamera.value = false
      }
    }
    
    const capturePhoto = () => {
      // Start countdown
      countdown.value = 3
      
      const countdownInterval = setInterval(() => {
        countdown.value--
        
        if (countdown.value <= 0) {
          clearInterval(countdownInterval)
          
          // Capture photo after countdown
          setTimeout(() => {
            if (!videoElement.value || !stream) return
            
            // Create canvas to capture frame
            const canvas = document.createElement('canvas')
            canvas.width = videoElement.value.videoWidth
            canvas.height = videoElement.value.videoHeight
            
            const context = canvas.getContext('2d')
            context.drawImage(videoElement.value, 0, 0, canvas.width, canvas.height)
            
            // Get image as blob
            canvas.toBlob(async (blob) => {
              photoBlob = blob
              previewUrl.value = URL.createObjectURL(blob)
              
              // Get location if available
              try {
                const position = await getCurrentPosition()
                photoMetadata = {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  accuracy: position.coords.accuracy,
                  timestamp: new Date().toISOString()
                }
              } catch (error) {
                console.warn('Could not get location:', error)
                photoMetadata = {
                  timestamp: new Date().toISOString()
                }
              }
              
              closeCamera()
            }, 'image/jpeg', 0.95)
          }, 500)
        }
      }, 1000)
    }
    
    const closeCamera = () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
        stream = null
      }
      
      if (videoElement.value) {
        videoElement.value.srcObject = null
      }
      
      showCamera.value = false
    }
    
    const handleFileUpload = async (event) => {
      const file = event.target.files[0]
      if (!file) return
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        notificationService.error('Please select an image file')
        return
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        notificationService.error('Image size should be less than 5MB')
        return
      }
      
      photoBlob = file
      previewUrl.value = URL.createObjectURL(file)
      
      // Get location if available
      try {
        const position = await getCurrentPosition()
        photoMetadata = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        console.warn('Could not get location:', error)
        photoMetadata = {
          timestamp: new Date().toISOString()
        }
      }
    }
    
    const getCurrentPosition = () => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported by this browser'))
          return
        }
        
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        })
      })
    }
    
    const clearPreview = () => {
      previewUrl.value = ''
      photoBlob = null
      photoMetadata = {}
    }
    
    const uploadPhoto = async () => {
      if (!photoBlob) {
        notificationService.error('No photo to upload')
        return
      }
      
      uploading.value = true
      
      try {
        // For demo purposes, we'll simulate the upload
        // In a real implementation, you would upload to Supabase Storage
        
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Generate a fake URL for demo
        const fakeUrl = previewUrl.value
        
        // Emit success event
        emit('upload-success', {
          type: props.type,
          url: fakeUrl,
          metadata: photoMetadata
        })
        
        notificationService.success('Photo uploaded successfully')
        
        // Clear preview
        clearPreview()
      } catch (error) {
        console.error('Error uploading photo:', error)
        notificationService.error('Failed to upload photo')
      } finally {
        uploading.value = false
      }
    }
    
    onUnmounted(() => {
      closeCamera()
      
      // Revoke object URLs to avoid memory leaks
      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value)
      }
    })
    
    return {
      previewUrl,
      showCamera,
      videoElement,
      uploading,
      countdown,
      takePhoto,
      capturePhoto,
      closeCamera,
      handleFileUpload,
      clearPreview,
      uploadPhoto
    }
  }
}
</script>
