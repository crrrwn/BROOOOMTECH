<template>
  <div class="location-picker">
    <!-- Search Input -->
    <div class="mb-4">
      <input
        ref="searchInput"
        type="text"
        placeholder="Search for a location in Calapan City..."
        class="input-field w-full"
        v-model="searchQuery"
        @keyup.enter="searchLocation"
      />
    </div>
    
    <!-- Map Container -->
    <div 
      ref="mapContainer" 
      class="w-full h-96 rounded-md border border-gray-300 mb-4 relative"
      style="min-height: 400px; background-color: #f3f4f6;"
    >
      <!-- Loading State -->
      <div v-if="!mapLoaded && !error" class="flex items-center justify-center h-full">
        <div class="text-center">
          <i class="fas fa-spinner fa-spin text-2xl text-gray-400 mb-2"></i>
          <p class="text-gray-500">Loading Calapan City map...</p>
        </div>
      </div>
      
      <!-- Error State -->
      <div v-if="error" class="flex items-center justify-center h-full">
        <div class="text-center text-red-500">
          <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
          <p class="mb-2">{{ error }}</p>
          <button @click="switchToOpenStreetMap" class="btn-primary text-sm mr-2">
            Use Alternative Map
          </button>
          <button @click="retryLoadMap" class="btn-secondary text-sm">
            Retry Google Maps
          </button>
        </div>
      </div>
      
      <!-- Map will be rendered here -->
      <div v-show="mapLoaded" class="w-full h-full"></div>
      
      <!-- Show Your Location Button (Floating) -->
      <div v-if="mapLoaded" class="absolute bottom-4 right-4 z-10">
        <button
          @click="getCurrentLocation"
          :disabled="gettingLocation"
          class="bg-white hover:bg-gray-50 border border-gray-300 rounded-lg p-3 shadow-lg transition-all duration-200 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          title="Show your location"
        >
          <div v-if="gettingLocation" class="w-5 h-5 flex items-center justify-center">
            <i class="fas fa-spinner fa-spin text-gray-600 text-sm"></i>
          </div>
          <div v-else class="w-5 h-5 flex items-center justify-center">
            <!-- Crosshair/Target Icon -->
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="3" stroke="#374151" stroke-width="2"/>
              <path d="M12 1v6m0 8v6m11-7h-6m-8 0H1" stroke="#374151" stroke-width="2"/>
            </svg>
          </div>
        </button>
      </div>
    </div>
    
    <!-- Manual Address Input (Fallback) -->
    <div v-if="!mapLoaded && error" class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
      <h4 class="font-medium text-yellow-800 mb-2">
        <i class="fas fa-info-circle mr-1"></i>
        Can't load map? Enter address manually:
      </h4>
      <textarea
        v-model="manualAddress"
        placeholder="Enter complete address in Calapan City, Oriental Mindoro"
        class="w-full p-2 border border-gray-300 rounded-md text-sm"
        rows="2"
      ></textarea>
      <button 
        @click="useManualAddress" 
        class="mt-2 btn-primary text-sm"
        :disabled="!manualAddress.trim()"
      >
        Use This Address
      </button>
    </div>
    
    <!-- Controls -->
    <div class="flex justify-between items-center">
      <button 
        @click="getCurrentLocation" 
        type="button"
        class="text-sm flex items-center text-green-600 hover:text-green-800"
        :disabled="!mapLoaded && !useManualMode || gettingLocation"
      >
        <i class="fas fa-location-arrow mr-1"></i> 
        {{ gettingLocation ? 'Getting location...' : 'Use my location' }}
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
      <p v-if="selectedLocation.lat && selectedLocation.lng" class="text-xs text-green-600 mt-1">
        Coordinates: {{ selectedLocation.lat.toFixed(6) }}, {{ selectedLocation.lng.toFixed(6) }}
      </p>
    </div>
    
    <!-- Location Status Messages -->
    <div v-if="locationMessage" class="mt-2 p-2 rounded-md text-sm" :class="locationMessageType === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'">
      <i :class="locationMessageType === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'" class="mr-1"></i>
      {{ locationMessage }}
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
    const manualAddress = ref('')
    
    const map = ref(null)
    const marker = ref(null)
    const geocoder = ref(null)
    const mapLoaded = ref(false)
    const error = ref('')
    const selectedLocation = ref(null)
    const useOpenStreetMap = ref(false)
    const useManualMode = ref(false)
    const gettingLocation = ref(false)
    const locationMessage = ref('')
    const locationMessageType = ref('success')
    
    // CALAPAN CITY COORDINATES - EXACT LOCATION
    const CALAPAN_CITY = {
      lat: 13.3664,
      lng: 121.1939,
      name: 'Calapan City, Oriental Mindoro, Philippines'
    }
    
    // CALAPAN CITY BOUNDS - RESTRICT MAP TO THIS AREA ONLY
    const CALAPAN_BOUNDS = {
      north: 13.4200,  // Northern boundary
      south: 13.3100,  // Southern boundary  
      east: 121.2500,  // Eastern boundary
      west: 121.1300   // Western boundary
    }
    
    // Set initial location if provided, otherwise use Calapan City
    if (props.initialLat && props.initialLng) {
      selectedLocation.value = {
        lat: props.initialLat,
        lng: props.initialLng,
        address: props.initialAddress
      }
    } else {
      selectedLocation.value = {
        lat: CALAPAN_CITY.lat,
        lng: CALAPAN_CITY.lng,
        address: CALAPAN_CITY.name
      }
      searchQuery.value = CALAPAN_CITY.name
    }
    
    // Show location message
    const showLocationMessage = (message, type = 'success') => {
      locationMessage.value = message
      locationMessageType.value = type
      setTimeout(() => {
        locationMessage.value = ''
      }, 5000)
    }
    
    // Load Google Maps API with your API key
    const loadGoogleMapsAPI = () => {
      return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.google && window.google.maps) {
          resolve()
          return
        }
        
        // Remove any existing Google Maps scripts
        const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]')
        existingScripts.forEach(script => script.remove())
        
        // Create script element with your API key
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDAY9tsXQublAc2y54vPqMy2bZuXYY6I5o&libraries=places&callback=initGoogleMapsCallback&v=3.55`
        script.async = true
        script.defer = true
        
        // Set up global callback
        window.initGoogleMapsCallback = () => {
          console.log('Google Maps API loaded successfully')
          delete window.initGoogleMapsCallback // Clean up
          resolve()
        }
        
        script.onerror = (error) => {
          console.error('Failed to load Google Maps API:', error)
          delete window.initGoogleMapsCallback // Clean up
          reject(new Error('Failed to load Google Maps API. Please check your internet connection.'))
        }
        
        // Add timeout for loading
        const timeoutId = setTimeout(() => {
          if (!window.google || !window.google.maps) {
            console.error('Google Maps API loading timeout')
            reject(new Error('Google Maps API loading timeout. Please try again.'))
          }
        }, 15000) // 15 second timeout
        
        // Clear timeout when loaded
        const originalResolve = resolve
        resolve = () => {
          clearTimeout(timeoutId)
          originalResolve()
        }
        
        document.head.appendChild(script)
      })
    }
    
    // Load OpenStreetMap as alternative
    const loadOpenStreetMap = async () => {
      try {
        // Load Leaflet CSS and JS
        if (!window.L) {
          const cssLink = document.createElement('link')
          cssLink.rel = 'stylesheet'
          cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          document.head.appendChild(cssLink)
          
          const script = document.createElement('script')
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
          
          await new Promise((resolve, reject) => {
            script.onload = resolve
            script.onerror = reject
            document.head.appendChild(script)
          })
        }
        
        console.log('Creating OpenStreetMap centered on Calapan City:', CALAPAN_CITY)
        
        // Create Leaflet map centered on Calapan City
        map.value = window.L.map(mapContainer.value, {
          center: [CALAPAN_CITY.lat, CALAPAN_CITY.lng],
          zoom: 14,
          maxBounds: [
            [CALAPAN_BOUNDS.south, CALAPAN_BOUNDS.west], // Southwest corner
            [CALAPAN_BOUNDS.north, CALAPAN_BOUNDS.east]  // Northeast corner
          ],
          maxBoundsViscosity: 1.0 // Prevent panning outside bounds
        })
        
        // Add tile layer
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map.value)
        
        // Add marker at Calapan City center
        marker.value = window.L.marker([CALAPAN_CITY.lat, CALAPAN_CITY.lng], { 
          draggable: true,
          title: 'Calapan City, Oriental Mindoro'
        }).addTo(map.value)
        
        // Add popup to marker
        marker.value.bindPopup('📍 Calapan City, Oriental Mindoro').openPopup()
        
        // Add event listeners
        map.value.on('click', (e) => {
          marker.value.setLatLng(e.latlng)
          reverseGeocodeOSM(e.latlng.lat, e.latlng.lng)
        })
        
        marker.value.on('dragend', () => {
          const pos = marker.value.getLatLng()
          reverseGeocodeOSM(pos.lat, pos.lng)
        })
        
        mapLoaded.value = true
        useOpenStreetMap.value = true
        console.log('OpenStreetMap loaded successfully at Calapan City')
        
      } catch (err) {
        console.error('Error loading OpenStreetMap:', err)
        error.value = 'Failed to load map. Please enter address manually.'
        useManualMode.value = true
      }
    }
    
    // Initialize Google Maps
    const initGoogleMaps = async () => {
      try {
        error.value = ''
        
        if (!mapContainer.value) {
          throw new Error('Map container not found')
        }
        
        console.log('Loading Google Maps API...')
        await loadGoogleMapsAPI()
        
        console.log('Creating Google Maps centered on Calapan City:', CALAPAN_CITY)
        
        // Create bounds for Calapan City area
        const bounds = new window.google.maps.LatLngBounds(
          new window.google.maps.LatLng(CALAPAN_BOUNDS.south, CALAPAN_BOUNDS.west), // SW
          new window.google.maps.LatLng(CALAPAN_BOUNDS.north, CALAPAN_BOUNDS.east)  // NE
        )
        
        // Map options - RESTRICTED TO CALAPAN CITY ONLY
        const mapOptions = {
          center: new window.google.maps.LatLng(CALAPAN_CITY.lat, CALAPAN_CITY.lng),
          zoom: 14,
          minZoom: 12, // Prevent zooming out too far
          maxZoom: 20, // Allow detailed zoom
          restriction: {
            latLngBounds: bounds,
            strictBounds: true // Prevent panning outside bounds
          },
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
          mapTypeId: 'roadmap',
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }]
            },
            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#d59563' }]
            }
          ]
        }
        
        // Create map
        map.value = new window.google.maps.Map(mapContainer.value, mapOptions)
        
        // Force fit to Calapan City bounds
        map.value.fitBounds(bounds)
        
        // Wait for map to be ready
        await new Promise((resolve) => {
          window.google.maps.event.addListenerOnce(map.value, 'idle', () => {
            console.log('Map is ready and centered on Calapan City')
            console.log('Current map center:', map.value.getCenter().toString())
            console.log('Current map bounds:', map.value.getBounds().toString())
            resolve()
          })
        })
        
        // Create geocoder
        geocoder.value = new window.google.maps.Geocoder()
        
        // Create marker at Calapan City center
        marker.value = new window.google.maps.Marker({
          position: new window.google.maps.LatLng(CALAPAN_CITY.lat, CALAPAN_CITY.lng),
          map: map.value,
          draggable: true,
          animation: window.google.maps.Animation.DROP,
          title: 'Calapan City, Oriental Mindoro'
        })
        
        // Add info window to marker
        const infoWindow = new window.google.maps.InfoWindow({
          content: '<div style="padding: 5px;"><strong>📍 Calapan City</strong><br>Oriental Mindoro, Philippines</div>'
        })
        
        marker.value.addListener('click', () => {
          infoWindow.open(map.value, marker.value)
        })
        
        // Open info window by default
        infoWindow.open(map.value, marker.value)
        
        // Add event listeners
        setupGoogleMapsEventListeners()
        setupGoogleMapsSearchBox()
        
        mapLoaded.value = true
        console.log('Google Maps initialized successfully at Calapan City!')
        
        // Ensure we're showing Calapan City
        setTimeout(() => {
          if (map.value) {
            map.value.setCenter(new window.google.maps.LatLng(CALAPAN_CITY.lat, CALAPAN_CITY.lng))
            map.value.setZoom(14)
            console.log('Final verification - Map center:', map.value.getCenter().toString())
          }
        }, 2000)
        
      } catch (err) {
        console.error('Error initializing Google Maps:', err)
        error.value = `Map loading failed: ${err.message}`
        mapLoaded.value = false
        
        // Auto-switch to OpenStreetMap after 3 seconds
        setTimeout(() => {
          if (!mapLoaded.value) {
            console.log('Auto-switching to OpenStreetMap...')
            switchToOpenStreetMap()
          }
        }, 3000)
      }
    }
    
    // Setup Google Maps event listeners
    const setupGoogleMapsEventListeners = () => {
      if (!map.value || !marker.value) return
      
      map.value.addListener('click', (event) => {
        marker.value.setPosition(event.latLng)
        reverseGeocodeGoogle(event.latLng)
      })
      
      marker.value.addListener('dragend', () => {
        const position = marker.value.getPosition()
        reverseGeocodeGoogle(position)
      })
    }
    
    // Setup Google Maps search box with Calapan City bias
    const setupGoogleMapsSearchBox = () => {
      if (!searchInput.value || !map.value) return
      
      try {
        const searchBox = new window.google.maps.places.SearchBox(searchInput.value, {
          bounds: new window.google.maps.LatLngBounds(
            new window.google.maps.LatLng(CALAPAN_BOUNDS.south, CALAPAN_BOUNDS.west),
            new window.google.maps.LatLng(CALAPAN_BOUNDS.north, CALAPAN_BOUNDS.east)
          )
        })
        
        map.value.addListener('bounds_changed', () => {
          searchBox.setBounds(map.value.getBounds())
        })
        
        searchBox.addListener('places_changed', () => {
          const places = searchBox.getPlaces()
          
          if (places.length === 0) return
          
          const place = places[0]
          
          if (!place.geometry || !place.geometry.location) {
            console.log('Place has no geometry')
            return
          }
          
          // Check if place is within Calapan City bounds
          const lat = place.geometry.location.lat()
          const lng = place.geometry.location.lng()
          
          if (lat >= CALAPAN_BOUNDS.south && lat <= CALAPAN_BOUNDS.north &&
              lng >= CALAPAN_BOUNDS.west && lng <= CALAPAN_BOUNDS.east) {
            
            map.value.setCenter(place.geometry.location)
            marker.value.setPosition(place.geometry.location)
            
            selectedLocation.value = {
              lat: lat,
              lng: lng,
              address: place.formatted_address || place.name
            }
            
            searchQuery.value = selectedLocation.value.address
            showLocationMessage('Location found in Calapan City!', 'success')
          } else {
            showLocationMessage('Please search for locations within Calapan City, Oriental Mindoro only.', 'error')
          }
        })
      } catch (err) {
        console.error('Error setting up search box:', err)
      }
    }
    
    // Reverse geocode with Google Maps
    const reverseGeocodeGoogle = (position) => {
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
    
    // Reverse geocode with OpenStreetMap (Nominatim)
    const reverseGeocodeOSM = async (lat, lng) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
        )
        const data = await response.json()
        
        if (data && data.display_name) {
          selectedLocation.value = {
            lat: lat,
            lng: lng,
            address: data.display_name
          }
          
          searchQuery.value = selectedLocation.value.address
        }
      } catch (err) {
        console.error('Reverse geocoding failed:', err)
        selectedLocation.value = {
          lat: lat,
          lng: lng,
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        }
      }
    }
    
    // Search location (restricted to Calapan City)
    const searchLocation = async () => {
      if (!searchQuery.value.trim()) return
      
      // Add Calapan City to search query if not present
      let searchTerm = searchQuery.value
      if (!searchTerm.toLowerCase().includes('calapan') && !searchTerm.toLowerCase().includes('oriental mindoro')) {
        searchTerm += ', Calapan City, Oriental Mindoro'
      }
      
      if (useOpenStreetMap.value) {
        await geocodeAddressOSM(searchTerm)
      } else if (geocoder.value) {
        geocodeAddressGoogle(searchTerm)
      }
    }
    
    // Geocode address with Google Maps (restricted to Calapan City)
    const geocodeAddressGoogle = (address) => {
      if (!geocoder.value || !address) return
      
      geocoder.value.geocode({ 
        address: address,
        bounds: new window.google.maps.LatLngBounds(
          new window.google.maps.LatLng(CALAPAN_BOUNDS.south, CALAPAN_BOUNDS.west),
          new window.google.maps.LatLng(CALAPAN_BOUNDS.north, CALAPAN_BOUNDS.east)
        )
      }, (results, status) => {
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
          
          showLocationMessage('Location found!', 'success')
        } else {
          console.error('Geocoding failed:', status)
          showLocationMessage('Location not found. Please try a different search term.', 'error')
        }
      })
    }
    
    // Geocode address with OpenStreetMap
    const geocodeAddressOSM = async (address) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1&bounded=1&viewbox=${CALAPAN_BOUNDS.west},${CALAPAN_BOUNDS.north},${CALAPAN_BOUNDS.east},${CALAPAN_BOUNDS.south}`
        )
        const data = await response.json()
        
        if (data && data.length > 0) {
          const result = data[0]
          const lat = parseFloat(result.lat)
          const lng = parseFloat(result.lon)
          
          if (map.value && marker.value) {
            map.value.setView([lat, lng], 15)
            marker.value.setLatLng([lat, lng])
          }
          
          selectedLocation.value = {
            lat: lat,
            lng: lng,
            address: result.display_name
          }
          
          searchQuery.value = selectedLocation.value.address
          showLocationMessage('Location found!', 'success')
        } else {
          showLocationMessage('Location not found. Please try a different search term.', 'error')
        }
      } catch (err) {
        console.error('Geocoding failed:', err)
        showLocationMessage('Error searching for location. Please try again.', 'error')
      }
    }
    
    // Get current location with improved UX
    const getCurrentLocation = () => {
      if (!navigator.geolocation) {
        showLocationMessage('Geolocation is not supported by this browser', 'error')
        return
      }
      
      gettingLocation.value = true
      showLocationMessage('Getting your location...', 'success')
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          
          // Check if user is within Calapan City bounds
          if (location.lat >= CALAPAN_BOUNDS.south && location.lat <= CALAPAN_BOUNDS.north &&
              location.lng >= CALAPAN_BOUNDS.west && location.lng <= CALAPAN_BOUNDS.east) {
            
            if (useOpenStreetMap.value && map.value && marker.value) {
              map.value.setView([location.lat, location.lng], 16)
              marker.value.setLatLng([location.lat, location.lng])
              reverseGeocodeOSM(location.lat, location.lng)
            } else if (map.value && marker.value) {
              const googleLatLng = new window.google.maps.LatLng(location.lat, location.lng)
              map.value.setCenter(googleLatLng)
              map.value.setZoom(16)
              marker.value.setPosition(googleLatLng)
              reverseGeocodeGoogle(marker.value.getPosition())
            }
            
            showLocationMessage('Your location found in Calapan City!', 'success')
          } else {
            showLocationMessage('You are outside Calapan City. Showing Calapan City center instead.', 'error')
            // Keep the map centered on Calapan City
          }
          
          gettingLocation.value = false
        },
        (err) => {
          console.error('Error getting current location:', err)
          gettingLocation.value = false
          
          let errorMessage = 'Unable to get your location. '
          switch(err.code) {
            case err.PERMISSION_DENIED:
              errorMessage += 'Please allow location access.'
              break
            case err.POSITION_UNAVAILABLE:
              errorMessage += 'Location information is unavailable.'
              break
            case err.TIMEOUT:
              errorMessage += 'Location request timed out.'
              break
            default:
              errorMessage += 'An unknown error occurred.'
              break
          }
          
          showLocationMessage(errorMessage, 'error')
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    }
    
    // Switch to OpenStreetMap
    const switchToOpenStreetMap = () => {
      error.value = ''
      mapLoaded.value = false
      loadOpenStreetMap()
    }
    
    // Use manual address
    const useManualAddress = () => {
      if (!manualAddress.value.trim()) return
      
      selectedLocation.value = {
        lat: null,
        lng: null,
        address: manualAddress.value.trim()
      }
      
      searchQuery.value = selectedLocation.value.address
      useManualMode.value = true
      showLocationMessage('Manual address set successfully!', 'success')
    }
    
    // Confirm location selection
    const confirmLocation = () => {
      if (selectedLocation.value) {
        emit('update:location', selectedLocation.value)
        showLocationMessage('Location confirmed!', 'success')
      }
    }
    
    // Retry loading map
    const retryLoadMap = () => {
      mapLoaded.value = false
      error.value = ''
      useOpenStreetMap.value = false
      
      // Clear any existing map instances
      if (map.value) {
        map.value = null
      }
      if (marker.value) {
        marker.value = null
      }
      
      setTimeout(() => {
        initGoogleMaps()
      }, 1000)
    }
    
    onMounted(() => {
      setTimeout(() => {
        initGoogleMaps()
      }, 100)
    })
    
    onUnmounted(() => {
      if (window.searchTimeout) {
        clearTimeout(window.searchTimeout)
      }
    })
    
    return {
      mapContainer,
      searchInput,
      searchQuery,
      manualAddress,
      mapLoaded,
      error,
      selectedLocation,
      useManualMode,
      gettingLocation,
      locationMessage,
      locationMessageType,
      getCurrentLocation,
      confirmLocation,
      retryLoadMap,
      switchToOpenStreetMap,
      useManualAddress,
      searchLocation
    }
  }
}
</script>
