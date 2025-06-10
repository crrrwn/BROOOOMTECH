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
                        @click="method.name === 'COD' ? (form.payment_method = method.name) : openPaymentModal(method.name)"
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
                        <div v-if="method.name !== 'COD'" class="text-xs text-blue-600 mt-1">
                          Tap for QR
                        </div>
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
                      class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
                      {{ loading ? 'Processing Your Order...' : 'Book Service Now' }}
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
                  <span class="text-gray-600">Distance ({{ calculatedDistance.toFixed(1) }}km):</span>
                  <span class="font-medium">₱{{ (calculatedDistance * 15).toFixed(2) }}</span>
                </div>
                
                <!-- AI Dynamic Pricing Factors -->
                <div v-if="getPricingFactors.length > 0" class="border-t border-gray-200 pt-3">
                  <p class="text-sm font-medium text-gray-700 mb-2">🤖 AI Dynamic Pricing</p>
                  <div class="space-y-1">
                    <div
                      v-for="factor in getPricingFactors"
                      :key="factor.label"
                      class="flex justify-between text-sm"
                    >
                      <span class="text-gray-600">{{ factor.label }}:</span>
                      <span :class="factor.color" class="font-medium">{{ factor.value }}</span>
                    </div>
                  </div>
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
                
                <div class="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                  <div class="flex items-start">
                    <i class="fas fa-robot text-blue-500 mr-2 mt-0.5"></i>
                    <div>
                      <p class="font-medium text-blue-800">AI-Powered Pricing</p>
                      <p class="text-blue-600">Price optimized based on distance, demand, time, and service type</p>
                    </div>
                  </div>
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
            style="min-height: 400px; background-color: #f3f4f6;"
          >
            <!-- Loading State -->
            <div v-if="!mapLoaded && !mapError" class="flex items-center justify-center h-full">
              <div class="text-center">
                <i class="fas fa-spinner fa-spin text-2xl text-gray-400 mb-2"></i>
                <p class="text-gray-500">Loading Calapan City map...</p>
              </div>
            </div>
            
            <!-- Error State with Fallback Options -->
            <div v-if="mapError" class="flex items-center justify-center h-full">
              <div class="text-center p-6">
                <i class="fas fa-exclamation-triangle text-3xl text-red-400 mb-4"></i>
                <h3 class="text-lg font-medium text-red-800 mb-2">Map Loading Failed</h3>
                <p class="text-red-600 mb-4">{{ mapError }}</p>
                
                <div class="space-y-3">
                  <button @click="retryMapLoad" class="btn-primary text-sm mr-2">
                    <i class="fas fa-redo mr-1"></i>
                    Retry Loading Map
                  </button>
                  <button @click="switchToOpenStreetMap" class="btn-secondary text-sm">
                    <i class="fas fa-map mr-1"></i>
                    Use Alternative Map
                  </button>
                </div>
                
                <!-- Manual Address Input -->
                <div class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <h4 class="font-medium text-yellow-800 mb-2">
                    <i class="fas fa-edit mr-1"></i>
                    Or enter address manually:
                  </h4>
                  <textarea
                    v-model="manualAddress"
                    placeholder="Enter complete address in Calapan City, Oriental Mindoro"
                    class="w-full p-2 border border-gray-300 rounded-md text-sm mb-2"
                    rows="2"
                  ></textarea>
                  <button 
                    @click="useManualAddress" 
                    class="btn-primary text-sm"
                    :disabled="!manualAddress.trim()"
                  >
                    Use This Address
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Map will be rendered here -->
            <div v-show="mapLoaded && !mapError" class="w-full h-full"></div>
          </div>
          
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

    <!-- Payment Modal -->
    <div 
      v-if="showPaymentModal" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="showPaymentModal = false"
    >
      <div 
        class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
        @click.stop
      >
        <div class="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">
            Pay with {{ selectedPaymentMethod }}
          </h3>
          <button
            @click="showPaymentModal = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="p-6 text-center">
          <div class="mb-4">
            <img 
              :src="paymentQRCode" 
              alt="Payment QR Code"
              class="w-48 h-48 mx-auto border border-gray-200 rounded-lg"
            />
          </div>
          
          <div class="mb-4">
            <p class="text-lg font-semibold text-gray-900">₱{{ totalFee.toFixed(2) }}</p>
            <p class="text-sm text-gray-600">Scan QR code with your {{ selectedPaymentMethod }} app</p>
          </div>
          
          <!-- Proof of Payment Upload -->
          <div class="mb-6 border-t border-gray-200 pt-4">
            <p class="text-sm font-medium text-gray-700 mb-2">Upload Proof of Payment</p>
            <div class="flex items-center justify-center">
              <label class="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50">
                <div v-if="!paymentProofPreview" class="flex flex-col items-center">
                  <i class="fas fa-cloud-upload-alt text-gray-400 text-3xl mb-2"></i>
                  <p class="text-sm text-gray-500">Click to upload screenshot</p>
                  <p class="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                </div>
                <div v-else class="w-full">
                  <img :src="paymentProofPreview" alt="Payment proof preview" class="h-32 mx-auto object-contain rounded" />
                  <p class="text-xs text-green-600 mt-2 text-center">
                    <i class="fas fa-check-circle mr-1"></i>
                    Image uploaded successfully
                  </p>
                </div>
                <input 
                  type="file" 
                  class="hidden" 
                  accept="image/*"
                  @change="handlePaymentProofUpload" 
                />
              </label>
            </div>
          </div>
          
          <div class="space-y-3">
            <button
              @click="confirmPayment"
              :disabled="!paymentProofFile && selectedPaymentMethod !== 'COD'"
              class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i v-if="uploadingPaymentProof" class="fas fa-spinner fa-spin mr-2"></i>
              {{ uploadingPaymentProof ? 'Uploading...' : 'Confirm Payment' }}
            </button>
            <button
              @click="showPaymentModal = false"
              class="w-full btn-secondary"
            >
              Cancel
            </button>
          </div>
          
          <div class="mt-4 text-xs text-gray-500">
            <p>⚠️ Please upload proof of payment before confirming</p>
            <p>Your order will be processed after payment verification</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Confirmation Modal -->
    <div 
      v-if="showOrderConfirmation && confirmedOrder" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      style="z-index: 9999;"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6 text-center">
          <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <i class="fas fa-check-circle text-green-600 text-3xl"></i>
          </div>
          
          <h3 class="text-2xl font-bold text-gray-900 mb-2">🎉 Booking Successful!</h3>
          <p class="text-green-600 font-medium mb-2">Your {{ confirmedOrder.service_type }} order has been placed</p>
          <p class="text-gray-600 mb-6">We're finding the best driver for you!</p>
          
          <div class="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6 text-left border border-green-200">
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-gray-600 font-medium">Order ID:</span>
                <span class="font-bold text-green-700">#{{ confirmedOrder.id }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Service:</span>
                <span class="font-medium">{{ confirmedOrder.service_type }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Total Amount:</span>
                <span class="font-bold text-green-600 text-lg">₱{{ confirmedOrder.delivery_fee }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Payment:</span>
                <span class="font-medium">{{ confirmedOrder.payment_method }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Status:</span>
                <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                  PLACED
                </span>
              </div>
            </div>
          </div>
          
          <!-- Payment Proof Preview -->
          <div v-if="paymentProofUrl || confirmedOrder.payment_proof_url" class="mb-6">
            <p class="text-sm font-medium text-gray-700 mb-2">Your Payment Proof</p>
            <div class="border border-gray-200 rounded-lg p-2">
              <img 
                :src="paymentProofUrl || confirmedOrder.payment_proof_url" 
                alt="Payment proof" 
                class="h-40 mx-auto object-contain" 
              />
            </div>
          </div>
          
          <!-- Cancellation Timer -->
          <div v-if="showCancellationTimer" class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <div class="flex items-start">
              <i class="fas fa-clock text-yellow-500 mr-2 mt-0.5"></i>
              <div class="text-left">
                <p class="text-sm font-medium text-yellow-800">Order can be cancelled for:</p>
                <p class="text-xl font-bold text-yellow-700 mt-1">{{ cancellationTimeLeft }} seconds</p>
                <button 
                  @click="cancelOrder" 
                  class="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors"
                >
                  Cancel Order
                </button>
              </div>
            </div>
          </div>
          
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <div class="flex items-start">
              <i class="fas fa-info-circle text-blue-500 mr-2 mt-0.5"></i>
              <div class="text-left">
                <p class="text-sm font-medium text-blue-800">What happens next?</p>
                <p class="text-xs text-blue-600 mt-1">
                  • We'll assign a driver to your order<br>
                  • You'll receive notifications about your order status<br>
                  • Track your order in real-time
                </p>
              </div>
            </div>
          </div>
          
          <div class="space-y-3">
            <router-link
              :to="`/user/orders/${confirmedOrder.id}`"
              class="w-full btn-primary block text-center"
              @click="showOrderConfirmation = false"
            >
              <i class="fas fa-map-marker-alt mr-2"></i>
              Track Order Now
            </router-link>
            <router-link
              to="/user/orders"
              class="w-full btn-secondary block text-center"
              @click="showOrderConfirmation = false"
            >
              <i class="fas fa-list mr-2"></i>
              View All Orders
            </router-link>
            <button
              @click="showOrderConfirmation = false"
              class="w-full text-gray-600 hover:text-gray-800 transition-colors"
            >
              Continue Booking More Services
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useOrders } from '@/composables/useOrders'
import { useSupabase } from '@/composables/useSupabase'
import { notificationService } from '@/composables/useNotification'
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
    const { createOrder, loading, updateOrderStatus } = useOrders()
    const { supabase } = useSupabase()
    
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
    const mapError = ref('')
    const gettingLocation = ref(false)
    const locationMessage = ref(null)
    const manualAddress = ref('')
    const useOpenStreetMap = ref(false)

    // Order confirmation and payment variables
    const showOrderConfirmation = ref(false)
    const confirmedOrder = ref(null)
    const showPaymentModal = ref(false)
    const selectedPaymentMethod = ref('')
    const paymentQRCode = ref('')
    
    // Payment proof variables
    const paymentProofFile = ref(null)
    const paymentProofPreview = ref(null)
    const paymentProofUrl = ref(null)
    const uploadingPaymentProof = ref(false)
    
    // Cancellation timer variables
    const showCancellationTimer = ref(false)
    const cancellationTimeLeft = ref(30)
    const cancellationInterval = ref(null)

    const isPeakHour = computed(() => {
      const currentHour = new Date().getHours()
      return (currentHour >= 7 && currentHour <= 9) || 
             (currentHour >= 12 && currentHour <= 14) || 
             (currentHour >= 18 && currentHour <= 20)
    })

    const getServiceMultiplier = () => {
      const serviceMultipliers = {
        'Food Delivery': 1.0,
        'Pay Bills': 0.8,
        'Pick-up': 1.0,
        'Surprise Delivery': 1.3,
        'Medicines': 1.1,
        'Grocery': 1.0,
        'Pabili': 1.0
      }
      return serviceMultipliers[selectedService.value] || 1.0
    }

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
      
      // AI-powered dynamic pricing factors
      let pricingMultiplier = 1
      const currentHour = new Date().getHours()
      const currentDay = new Date().getDay() // 0 = Sunday, 6 = Saturday
      
      // Peak hours pricing (7-9 AM, 12-2 PM, 6-8 PM) - 25% increase
      const isPeakHour = (currentHour >= 7 && currentHour <= 9) || 
                         (currentHour >= 12 && currentHour <= 14) || 
                         (currentHour >= 18 && currentHour <= 20)
      
      if (isPeakHour) {
        pricingMultiplier *= 1.25
      }
      
      // Weekend pricing (Friday evening to Sunday) - 15% increase
      const isWeekend = currentDay === 0 || currentDay === 6 || 
                       (currentDay === 5 && currentHour >= 18)
      
      if (isWeekend) {
        pricingMultiplier *= 1.15
      }
      
      // Weather-based pricing (simulated - in real app, use weather API)
      const isRainyDay = Math.random() < 0.3 // 30% chance of rain
      if (isRainyDay) {
        pricingMultiplier *= 1.2 // 20% increase for bad weather
      }
      
      // Distance-based surge pricing for long distances
      if (calculatedDistance.value > 10) {
        pricingMultiplier *= 1.1 // 10% increase for distances over 10km
      }
      
      // Service type multipliers with AI optimization
      const serviceMultipliers = {
        'Food Delivery': 1.0,
        'Pay Bills': 0.85, // Discount for simple tasks
        'Pick-up': 1.0,
        'Surprise Delivery': 1.4, // Premium for special handling
        'Medicines': 1.2, // Premium for urgent/sensitive items
        'Grocery': 1.05, // Slight premium for multiple items
        'Pabili': 1.0
      }
      
      const serviceMultiplier = serviceMultipliers[selectedService.value] || 1.0
      
      // Demand-based pricing (simulated AI prediction)
      const demandMultiplier = getDemandMultiplier()
      
      const totalBeforeMultipliers = baseFee + distanceFee
      const finalTotal = totalBeforeMultipliers * pricingMultiplier * serviceMultiplier * demandMultiplier
      
      return Math.round(finalTotal)
    })

    const getDemandMultiplier = () => {
      // Simulate AI demand prediction based on time and historical data
      const currentHour = new Date().getHours()
      const baselineOrders = 10 // Average orders per hour
      
      // Simulate current demand (in real app, this would come from your AI model)
      let predictedDemand = baselineOrders
      
      // Higher demand during meal times
      if ((currentHour >= 11 && currentHour <= 13) || (currentHour >= 18 && currentHour <= 20)) {
        predictedDemand *= 1.8
      }
      
      // Lower demand during late night/early morning
      if (currentHour >= 22 || currentHour <= 6) {
        predictedDemand *= 0.6
      }
      
      // Convert demand to pricing multiplier
      if (predictedDemand > baselineOrders * 1.5) {
        return 1.3 // High demand - 30% increase
      } else if (predictedDemand > baselineOrders * 1.2) {
        return 1.15 // Medium demand - 15% increase
      } else if (predictedDemand < baselineOrders * 0.8) {
        return 0.9 // Low demand - 10% discount
      }
      
      return 1.0 // Normal demand
    }

    const getPricingFactors = computed(() => {
      const factors = []
      const currentHour = new Date().getHours()
      const currentDay = new Date().getDay()
      
      if (isPeakHour.value) {
        factors.push({ label: 'Peak Hour Surcharge', value: '+25%', color: 'text-orange-600' })
      }
      
      const isWeekend = currentDay === 0 || currentDay === 6 || (currentDay === 5 && currentHour >= 18)
      if (isWeekend) {
        factors.push({ label: 'Weekend Premium', value: '+15%', color: 'text-blue-600' })
      }
      
      if (calculatedDistance.value > 10) {
        factors.push({ label: 'Long Distance Fee', value: '+10%', color: 'text-purple-600' })
      }
      
      const demandLevel = getDemandLevel()
      if (demandLevel !== 'Normal') {
        const demandColor = demandLevel === 'High' ? 'text-red-600' : demandLevel === 'Medium' ? 'text-yellow-600' : 'text-green-600'
        factors.push({ label: `${demandLevel} Demand`, value: getDemandText(), color: demandColor })
      }
      
      return factors
    })

    const getDemandLevel = () => {
      const multiplier = getDemandMultiplier()
      if (multiplier >= 1.3) return 'High'
      if (multiplier >= 1.15) return 'Medium'
      if (multiplier <= 0.9) return 'Low'
      return 'Normal'
    }

    const getDemandText = () => {
      const multiplier = getDemandMultiplier()
      if (multiplier >= 1.3) return '+30%'
      if (multiplier >= 1.15) return '+15%'
      if (multiplier <= 0.9) return '-10%'
      return '0%'
    }
    
    const selectService = (service) => {
      selectedService.value = service
      resetServiceFields()
      notificationService.info(`${service} service selected`, { title: 'Service Selected' })
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
      paymentProofFile.value = null
      paymentProofPreview.value = null
      paymentProofUrl.value = null
      notificationService.info('Form has been reset', { title: 'Form Reset' })
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

    // Load Google Maps API with better error handling
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
        
        script.onerror = (error) => {
          console.error('Failed to load Google Maps API:', error)
          delete window.initGoogleMapsCallback // Clean up
          reject(new Error('Failed to load Google Maps API. Please check your internet connection or try again later.'))
        }
        
        // Add timeout for loading
        const timeoutId = setTimeout(() => {
          if (!window.google || !window.google.maps) {
            console.error('Google Maps API loading timeout')
            reject(new Error('Google Maps API loading timeout. Please check your internet connection.'))
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

    // Load OpenStreetMap as fallback
    const loadOpenStreetMap = async () => {
      try {
        mapError.value = ''
        
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
        
        // Clear existing map
        if (map.value) {
          map.value.remove()
          map.value = null
        }
        
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
          selectedMapCoordinates.value = {
            lat: e.latlng.lat,
            lng: e.latlng.lng
          }
          reverseGeocodeOSM(e.latlng.lat, e.latlng.lng)
        })
        
        marker.value.on('dragend', () => {
          const pos = marker.value.getLatLng()
          selectedMapCoordinates.value = {
            lat: pos.lat,
            lng: pos.lng
          }
          reverseGeocodeOSM(pos.lat, pos.lng)
        })
        
        mapLoaded.value = true
        useOpenStreetMap.value = true
        console.log('OpenStreetMap loaded successfully at Calapan City')
        
        // Set initial coordinates
        selectedMapCoordinates.value = {
          lat: CALAPAN_CITY.lat,
          lng: CALAPAN_CITY.lng
        }
        selectedMapAddress.value = CALAPAN_CITY.name
        
      } catch (err) {
        console.error('Error loading OpenStreetMap:', err)
        mapError.value = 'Failed to load alternative map. Please use manual address input.'
      }
    }

    // Reverse geocode with OpenStreetMap
    const reverseGeocodeOSM = async (lat, lng) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
        )
        const data = await response.json()
        
        if (data && data.display_name) {
          selectedMapAddress.value = data.display_name
        } else {
          selectedMapAddress.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        }
      } catch (err) {
        console.error('Reverse geocoding failed:', err)
        selectedMapAddress.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      }
    }

    // Initialize map with better error handling
    const initMap = async () => {
      try {
        mapError.value = ''
        mapLoaded.value = false
        
        // Wait for container to be available
        if (!mapContainer.value) {
          throw new Error('Map container not found')
        }
        
        console.log('Attempting to load Google Maps...')
        
        // Try to load Google Maps first
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
        
        // Set initial coordinates
        selectedMapCoordinates.value = {
          lat: CALAPAN_CITY.lat,
          lng: CALAPAN_CITY.lng
        }
        selectedMapAddress.value = CALAPAN_CITY.name
        
        // Add click listener for map
        map.value.addListener('click', (event) => {
          const clickedLat = event.latLng.lat()
          const clickedLng = event.latLng.lng()
          
          console.log('Map clicked at:', clickedLat, clickedLng)
          
          // Check if clicked location is within Calapan City bounds
          if (clickedLat >= CALAPAN_BOUNDS.south && clickedLat <= CALAPAN_BOUNDS.north &&
              clickedLng >= CALAPAN_BOUNDS.west && clickedLng <= CALAPAN_BOUNDS.east) {
            
            // Update marker position
            marker.value.setPosition(event.latLng)
            
            // Set coordinates
            selectedMapCoordinates.value = {
              lat: clickedLat,
              lng: clickedLng
            }
            
            console.log('Coordinates set:', selectedMapCoordinates.value)
            
            // Get address from coordinates
            getAddressFromCoordinates(clickedLat, clickedLng)
          } else {
            showLocationMessage('Please select a location within Calapan City, Oriental Mindoro only.', 'error')
          }
        })
        
        // Add drag listener for marker
        marker.value.addListener('dragend', () => {
          const position = marker.value.getPosition()
          const lat = position.lat()
          const lng = position.lng()
          
          // Check if marker is within Calapan City bounds
          if (lat >= CALAPAN_BOUNDS.south && lat <= CALAPAN_BOUNDS.north &&
              lng >= CALAPAN_BOUNDS.west && lng >= CALAPAN_BOUNDS.east) {
            
            // Set coordinates
            selectedMapCoordinates.value = {
              lat: lat,
              lng: lng
            }
            
            // Get address from coordinates
            getAddressFromCoordinates(lat, lng)
          } else {
            // Move marker back to Calapan City center
            marker.value.setPosition(new window.google.maps.LatLng(CALAPAN_CITY.lat, CALAPAN_CITY.lng))
            showLocationMessage('Please select a location within Calapan City, Oriental Mindoro only.', 'error')
          }
        })
        
        // Setup search box
        setupSearchBox()
        
        mapLoaded.value = true
        useOpenStreetMap.value = false
        console.log('Google Maps initialized successfully at Calapan City!')
        
      } catch (err) {
        console.error('Error initializing Google Maps:', err)
        mapError.value = `Failed to load Google Maps: ${err.message}. You can try our alternative map or enter address manually.`
        mapLoaded.value = false
      }
    }

    const setupSearchBox = () => {
      // Setup autocomplete for search input with Calapan City bias
      if (mapSearchInput.value && window.google && window.google.maps && window.google.maps.places) {
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
              marker.value.setPosition(location)
              
              selectedMapCoordinates.value = {
                lat: lat,
                lng: lng
              }
              
              selectedMapAddress.value = place.formatted_address
            } else {
              showLocationMessage('Please search for locations within Calapan City, Oriental Mindoro only.', 'error')
              mapSearchQuery.value = ''
            }
          }
        })
      }
    }

    const getAddressFromCoordinates = (lat, lng) => {
      if (!geocoder.value) {
        // Fallback if geocoder is not available
        selectedMapAddress.value = `Location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`
        return
      }

      geocoder.value.geocode(
        { location: { lat, lng } },
        (results, status) => {
          if (status === 'OK' && results[0]) {
            selectedMapAddress.value = results[0].formatted_address
          } else {
            selectedMapAddress.value = `Location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`
          }
        }
      )
    }

    const searchInMap = () => {
      if (!mapSearchQuery.value.trim()) return
      
      if (useOpenStreetMap.value) {
        searchInOpenStreetMap()
        return
      }
      
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
              marker.value.setPosition(location)
              
              selectedMapCoordinates.value = {
                lat: lat,
                lng: lng
              }
              
              selectedMapAddress.value = results[0].formatted_address
            } else {
              showLocationMessage('No results found within Calapan City, Oriental Mindoro.', 'error')
            }
          } else {
            showLocationMessage('Location not found. Please try a different search term.', 'error')
          }
        })
      }
    }

    const searchInOpenStreetMap = async () => {
      try {
        const searchTerm = mapSearchQuery.value
        
        // Add Calapan City to search query if not present
        const fullSearchTerm = !searchTerm.toLowerCase().includes('calapan') && !searchTerm.toLowerCase().includes('oriental mindoro')
          ? `${searchTerm}, Calapan City, Oriental Mindoro`
          : searchTerm
        
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullSearchTerm)}&limit=1`
        )
        
        const data = await response.json()
        
        if (data && data.length > 0) {
          const result = data[0]
          const lat = parseFloat(result.lat)
          const lng = parseFloat(result.lon)
          
          // Check if result is within Calapan City bounds
          if (lat >= CALAPAN_BOUNDS.south && lat <= CALAPAN_BOUNDS.north &&
              lng >= CALAPAN_BOUNDS.west && lng <= CALAPAN_BOUNDS.east) {
            
            map.value.setView([lat, lng], 17)
            marker.value.setLatLng([lat, lng])
            
            selectedMapCoordinates.value = { lat, lng }
            selectedMapAddress.value = result.display_name
          } else {
            showLocationMessage('No results found within Calapan City, Oriental Mindoro.', 'error')
          }
        } else {
          showLocationMessage('Location not found. Please try a different search term.', 'error')
        }
      } catch (err) {
        console.error('Error searching in OpenStreetMap:', err)
        showLocationMessage('Search failed. Please try again.', 'error')
      }
    }

    const openPickupMap = () => {
      mapModalType.value = 'pickup'
      showMapModal.value = true
      mapError.value = ''
      
      // Set initial coordinates if available
      if (form.pickup_coordinates) {
        selectedMapCoordinates.value = { ...form.pickup_coordinates }
        selectedMapAddress.value = form.pickup_address
      } else {
        selectedMapCoordinates.value = {
          lat: CALAPAN_CITY.lat,
          lng: CALAPAN_CITY.lng
        }
        selectedMapAddress.value = CALAPAN_CITY.name
      }
      
      mapSearchQuery.value = ''
      manualAddress.value = form.pickup_address || ''
      
      // Initialize map after modal is shown
      setTimeout(() => {
        initMap()
      }, 100)
    }

    const openDeliveryMap = () => {
      mapModalType.value = 'delivery'
      showMapModal.value = true
      mapError.value = ''
      
      // Set initial coordinates if available
      if (form.delivery_coordinates) {
        selectedMapCoordinates.value = { ...form.delivery_coordinates }
        selectedMapAddress.value = form.delivery_address
      } else {
        selectedMapCoordinates.value = {
          lat: CALAPAN_CITY.lat,
          lng: CALAPAN_CITY.lng
        }
        selectedMapAddress.value = CALAPAN_CITY.name
      }
      
      mapSearchQuery.value = ''
      manualAddress.value = form.delivery_address || ''
      
      // Initialize map after modal is shown
      setTimeout(() => {
        initMap()
      }, 100)
    }

    const closeMapModal = () => {
      showMapModal.value = false
      mapSearchQuery.value = ''
      
      // Clean up map resources
      if (map.value && !useOpenStreetMap.value) {
        // Google Maps cleanup
        window.google.maps.event.clearInstanceListeners(map.value)
        if (marker.value) {
          window.google.maps.event.clearInstanceListeners(marker.value)
        }
      } else if (map.value && useOpenStreetMap.value) {
        // OpenStreetMap cleanup
        map.value.remove()
      }
      
      map.value = null
      marker.value = null
      mapLoaded.value = false
      useOpenStreetMap.value = false
    }

    const confirmLocation = () => {
      // Always allow confirmation if coordinates are set
      if (selectedMapCoordinates.value) {
        if (mapModalType.value === 'pickup') {
          form.pickup_coordinates = { ...selectedMapCoordinates.value }
          form.pickup_address = selectedMapAddress.value
          notificationService.success('Pickup location confirmed!', { title: 'Location Set' })
        } else {
          form.delivery_coordinates = { ...selectedMapCoordinates.value }
          form.delivery_address = selectedMapAddress.value
          notificationService.success('Delivery location confirmed!', { title: 'Location Set' })
        }
        closeMapModal()
      }
    }

    const useManualAddress = () => {
      if (!manualAddress.value.trim()) {
        showLocationMessage('Please enter an address first.', 'error')
        return
      }
      
      // Use Calapan City center coordinates with manual address
      if (mapModalType.value === 'pickup') {
        form.pickup_coordinates = {
          lat: CALAPAN_CITY.lat,
          lng: CALAPAN_CITY.lng
        }
        form.pickup_address = manualAddress.value
        notificationService.success('Pickup address saved manually', { title: 'Address Set' })
      } else {
        form.delivery_coordinates = {
          lat: CALAPAN_CITY.lat,
          lng: CALAPAN_CITY.lng
        }
        form.delivery_address = manualAddress.value
        notificationService.success('Delivery address saved manually', { title: 'Address Set' })
      }
      
      closeMapModal()
    }

    const retryMapLoad = () => {
      mapError.value = ''
      initMap()
    }

    const switchToOpenStreetMap = () => {
      mapError.value = ''
      loadOpenStreetMap()
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

    const handlePaymentProofUpload = async (event) => {
      const file = event.target.files[0]
      if (!file) return
      
      // Validate file type and size
      if (!file.type.match('image.*')) {
        notificationService.error('Please upload an image file', { title: 'Invalid File' })
        return
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        notificationService.error('File size must be less than 5MB', { title: 'File Too Large' })
        return
      }
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        paymentProofPreview.value = e.target.result
      }
      reader.readAsDataURL(file)
      
      // Store file for later upload
      paymentProofFile.value = file
    }

    const uploadPaymentProof = async () => {
      if (!paymentProofFile.value) return null
      
      try {
        uploadingPaymentProof.value = true
        
        // Create a unique file path
        const filePath = `payment_proofs/${userProfile.value.user_id}/${Date.now()}_${paymentProofFile.value.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
        
        // Upload to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
          .from('payment_proofs')
          .upload(filePath, paymentProofFile.value)
        
        if (uploadError) {
          throw new Error(uploadError.message)
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('payment_proofs')
          .getPublicUrl(filePath)
        
        paymentProofUrl.value = publicUrl
        return publicUrl
        
      } catch (err) {
        console.error('Error uploading payment proof:', err)
        notificationService.error('Failed to upload payment proof', { title: 'Upload Error' })
        return null
      } finally {
        uploadingPaymentProof.value = false
      }
    }

    const openPaymentModal = (method) => {
      selectedPaymentMethod.value = method
      paymentProofFile.value = null
      paymentProofPreview.value = null
      
      if (method !== 'COD') {
        generatePaymentQR(method)
      }
      
      showPaymentModal.value = true
    }

    const generatePaymentQR = (method) => {
      // In a real app, you'd integrate with actual payment providers
      const amount = totalFee.value
      const orderRef = `BROOOM-${Date.now()}`
      
      const qrData = {
        'GCash': `gcash://pay?amount=${amount}&reference=${orderRef}`,
        'PayMaya': `paymaya://pay?amount=${amount}&reference=${orderRef}`,
        'GoTyme': `gotyme://pay?amount=${amount}&reference=${orderRef}`
      }
      
      // Generate QR code (you'd use a real QR library like qrcode.js)
      paymentQRCode.value = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData[method])}`
    }

    const confirmPayment = async () => {
      // For COD, no need to upload proof
      if (selectedPaymentMethod.value === 'COD') {
        form.payment_method = 'COD'
        showPaymentModal.value = false
        proceedWithOrder()
        return
      }
      
      // For other payment methods, require proof
      if (!paymentProofFile.value) {
        notificationService.error('Please upload proof of payment', { title: 'Proof Required' })
        return
      }
      
      // Upload payment proof
      const proofUrl = await uploadPaymentProof()
      
      if (proofUrl) {
        form.payment_method = selectedPaymentMethod.value
        form.payment_proof_url = proofUrl
        showPaymentModal.value = false
        proceedWithOrder()
      }
    }

    const proceedWithOrder = async () => {
      await submitOrder()
    }
    
    const submitOrder = async () => {
      error.value = ''
      
      if (!selectedService.value) {
        error.value = 'Please select a service type'
        notificationService.error('Please select a service type', { title: 'Missing Information' })
        return
      }
      
      if (!form.pickup_address || !form.delivery_address) {
        error.value = 'Please provide pickup and delivery addresses'
        notificationService.error('Please provide pickup and delivery addresses', { title: 'Missing Information' })
        return
      }
      
      if (!form.pickup_coordinates || !form.delivery_coordinates) {
        error.value = 'Please pin both pickup and delivery locations on the map'
        notificationService.error('Please pin both pickup and delivery locations on the map', { title: 'Missing Information' })
        return
      }
      
      // Prepare order data with enhanced details
      const orderData = {
        user_id: userProfile.value.user_id,
        service_type: selectedService.value,
        pickup_address: form.pickup_address,
        delivery_address: form.delivery_address,
        pickup_latitude: form.pickup_coordinates.lat,
        pickup_longitude: form.pickup_coordinates.lng,
        delivery_latitude: form.delivery_coordinates.lat,
        delivery_longitude: form.delivery_coordinates.lng,
        payment_method: form.payment_method,
        payment_proof_url: form.payment_proof_url || null,
        special_instructions: form.special_instructions,
        delivery_fee: totalFee.value,
        distance_km: calculatedDistance.value,
        status: 'placed',
        service_details: getServiceDetails(),
        pricing_factors: {
          base_fee: 50,
          distance_fee: calculatedDistance.value * 15,
          service_multiplier: getServiceMultiplier(),
          demand_multiplier: getDemandMultiplier(),
          total_multiplier: totalFee.value / (50 + calculatedDistance.value * 15)
        }
      }
      
      try {
        const { data, error: orderError } = await createOrder(orderData)
      
        if (orderError) {
          error.value = orderError.message
          notificationService.error(orderError.message, { title: 'Order Failed' })
          return
        }
        
        if (data) {
          confirmedOrder.value = data
          showOrderConfirmation.value = true
          startCancellationTimer(data.id)
          resetForm()
          notificationService.success('Your order has been placed successfully!', { title: 'Order Confirmed' })
        }
      } catch (err) {
        console.error('Error submitting order:', err)
        error.value = 'An unexpected error occurred while submitting your order. Please try again.'
        notificationService.error('An unexpected error occurred. Please try again.', { title: 'Order Failed' })
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
            if (useOpenStreetMap.value) {
              // For OpenStreetMap
              map.value.setView([lat, lng], 18)
              marker.value.setLatLng([lat, lng])
              reverseGeocodeOSM(lat, lng)
            } else {
              // For Google Maps
              const location = new window.google.maps.LatLng(lat, lng)
              map.value.setCenter(location)
              map.value.setZoom(18)
              marker.value.setPosition(location)
              getAddressFromCoordinates(lat, lng)
            }
            
            selectedMapCoordinates.value = { lat, lng }
            showLocationMessage('📍 Current location found in Calapan City!', 'success')
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

    const startCancellationTimer = (orderId) => {
      showCancellationTimer.value = true
      cancellationTimeLeft.value = 30
      
      cancellationInterval.value = setInterval(() => {
        cancellationTimeLeft.value -= 1
        
        if (cancellationTimeLeft.value <= 0) {
          clearInterval(cancellationInterval.value)
          showCancellationTimer.value = false
        }
      }, 1000)
    }

    const cancelOrder = async () => {
      if (!confirmedOrder.value || !confirmedOrder.value.id) return
      
      try {
        const { error } = await updateOrderStatus(confirmedOrder.value.id, 'cancelled')
        
        if (error) {
          throw new Error(error.message)
        }
        
        notificationService.success('Your order has been cancelled', { title: 'Order Cancelled' })
        showOrderConfirmation.value = false
        clearInterval(cancellationInterval.value)
        
      } catch (err) {
        console.error('Error cancelling order:', err)
        notificationService.error('Failed to cancel order', { title: 'Cancellation Failed' })
      }
    }
    
    onMounted(() => {
      // Check if service is pre-selected from query params
      if (route.query.service) {
        selectedService.value = route.query.service
      }
    })
    
    onUnmounted(() => {
      // Clean up any intervals
      if (cancellationInterval.value) {
        clearInterval(cancellationInterval.value)
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
      mapLoaded,
      mapError,
      showOrderConfirmation,
      confirmedOrder,
      showPaymentModal,
      selectedPaymentMethod,
      paymentQRCode,
      paymentProofPreview,
      paymentProofFile,
      paymentProofUrl,
      uploadingPaymentProof,
      manualAddress,
      showCancellationTimer,
      cancellationTimeLeft,
      selectService,
      resetForm,
      handleFileUpload,
      handleImageUpload,
      handlePaymentProofUpload,
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
      getCurrentLocation,
      isPeakHour,
      getServiceMultiplier,
      getPricingFactors,
      getDemandLevel,
      openPaymentModal,
      generatePaymentQR,
      confirmPayment,
      proceedWithOrder,
      retryMapLoad,
      switchToOpenStreetMap,
      useManualAddress,
      cancelOrder
    }
  }
}
</script>
