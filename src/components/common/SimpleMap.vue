<template>
  <div class="simple-map-container">
    <!-- Search Input -->
    <div class="mb-4">
      <input
        ref="searchInput"
        type="text"
        placeholder="Search for a location"
        class="input-field w-full"
        v-model="searchQuery"
      />
    </div>
    
    <!-- Map Container -->
    <div 
      ref="mapElement" 
      class="map-container"
      style="width: 100%; height: 400px; background-color: #e5e7eb; border: 1px solid #d1d5db; border-radius: 8px;"
    >
      <div v-if="!mapReady" class="loading-container">
        <div class="loading-content">
          <i class="fas fa-spinner fa-spin text-2xl text-gray-400 mb-2"></i>
          <p class="text-gray-500">Loading map...</p>
          <p class="text-xs text-gray-400 mt-1">{{ status }}</p>
        </div>
      </div>
      
      <div v-if="error" class="error-container">
        <div class="error-content">
          <i class="fas fa-exclamation-triangle text-2xl text-red-400 mb-2"></i>
          <p class="text-red-500">{{ error }}</p>
          <button @click="retryMap" class="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm">
            Retry
          </button>
        </div>
      </div>
    </div>
    
    <!-- Controls -->
    <div class="flex justify-between items-center mt-4">
      <button 
        @click="getCurrentLocation" 
        type="button"
        class="text-sm flex items-center text-green-600 hover:text-green-800"
        :disabled="!mapReady"
      >
        <i class="fas fa-location-arrow mr-1"></i> Use my location
      </button>
      
      <button 
        @click="confirmLocation" 
        type="button"
        class="btn-primary text-sm py-2 px-4"
        :disabled="!selectedLocation"
      >
        <i class="fas fa-check-circle mr-1"></i> Confirm Location
      </button>
    </div>
    
    <!-- Selected Location -->
    <div v-if="selectedLocation" class="mt-4 p-3 bg-green-50 rounded-md">
      <p class="text-sm text-green-800">
        <i class="fas fa-map-marker-alt mr-1"></i>
        {{ selectedLocation.address }}
      </p>
      <p class="text-xs text-gray-600 mt-1">
        Lat: {{ selectedLocation.lat.toFixed(6) }}, Lng: {{ selectedLocation.lng.toFixed(6) }}
      </p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

export default {
  name: 'SimpleMap',
  props: {
    initialAddress: String,
    initialLat: Number,
    initialLng: Number
  },
  emits: ['location-selected'],
  setup(props, { emit }) {
    const mapElement = ref(null)
    const searchInput = ref(null)
    const searchQuery = ref(props.initialAddress || '')
    
    const map = ref(null)
    const marker = ref(null)
    const geocoder = ref(null)
    const mapReady = ref(false)
    const error = ref('')
    const status = ref('Initializing...')
    const selectedLocation = ref(null)
    
    // Set initial location if provided
    if (props.initialLat && props.initialLng) {
      selectedLocation.value = {
        lat: props.initialLat,
        lng: props.initialLng,
        address: props.initialAddress || ''
      }
    }
    
    const waitForGoogleMaps = () => {
      return new Promise((resolve, reject) => {
        let attempts = 0
        const maxAttempts = 50
        
        const checkGoogle = () => {
          attempts++
          status.value = `Checking Google Maps API... (${attempts}/${maxAttempts})`
          
          if (window.google && window.google.maps) {
            console.log('✅ Google Maps API is ready!')
            resolve()
            return
          }
          
          if (attempts >= maxAttempts) {
            reject(new Error('Google Maps API failed to load after 50 attempts'))
            return
          }
          
          setTimeout(checkGoogle, 200)
        }
        
        checkGoogle()
      })
    }
    
    const createMap = async () => {
      try {
        status.value = 'Creating map...'
        
        if (!mapElement.value) {
          throw new Error('Map container not found')
        }
        
        // Default location (Manila)
        const defaultLocation = { lat: 14.5995, lng: 120.9842 }
        const center = selectedLocation.value 
          ? { lat: selectedLocation.value.lat, lng: selectedLocation.value.lng }
          : defaultLocation
        
        console.log('Creating map with center:', center)
        
        // Create map
        map.value = new window.google.maps.Map(mapElement.value, {
          center: center,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        })
        
        console.log('✅ Map created successfully!')
        
        // Create geocoder
        geocoder.value = new window.google.maps.Geocoder()
        
        // Create marker
        marker.value = new window.google.maps.Marker({
          position: center,
          map: map.value,
          draggable: true,
          title: 'Selected Location'
        })
        
        console.log('✅ Marker created successfully!')
        
        // Add event listeners
        setupEventListeners()
        
        // Setup search
        setupSearch()
        
        mapReady.value = true
        status.value = 'Map ready!'
        
        console.log('✅ Map initialization complete!')
        
      } catch (err) {
        console.error('❌ Error creating map:', err)
        error.value = `Failed to create map: ${err.message}`
        mapReady.value = false
      }
    }
    
    const setupEventListeners = () => {
      if (!map.value || !marker.value) return
      
      // Map click
      map.value.addListener('click', (event) => {
        console.log('Map clicked:', event.latLng.toString())
        marker.value.setPosition(event.latLng)
        reverseGeocode(event.latLng)
      })
      
      // Marker drag
      marker.value.addListener('dragend', () => {
        const position = marker.value.getPosition()
        console.log('Marker dragged to:', position.toString())
        reverseGeocode(position)
      })
    }
    
    const setupSearch = () => {
      if (!searchInput.value || !map.value) return
      
      try {
        const searchBox = new window.google.maps.places.SearchBox(searchInput.value)
        
        map.value.addListener('bounds_changed', () => {
          searchBox.setBounds(map.value.getBounds())
        })
        
        searchBox.addListener('places_changed', () => {
          const places = searchBox.getPlaces()
          
          if (places.length === 0) return
          
          const place = places[0]
          
          if (!place.geometry || !place.geometry.location) return
          
          console.log('Place selected:', place.name)
          
          map.value.setCenter(place.geometry.location)
          marker.value.setPosition(place.geometry.location)
          
          selectedLocation.value = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address || place.name
          }
          
          searchQuery.value = selectedLocation.value.address
        })
        
        console.log('✅ Search box setup complete!')
        
      } catch (err) {
        console.error('❌ Error setting up search:', err)
      }
    }
    
    const reverseGeocode = (position) => {
      if (!geocoder.value) return
      
      const latLng = {
        lat: position.lat(),
        lng: position.lng()
      }
      
      geocoder.value.geocode({ location: latLng }, (results, status) => {
        if (status === 'OK' && results[0]) {
          selectedLocation.value = {
            lat: latLng.lat,
            lng: latLng.lng,
            address: results[0].formatted_address
          }
          
          searchQuery.value = selectedLocation.value.address
          console.log('✅ Reverse geocoding successful:', selectedLocation.value.address)
        } else {
          console.error('❌ Reverse geocoding failed:', status)
        }
      })
    }
    
    const getCurrentLocation = () => {
      if (!navigator.geolocation) {
        error.value = 'Geolocation not supported'
        return
      }
      
      status.value = 'Getting your location...'
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          
          console.log('✅ Got current location:', location)
          
          if (map.value && marker.value) {
            map.value.setCenter(location)
            marker.value.setPosition(new window.google.maps.LatLng(location.lat, location.lng))
            reverseGeocode(marker.value.getPosition())
          }
          
          status.value = 'Map ready!'
        },
        (err) => {
          console.error('❌ Geolocation error:', err)
          error.value = `Location error: ${err.message}`
          status.value = 'Map ready!'
        }
      )
    }
    
    const confirmLocation = () => {
      if (selectedLocation.value) {
        console.log('✅ Location confirmed:', selectedLocation.value)
        emit('location-selected', selectedLocation.value)
      }
    }
    
    const retryMap = () => {
      error.value = ''
      mapReady.value = false
      status.value = 'Retrying...'
      
      setTimeout(() => {
        initializeMap()
      }, 1000)
    }
    
    const initializeMap = async () => {
      try {
        console.log('🚀 Starting map initialization...')
        
        // Wait for Google Maps API
        await waitForGoogleMaps()
        
        // Wait for DOM
        await nextTick()
        
        // Create map
        await createMap()
        
      } catch (err) {
        console.error('❌ Map initialization failed:', err)
        error.value = err.message
        mapReady.value = false
      }
    }
    
    onMounted(() => {
      console.log('🔄 SimpleMap component mounted')
      
      // Start initialization after a short delay
      setTimeout(() => {
        initializeMap()
      }, 500)
    })
    
    onUnmounted(() => {
      console.log('🔄 SimpleMap component unmounted')
    })
    
    return {
      mapElement,
      searchInput,
      searchQuery,
      mapReady,
      error,
      status,
      selectedLocation,
      getCurrentLocation,
      confirmLocation,
      retryMap
    }
  }
}
</script>

<style scoped>
.simple-map-container {
  width: 100%;
}

.map-container {
  position: relative;
  overflow: hidden;
}

.loading-container,
.error-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
}

.loading-content,
.error-content {
  text-align: center;
}
</style>
