<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <i class="fas fa-cog text-red-600 text-2xl"></i>
            </div>
            <div class="ml-4">
              <h1 class="text-2xl font-bold text-gray-900">System Settings</h1>
              <p class="text-sm text-gray-500">Manage application configuration</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Security Settings -->
      <div class="bg-white overflow-hidden shadow rounded-lg mb-6">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            <i class="fas fa-shield-alt text-red-600 mr-2"></i>
            Security Settings
          </h3>
          
          <div class="space-y-4">
            <!-- Admin Registration Code -->
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Admin Registration Code
              </label>
              <div class="mt-1 flex rounded-md shadow-sm">
                <input
                  v-model="settings.admin_registration_code"
                  :type="showAdminCode ? 'text' : 'password'"
                  class="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border-gray-300 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter new admin registration code"
                />
                <button
                  @click="showAdminCode = !showAdminCode"
                  type="button"
                  class="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100"
                >
                  <i :class="showAdminCode ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <p class="mt-1 text-xs text-gray-500">
                This code is required for new admin registrations. Keep it secure!
              </p>
            </div>

            <!-- Admin Registration Toggle -->
            <div class="flex items-center justify-between">
              <div>
                <label class="block text-sm font-medium text-gray-700">
                  Enable Admin Registration
                </label>
                <p class="text-xs text-gray-500">
                  Allow new admin accounts to be created
                </p>
              </div>
              <button
                @click="toggleAdminRegistration"
                :class="[
                  settings.admin_registration_enabled === 'true' 
                    ? 'bg-red-600' 
                    : 'bg-gray-200',
                  'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                ]"
              >
                <span
                  :class="[
                    settings.admin_registration_enabled === 'true' 
                      ? 'translate-x-5' 
                      : 'translate-x-0',
                    'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                  ]"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Application Settings -->
      <div class="bg-white overflow-hidden shadow rounded-lg mb-6">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            <i class="fas fa-cogs text-blue-600 mr-2"></i>
            Application Settings
          </h3>
          
          <div class="space-y-4">
            <!-- App Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Application Name
              </label>
              <input
                v-model="settings.app_name"
                type="text"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <!-- Max Delivery Distance -->
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Maximum Delivery Distance (km)
              </label>
              <input
                v-model="settings.max_delivery_distance_km"
                type="number"
                min="1"
                max="100"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <div class="flex justify-end">
        <button
          @click="saveSettings"
          :disabled="loading"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
        >
          <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
          <i v-else class="fas fa-save mr-2"></i>
          {{ loading ? 'Saving...' : 'Save Settings' }}
        </button>
      </div>

      <!-- Success/Error Messages -->
      <div v-if="message" class="mt-4">
        <div :class="[
          messageType === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800',
          'border rounded-md p-4'
        ]">
          <div class="flex">
            <div class="flex-shrink-0">
              <i :class="[
                messageType === 'success' ? 'fas fa-check-circle text-green-400' : 'fas fa-exclamation-circle text-red-400'
              ]"></i>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium">{{ message }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
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
    const loading = ref(false)
    const message = ref('')
    const messageType = ref('success')
    const showAdminCode = ref(false)
    
    const settings = reactive({
      admin_registration_code: '',
      admin_registration_enabled: 'true',
      app_name: '',
      max_delivery_distance_km: '50'
    })
    
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
        const { data, error } = await supabase
          .from('system_settings')
          .select('setting_key, setting_value')
        
        if (error) throw error
        
        // Map settings to reactive object
        data.forEach(setting => {
          if (settings.hasOwnProperty(setting.setting_key)) {
            settings[setting.setting_key] = setting.setting_value
          }
        })
      } catch (error) {
        console.error('Error loading settings:', error)
        showMessage('Error loading settings', 'error')
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
    
    const saveSettings = async () => {
      loading.value = true
      
      try {
        // Update each setting
        for (const [key, value] of Object.entries(settings)) {
          const { error } = await supabase
            .from('system_settings')
            .upsert({
              setting_key: key,
              setting_value: value,
              updated_at: new Date()
            })
          
          if (error) throw error
        }
        
        showMessage('Settings saved successfully!', 'success')
      } catch (error) {
        console.error('Error saving settings:', error)
        showMessage('Error saving settings', 'error')
      } finally {
        loading.value = false
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

    const toggleAdminRegistration = () => {
      settings.admin_registration_enabled = settings.admin_registration_enabled === 'true' ? 'false' : 'true'
    }
    
    const showMessage = (msg, type) => {
      message.value = msg
      messageType.value = type
      setTimeout(() => {
        message.value = ''
      }, 5000)
    }
    
    onMounted(() => {
      loadSettings()
    })
    
    return {
      loading,
      message,
      messageType,
      showAdminCode,
      settings,
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
      saveSettings,
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
      formatDate,
      toggleAdminRegistration
    }
  }
}
</script>
