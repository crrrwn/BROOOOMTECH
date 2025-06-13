<template>
  <div class="bg-white p-4 rounded-lg shadow">
    <h3 class="text-lg font-medium mb-2">{{ title }}</h3>
    
    <div class="mb-4">
      <div class="h-64 w-full bg-gray-100 rounded-lg relative">
        <!-- Map placeholder -->
        <div class="absolute inset-0 flex items-center justify-center">
          <div v-if="loading" class="text-center">
            <i class="fas fa-spinner fa-spin text-2xl text-gray-400 mb-2"></i>
            <p class="text-gray-500">Loading map...</p>
          </div>
          <div v-else-if="error" class="text-center p-4">
            <i class="fas fa-exclamation-triangle text-2xl text-red-500 mb-2"></i>
            <p class="text-red-500">{{ error }}</p>
          </div>
          <div v-else class="w-full h-full relative">
            <!-- Simple map visualization -->
            <div class="absolute inset-0 bg-blue-50 p-4">
              <div class="border-2 border-gray-300 border-dashed h-full w-full rounded-lg flex items-center justify-center">
                <div class="text-center">
                  <i class="fas fa-map-marker-alt text-3xl text-red-500 mb-2"></i>
                  <p class="text-gray-700 font-medium">Driver Location</p>
                  <p class="text-sm text-gray-500">
                    {{ location.latitude.toFixed(6) }}, {{ location.longitude.toFixed(6) }}
                  </p>
                  <p v-if="distance" class="mt-2 text-sm font-medium">
                    <span v-if="isDriver">
                      <i class="fas fa-route mr-1 text-blue-500"></i>
                      {{ distance.toDestination.toFixed(1) }} km to destination
                    </span>
                    <span v-else>
                      <i class="fas fa-clock mr-1 text-green-500"></i>
                      Estimated arrival: {{ estimatedArrival }}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Driver marker -->
            <div class="absolute" style="top: 40%; left: 50%; transform: translate(-50%, -50%)">
              <div class="relative">
                <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                  <i class="fas fa-truck text-white"></i>
                </div>
                <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
            </div>
            
            <!-- Destination marker -->
            <div class="absolute" style="bottom: 20%; right: 20%">
              <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <i class="fas fa-flag-checkered text-white"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="isDriver" class="mt-4">
      <div class="flex items-center justify-between">
        <div>
          <span class="text-sm font-medium">Location Tracking</span>
          <p class="text-xs text-gray-500">
            {{ tracking ? 'Your location is being shared' : 'Location sharing is paused' }}
          </p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            v-model="tracking" 
            class="sr-only peer"
          />
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { notificationService } from '@/composables/useNotification'

export default {
  name: 'LocationTracker',
  props: {
    orderId: {
      type: [Number, String],
      required: true
    },
    driverId: {
      type: String,
      required: true
    },
    isDriver: {
      type: Boolean,
      default: false
    },
    pickupLocation: {
      type: Object,
      default: () => ({
        latitude: 14.5995,
        longitude: 120.9842
      })
    },
    deliveryLocation: {
      type: Object,
      default: () => ({
        latitude: 14.6091,
        longitude: 121.0223
      })
    },
    title: {
      type: String,
      default: 'Driver Location'
    }
  },
  setup(props) {
    const loading = ref(true)
    const error = ref(null)
    const tracking = ref(props.isDriver)
    const location = ref({
      latitude: 0,
      longitude: 0,
      accuracy: 0,
      timestamp: null
    })
    const distance = ref(null)
    const estimatedArrival = ref('15-20 minutes')
    
    let watchId = null
    let updateInterval = null
    
    const startTracking = () => {
      if (!navigator.geolocation) {
        error.value = 'Geolocation is not supported by your browser'
        loading.value = false
        return
      }
      
      // Get initial position
      navigator.geolocation.getCurrentPosition(
        handlePositionSuccess,
        handlePositionError,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
      
      // Watch position changes
      watchId = navigator.geolocation.watchPosition(
        handlePositionSuccess,
        handlePositionError,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
      
      // Set up interval to update server with location
      if (props.isDriver) {
        updateInterval = setInterval(updateLocationOnServer, 10000)
      }
    }
    
    const stopTracking = () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
        watchId = null
      }
      
      if (updateInterval !== null) {
        clearInterval(updateInterval)
        updateInterval = null
      }
    }
    
    const handlePositionSuccess = (position) => {
      location.value = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date().toISOString()
      }
      
      loading.value = false
      error.value = null
      
      // Calculate distances
      calculateDistances()
    }
    
    const handlePositionError = (err) => {
      console.error('Error getting location:', err)
      error.value = `Error getting location: ${err.message}`
      loading.value = false
      
      // For demo, use a simulated location
      simulateLocation()
    }
    
    const simulateLocation = () => {
      // Generate a location near the pickup point
      const randomOffset = () => (Math.random() - 0.5) * 0.01
      
      location.value = {
        latitude: props.pickupLocation.latitude + randomOffset(),
        longitude: props.pickupLocation.longitude + randomOffset(),
        accuracy: 10,
        timestamp: new Date().toISOString()
      }
      
      error.value = null
      loading.value = false
      
      // Calculate distances
      calculateDistances()
    }
    
    const calculateDistances = () => {
      const toPickup = calculateDistance(
        location.value.latitude,
        location.value.longitude,
        props.pickupLocation.latitude,
        props.pickupLocation.longitude
      )
      
      const toDestination = calculateDistance(
        location.value.latitude,
        location.value.longitude,
        props.deliveryLocation.latitude,
        props.deliveryLocation.longitude
      )
      
      distance.value = {
        toPickup,
        toDestination
      }
      
      // Update estimated arrival time based on distance
      updateEstimatedArrival(toDestination)
    }
    
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      // Haversine formula to calculate distance between two points
      const R = 6371 // Radius of the earth in km
      const dLat = deg2rad(lat2 - lat1)
      const dLon = deg2rad(lon2 - lon1)
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      const distance = R * c // Distance in km
      return distance
    }
    
    const deg2rad = (deg) => {
      return deg * (Math.PI/180)
    }
    
    const updateEstimatedArrival = (distance) => {
      // Assume average speed of 30 km/h
      const timeInMinutes = Math.round((distance / 30) * 60)
      
      if (timeInMinutes < 5) {
        estimatedArrival.value = 'Less than 5 minutes'
      } else if (timeInMinutes < 10) {
        estimatedArrival.value = '5-10 minutes'
      } else if (timeInMinutes < 15) {
        estimatedArrival.value = '10-15 minutes'
      } else if (timeInMinutes < 20) {
        estimatedArrival.value = '15-20 minutes'
      } else if (timeInMinutes < 30) {
        estimatedArrival.value = '20-30 minutes'
      } else {
        estimatedArrival.value = 'Over 30 minutes'
      }
    }
    
    const updateLocationOnServer = async () => {
      if (!props.isDriver || !tracking.value) return
      
      try {
        // For demo purposes, we'll just log the location
        // In a real implementation, you would send this to your server
        console.log('Updating driver location:', {
          driver_id: props.driverId,
          order_id: props.orderId,
          latitude: location.value.latitude,
          longitude: location.value.longitude,
          accuracy: location.value.accuracy,
          timestamp: location.value.timestamp
        })
        
        // Simulate successful update
        // In a real implementation, you would use Supabase to update the location
      } catch (error) {
        console.error('Error updating location:', error)
      }
    }
    
    watch(tracking, (newValue) => {
      if (newValue) {
        startTracking()
        notificationService.success('Location tracking enabled')
      } else {
        stopTracking()
        notificationService.info('Location tracking disabled')
      }
    })
    
    onMounted(() => {
      if (tracking.value) {
        startTracking()
      } else {
        // For non-drivers, simulate a location
        simulateLocation()
      }
    })
    
    onUnmounted(() => {
      stopTracking()
    })
    
    return {
      loading,
      error,
      tracking,
      location,
      distance,
      estimatedArrival
    }
  }
}
</script>
