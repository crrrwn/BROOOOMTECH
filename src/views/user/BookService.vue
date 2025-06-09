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
                    <div>
                      <label for="pickup_address" class="block text-sm font-medium text-gray-700">
                        Pickup Address
                      </label>
                      <textarea
                        id="pickup_address"
                        v-model="form.pickup_address"
                        rows="3"
                        required
                        class="mt-1 input-field"
                        placeholder="Enter pickup address"
                      ></textarea>
                    </div>
                    
                    <div>
                      <label for="delivery_address" class="block text-sm font-medium text-gray-700">
                        Delivery Address
                      </label>
                      <textarea
                        id="delivery_address"
                        v-model="form.delivery_address"
                        rows="3"
                        required
                        class="mt-1 input-field"
                        placeholder="Enter delivery address"
                      ></textarea>
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
                  <span class="font-medium">₱{{ estimatedDistance * 15 }}.00</span>
                </div>
                
                <div v-if="form.payment_method" class="flex justify-between">
                  <span class="text-gray-600">Payment:</span>
                  <span class="font-medium">{{ form.payment_method }}</span>
                </div>
                
                <div class="border-t border-gray-200 pt-4">
                  <div class="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span class="text-green-600">₱{{ totalFee }}.00</span>
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
    
    const totalFee = computed(() => {
      const baseFee = 50
      const distanceFee = estimatedDistance.value * 15
      return baseFee + distanceFee
    })
    
    const selectService = (service) => {
      selectedService.value = service
      resetServiceFields()
    }
    
    const resetServiceFields = () => {
      // Reset service-specific fields
      Object.keys(form).forEach(key => {
        if (!['pickup_address', 'delivery_address', 'payment_method', 'special_instructions'].includes(key)) {
          form[key] = ''
        }
      })
    }
    
    const resetForm = () => {
      Object.keys(form).forEach(key => {
        if (key === 'payment_method') {
          form[key] = 'COD'
        } else {
          form[key] = ''
        }
      })
      selectedService.value = ''
      error.value = ''
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
      totalFee,
      selectService,
      resetForm,
      handleFileUpload,
      handleImageUpload,
      submitOrder
    }
  }
}
</script>
