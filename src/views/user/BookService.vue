<template>
  <div>
    <Navbar />
    
    <div class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Book a Service</h1>
          <p class="mt-2 text-gray-600">Choose a service and provide delivery details</p>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Service Selection -->
          <div class="lg:col-span-2">
            <div class="card">
              <h2 class="text-xl font-semibold text-gray-900 mb-6">Select Service Type</h2>
              
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div
                  v-for="service in services"
                  :key="service.name"
                  @click="selectService(service.name)"
                  :class="[
                    'card cursor-pointer text-center transition-all duration-200',
                    selectedService === service.name
                      ? 'ring-2 ring-green-500 bg-green-50 border-green-300'
                      : 'hover:shadow-md'
                  ]"
                >
                  <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <i :class="`${service.icon} text-green-600 text-xl`"></i>
                  </div>
                  <h3 class="font-medium text-gray-900 text-sm">{{ service.name }}</h3>
                </div>
              </div>
              
              <!-- Service Form -->
              <div v-if="selectedService" class="border-t border-gray-200 pt-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Service Details</h3>
                
                <form @submit.prevent="submitOrder" class="space-y-6">
                  <!-- Common Fields -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Pickup Address with Map -->
                    <div>
                      <label for="pickup_address" class="block text-sm font-medium text-gray-700 mb-2">
                        Pickup Address
                      </label>
                      <div class="space-y-3">
                        <textarea
                          id="pickup_address"
                          v-model="form.pickup_address"
                          rows="2"
                          required
                          class="input-field"
                          placeholder="Enter pickup address in Calapan City"
                          @input="searchPickupLocation"
                        ></textarea>
                        <button
                          type="button"
                          @click="openPickupMap"
                          class="w-full btn-outline text-sm"
                        >
                          <i class="fas fa-map-marker-alt mr-2"></i>
                          Pin Pickup Location
                        </button>
                        <div v-if="form.pickup_coordinates" class="text-xs text-green-600">
                          <i class="fas fa-check-circle mr-1"></i>
                          Location pinned: {{ form.pickup_coordinates.lat.toFixed(6) }}, {{ form.pickup_coordinates.lng.toFixed(6) }}
                        </div>
                      </div>
                    </div>
                    
                    <!-- Delivery Address with Map -->
                    <div>
                      <label for="delivery_address" class="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Address
                      </label>
                      <div class="space-y-3">
                        <textarea
                          id="delivery_address"
                          v-model="form.delivery_address"
                          rows="2"
                          required
                          class="input-field"
                          placeholder="Enter delivery address in Calapan City"
                          @input="searchDeliveryLocation"
                        ></textarea>
                        <button
                          type="button"
                          @click="openDeliveryMap"
                          class="w-full btn-outline text-sm"
                        >
                          <i class="fas fa-map-marker-alt mr-2"></i>
                          Pin Delivery Location
                        </button>
                        <div v-if="form.delivery_coordinates" class="text-xs text-green-600">
                          <i class="fas fa-check-circle mr-1"></i>
                          Location pinned: {{ form.delivery_coordinates.lat.toFixed(6) }}, {{ form.delivery_coordinates.lng.toFixed(6) }}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Distance Calculation -->
                  <div v-if="form.pickup_coordinates && form.delivery_coordinates" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div class="flex items-center">
                      <i class="fas fa-route text-blue-600 mr-2"></i>
                      <span class="text-sm text-blue-800">
                        Estimated Distance: {{ calculatedDistance.toFixed(1) }} km
                      </span>
                    </div>
                  </div>
                  
                  <!-- Service-specific Fields -->
                  <div v-if="selectedService === 'Food Delivery'" class="space-y-4">
                    <div>
                      <label for="restaurant" class="block text-sm font-medium text-gray-700">
                        Restaurant Name
                      </label>
                      <input
                        id="restaurant"
                        v-model="form.restaurant"
                        type="text"
                        required
                        class="mt-1 input-field"
                        placeholder="Restaurant name"
                      />
                    </div>
                    <div>
                      <label for="items" class="block text-sm font-medium text-gray-700">
                        Items to Order
                      </label>
                      <textarea
                        id="items"
                        v-model="form.items"
                        rows="3"
                        required
                        class="mt-1 input-field"
                        placeholder="List the items you want to order"
                      ></textarea>
                    </div>
                  </div>
                  
                  <div v-if="selectedService === 'Pay Bills'" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label for="bill_type" class="block text-sm font-medium text-gray-700">
                          Bill Type
                        </label>
                        <select
                          id="bill_type"
                          v-model="form.bill_type"
                          required
                          class="mt-1 input-field"
                        >
                          <option value="">Select bill type</option>
                          <option value="electricity">Electricity</option>
                          <option value="water">Water</option>
                          <option value="internet">Internet</option>
                          <option value="credit_card">Credit Card</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label for="account_number" class="block text-sm font-medium text-gray-700">
                          Account Number
                        </label>
                        <input
                          id="account_number"
                          v-model="form.account_number"
                          type="text"
                          required
                          class="mt-1 input-field"
                          placeholder="Account number"
                        />
                      </div>
                    </div>
                    <div>
                      <label for="amount" class="block text-sm font-medium text-gray-700">
                        Amount
                      </label>
                      <input
                        id="amount"
                        v-model="form.amount"
                        type="number"
                        step="0.01"
                        required
                        class="mt-1 input-field"
                        placeholder="Amount to pay"
                      />
                    </div>
                  </div>
                  
                  <div v-if="selectedService === 'Medicines'" class="space-y-4">
                    <div>
                      <label for="medicine_list" class="block text-sm font-medium text-gray-700">
                        Medicine List
                      </label>
                      <textarea
                        id="medicine_list"
                        v-model="form.medicine_list"
                        rows="3"
                        required
                        class="mt-1 input-field"
                        placeholder="List the medicines needed"
                      ></textarea>
                    </div>
                    <div>
                      <label for="prescription" class="block text-sm font-medium text-gray-700">
                        Prescription (Optional)
                      </label>
                      <input
                        id="prescription"
                        type="file"
                        accept="image/*"
                        @change="handleFileUpload"
                        class="mt-1 input-field"
                      />
                    </div>
                  </div>
                  
                  <div v-if="selectedService === 'Grocery'" class="space-y-4">
                    <div>
                      <label for="grocery_list" class="block text-sm font-medium text-gray-700">
                        Grocery List
                      </label>
                      <textarea
                        id="grocery_list"
                        v-model="form.grocery_list"
                        rows="4"
                        required
                        class="mt-1 input-field"
                        placeholder="List all grocery items needed"
                      ></textarea>
                    </div>
                    <div>
                      <label for="budget" class="block text-sm font-medium text-gray-700">
                        Budget
                      </label>
                      <input
                        id="budget"
                        v-model="form.budget"
                        type="number"
                        step="0.01"
                        required
                        class="mt-1 input-field"
                        placeholder="Maximum budget"
                      />
                    </div>
                  </div>
                  
                  <div v-if="selectedService === 'Surprise Delivery'" class="space-y-4">
                    <div>
                      <label for="item_description" class="block text-sm font-medium text-gray-700">
                        Item Description
                      </label>
                      <textarea
                        id="item_description"
                        v-model="form.item_description"
                        rows="3"
                        required
                        class="mt-1 input-field"
                        placeholder="Describe the item to be delivered"
                      ></textarea>
                    </div>
                    <div>
                      <label for="message" class="block text-sm font-medium text-gray-700">
                        Message for Recipient
                      </label>
                      <textarea
                        id="message"
                        v-model="form.message"
                        rows="3"
                        class="mt-1 input-field"
                        placeholder="Optional message"
                      ></textarea>
                    </div>
                    <div>
                      <label for="recipient_info" class="block text-sm font-medium text-gray-700">
                        Recipient Information
                      </label>
                      <textarea
                        id="recipient_info"
                        v-model="form.recipient_info"
                        rows="2"
                        required
                        class="mt-1 input-field"
                        placeholder="Recipient name and contact"
                      ></textarea>
                    </div>
                  </div>
                  
                  <div v-if="selectedService === 'Pabili'" class="space-y-4">
                    <div>
                      <label for="item_name" class="block text-sm font-medium text-gray-700">
                        Item Name
                      </label>
                      <input
                        id="item_name"
                        v-model="form.item_name"
                        type="text"
                        required
                        class="mt-1 input-field"
                        placeholder="What do you want to buy?"
                      />
                    </div>
                    <div>
                      <label for="store_name" class="block text-sm font-medium text-gray-700">
                        Store Name
                      </label>
                      <input
                        id="store_name"
                        v-model="form.store_name"
                        type="text"
                        class="mt-1 input-field"
                        placeholder="Preferred store (optional)"
                      />
                    </div>
                    <div>
                      <label for="notes" class="block text-sm font-medium text-gray-700">
                        Special Notes
                      </label>
                      <textarea
                        id="notes"
                        v-model="form.notes"
                        rows="3"
                        class="mt-1 input-field"
                        placeholder="Any special instructions"
                      ></textarea>
                    </div>
                  </div>
                  
                  <!-- Item Picture Upload -->
                  <div>
                    <label for="item_picture" class="block text-sm font-medium text-gray-700">
                      Picture of Item (Optional)
                    </label>
                    <input
                      id="item_picture"
                      type="file"
                      accept="image/*"
                      @change="handleImageUpload"
                      class="mt-1 input-field"
                    />
                    <p class="mt-1 text-sm text-gray-500">
                      Upload a picture to help the driver identify your item
                    </p>
                  </div>
                  
                  <!-- Special Instructions -->
                  <div>
                    <label for="special_instructions" class="block text-sm font-medium text-gray-700">
                      Special Instructions
                    </label>
                    <textarea
                      id="special_instructions"
                      v-model="form.special_instructions"
                      rows="3"
                      class="mt-1 input-field"
                      placeholder="Any additional instructions for the driver"
                    ></textarea>
                  </div>
                  
                  <!-- Payment Method -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-3">
                      Payment Method
                    </label>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div
                        v-for="method in paymentMethods"
                        :key="method.name"
                        @click="form.payment_method = method.name"
                        :class="[
                          'border border-gray-300 rounded-lg p-3 cursor-pointer text-center transition-all',
                          form.payment_method === method.name
                            ? 'border-green-500 bg-green-50'
                            : 'hover:border-gray-400'
                        ]"
                      >
                        <div class="w-8 h-8 bg-gray-100 rounded mx-auto mb-2 flex items-center justify-center">
                          <i :class="`${method.icon} text-gray-600`"></i>
                        </div>
                        <span class="text-sm font-medium">{{ method.name }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div v-if="error" class="rounded-md bg-red-50 p-4">
                    <div class="flex">
                      <div class="flex-shrink-0">
                        <i class="fas fa-exclamation-circle text-red-400"></i>
                      </div>
                      <div class="ml-3">
                        <h3 class="text-sm font-medium text-red-800">
                          {{ error }}
                        </h3>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex justify-between">
                    <button
                      type="button"
                      @click="resetForm"
                      class="btn-secondary"
                    >
                      Reset Form
                    </button>
                    <button
                      type="submit"
                      :disabled="loading"
                      class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {{ loading ? 'Booking...' : 'Book Service' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          <!-- Order Summary -->
          <div class="lg:col-span-1">
            <div class="card sticky top-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
              
              <div v-if="!selectedService" class="text-center text-gray-500 py-8">
                <i class="fas fa-clipboard-list text-3xl mb-4"></i>
                <p>Select a service to see summary</p>
              </div>
              
              <div v-else class="space-y-4">
                <div class="flex justify-between">
                  <span class="text-gray-600">Service:</span>
                  <span class="font-medium">{{ selectedService }}</span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-gray-600">Base Fee:</span>
                  <span class="font-medium">₱50.00</span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-gray-600">Distance Fee:</span>
                  <span class="font-medium">₱{{ (calculatedDistance * 15).toFixed(2) }}</span>
                </div>
                
                <div v-if="form.payment_method" class="flex justify-between">
                  <span class="text-gray-600">Payment:</span>
                  <span class="font-medium">{{ form.payment_method }}</span>
                </div>
                
                <div class="border-t border-gray-200 pt-4">
                  <div class="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span class="text-green-600">₱{{ totalFee.toFixed(2) }}</span>
                  </div>
                </div>
                
                <div class="text-sm text-gray-500">
                  <p>* Final fee may vary based on actual distance and service requirements</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Map Modal -->
    <div 
      v-if="showMapModal" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="closeMapModal"
    >
      <div 
        class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
        @click.stop
      >
        <div class="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">
            {{ mapModalType === 'pickup' ? 'Pin Pickup Location in Calapan City' : 'Pin Delivery Location in Calapan City' }}
          </h3>
          <button
            @click="closeMapModal"
            class="text-gray-400 hover:text-gray-600"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="p-4">
          <div class="mb-4">
            <input
              ref="mapSearchInput"
              type="text"
              class="w-full input-field"
              placeholder="Search for a location in Calapan City..."
              v-model="mapSearchQuery"
              @keyup.enter="searchInMap"
            />
          </div>
          
          <div 
            ref="mapContainer" 
            class="relative w-full h-96 rounded-lg border border-gray-300"
          ></div>
          
          <!-- Floating Location Button -->
          <button
            v-if="mapLoaded && !gettingLocation"
            @click="getCurrentLocation"
            class="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-300 p-3 hover:shadow-xl transition-all duration-200 z-10"
            title="Show your current location"
          >
            <i class="fas fa-crosshairs text-gray-600 text-lg"></i>
          </button>

          <!-- Loading Location Button -->
          <button
            v-if="mapLoaded && gettingLocation"
            disabled
            class="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-300 p-3 z-10 opacity-75"
            title="Getting your location..."
          >
            <i class="fas fa-spinner fa-spin text-gray-600 text-lg"></i>
          </button>

          <!-- Location Status Messages -->
          <div
            v-if="locationMessage"
            :class="[
              'absolute top-20 left-4 right-4 p-3 rounded-lg shadow-lg z-20 transition-all duration-300',
              locationMessage.type === 'success' ? 'bg-green-100 border border-green-300 text-green-800' : 'bg-red-100 border border-red-300 text-red-800'
            ]"
          >
            <div class="flex items-center">
              <i :class="[
                'mr-2',
                locationMessage.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle'
              ]"></i>
              <span class="text-sm">{{ locationMessage.text }}</span>
              <button
                @click="locationMessage = null"
                class="ml-auto text-gray-500 hover:text-gray-700"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          
          <div class="flex justify-between items-center mt-4">
            <div class="text-sm text-gray-600">
              {{ selectedMapAddress || 'Click on the map to select a location in Calapan City' }}
            </div>
            <div class="space-x-3">
              <button
                @click="closeMapModal"
                class="btn-secondary"
              >
                Cancel
              </button>
              <button
                @click="confirmLocation"
                :disabled="!selectedMapCoordinates"
                class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useOrders } from '@/composables/useOrders'
import Navbar from '@/components/common/Navbar.vue'

export default {
  name: 'BookService',
  components: {
    Navbar
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const { userProfile } = useAuth()
    const { createOrder, loading } = useOrders()
    
    const selectedService = ref('')
    const error = ref('')
    const estimatedDistance = ref(5) // Default 5km
    
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
    
    const services = [
      { name: 'Food Delivery', icon: 'fas fa-utensils' },
      { name: 'Pay Bills', icon: 'fas fa-file-invoice-dollar' },
      { name: 'Pick-up', icon: 'fas fa-hand-paper' },
      { name: 'Surprise Delivery', icon: 'fas fa-gift' },
      { name: 'Medicines', icon: 'fas fa-pills' },
      { name: 'Grocery', icon: 'fas fa-shopping-cart' },
      { name: 'Pabili', icon: 'fas fa-shopping-bag' }
    ]
    
    const paymentMethods = [
      { name: 'GCash', icon: 'fas fa-mobile-alt' },
      { name: 'PayMaya', icon: 'fas fa-credit-card' },
      { name: 'GoTyme', icon: 'fas fa-university' },
      { name: 'COD', icon: 'fas fa-money-bill-wave' }
    ]
    
    const form = reactive({
      pickup_address: '',
      delivery_address: '',
      pickup_coordinates: null,
      delivery_coordinates: null,
      payment_method: 'COD',
      special_instructions: '',
      // Service-specific fields
      restaurant: '',
      items: '',
      bill_type: '',
      account_number: '',
      amount: '',
      medicine_list: '',
      grocery_list: '',
      budget: '',
      item_description: '',
      message: '',
      recipient_info: '',
      item_name: '',
      store_name: '',
      notes: ''
    })
    
    // Map-related reactive variables
    const showMapModal = ref(false)
    const mapModalType = ref('') // 'pickup' or 'delivery'
    const selectedMapCoordinates = ref(null)
    const selectedMapAddress = ref('')
    const mapSearchQuery = ref('')
    const map = ref(null)
    const marker = ref(null)
    const geocoder = ref(null)
    const autocomplete = ref(null)
    const mapSearchInput = ref(null)
    const mapContainer = ref(null)
    const mapLoaded = ref(false)
    const gettingLocation = ref(false)
    const locationMessage = ref(null)

    const calculatedDistance = computed(() => {
      if (form.pickup_coordinates && form.delivery_coordinates) {
        return calculateDistance(
          form.pickup_coordinates.lat,
          form.pickup_coordinates.lng,
          form.delivery_coordinates.lat,
          form.delivery_coordinates.lng
        )
      }
      return estimatedDistance.value
    })

    const totalFee = computed(() => {
      const baseFee = 50
      const distanceFee = calculatedDistance.value * 15
      return baseFee + distanceFee
    })
    
    const selectService = (service) => {
      selectedService.value = service
      resetServiceFields()
    }
    
    const resetServiceFields = () => {
      // Reset service-specific fields
      Object.keys(form).forEach(key => {
        if (!['pickup_address', 'delivery_address', 'pickup_coordinates', 'delivery_coordinates', 'payment_method', 'special_instructions'].includes(key)) {
          form[key] = ''
        }
      })
    }
    
    const resetForm = () => {
      Object.keys(form).forEach(key => {
        if (key === 'payment_method') {
          form[key] = 'COD'
        } else if (key === 'pickup_coordinates' || key === 'delivery_coordinates') {
          form[key] = null
        } else {
          form[key] = ''
        }
      })
      selectedService.value = ''
      error.value = ''
    }

    // Google Maps utility functions
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
      const R = 6371 // Radius of the Earth in kilometers
      const dLat = (lat2 - lat1) * Math.PI / 180
      const dLng = (lng2 - lng1) * Math.PI / 180
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng/2) * Math.sin(dLng/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      return R * c
    }

    // Load Google Maps API
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
        
        // Add global callback
        window.initGoogleMapsCallback = () => {
          console.log('Google Maps API loaded successfully for BookService')
          delete window.initGoogleMapsCallback // Clean up
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
        
        console.log('Creating BookService map centered on Calapan City:', CALAPAN_CITY)
        
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
        
        // Add event listeners
        setupEventListeners()
        
        // Setup search box
        setupSearchBox()
        
        mapLoaded.value = true
        console.log('BookService map initialized successfully at Calapan City!')
        
        // Set initial location
        selectedMapCoordinates.value = {
          lat: CALAPAN_CITY.lat,
          lng: CALAPAN_CITY.lng
        }
        selectedMapAddress.value = CALAPAN_CITY.name
        
      } catch (err) {
        console.error('Error initializing map:', err)
        error.value = `Failed to load map: ${err.message}. Please check your internet connection and try again.`
        mapLoaded.value = false
      }
    }

    const setupEventListeners = () => {
      // Listen for map clicks
      map.value.addListener('click', (event) => {
        const location = event.latLng
        const lat = location.lat()
        const lng = location.lng()
        
        // Check if location is within Calapan City bounds
        if (lat >= CALAPAN_BOUNDS.south && lat <= CALAPAN_BOUNDS.north &&
            lng >= CALAPAN_BOUNDS.west && lng <= CALAPAN_BOUNDS.east) {
          
          getAddressFromCoordinates(lat, lng)
          setMapMarker(location)
        } else {
          alert('Please select a location within Calapan City, Oriental Mindoro only.')
        }
      })

      // Listen for marker drags
      marker.value.addListener('dragend', (event) => {
        const location = event.latLng
        const lat = location.lat()
        const lng = location.lng()
        
        // Check if location is within Calapan City bounds
        if (lat >= CALAPAN_BOUNDS.south && lat <= CALAPAN_BOUNDS.north &&
            lng >= CALAPAN_BOUNDS.west && lng <= CALAPAN_BOUNDS.east) {
          
          getAddressFromCoordinates(lat, lng)
          setMapMarker(location)
        } else {
          // Move marker back to Calapan City center
          marker.value.setPosition(new window.google.maps.LatLng(CALAPAN_CITY.lat, CALAPAN_CITY.lng))
          alert('Please select a location within Calapan City, Oriental Mindoro only.')
        }
      })
    }

    const setupSearchBox = () => {
      // Setup autocomplete for search input with Calapan City bias
      if (mapSearchInput.value) {
        autocomplete.value = new window.google.maps.places.Autocomplete(mapSearchInput.value, {
          componentRestrictions: { country: 'ph' }, // Restrict to Philippines
          fields: ['address_components', 'geometry', 'formatted_address'],
          bounds: new window.google.maps.LatLngBounds(
            new window.google.maps.LatLng(CALAPAN_BOUNDS.south, CALAPAN_BOUNDS.west),
            new window.google.maps.LatLng(CALAPAN_BOUNDS.north, CALAPAN_BOUNDS.east)
          )
        })

        autocomplete.value.addListener('place_changed', () => {
          const place = autocomplete.value.getPlace()
          if (place.geometry) {
            const location = place.geometry.location
            const lat = location.lat()
            const lng = location.lng()
            
            // Check if place is within Calapan City bounds
            if (lat >= CALAPAN_BOUNDS.south && lat <= CALAPAN_BOUNDS.north &&
                lng >= CALAPAN_BOUNDS.west && lng <= CALAPAN_BOUNDS.east) {
              
              map.value.setCenter(location)
              map.value.setZoom(17)
              setMapMarker(location, place.formatted_address)
            } else {
              alert('Please search for locations within Calapan City, Oriental Mindoro only.')
              mapSearchQuery.value = ''
            }
          }
        })
      }
    }

    const setMapMarker = (location, address = '') => {
      // Update marker position
      marker.value.setPosition(location)

      selectedMapCoordinates.value = {
        lat: location.lat(),
        lng: location.lng()
      }

      if (address) {
        selectedMapAddress.value = address
      }
    }

    const getAddressFromCoordinates = (lat, lng) => {
      if (!geocoder.value) return

      geocoder.value.geocode(
        { location: { lat, lng } },
        (results, status) => {
          if (status === 'OK' && results[0]) {
            selectedMapAddress.value = results[0].formatted_address
          }
        }
      )
    }

    const searchInMap = () => {
      if (!mapSearchQuery.value.trim()) return
      
      // Add Calapan City to search query if not present
      let searchTerm = mapSearchQuery.value
      if (!searchTerm.toLowerCase().includes('calapan') && !searchTerm.toLowerCase().includes('oriental mindoro')) {
        searchTerm += ', Calapan City, Oriental Mindoro'
      }
      
      if (geocoder.value) {
        geocoder.value.geocode({ 
          address: searchTerm,
          bounds: new window.google.maps.LatLngBounds(
            new window.google.maps.LatLng(CALAPAN_BOUNDS.south, CALAPAN_BOUNDS.west),
            new window.google.maps.LatLng(CALAPAN_BOUNDS.north, CALAPAN_BOUNDS.east)
          )
        }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location
            const lat = location.lat()
            const lng = location.lng()
            
            // Check if result is within Calapan City bounds
            if (lat >= CALAPAN_BOUNDS.south && lat <= CALAPAN_BOUNDS.north &&
                lng >= CALAPAN_BOUNDS.west && lng <= CALAPAN_BOUNDS.east) {
              
              map.value.setCenter(location)
              map.value.setZoom(17)
              setMapMarker(location, results[0].formatted_address)
            } else {
              alert('No results found within Calapan City, Oriental Mindoro.')
            }
          } else {
            alert('Location not found. Please try a different search term.')
          }
        })
      }
    }

    const openPickupMap = () => {
      mapModalType.value = 'pickup'
      showMapModal.value = true
      selectedMapCoordinates.value = form.pickup_coordinates || {
        lat: CALAPAN_CITY.lat,
        lng: CALAPAN_CITY.lng
      }
      selectedMapAddress.value = form.pickup_address || CALAPAN_CITY.name
      mapSearchQuery.value = ''
      
      setTimeout(() => {
        initMap()
      }, 100)
    }

    const openDeliveryMap = () => {
      mapModalType.value = 'delivery'
      showMapModal.value = true
      selectedMapCoordinates.value = form.delivery_coordinates || {
        lat: CALAPAN_CITY.lat,
        lng: CALAPAN_CITY.lng
      }
      selectedMapAddress.value = form.delivery_address || CALAPAN_CITY.name
      mapSearchQuery.value = ''
      
      setTimeout(() => {
        initMap()
      }, 100)
    }

    const closeMapModal = () => {
      showMapModal.value = false
      selectedMapCoordinates.value = null
      selectedMapAddress.value = ''
      mapSearchQuery.value = ''
      map.value = null
      marker.value = null
      mapLoaded.value = false
    }

    const confirmLocation = () => {
      if (!selectedMapCoordinates.value) return

      if (mapModalType.value === 'pickup') {
        form.pickup_coordinates = { ...selectedMapCoordinates.value }
        form.pickup_address = selectedMapAddress.value
      } else {
        form.delivery_coordinates = { ...selectedMapCoordinates.value }
        form.delivery_address = selectedMapAddress.value
      }

      closeMapModal()
    }

    const searchPickupLocation = () => {
      // Debounced search functionality can be added here
    }

    const searchDeliveryLocation = () => {
      // Debounced search functionality can be added here
    }
    
    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        // Handle file upload logic here
        console.log('File selected:', file.name)
      }
    }
    
    const handleImageUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        // Handle image upload logic here
        console.log('Image selected:', file.name)
      }
    }
    
    const submitOrder = async () => {
      error.value = ''
      
      if (!selectedService.value) {
        error.value = 'Please select a service type'
        return
      }
      
      if (!form.pickup_address || !form.delivery_address) {
        error.value = 'Please provide pickup and delivery addresses'
        return
      }
      
      // Prepare order data
      const orderData = {
        user_id: userProfile.value.user_id,
        service_type: selectedService.value,
        pickup_address: form.pickup_address,
        delivery_address: form.delivery_address,
        pickup_latitude: form.pickup_coordinates?.lat || null,
        pickup_longitude: form.pickup_coordinates?.lng || null,
        delivery_latitude: form.delivery_coordinates?.lat || null,
        delivery_longitude: form.delivery_coordinates?.lng || null,
        payment_method: form.payment_method,
        special_instructions: form.special_instructions,
        delivery_fee: totalFee.value,
        status: 'placed',
        service_details: getServiceDetails()
      }
      
      const { data, error: orderError } = await createOrder(orderData)
      
      if (orderError) {
        error.value = orderError.message
        return
      }
      
      if (data) {
        router.push({
          name: 'OrderDetails',
          params: { id: data.id }
        })
      }
    }
    
    const getServiceDetails = () => {
      const details = {}
      
      switch (selectedService.value) {
        case 'Food Delivery':
          details.restaurant = form.restaurant
          details.items = form.items
          break
        case 'Pay Bills':
          details.bill_type = form.bill_type
          details.account_number = form.account_number
          details.amount = form.amount
          break
        case 'Medicines':
          details.medicine_list = form.medicine_list
          break
        case 'Grocery':
          details.grocery_list = form.grocery_list
          details.budget = form.budget
          break
        case 'Surprise Delivery':
          details.item_description = form.item_description
          details.message = form.message
          details.recipient_info = form.recipient_info
          break
        case 'Pabili':
          details.item_name = form.item_name
          details.store_name = form.store_name
          details.notes = form.notes
          break
      }
      
      return details
    }

    const getCurrentLocation = () => {
      if (!navigator.geolocation) {
        showLocationMessage('Geolocation is not supported by this browser.', 'error')
        return
      }

      gettingLocation.value = true
      locationMessage.value = null

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          
          console.log('Current location:', lat, lng)
          
          // Check if current location is within Calapan City bounds
          if (lat >= CALAPAN_BOUNDS.south && lat <= CALAPAN_BOUNDS.north &&
              lng >= CALAPAN_BOUNDS.west && lng <= CALAPAN_BOUNDS.east) {
            
            // Location is within Calapan City
            const location = new window.google.maps.LatLng(lat, lng)
            
            if (map.value) {
              map.value.setCenter(location)
              map.value.setZoom(18)
              setMapMarker(location)
              getAddressFromCoordinates(lat, lng)
              showLocationMessage('📍 Current location found in Calapan City!', 'success')
            }
          } else {
            // Location is outside Calapan City bounds
            showLocationMessage('❌ Your current location is outside Calapan City, Oriental Mindoro. Please select a location within the city.', 'error')
          }
          
          gettingLocation.value = false
        },
        (error) => {
          console.error('Geolocation error:', error)
          let errorMessage = 'Unable to get your location. '
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Please allow location access in your browser.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information is unavailable.'
              break
            case error.TIMEOUT:
              errorMessage += 'Location request timed out.'
              break
            default:
              errorMessage += 'An unknown error occurred.'
              break
          }
          
          showLocationMessage(errorMessage, 'error')
          gettingLocation.value = false
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    }

    const showLocationMessage = (text, type) => {
      locationMessage.value = { text, type }
      
      // Auto-hide success messages after 3 seconds
      if (type === 'success') {
        setTimeout(() => {
          if (locationMessage.value && locationMessage.value.type === 'success') {
            locationMessage.value = null
          }
        }, 3000)
      }
    }
    
    onMounted(() => {
      // Check if service is pre-selected from query params
      if (route.query.service) {
        selectedService.value = route.query.service
      }
    })
    
    return {
      selectedService,
      services,
      paymentMethods,
      form,
      error,
      loading,
      estimatedDistance,
      calculatedDistance,
      totalFee,
      showMapModal,
      mapModalType,
      selectedMapCoordinates,
      selectedMapAddress,
      mapSearchQuery,
      mapSearchInput,
      mapContainer,
      selectService,
      resetForm,
      handleFileUpload,
      handleImageUpload,
      submitOrder,
      openPickupMap,
      openDeliveryMap,
      closeMapModal,
      confirmLocation,
      searchPickupLocation,
      searchDeliveryLocation,
      searchInMap,
      gettingLocation,
      locationMessage,
      getCurrentLocation
    }
  }
}
</script>
