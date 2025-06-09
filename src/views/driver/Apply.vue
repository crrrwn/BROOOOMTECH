<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <div class="text-center mb-8">
        <div class="mx-auto h-16 w-16 bg-green-600 rounded-lg flex items-center justify-center">
          <i class="fas fa-motorcycle text-white text-2xl"></i>
        </div>
        <h1 class="mt-6 text-3xl font-extrabold text-gray-900">
          Apply to be a Driver
        </h1>
        <p class="mt-2 text-gray-600">
          Join our delivery team and start earning today
        </p>
      </div>
      
      <div class="card">
        <form @submit.prevent="submitApplication" class="space-y-8">
          <!-- Personal Information -->
          <div>
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="first_name" class="block text-sm font-medium text-gray-700">
                  First Name *
                </label>
                <input
                  id="first_name"
                  v-model="form.first_name"
                  type="text"
                  required
                  class="mt-1 input-field"
                  placeholder="Enter your first name"
                />
              </div>
              
              <div>
                <label for="last_name" class="block text-sm font-medium text-gray-700">
                  Last Name *
                </label>
                <input
                  id="last_name"
                  v-model="form.last_name"
                  type="text"
                  required
                  class="mt-1 input-field"
                  placeholder="Enter your last name"
                />
              </div>
              
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                  class="mt-1 input-field"
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label for="mobile_number" class="block text-sm font-medium text-gray-700">
                  Mobile Number *
                </label>
                <input
                  id="mobile_number"
                  v-model="form.mobile_number"
                  type="tel"
                  required
                  class="mt-1 input-field"
                  placeholder="09XX XXX XXXX"
                />
              </div>
              
              <div class="md:col-span-2">
                <label for="home_address" class="block text-sm font-medium text-gray-700">
                  Home Address *
                </label>
                <textarea
                  id="home_address"
                  v-model="form.home_address"
                  rows="3"
                  required
                  class="mt-1 input-field"
                  placeholder="Enter your complete home address"
                ></textarea>
              </div>
              
              <div>
                <label for="date_of_birth" class="block text-sm font-medium text-gray-700">
                  Date of Birth *
                </label>
                <input
                  id="date_of_birth"
                  v-model="form.date_of_birth"
                  type="date"
                  required
                  class="mt-1 input-field"
                />
              </div>
              
              <div>
                <label for="years_of_experience" class="block text-sm font-medium text-gray-700">
                  Years of Driving Experience *
                </label>
                <select
                  id="years_of_experience"
                  v-model="form.years_of_experience"
                  required
                  class="mt-1 input-field"
                >
                  <option value="">Select experience</option>
                  <option value="0-1">0-1 years</option>
                  <option value="1-3">1-3 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5-10">5-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>
            </div>
          </div>
          
          <!-- License Information -->
          <div class="border-t border-gray-200 pt-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Driver's License Information</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="license_number" class="block text-sm font-medium text-gray-700">
                  License Number *
                </label>
                <input
                  id="license_number"
                  v-model="form.license_number"
                  type="text"
                  required
                  class="mt-1 input-field"
                  placeholder="Enter license number"
                />
              </div>
              
              <div>
                <label for="license_expiry_date" class="block text-sm font-medium text-gray-700">
                  License Expiry Date *
                </label>
                <input
                  id="license_expiry_date"
                  v-model="form.license_expiry_date"
                  type="date"
                  required
                  class="mt-1 input-field"
                />
              </div>
            </div>
          </div>
          
          <!-- Vehicle Information -->
          <div class="border-t border-gray-200 pt-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Vehicle Information</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="motorcycle_plate_number" class="block text-sm font-medium text-gray-700">
                  Motorcycle Plate Number *
                </label>
                <input
                  id="motorcycle_plate_number"
                  v-model="form.motorcycle_plate_number"
                  type="text"
                  required
                  class="mt-1 input-field"
                  placeholder="ABC-1234"
                />
              </div>
              
              <div>
                <label for="motorcycle_brand" class="block text-sm font-medium text-gray-700">
                  Motorcycle Brand & Model
                </label>
                <input
                  id="motorcycle_brand"
                  v-model="form.motorcycle_brand"
                  type="text"
                  class="mt-1 input-field"
                  placeholder="e.g., Honda Click 150i"
                />
              </div>
            </div>
          </div>
          
          <!-- Availability -->
          <div class="border-t border-gray-200 pt-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Availability</h2>
            
            <div>
              <label for="availability_schedule" class="block text-sm font-medium text-gray-700">
                Available Schedule *
              </label>
              <textarea
                id="availability_schedule"
                v-model="form.availability_schedule"
                rows="3"
                required
                class="mt-1 input-field"
                placeholder="e.g., Monday-Friday: 8AM-6PM, Weekends: 9AM-5PM"
              ></textarea>
            </div>
          </div>
          
          <!-- Document Uploads -->
          <div class="border-t border-gray-200 pt-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Required Documents</h2>
            
            <div class="space-y-6">
              <!-- Driver's License -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Driver's License (Front & Back) *
                </label>
                <div class="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div class="text-center">
                    <i class="fas fa-cloud-upload-alt text-gray-400 text-3xl mb-4"></i>
                    <div class="text-sm text-gray-600">
                      <label for="license-upload" class="cursor-pointer">
                        <span class="text-green-600 hover:text-green-500 font-medium">
                          Upload driver's license
                        </span>
                        <input
                          id="license-upload"
                          type="file"
                          class="sr-only"
                          accept="image/*"
                          required
                          @change="handleFileUpload('license', $event)"
                        />
                      </label>
                      or drag and drop
                    </div>
                    <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
                
                <div v-if="uploadedFiles.license" class="mt-4 p-4 bg-green-50 rounded-lg">
                  <div class="flex items-center">
                    <i class="fas fa-check-circle text-green-500 mr-2"></i>
                    <span class="text-sm text-green-700">{{ uploadedFiles.license.name }}</span>
                  </div>
                </div>
              </div>
              
              <!-- ORCR -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  ORCR (Official Receipt & Certificate of Registration) *
                </label>
                <div class="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div class="text-center">
                    <i class="fas fa-cloud-upload-alt text-gray-400 text-3xl mb-4"></i>
                    <div class="text-sm text-gray-600">
                      <label for="orcr-upload" class="cursor-pointer">
                        <span class="text-green-600 hover:text-green-500 font-medium">
                          Upload ORCR
                        </span>
                        <input
                          id="orcr-upload"
                          type="file"
                          class="sr-only"
                          accept="image/*"
                          required
                          @change="handleFileUpload('orcr', $event)"
                        />
                      </label>
                      or drag and drop
                    </div>
                    <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
                
                <div v-if="uploadedFiles.orcr" class="mt-4 p-4 bg-green-50 rounded-lg">
                  <div class="flex items-center">
                    <i class="fas fa-check-circle text-green-500 mr-2"></i>
                    <span class="text-sm text-green-700">{{ uploadedFiles.orcr.name }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Selfie with ID -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Selfie with ID *
                </label>
                <div class="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div class="text-center">
                    <i class="fas fa-cloud-upload-alt text-gray-400 text-3xl mb-4"></i>
                    <div class="text-sm text-gray-600">
                      <label for="selfie-upload" class="cursor-pointer">
                        <span class="text-green-600 hover:text-green-500 font-medium">
                          Upload selfie with ID
                        </span>
                        <input
                          id="selfie-upload"
                          type="file"
                          class="sr-only"
                          accept="image/*"
                          required
                          @change="handleFileUpload('selfie', $event)"
                        />
                      </label>
                      or drag and drop
                    </div>
                    <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
                
                <div v-if="uploadedFiles.selfie" class="mt-4 p-4 bg-green-50 rounded-lg">
                  <div class="flex items-center">
                    <i class="fas fa-check-circle text-green-500 mr-2"></i>
                    <span class="text-sm text-green-700">{{ uploadedFiles.selfie.name }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Profile Picture -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture *
                </label>
                <div class="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div class="text-center">
                    <i class="fas fa-cloud-upload-alt text-gray-400 text-3xl mb-4"></i>
                    <div class="text-sm text-gray-600">
                      <label for="profile-upload" class="cursor-pointer">
                        <span class="text-green-600 hover:text-green-500 font-medium">
                          Upload profile picture
                        </span>
                        <input
                          id="profile-upload"
                          type="file"
                          class="sr-only"
                          accept="image/*"
                          required
                          @change="handleFileUpload('profile', $event)"
                        />
                      </label>
                      or drag and drop
                    </div>
                    <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
                
                <div v-if="uploadedFiles.profile" class="mt-4 p-4 bg-green-50 rounded-lg">
                  <div class="flex items-center">
                    <i class="fas fa-check-circle text-green-500 mr-2"></i>
                    <span class="text-sm text-green-700">{{ uploadedFiles.profile.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Additional Information -->
          <div class="border-t border-gray-200 pt-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Additional Information</h2>
            
            <div>
              <label for="notes" class="block text-sm font-medium text-gray-700">
                Additional Notes
              </label>
              <textarea
                id="notes"
                v-model="form.notes"
                rows="4"
                class="mt-1 input-field"
                placeholder="Any additional information you'd like to share..."
              ></textarea>
            </div>
          </div>
          
          <!-- Terms and Conditions -->
          <div class="border-t border-gray-200 pt-8">
            <div class="flex items-start">
              <div class="flex items-center h-5">
                <input
                  id="terms"
                  v-model="form.agreedToTerms"
                  type="checkbox"
                  required
                  class="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"
                />
              </div>
              <div class="ml-3 text-sm">
                <label for="terms" class="font-medium text-gray-700">
                  I agree to the Terms and Conditions *
                </label>
                <p class="text-gray-500">
                  By checking this box, I agree to DeliveryHub's terms of service and privacy policy.
                  I understand that all information provided will be verified and I consent to background checks.
                </p>
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
          
          <div v-if="success" class="rounded-md bg-green-50 p-4">
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
          
          <div class="flex justify-between">
            <router-link to="/login" class="btn-secondary">
              Back to Login
            </router-link>
            <button
              type="submit"
              :disabled="loading || !allRequiredFilesUploaded"
              class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading ? 'Submitting...' : 'Submit Application' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/composables/useSupabase'

export default {
  name: 'DriverApply',
  setup() {
    const router = useRouter()
    
    const loading = ref(false)
    const error = ref('')
    const success = ref('')
    
    const form = reactive({
      first_name: '',
      last_name: '',
      email: '',
      mobile_number: '',
      home_address: '',
      date_of_birth: '',
      license_number: '',
      license_expiry_date: '',
      motorcycle_plate_number: '',
      motorcycle_brand: '',
      years_of_experience: '',
      availability_schedule: '',
      notes: '',
      agreedToTerms: false
    })
    
    const uploadedFiles = reactive({
      license: null,
      orcr: null,
      selfie: null,
      profile: null
    })
    
    const uploadedUrls = reactive({
      license: '',
      orcr: '',
      selfie: '',
      profile: ''
    })
    
    const allRequiredFilesUploaded = computed(() => {
      return uploadedFiles.license && 
             uploadedFiles.orcr && 
             uploadedFiles.selfie && 
             uploadedFiles.profile
    })
    
    const handleFileUpload = async (documentType, event) => {
      const file = event.target.files[0]
      if (!file) return
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        error.value = 'File size must be less than 10MB'
        return
      }
      
      try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${documentType}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('driver-applications')
          .upload(fileName, file)
        
        if (uploadError) throw uploadError
        
        const { data: { publicUrl } } = supabase.storage
          .from('driver-applications')
          .getPublicUrl(fileName)
        
        uploadedFiles[documentType] = file
        uploadedUrls[documentType] = publicUrl
        
        error.value = ''
      } catch (uploadError) {
        error.value = `Error uploading ${documentType}: ${uploadError.message}`
      }
    }
    
    const submitApplication = async () => {
      error.value = ''
      success.value = ''
      
      if (!form.agreedToTerms) {
        error.value = 'You must agree to the terms and conditions'
        return
      }
      
      if (!allRequiredFilesUploaded.value) {
        error.value = 'Please upload all required documents'
        return
      }
      
      try {
        loading.value = true
        
        const applicationData = {
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          mobile_number: form.mobile_number,
          home_address: form.home_address,
          date_of_birth: form.date_of_birth,
          license_number: form.license_number,
          license_expiry_date: form.license_expiry_date,
          motorcycle_plate_number: form.motorcycle_plate_number,
          motorcycle_brand: form.motorcycle_brand,
          years_of_experience: form.years_of_experience,
          availability_schedule: form.availability_schedule,
          notes: form.notes,
          license_url: uploadedUrls.license,
          orcr_url: uploadedUrls.orcr,
          selfie_url: uploadedUrls.selfie,
          profile_picture_url: uploadedUrls.profile,
          status: 'pending',
          applied_at: new Date().toISOString()
        }
        
        const { error: insertError } = await supabase
          .from('driver_applications')
          .insert(applicationData)
        
        if (insertError) throw insertError
        
        success.value = 'Application submitted successfully! We will review your application and contact you within 3-5 business days.'
        
        // Reset form
        Object.keys(form).forEach(key => {
          if (key === 'agreedToTerms') {
            form[key] = false
          } else {
            form[key] = ''
          }
        })
        
        Object.keys(uploadedFiles).forEach(key => {
          uploadedFiles[key] = null
          uploadedUrls[key] = ''
        })
        
        // Redirect to login after delay
        setTimeout(() => {
          router.push('/login')
        }, 5000)
        
      } catch (submitError) {
        error.value = submitError.message
      } finally {
        loading.value = false
      }
    }
    
    return {
      form,
      uploadedFiles,
      allRequiredFilesUploaded,
      loading,
      error,
      success,
      handleFileUpload,
      submitApplication
    }
  }
}
</script>
