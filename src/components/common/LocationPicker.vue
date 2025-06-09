<template>
  <div class="location-picker">
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
      ref="mapContainer" 
      class="w-full h-96 rounded-md border border-gray-300 mb-4"
      style="min-height: 400px; background-color: #f3f4f6;"
    >
      <div v-if="!mapLoaded" class="flex items-center justify-center h-full">
        <div class="text-center">
          <i class="fas fa-spinner fa-spin text-2xl text-gray-400 mb-2"></i>
          <p class="text-gray-500">Loading map...</p>
        </div>
      </div>
      <div v-if="error" class="flex items-center justify-center h-full">
        <div class="text-center text-red-500">
          <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
          <p>{{ error }}</p>
          <button @click="retryLoadMap" class="mt-2 btn-primary text-sm">
            Retry
          </button>
        </div>
      </div>
    </div>
    
    <!-- Controls -->
    <div class="flex justify-between items-center">
      <button 
        @click="getCurrentLocation" 
        type="button"
        class="text-sm flex items-center text-green-600 hover:text-green-800"
        :disabled="!mapLoaded"
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
    
    <!-- Selected Location Info -->
    <div v-if="selectedLocation" class="mt-4 p-3 bg-green-50 rounded-md">
      <p class="text-sm text-green-800">
        <i class="fas fa-map-marker-alt mr-1"></i>
        {{ selectedLocation.address }}
      </p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue'

export default {
  name: 'LocationPicker',
  props: {
    initialAddress: {
      type: String,
      default: ''
    },
    initialLat: {
      type: Number,
      default: null
    },
    initialLng: {
      type: Number,
      default: null
    }
  },
  emits: ['update:location'],
  setup(props, { emit }) {
    const mapContainer = ref(null)
    const searchInput = ref(null)
    const searchQuery = ref(props.initialAddress)
    
    const map = ref(null)
    const marker = ref(null)
    const geocoder = ref(null)
    const mapLoaded = ref(false)
    const error = ref('')
    const selectedLocation = ref(null)
    
    // Set initial location if provided
    if (props.initialLat && props.initialLng) {
      selectedLocation.value = {
        lat: props.initialLat,
        lng: props.initialLng,
        address: props.initialAddress
      }
    }
    
    // Load Google Maps API
    const loadGoogleMapsAPI = () => {
      return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.google && window.google.maps) {
          resolve()
          return
        }
        
        // Create script element
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDAY9tsXQublAc2y54vPqMy2bZuXYY6I5o&libraries=places`
        script.async = true
        script.defer = true
        
        script.onload = () => {
          console.log('Google Maps API loaded successfully')
          resolve()
        }
        
        script.onerror = () => {
          console.error('Failed to load Google Maps API')
          reject(new Error('Failed to load Google Maps API'))
        }
        
        document.head.appendChild(script)
      })
    }
    
    // Initialize map
    const initMap = async () => {
      try {
        error.value = ''
        
        // Wait for container to be available
        if (!mapContainer.value) {
          throw new Error('Map container not found')
        }
        
        // Load Google Maps API
        await loadGoogleMapsAPI()
        
        // Default location (Manila)
        const defaultLocation = { lat: 14.5995, lng: 120.9842 }
        const initialLocation = selectedLocation.value 
          ? { lat: selectedLocation.value.lat, lng: selectedLocation.value.lng }
          : defaultLocation
        
        // Map options
        const mapOptions = {
          center: initialLocation,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }]
            }
          ]
        }
        
        // Create map
        map.value = new window.google.maps.Map(mapContainer.value, mapOptions)
        
        // Create geocoder
        geocoder.value = new window.google.maps.Geocoder()
        
        // Create marker
        marker.value = new window.google.maps.Marker({
          position: initialLocation,
          map: map.value,
          draggable: true,
          animation: window.google.maps.Animation.DROP,
          title: 'Selected Location'
        })
        
        // Add event listeners
        setupEventListeners()
        
        // Setup search box
        setupSearchBox()
        
        mapLoaded.value = true
        console.log('Map initialized successfully')
        
      } catch (err) {
        console.error('Error initializing map:', err)
        error.value = `Failed to load map: ${err.message}`
        mapLoaded.value = false
      }
    }
    
    // Setup event listeners
    const setupEventListeners = () => {
      if (!map.value || !marker.value) return
      
      // Map click event
      map.value.addListener('click', (event) => {
        marker.value.setPosition(event.latLng)
        reverseGeocode(event.latLng)
      })
      
      // Marker drag event
      marker.value.addListener('dragend', () => {
        const position = marker.value.getPosition()
        reverseGeocode(position)
      })
    }
    
    // Setup search box
    const setupSearchBox = () => {
      if (!searchInput.value || !map.value) return
      
      try {
        const searchBox = new window.google.maps.places.SearchBox(searchInput.value)
        
        // Bias search results to map viewport
        map.value.addListener('bounds_changed', () => {
          searchBox.setBounds(map.value.getBounds())
        })
        
        // Handle place selection
        searchBox.addListener('places_changed', () => {
          const places = searchBox.getPlaces()
          
          if (places.length === 0) return
          
          const place = places[0]
          
          if (!place.geometry || !place.geometry.location) {
            console.log('Place has no geometry')
            return
          }
          
          // Update map and marker
          map.value.setCenter(place.geometry.location)
          marker.value.setPosition(place.geometry.location)
          
          // Update selected location
          selectedLocation.value = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address || place.name
          }
          
          searchQuery.value = selectedLocation.value.address
        })
      } catch (err) {
        console.error('Error setting up search box:', err)
      }
    }
    
    // Reverse geocode coordinates to address
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
        } else {
          console.error('Reverse geocoding failed:', status)
        }
      })
    }
    
    // Get current location
    const getCurrentLocation = () => {
      if (!navigator.geolocation) {
        error.value = 'Geolocation is not supported by this browser'
        return
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          
          if (map.value && marker.value) {
            map.value.setCenter(location)
            marker.value.setPosition(new window.google.maps.LatLng(location.lat, location.lng))
            reverseGeocode(marker.value.getPosition())
          }
        },
        (err) => {
          console.error('Error getting current location:', err)
          error.value = `Unable to get your location: ${err.message}`
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    }
    
    // Confirm location selection
    const confirmLocation = () => {
      if (selectedLocation.value) {
        emit('update:location', selectedLocation.value)
      }
    }
    
    // Retry loading map
    const retryLoadMap = () => {
      mapLoaded.value = false
      error.value = ''
      setTimeout(() => {
        initMap()
      }, 1000)
    }
    
    // Watch for search query changes
    watch(searchQuery, (newQuery) => {
      if (newQuery && newQuery !== selectedLocation.value?.address) {
        // Debounce search
        clearTimeout(window.searchTimeout)
        window.searchTimeout = setTimeout(() => {
          geocodeAddress(newQuery)
        }, 500)
      }
    })
    
    // Geocode address to coordinates
    const geocodeAddress = (address) => {
      if (!geocoder.value || !address) return
      
      geocoder.value.geocode({ address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location
          
          if (map.value && marker.value) {
            map.value.setCenter(location)
            marker.value.setPosition(location)
          }
          
          selectedLocation.value = {
            lat: location.lat(),
            lng: location.lng(),
            address: results[0].formatted_address
          }
        } else {
          console.error('Geocoding failed:', status)
        }
      })
    }
    
    onMounted(() => {
      // Initialize map after component is mounted
      setTimeout(() => {
        initMap()
      }, 100)
    })
    
    onUnmounted(() => {
      // Clean up
      if (window.searchTimeout) {
        clearTimeout(window.searchTimeout)
      }
    })
    
    return {
      mapContainer,
      searchInput,
      searchQuery,
      mapLoaded,
      error,
      selectedLocation,
      getCurrentLocation,
      confirmLocation,
      retryLoadMap
    }
  }
}
</script>
