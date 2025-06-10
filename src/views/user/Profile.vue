<template>
  <div>
    <Navbar />
    
    <div class="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p class="mt-2 text-gray-600">Manage your personal information and preferences</p>
        </div>
        
        <div class="card">
          <form @submit.prevent="updateProfile">
            <div class="space-y-6">
              <!-- Profile Picture -->
              <div class="flex items-center space-x-6">
                <div class="flex-shrink-0">
                  <div class="w-20 h-20 rounded-full overflow-hidden bg-green-100 flex items-center justify-center">
                    <img
                      v-if="profilePictureUrl"
                      :src="profilePictureUrl"
                      alt="Profile Picture"
                      class="w-full h-full object-cover"
                    />
                    <i v-else class="fas fa-user text-green-600 text-2xl"></i>
                  </div>
                </div>
                <div>
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    @change="handleProfilePictureUpload"
                    class="hidden"
                  />
                  <button
                    type="button"
                    @click="$refs.fileInput.click()"
                    class="btn-secondary mr-2"
                    :disabled="uploadingPicture"
                  >
                    {{ uploadingPicture ? 'Uploading...' : 'Change Photo' }}
                  </button>
                  <button
                    v-if="profilePictureUrl"
                    type="button"
                    @click="removeProfilePicture"
                    class="btn-outline text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Remove
                  </button>
                  <p class="mt-2 text-sm text-gray-500">
                    JPG, PNG or GIF. Max size of 5MB.
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
                    v-model="form.first_name"
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
                    v-model="form.last_name"
                    type="text"
                    required
                    class="mt-1 input-field"
                  />
                </div>
                
                <div class="md:col-span-2">
                  <label for="middle_name" class="block text-sm font-medium text-gray-700">
                    Middle Name
                  </label>
                  <input
                    id="middle_name"
                    v-model="form.middle_name"
                    type="text"
                    class="mt-1 input-field"
                  />
                </div>
                
                <div>
                  <label for="contact_number" class="block text-sm font-medium text-gray-700">
                    Contact Number
                  </label>
                  <input
                    id="contact_number"
                    v-model="form.contact_number"
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
                    v-model="form.email"
                    type="email"
                    disabled
                    class="mt-1 input-field bg-gray-50 text-gray-500"
                  />
                  <p class="mt-1 text-sm text-gray-500">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>
                
                <div class="md:col-span-2">
                  <label for="address" class="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <textarea
                    id="address"
                    v-model="form.address"
                    rows="3"
                    required
                    class="mt-1 input-field"
                  ></textarea>
                </div>
              </div>
              
              <!-- Account Information -->
              <div class="border-t border-gray-200 pt-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Account Type</label>
                    <div class="mt-1 p-3 bg-gray-50 rounded-lg">
                      <span class="text-sm text-gray-900 capitalize">{{ userProfile?.role }}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Member Since</label>
                    <div class="mt-1 p-3 bg-gray-50 rounded-lg">
                      <span class="text-sm text-gray-900">
                        {{ formatDate(userProfile?.created_at) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="error" class="mt-6 rounded-md bg-red-50 p-4">
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
            
            <div v-if="success" class="mt-6 rounded-md bg-green-50 p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <i class="fas fa-check-circle text-green-400"></i>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-green-800">
                    {{ success }}
                  </h3>
                </div>
              </div>
            </div>
            
            <div class="mt-6 flex justify-between">
              <button
                type="button"
                @click="resetForm"
                class="btn-secondary"
              >
                Reset Changes
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ loading ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useSupabase } from '@/composables/useSupabase'
import Navbar from '@/components/common/Navbar.vue'

export default {
  name: 'UserProfile',
  components: {
    Navbar
  },
  setup() {
    const { userProfile, updateProfile, loading } = useAuth()
    const { supabase } = useSupabase()
    
    const form = reactive({
      first_name: '',
      last_name: '',
      middle_name: '',
      contact_number: '',
      email: '',
      address: ''
    })
    
    const error = ref('')
    const success = ref('')

    const profilePictureUrl = ref(userProfile.value?.profile_picture_url || '')
    const uploadingPicture = ref(false)
    const fileInput = ref(null)
    
    const initializeForm = () => {
      if (userProfile.value) {
        form.first_name = userProfile.value.first_name || ''
        form.last_name = userProfile.value.last_name || ''
        form.middle_name = userProfile.value.middle_name || ''
        form.contact_number = userProfile.value.contact_number || ''
        form.email = userProfile.value.email || ''
        form.address = userProfile.value.address || ''
        profilePictureUrl.value = userProfile.value.profile_picture_url || ''
      }
    }
    
    const resetForm = () => {
      initializeForm()
      error.value = ''
      success.value = ''
    }

    const handleProfilePictureUpload = async (event) => {
      const file = event.target.files[0]
      if (!file) return
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        error.value = 'File size must be less than 5MB'
        return
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        error.value = 'Please select an image file'
        return
      }
      
      try {
        uploadingPicture.value = true
        error.value = ''
        
        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop()
        const fileName = `${userProfile.value.user_id}_${Date.now()}.${fileExt}`
        
        const { data, error: uploadError } = await supabase.storage
          .from('profile-pictures')
          .upload(fileName, file)
        
        if (uploadError) throw uploadError
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('profile-pictures')
          .getPublicUrl(fileName)
        
        // Update profile with new picture URL
        const { error: updateError } = await updateProfile({
          profile_picture_url: publicUrl
        })
        
        if (updateError) throw updateError
        
        profilePictureUrl.value = publicUrl
        success.value = 'Profile picture updated successfully!'
        
      } catch (err) {
        error.value = err.message
      } finally {
        uploadingPicture.value = false
        // Clear file input
        if (fileInput.value) {
          fileInput.value.value = ''
        }
      }
    }

    const removeProfilePicture = async () => {
      if (!confirm('Are you sure you want to remove your profile picture?')) return
      
      try {
        const { error: updateError } = await updateProfile({
          profile_picture_url: null
        })
        
        if (updateError) throw updateError
        
        profilePictureUrl.value = ''
        success.value = 'Profile picture removed successfully!'
        
      } catch (err) {
        error.value = err.message
      }
    }
    
    const handleUpdateProfile = async () => {
      error.value = ''
      success.value = ''
      
      const updates = {
        first_name: form.first_name,
        last_name: form.last_name,
        middle_name: form.middle_name,
        contact_number: form.contact_number,
        address: form.address
      }
      
      const { error: updateError } = await updateProfile(updates)
      
      if (updateError) {
        error.value = updateError.message
        return
      }
      
      success.value = 'Profile updated successfully!'
      
      setTimeout(() => {
        success.value = ''
      }, 3000)
    }
    
    const formatDate = (date) => {
      if (!date) return 'N/A'
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    
    onMounted(() => {
      initializeForm()
    })
    
    return {
      userProfile,
      form,
      error,
      success,
      loading,
      updateProfile: handleUpdateProfile,
      resetForm,
      formatDate,
      profilePictureUrl,
      uploadingPicture,
      fileInput,
      handleProfilePictureUpload,
      removeProfilePicture
    }
  }
}
</script>
