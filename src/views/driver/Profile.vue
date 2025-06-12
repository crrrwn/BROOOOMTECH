<template>
  <div>
    <Navbar />
    
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-md mx-auto px-4 py-6">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Driver Profile</h1>
          <p class="text-gray-600">Manage your driver information</p>
        </div>
        
        <div class="space-y-4">
          <!-- Profile Picture -->
          <div class="bg-white rounded-lg p-4 shadow-sm">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
            
            <div class="flex items-center space-x-4">
              <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                <img
                  v-if="profilePicture"
                  :src="profilePicture"
                  alt="Profile"
                  class="w-full h-full object-cover"
                />
                <i v-else class="fas fa-user text-blue-600 text-2xl"></i>
              </div>
              <div class="flex-1">
                <label for="profile-pic" class="cursor-pointer">
                  <span class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <i class="fas fa-camera mr-2"></i>
                    Change Photo
                  </span>
                  <input
                    id="profile-pic"
                    type="file"
                    class="sr-only"
                    accept="image/*"
                    @change="handleProfilePicUpload"
                  />
                </label>
                <p class="mt-1 text-xs text-gray-500">JPG, PNG up to 5MB</p>
              </div>
            </div>
          </div>
          
          <!-- Basic Information -->
          <div class="bg-white rounded-lg p-4 shadow-sm">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <form @submit.prevent="updateBasicInfo" class="space-y-4">
              <div>
                <label for="first_name" class="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  id="first_name"
                  v-model="basicForm.first_name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label for="last_name" class="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  id="last_name"
                  v-model="basicForm.last_name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label for="contact_number" class="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number
                </label>
                <input
                  id="contact_number"
                  v-model="basicForm.contact_number"
                  type="tel"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  v-model="basicForm.email"
                  type="email"
                  disabled
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
              
              <button
                type="submit"
                :disabled="loading.basic"
                class="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ loading.basic ? 'Saving...' : 'Save Changes' }}
              </button>
            </form>
          </div>
          
          <!-- Vehicle Information -->
          <div class="bg-white rounded-lg p-4 shadow-sm">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Vehicle Information</h2>
            
            <form @submit.prevent="updateVehicleInfo" class="space-y-4">
              <div>
                <label for="vehicle_type" class="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Type
                </label>
                <select
                  id="vehicle_type"
                  v-model="vehicleForm.vehicle_type"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select vehicle type</option>
                  <option value="motorcycle">Motorcycle</option>
                  <option value="scooter">Scooter</option>
                  <option value="bicycle">Bicycle</option>
                </select>
              </div>
              
              <div>
                <label for="plate_number" class="block text-sm font-medium text-gray-700 mb-1">
                  Motorcycle Plate Number
                </label>
                <input
                  id="plate_number"
                  v-model="vehicleForm.plate_number"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., ABC-1234"
                />
              </div>
              
              <div>
                <label for="vehicle_brand" class="block text-sm font-medium text-gray-700 mb-1">
                  Brand & Model
                </label>
                <input
                  id="vehicle_brand"
                  v-model="vehicleForm.vehicle_brand"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., Honda Click 150i"
                />
              </div>
              
              <div>
                <label for="vehicle_color" class="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  id="vehicle_color"
                  v-model="vehicleForm.vehicle_color"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., Red"
                />
              </div>
              
              <button
                type="submit"
                :disabled="loading.vehicle"
                class="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ loading.vehicle ? 'Saving...' : 'Save Vehicle Info' }}
              </button>
            </form>
          </div>
          
          <!-- Documents -->
          <div class="bg-white rounded-lg p-4 shadow-sm">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Required Documents</h2>
            
            <div class="space-y-4">
              <!-- Driver's License -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Driver's License
                </label>
                <div v-if="documents.license" class="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div class="flex items-center">
                    <i class="fas fa-check-circle text-green-500 mr-2"></i>
                    <span class="text-sm text-green-700">License uploaded successfully</span>
                  </div>
                </div>
                <div v-else class="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div class="text-center">
                    <i class="fas fa-cloud-upload-alt text-gray-400 text-2xl mb-2"></i>
                    <label for="license-upload" class="cursor-pointer">
                      <span class="text-green-600 hover:text-green-500 font-medium">
                        Upload License
                      </span>
                      <input
                        id="license-upload"
                        type="file"
                        class="sr-only"
                        accept="image/*"
                        @change="handleFileUpload('license', $event)"
                      />
                    </label>
                    <p class="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                  </div>
                </div>
              </div>
              
              <!-- ORCR -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  ORCR (Official Receipt & Certificate of Registration)
                </label>
                <div v-if="documents.orcr" class="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div class="flex items-center">
                    <i class="fas fa-check-circle text-green-500 mr-2"></i>
                    <span class="text-sm text-green-700">ORCR uploaded successfully</span>
                  </div>
                </div>
                <div v-else class="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div class="text-center">
                    <i class="fas fa-cloud-upload-alt text-gray-400 text-2xl mb-2"></i>
                    <label for="orcr-upload" class="cursor-pointer">
                      <span class="text-green-600 hover:text-green-500 font-medium">
                        Upload ORCR
                      </span>
                      <input
                        id="orcr-upload"
                        type="file"
                        class="sr-only"
                        accept="image/*"
                        @change="handleFileUpload('orcr', $event)"
                      />
                    </label>
                    <p class="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                  </div>
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
    const { userProfile, updateProfile, user } = useAuth()
    
    const loading = reactive({
      basic: false,
      vehicle: false
    })
    
    const profilePicture = ref('')
    
    const basicForm = reactive({
      first_name: '',
      last_name: '',
      contact_number: '',
      email: ''
    })
    
    const vehicleForm = reactive({
      vehicle_type: '',
      plate_number: '',
      vehicle_brand: '',
      vehicle_color: ''
    })
    
    const documents = reactive({
      license: false,
      orcr: false
    })
    
    const initializeForms = () => {
      if (userProfile.value) {
        basicForm.first_name = userProfile.value.first_name || ''
        basicForm.last_name = userProfile.value.last_name || ''
        basicForm.contact_number = userProfile.value.contact_number || ''
        basicForm.email = user.value?.email || ''
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
          profilePicture.value = data.profile_picture_url || ''
        }
      } catch (error) {
        console.error('Error loading driver profile:', error)
      }
    }
    
    const updateBasicInfo = async () => {
      loading.basic = true
      
      try {
        const { error } = await updateProfile({
          first_name: basicForm.first_name,
          last_name: basicForm.last_name,
          contact_number: basicForm.contact_number
        })
        
        if (error) throw error
        
        alert('Profile updated successfully!')
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
    
    const handleProfilePicUpload = async (event) => {
      const file = event.target.files[0]
      if (!file) return
      
      try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${userProfile.value.user_id}_profile_${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('driver-documents')
          .upload(fileName, file)
        
        if (uploadError) throw uploadError
        
        const { data: { publicUrl } } = supabase.storage
          .from('driver-documents')
          .getPublicUrl(fileName)
        
        await supabase
          .from('driver_profiles')
          .upsert({
            user_id: userProfile.value.user_id,
            profile_picture_url: publicUrl
          })
        
        profilePicture.value = publicUrl
        alert('Profile picture updated successfully!')
      } catch (error) {
        alert('Error uploading profile picture: ' + error.message)
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
        
        const updateField = `${documentType}_url`
        const { error: updateError } = await supabase
          .from('driver_profiles')
          .upsert({
            user_id: userProfile.value.user_id,
            [updateField]: publicUrl
          })
        
        if (updateError) throw updateError
        
        documents[documentType] = true
        alert(`${documentType.toUpperCase()} uploaded successfully!`)
      } catch (error) {
        alert('Error uploading file: ' + error.message)
      }
    }
    
    onMounted(async () => {
      initializeForms()
      await loadDriverProfile()
    })
    
    return {
      userProfile,
      loading,
      profilePicture,
      basicForm,
      vehicleForm,
      documents,
      updateBasicInfo,
      updateVehicleInfo,
      handleProfilePicUpload,
      handleFileUpload
    }
  }
}
</script>
