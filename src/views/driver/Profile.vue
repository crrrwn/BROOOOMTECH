<template>
  <div>
    <Navbar />
    
    <div class="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Driver Profile</h1>
          <p class="mt-2 text-gray-600">Manage your driver information and documents</p>
        </div>
        
        <div class="space-y-6">
          <!-- Basic Information -->
          <div class="card">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <form @submit.prevent="updateBasicInfo">
              <div class="space-y-6">
                <!-- Profile Picture -->
                <div class="flex items-center space-x-6">
                  <div class="flex-shrink-0">
                    <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                      <i class="fas fa-motorcycle text-blue-600 text-2xl"></i>
                    </div>
                  </div>
                  <div>
                    <button type="button" class="btn-secondary">
                      Change Photo
                    </button>
                    <p class="mt-2 text-sm text-gray-500">
                      JPG, GIF or PNG. Max size of 5MB.
                    </p>
                  </div>
                </div>
                
                <!-- Personal Information -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label for="first_name" class="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      id="first_name"
                      v-model="basicForm.first_name"
                      type="text"
                      required
                      class="mt-1 input-field"
                    />
                  </div>
                  
                  <div>
                    <label for="last_name" class="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      id="last_name"
                      v-model="basicForm.last_name"
                      type="text"
                      required
                      class="mt-1 input-field"
                    />
                  </div>
                  
                  <div>
                    <label for="contact_number" class="block text-sm font-medium text-gray-700">
                      Contact Number
                    </label>
                    <input
                      id="contact_number"
                      v-model="basicForm.contact_number"
                      type="tel"
                      required
                      class="mt-1 input-field"
                    />
                  </div>
                  
                  <div>
                    <label for="email" class="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      id="email"
                      v-model="basicForm.email"
                      type="email"
                      disabled
                      class="mt-1 input-field bg-gray-50 text-gray-500"
                    />
                  </div>
                  
                  <div class="md:col-span-2">
                    <label for="address" class="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <textarea
                      id="address"
                      v-model="basicForm.address"
                      rows="3"
                      required
                      class="mt-1 input-field"
                    ></textarea>
                  </div>
                </div>
                
                <div class="flex justify-end">
                  <button
                    type="submit"
                    :disabled="loading.basic"
                    class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ loading.basic ? 'Saving...' : 'Save Changes' }}
                  </button>
                </div>
              </div>
            </form>
          </div>
          
          <!-- Vehicle Information -->
          <div class="card">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Vehicle Information</h2>
            
            <form @submit.prevent="updateVehicleInfo">
              <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label for="vehicle_type" class="block text-sm font-medium text-gray-700">
                      Vehicle Type
                    </label>
                    <select
                      id="vehicle_type"
                      v-model="vehicleForm.vehicle_type"
                      required
                      class="mt-1 input-field"
                    >
                      <option value="">Select vehicle type</option>
                      <option value="motorcycle">Motorcycle</option>
                      <option value="scooter">Scooter</option>
                      <option value="bicycle">Bicycle</option>
                    </select>
                  </div>
                  
                  <div>
                    <label for="plate_number" class="block text-sm font-medium text-gray-700">
                      Plate Number
                    </label>
                    <input
                      id="plate_number"
                      v-model="vehicleForm.plate_number"
                      type="text"
                      required
                      class="mt-1 input-field"
                      placeholder="e.g., ABC-1234"
                    />
                  </div>
                  
                  <div>
                    <label for="vehicle_brand" class="block text-sm font-medium text-gray-700">
                      Brand & Model
                    </label>
                    <input
                      id="vehicle_brand"
                      v-model="vehicleForm.vehicle_brand"
                      type="text"
                      class="mt-1 input-field"
                      placeholder="e.g., Honda Click 150i"
                    />
                  </div>
                  
                  <div>
                    <label for="vehicle_color" class="block text-sm font-medium text-gray-700">
                      Color
                    </label>
                    <input
                      id="vehicle_color"
                      v-model="vehicleForm.vehicle_color"
                      type="text"
                      class="mt-1 input-field"
                      placeholder="e.g., Red"
                    />
                  </div>
                </div>
                
                <div class="flex justify-end">
                  <button
                    type="submit"
                    :disabled="loading.vehicle"
                    class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ loading.vehicle ? 'Saving...' : 'Save Vehicle Info' }}
                  </button>
                </div>
              </div>
            </form>
          </div>
          
          <!-- Documents -->
          <div class="card">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Documents</h2>
            
            <div class="space-y-6">
              <!-- Driver's License -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Driver's License
                </label>
                <div class="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div class="text-center">
                    <i class="fas fa-cloud-upload-alt text-gray-400 text-3xl mb-4"></i>
                    <div class="text-sm text-gray-600">
                      <label for="license-upload" class="cursor-pointer">
                        <span class="text-green-600 hover:text-green-500 font-medium">
                          Upload a file
                        </span>
                        <input
                          id="license-upload"
                          type="file"
                          class="sr-only"
                          accept="image/*"
                          @change="handleFileUpload('license', $event)"
                        />
                      </label>
                      or drag and drop
                    </div>
                    <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
                
                <div v-if="documents.license" class="mt-4 p-4 bg-green-50 rounded-lg">
                  <div class="flex items-center">
                    <i class="fas fa-check-circle text-green-500 mr-2"></i>
                    <span class="text-sm text-green-700">License uploaded successfully</span>
                  </div>
                </div>
              </div>
              
              <!-- ORCR -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  ORCR (Official Receipt & Certificate of Registration)
                </label>
                <div class="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div class="text-center">
                    <i class="fas fa-cloud-upload-alt text-gray-400 text-3xl mb-4"></i>
                    <div class="text-sm text-gray-600">
                      <label for="orcr-upload" class="cursor-pointer">
                        <span class="text-green-600 hover:text-green-500 font-medium">
                          Upload a file
                        </span>
                        <input
                          id="orcr-upload"
                          type="file"
                          class="sr-only"
                          accept="image/*"
                          @change="handleFileUpload('orcr', $event)"
                        />
                      </label>
                      or drag and drop
                    </div>
                    <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
                
                <div v-if="documents.orcr" class="mt-4 p-4 bg-green-50 rounded-lg">
                  <div class="flex items-center">
                    <i class="fas fa-check-circle text-green-500 mr-2"></i>
                    <span class="text-sm text-green-700">ORCR uploaded successfully</span>
                  </div>
                </div>
              </div>
              
              <!-- Selfie with ID -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Selfie with ID
                </label>
                <div class="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div class="text-center">
                    <i class="fas fa-cloud-upload-alt text-gray-400 text-3xl mb-4"></i>
                    <div class="text-sm text-gray-600">
                      <label for="selfie-upload" class="cursor-pointer">
                        <span class="text-green-600 hover:text-green-500 font-medium">
                          Upload a file
                        </span>
                        <input
                          id="selfie-upload"
                          type="file"
                          class="sr-only"
                          accept="image/*"
                          @change="handleFileUpload('selfie', $event)"
                        />
                      </label>
                      or drag and drop
                    </div>
                    <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
                
                <div v-if="documents.selfie" class="mt-4 p-4 bg-green-50 rounded-lg">
                  <div class="flex items-center">
                    <i class="fas fa-check-circle text-green-500 mr-2"></i>
                    <span class="text-sm text-green-700">Selfie uploaded successfully</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Driver Stats -->
          <div class="card">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Driver Statistics</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="text-center">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i class="fas fa-check-circle text-green-600 text-2xl"></i>
                </div>
                <p class="text-2xl font-bold text-gray-900">{{ driverStats.totalDeliveries }}</p>
                <p class="text-sm text-gray-500">Total Deliveries</p>
              </div>
              
              <div class="text-center">
                <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i class="fas fa-star text-yellow-600 text-2xl"></i>
                </div>
                <p class="text-2xl font-bold text-gray-900">{{ driverStats.rating || 'N/A' }}</p>
                <p class="text-sm text-gray-500">Average Rating</p>
              </div>
              
              <div class="text-center">
                <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i class="fas fa-calendar text-blue-600 text-2xl"></i>
                </div>
                <p class="text-2xl font-bold text-gray-900">{{ calculateDaysActive() }}</p>
                <p class="text-sm text-gray-500">Days Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { supabase } from '@/composables/useSupabase'
import Navbar from '@/components/common/Navbar.vue'

export default {
  name: 'DriverProfile',
  components: {
    Navbar
  },
  setup() {
    const { userProfile, updateProfile } = useAuth()
    
    const loading = reactive({
      basic: false,
      vehicle: false
    })
    
    const basicForm = reactive({
      first_name: '',
      last_name: '',
      contact_number: '',
      email: '',
      address: ''
    })
    
    const vehicleForm = reactive({
      vehicle_type: '',
      plate_number: '',
      vehicle_brand: '',
      vehicle_color: ''
    })
    
    const documents = reactive({
      license: false,
      orcr: false,
      selfie: false
    })
    
    const driverStats = reactive({
      totalDeliveries: 0,
      rating: 4.8,
      joinDate: new Date()
    })
    
    const initializeForms = () => {
      if (userProfile.value) {
        basicForm.first_name = userProfile.value.first_name || ''
        basicForm.last_name = userProfile.value.last_name || ''
        basicForm.contact_number = userProfile.value.contact_number || ''
        basicForm.email = userProfile.value.email || ''
        basicForm.address = userProfile.value.address || ''
      }
    }
    
    const loadDriverProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('driver_profiles')
          .select('*')
          .eq('user_id', userProfile.value.user_id)
          .single()
        
        if (error && error.code !== 'PGRST116') {
          throw error
        }
        
        if (data) {
          vehicleForm.vehicle_type = data.vehicle_type || ''
          vehicleForm.plate_number = data.plate_number || ''
          vehicleForm.vehicle_brand = data.vehicle_brand || ''
          vehicleForm.vehicle_color = data.vehicle_color || ''
          
          documents.license = !!data.license_url
          documents.orcr = !!data.orcr_url
          documents.selfie = !!data.selfie_url
          
          if (data.created_at) {
            driverStats.joinDate = new Date(data.created_at)
          }
        }
      } catch (error) {
        console.error('Error loading driver profile:', error)
      }
    }
    
    const loadDriverStats = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('id, status')
          .eq('driver_id', userProfile.value.user_id)
        
        if (error) throw error
        
        driverStats.totalDeliveries = data?.filter(order => order.status === 'delivered').length || 0
      } catch (error) {
        console.error('Error loading driver stats:', error)
      }
    }
    
    const updateBasicInfo = async () => {
      loading.basic = true
      
      try {
        const { error } = await updateProfile({
          first_name: basicForm.first_name,
          last_name: basicForm.last_name,
          contact_number: basicForm.contact_number,
          address: basicForm.address
        })
        
        if (error) throw error
        
        alert('Basic information updated successfully!')
      } catch (error) {
        alert('Error updating profile: ' + error.message)
      } finally {
        loading.basic = false
      }
    }
    
    const updateVehicleInfo = async () => {
      loading.vehicle = true
      
      try {
        const { error } = await supabase
          .from('driver_profiles')
          .upsert({
            user_id: userProfile.value.user_id,
            vehicle_type: vehicleForm.vehicle_type,
            plate_number: vehicleForm.plate_number,
            vehicle_brand: vehicleForm.vehicle_brand,
            vehicle_color: vehicleForm.vehicle_color,
            vehicle_info: `${vehicleForm.vehicle_brand} ${vehicleForm.vehicle_color} (${vehicleForm.plate_number})`
          })
        
        if (error) throw error
        
        alert('Vehicle information updated successfully!')
      } catch (error) {
        alert('Error updating vehicle info: ' + error.message)
      } finally {
        loading.vehicle = false
      }
    }
    
    const handleFileUpload = async (documentType, event) => {
      const file = event.target.files[0]
      if (!file) return
      
      try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${userProfile.value.user_id}_${documentType}_${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('driver-documents')
          .upload(fileName, file)
        
        if (uploadError) throw uploadError
        
        const { data: { publicUrl } } = supabase.storage
          .from('driver-documents')
          .getPublicUrl(fileName)
        
        // Update driver profile with document URL
        const updateField = `${documentType}_url`
        const { error: updateError } = await supabase
          .from('driver_profiles')
          .upsert({
            user_id: userProfile.value.user_id,
            [updateField]: publicUrl
          })
        
        if (updateError) throw updateError
        
        documents[documentType] = true
        alert(`${documentType.charAt(0).toUpperCase() + documentType.slice(1)} uploaded successfully!`)
      } catch (error) {
        alert('Error uploading file: ' + error.message)
      }
    }
    
    const calculateDaysActive = () => {
      const now = new Date()
      const diffTime = Math.abs(now - driverStats.joinDate)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    }
    
    onMounted(async () => {
      initializeForms()
      await loadDriverProfile()
      await loadDriverStats()
    })
    
    return {
      userProfile,
      loading,
      basicForm,
      vehicleForm,
      documents,
      driverStats,
      updateBasicInfo,
      updateVehicleInfo,
      handleFileUpload,
      calculateDaysActive
    }
  }
}
</script>
