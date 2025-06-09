<template>
  <div>
    <Navbar />
    
    <div class="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">System Settings</h1>
          <p class="mt-2 text-gray-600">Configure system settings and preferences</p>
        </div>
        
        <div class="space-y-8">
          <!-- Service Categories -->
          <div class="card">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Service Categories</h2>
            
            <div class="space-y-4">
              <div
                v-for="(service, index) in serviceCategories"
                :key="index"
                class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div class="flex items-center space-x-4">
                  <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <i :class="service.icon + ' text-green-600'"></i>
                  </div>
                  <div>
                    <h3 class="font-medium text-gray-900">{{ service.name }}</h3>
                    <p class="text-sm text-gray-500">{{ service.description }}</p>
                  </div>
                </div>
                
                <div class="flex items-center space-x-2">
                  <span :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    service.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  ]">
                    {{ service.active ? 'Active' : 'Inactive' }}
                  </span>
                  
                  <button
                    @click="editService(service, index)"
                    class="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50"
                    title="Edit Service"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  
                  <button
                    @click="toggleService(index)"
                    class="text-gray-600 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-50"
                    :title="service.active ? 'Deactivate' : 'Activate'"
                  >
                    <i :class="service.active ? 'fas fa-toggle-on text-green-600' : 'fas fa-toggle-off'"></i>
                  </button>
                </div>
              </div>
              
              <button
                @click="addNewService"
                class="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors"
              >
                <div class="flex items-center justify-center space-x-2 text-gray-600">
                  <i class="fas fa-plus"></i>
                  <span>Add New Service Category</span>
                </div>
              </button>
            </div>
          </div>
          
          <!-- Pricing Settings -->
          <div class="card">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Pricing Configuration</h2>
            
            <form @submit.prevent="savePricingSettings" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="base_fee" class="block text-sm font-medium text-gray-700">
                    Base Delivery Fee (₱)
                  </label>
                  <input
                    id="base_fee"
                    v-model.number="pricingSettings.base_fee"
                    type="number"
                    step="0.01"
                    min="0"
                    class="mt-1 input-field"
                    placeholder="50.00"
                  />
                </div>
                
                <div>
                  <label for="per_km_rate" class="block text-sm font-medium text-gray-700">
                    Per Kilometer Rate (₱)
                  </label>
                  <input
                    id="per_km_rate"
                    v-model.number="pricingSettings.per_km_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    class="mt-1 input-field"
                    placeholder="15.00"
                  />
                </div>
                
                <div>
                  <label for="peak_hour_multiplier" class="block text-sm font-medium text-gray-700">
                    Peak Hour Multiplier
                  </label>
                  <input
                    id="peak_hour_multiplier"
                    v-model.number="pricingSettings.peak_hour_multiplier"
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="3.0"
                    class="mt-1 input-field"
                    placeholder="1.5"
                  />
                </div>
                
                <div>
                  <label for="driver_availability_multiplier" class="block text-sm font-medium text-gray-700">
                    Low Driver Availability Multiplier
                  </label>
                  <input
                    id="driver_availability_multiplier"
                    v-model.number="pricingSettings.driver_availability_multiplier"
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="2.0"
                    class="mt-1 input-field"
                    placeholder="1.2"
                  />
                </div>
              </div>
              
              <div class="border-t border-gray-200 pt-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Peak Hours Configuration</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label for="peak_start" class="block text-sm font-medium text-gray-700">
                      Peak Hours Start
                    </label>
                    <input
                      id="peak_start"
                      v-model="pricingSettings.peak_hours_start"
                      type="time"
                      class="mt-1 input-field"
                    />
                  </div>
                  
                  <div>
                    <label for="peak_end" class="block text-sm font-medium text-gray-700">
                      Peak Hours End
                    </label>
                    <input
                      id="peak_end"
                      v-model="pricingSettings.peak_hours_end"
                      type="time"
                      class="mt-1 input-field"
                    />
                  </div>
                </div>
              </div>
              
              <div class="flex justify-end">
                <button
                  type="submit"
                  :disabled="loading.pricing"
                  class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ loading.pricing ? 'Saving...' : 'Save Pricing Settings' }}
                </button>
              </div>
            </form>
          </div>
          
          <!-- Payment Methods -->
          <div class="card">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Payment Methods</h2>
            
            <div class="space-y-4">
              <div
                v-for="(method, index) in paymentMethods"
                :key="index"
                class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div class="flex items-center space-x-4">
                  <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i :class="method.icon + ' text-blue-600'"></i>
                  </div>
                  <div>
                    <h3 class="font-medium text-gray-900">{{ method.name }}</h3>
                    <p class="text-sm text-gray-500">{{ method.description }}</p>
                  </div>
                </div>
                
                <div class="flex items-center space-x-4">
                  <span :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    method.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  ]">
                    {{ method.active ? 'Active' : 'Inactive' }}
                  </span>
                  
                  <button
                    v-if="method.type === 'qr'"
                    @click="uploadQRCode(method, index)"
                    class="text-purple-600 hover:text-purple-700 p-2 rounded-lg hover:bg-purple-50"
                    title="Upload QR Code"
                  >
                    <i class="fas fa-qrcode"></i>
                  </button>
                  
                  <button
                    @click="togglePaymentMethod(index)"
                    class="text-gray-600 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-50"
                    :title="method.active ? 'Deactivate' : 'Activate'"
                  >
                    <i :class="method.active ? 'fas fa-toggle-on text-green-600' : 'fas fa-toggle-off'"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- System Configuration -->
          <div class="card">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">System Configuration</h2>
            
            <form @submit.prevent="saveSystemSettings" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="max_delivery_distance" class="block text-sm font-medium text-gray-700">
                    Maximum Delivery Distance (km)
                  </label>
                  <input
                    id="max_delivery_distance"
                    v-model.number="systemSettings.max_delivery_distance"
                    type="number"
                    min="1"
                    max="100"
                    class="mt-1 input-field"
                    placeholder="50"
                  />
                </div>
                
                <div>
                  <label for="order_timeout" class="block text-sm font-medium text-gray-700">
                    Order Timeout (minutes)
                  </label>
                  <input
                    id="order_timeout"
                    v-model.number="systemSettings.order_timeout"
                    type="number"
                    min="5"
                    max="60"
                    class="mt-1 input-field"
                    placeholder="30"
                  />
                </div>
                
                <div>
                  <label for="driver_radius" class="block text-sm font-medium text-gray-700">
                    Driver Search Radius (km)
                  </label>
                  <input
                    id="driver_radius"
                    v-model.number="systemSettings.driver_radius"
                    type="number"
                    min="1"
                    max="50"
                    class="mt-1 input-field"
                    placeholder="10"
                  />
                </div>
                
                <div>
                  <label for="min_driver_rating" class="block text-sm font-medium text-gray-700">
                    Minimum Driver Rating
                  </label>
                  <input
                    id="min_driver_rating"
                    v-model.number="systemSettings.min_driver_rating"
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    class="mt-1 input-field"
                    placeholder="3.0"
                  />
                </div>
              </div>
              
              <div class="space-y-4">
                <div class="flex items-center">
                  <input
                    id="auto_assign_drivers"
                    v-model="systemSettings.auto_assign_drivers"
                    type="checkbox"
                    class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label for="auto_assign_drivers" class="ml-2 block text-sm text-gray-900">
                    Automatically assign drivers to orders
                  </label>
                </div>
                
                <div class="flex items-center">
                  <input
                    id="email_notifications"
                    v-model="systemSettings.email_notifications"
                    type="checkbox"
                    class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label for="email_notifications" class="ml-2 block text-sm text-gray-900">
                    Send email notifications for order updates
                  </label>
                </div>
                
                <div class="flex items-center">
                  <input
                    id="sms_notifications"
                    v-model="systemSettings.sms_notifications"
                    type="checkbox"
                    class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label for="sms_notifications" class="ml-2 block text-sm text-gray-900">
                    Send SMS notifications for order updates
                  </label>
                </div>
                
                <div class="flex items-center">
                  <input
                    id="maintenance_mode"
                    v-model="systemSettings.maintenance_mode"
                    type="checkbox"
                    class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label for="maintenance_mode" class="ml-2 block text-sm text-gray-900">
                    Enable maintenance mode (prevents new orders)
                  </label>
                </div>
              </div>
              
              <div class="flex justify-end">
                <button
                  type="submit"
                  :disabled="loading.system"
                  class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ loading.system ? 'Saving...' : 'Save System Settings' }}
                </button>
              </div>
            </form>
          </div>
          
          <!-- Promotional Settings -->
          <div class="card">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Promotional Codes</h2>
            
            <div class="space-y-4 mb-6">
              <div
                v-for="(promo, index) in promoCodes"
                :key="index"
                class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <h3 class="font-medium text-gray-900">{{ promo.code }}</h3>
                  <p class="text-sm text-gray-500">{{ promo.description }}</p>
                  <div class="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                    <span>{{ promo.discount_type === 'percentage' ? promo.discount_value + '%' : '₱' + promo.discount_value }} off</span>
                    <span>Expires: {{ formatDate(promo.expires_at) }}</span>
                    <span>Used: {{ promo.usage_count }}/{{ promo.usage_limit || '∞' }}</span>
                  </div>
                </div>
                
                <div class="flex items-center space-x-2">
                  <span :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    promo.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  ]">
                    {{ promo.active ? 'Active' : 'Inactive' }}
                  </span>
                  
                  <button
                    @click="editPromoCode(promo, index)"
                    class="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50"
                    title="Edit Promo Code"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  
                  <button
                    @click="deletePromoCode(index)"
                    class="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                    title="Delete Promo Code"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <button
              @click="addNewPromoCode"
              class="btn-outline w-full"
            >
              <i class="fas fa-plus mr-2"></i>
              Add New Promo Code
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Service Category Modal -->
    <Modal
      :is-open="showServiceModal"
      :title="editingServiceIndex !== null ? 'Edit Service Category' : 'Add Service Category'"
      size="lg"
      @close="closeServiceModal"
      @confirm="saveService"
    >
      <div class="space-y-4">
        <div>
          <label for="service-name" class="block text-sm font-medium text-gray-700">
            Service Name
          </label>
          <input
            id="service-name"
            v-model="serviceForm.name"
            type="text"
            class="mt-1 input-field"
            placeholder="Enter service name"
          />
        </div>
        
        <div>
          <label for="service-description" class="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="service-description"
            v-model="serviceForm.description"
            rows="3"
            class="mt-1 input-field"
            placeholder="Enter service description"
          ></textarea>
        </div>
        
        <div>
          <label for="service-icon" class="block text-sm font-medium text-gray-700">
            Icon Class (Font Awesome)
          </label>
          <input
            id="service-icon"
            v-model="serviceForm.icon"
            type="text"
            class="mt-1 input-field"
            placeholder="fas fa-utensils"
          />
        </div>
        
        <div class="flex items-center">
          <input
            id="service-active"
            v-model="serviceForm.active"
            type="checkbox"
            class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label for="service-active" class="ml-2 block text-sm text-gray-900">
            Active
          </label>
        </div>
      </div>
    </Modal>
    
    <!-- Promo Code Modal -->
    <Modal
      :is-open="showPromoModal"
      :title="editingPromoIndex !== null ? 'Edit Promo Code' : 'Add Promo Code'"
      size="lg"
      @close="closePromoModal"
      @confirm="savePromoCode"
    >
      <div class="space-y-4">
        <div>
          <label for="promo-code" class="block text-sm font-medium text-gray-700">
            Promo Code
          </label>
          <input
            id="promo-code"
            v-model="promoForm.code"
            type="text"
            class="mt-1 input-field"
            placeholder="SAVE20"
            style="text-transform: uppercase"
          />
        </div>
        
        <div>
          <label for="promo-description" class="block text-sm font-medium text-gray-700">
            Description
          </label>
          <input
            id="promo-description"
            v-model="promoForm.description"
            type="text"
            class="mt-1 input-field"
            placeholder="20% off on all orders"
          />
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="discount-type" class="block text-sm font-medium text-gray-700">
              Discount Type
            </label>
            <select
              id="discount-type"
              v-model="promoForm.discount_type"
              class="mt-1 input-field"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>
          
          <div>
            <label for="discount-value" class="block text-sm font-medium text-gray-700">
              Discount Value
            </label>
            <input
              id="discount-value"
              v-model.number="promoForm.discount_value"
              type="number"
              step="0.01"
              min="0"
              class="mt-1 input-field"
              :placeholder="promoForm.discount_type === 'percentage' ? '20' : '100'"
            />
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="usage-limit" class="block text-sm font-medium text-gray-700">
              Usage Limit (optional)
            </label>
            <input
              id="usage-limit"
              v-model.number="promoForm.usage_limit"
              type="number"
              min="1"
              class="mt-1 input-field"
              placeholder="100"
            />
          </div>
          
          <div>
            <label for="expires-at" class="block text-sm font-medium text-gray-700">
              Expiry Date
            </label>
            <input
              id="expires-at"
              v-model="promoForm.expires_at"
              type="datetime-local"
              class="mt-1 input-field"
            />
          </div>
        </div>
        
        <div class="flex items-center">
          <input
            id="promo-active"
            v-model="promoForm.active"
            type="checkbox"
            class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label for="promo-active" class="ml-2 block text-sm text-gray-900">
            Active
          </label>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { supabase } from '@/composables/useSupabase'
import Navbar from '@/components/common/Navbar.vue'
import Modal from '@/components/common/Modal.vue'

export default {
  name: 'AdminSettings',
  components: {
    Navbar,
    Modal
  },
  setup() {
    const loading = reactive({
      pricing: false,
      system: false
    })
    
    // Service Categories
    const serviceCategories = ref([
      {
        name: 'Food Delivery',
        description: 'Order food from restaurants',
        icon: 'fas fa-utensils',
        active: true
      },
      {
        name: 'Pay Bills',
        description: 'Pay utility bills and other services',
        icon: 'fas fa-file-invoice-dollar',
        active: true
      },
      {
        name: 'Pick-up',
        description: 'Pick up items from any location',
        icon: 'fas fa-hand-paper',
        active: true
      },
      {
        name: 'Surprise Delivery',
        description: 'Send surprises to your loved ones',
        icon: 'fas fa-gift',
        active: true
      },
      {
        name: 'Medicines',
        description: 'Deliver medicines and prescriptions',
        icon: 'fas fa-pills',
        active: true
      },
      {
        name: 'Grocery',
        description: 'Grocery shopping and delivery',
        icon: 'fas fa-shopping-cart',
        active: true
      },
      {
        name: 'Pabili',
        description: 'Buy items from stores',
        icon: 'fas fa-shopping-bag',
        active: true
      }
    ])
    
    const showServiceModal = ref(false)
    const editingServiceIndex = ref(null)
    const serviceForm = reactive({
      name: '',
      description: '',
      icon: '',
      active: true
    })
    
    // Pricing Settings
    const pricingSettings = reactive({
      base_fee: 50,
      per_km_rate: 15,
      peak_hour_multiplier: 1.5,
      driver_availability_multiplier: 1.2,
      peak_hours_start: '07:00',
      peak_hours_end: '09:00'
    })
    
    // Payment Methods
    const paymentMethods = ref([
      {
        name: 'GCash',
        description: 'Mobile payment via GCash',
        icon: 'fas fa-mobile-alt',
        type: 'qr',
        active: true,
        qr_code_url: ''
      },
      {
        name: 'PayMaya',
        description: 'Mobile payment via PayMaya',
        icon: 'fas fa-credit-card',
        type: 'qr',
        active: true,
        qr_code_url: ''
      },
      {
        name: 'GoTyme',
        description: 'Digital bank payment',
        icon: 'fas fa-university',
        type: 'qr',
        active: true,
        qr_code_url: ''
      },
      {
        name: 'Cash on Delivery',
        description: 'Pay cash upon delivery',
        icon: 'fas fa-money-bill-wave',
        type: 'cod',
        active: true
      }
    ])
    
    // System Settings
    const systemSettings = reactive({
      max_delivery_distance: 50,
      order_timeout: 30,
      driver_radius: 10,
      min_driver_rating: 3.0,
      auto_assign_drivers: true,
      email_notifications: true,
      sms_notifications: false,
      maintenance_mode: false
    })
    
    // Promo Codes
    const promoCodes = ref([
      {
        code: 'WELCOME20',
        description: '20% off for new users',
        discount_type: 'percentage',
        discount_value: 20,
        usage_limit: 100,
        usage_count: 25,
        expires_at: '2024-12-31T23:59',
        active: true
      },
      {
        code: 'SAVE50',
        description: '₱50 off on orders above ₱500',
        discount_type: 'fixed',
        discount_value: 50,
        usage_limit: 200,
        usage_count: 45,
        expires_at: '2024-06-30T23:59',
        active: true
      }
    ])
    
    const showPromoModal = ref(false)
    const editingPromoIndex = ref(null)
    const promoForm = reactive({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      usage_limit: null,
      expires_at: '',
      active: true
    })
    
    const loadSettings = async () => {
      try {
        // Load settings from Supabase
        // In a real implementation, you would fetch these from a settings table
        console.log('Loading settings from database...')
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
    
    const savePricingSettings = async () => {
      loading.pricing = true
      
      try {
        // Save pricing settings to database
        // In a real implementation, you would save these to a settings table
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
        
        alert('Pricing settings saved successfully!')
      } catch (error) {
        console.error('Error saving pricing settings:', error)
        alert('Error saving pricing settings: ' + error.message)
      } finally {
        loading.pricing = false
      }
    }
    
    const saveSystemSettings = async () => {
      loading.system = true
      
      try {
        // Save system settings to database
        // In a real implementation, you would save these to a settings table
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
        
        alert('System settings saved successfully!')
      } catch (error) {
        console.error('Error saving system settings:', error)
        alert('Error saving system settings: ' + error.message)
      } finally {
        loading.system = false
      }
    }
    
    const toggleService = (index) => {
      serviceCategories.value[index].active = !serviceCategories.value[index].active
    }
    
    const addNewService = () => {
      editingServiceIndex.value = null
      serviceForm.name = ''
      serviceForm.description = ''
      serviceForm.icon = ''
      serviceForm.active = true
      showServiceModal.value = true
    }
    
    const editService = (service, index) => {
      editingServiceIndex.value = index
      serviceForm.name = service.name
      serviceForm.description = service.description
      serviceForm.icon = service.icon
      serviceForm.active = service.active
      showServiceModal.value = true
    }
    
    const closeServiceModal = () => {
      showServiceModal.value = false
      editingServiceIndex.value = null
    }
    
    const saveService = () => {
      if (!serviceForm.name || !serviceForm.description || !serviceForm.icon) {
        alert('Please fill in all fields')
        return
      }
      
      const serviceData = {
        name: serviceForm.name,
        description: serviceForm.description,
        icon: serviceForm.icon,
        active: serviceForm.active
      }
      
      if (editingServiceIndex.value !== null) {
        serviceCategories.value[editingServiceIndex.value] = serviceData
      } else {
        serviceCategories.value.push(serviceData)
      }
      
      closeServiceModal()
    }
    
    const togglePaymentMethod = (index) => {
      paymentMethods.value[index].active = !paymentMethods.value[index].active
    }
    
    const uploadQRCode = (method, index) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = async (event) => {
        const file = event.target.files[0]
        if (!file) return
        
        try {
          // Upload QR code to Supabase Storage
          const fileName = `qr_${method.name.toLowerCase()}_${Date.now()}.${file.name.split('.').pop()}`
          
          const { error: uploadError } = await supabase.storage
            .from('payment-qr-codes')
            .upload(fileName, file)
          
          if (uploadError) throw uploadError
          
          const { data: { publicUrl } } = supabase.storage
            .from('payment-qr-codes')
            .getPublicUrl(fileName)
          
          paymentMethods.value[index].qr_code_url = publicUrl
          alert('QR code uploaded successfully!')
        } catch (error) {
          console.error('Error uploading QR code:', error)
          alert('Error uploading QR code: ' + error.message)
        }
      }
      input.click()
    }
    
    const addNewPromoCode = () => {
      editingPromoIndex.value = null
      promoForm.code = ''
      promoForm.description = ''
      promoForm.discount_type = 'percentage'
      promoForm.discount_value = 0
      promoForm.usage_limit = null
      promoForm.expires_at = ''
      promoForm.active = true
      showPromoModal.value = true
    }
    
    const editPromoCode = (promo, index) => {
      editingPromoIndex.value = index
      promoForm.code = promo.code
      promoForm.description = promo.description
      promoForm.discount_type = promo.discount_type
      promoForm.discount_value = promo.discount_value
      promoForm.usage_limit = promo.usage_limit
      promoForm.expires_at = promo.expires_at
      promoForm.active = promo.active
      showPromoModal.value = true
    }
    
    const closePromoModal = () => {
      showPromoModal.value = false
      editingPromoIndex.value = null
    }
    
    const savePromoCode = () => {
      if (!promoForm.code || !promoForm.description || !promoForm.discount_value || !promoForm.expires_at) {
        alert('Please fill in all required fields')
        return
      }
      
      const promoData = {
        code: promoForm.code.toUpperCase(),
        description: promoForm.description,
        discount_type: promoForm.discount_type,
        discount_value: promoForm.discount_value,
        usage_limit: promoForm.usage_limit,
        usage_count: editingPromoIndex.value !== null ? promoCodes.value[editingPromoIndex.value].usage_count : 0,
        expires_at: promoForm.expires_at,
        active: promoForm.active
      }
      
      if (editingPromoIndex.value !== null) {
        promoCodes.value[editingPromoIndex.value] = promoData
      } else {
        promoCodes.value.push(promoData)
      }
      
      closePromoModal()
    }
    
    const deletePromoCode = (index) => {
      if (confirm('Are you sure you want to delete this promo code?')) {
        promoCodes.value.splice(index, 1)
      }
    }
    
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }
    
    onMounted(() => {
      loadSettings()
    })
    
    return {
      loading,
      serviceCategories,
      showServiceModal,
      editingServiceIndex,
      serviceForm,
      pricingSettings,
      paymentMethods,
      systemSettings,
      promoCodes,
      showPromoModal,
      editingPromoIndex,
      promoForm,
      savePricingSettings,
      saveSystemSettings,
      toggleService,
      addNewService,
      editService,
      closeServiceModal,
      saveService,
      togglePaymentMethod,
      uploadQRCode,
      addNewPromoCode,
      editPromoCode,
      closePromoModal,
      savePromoCode,
      deletePromoCode,
      formatDate
    }
  }
}
</script>
