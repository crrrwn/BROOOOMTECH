<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="mx-auto h-12 w-12 bg-yellow-600 rounded-lg flex items-center justify-center">
          <i class="fas fa-motorcycle text-white text-xl"></i>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Driver Registration
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Join our delivery team
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <!-- Personal Information -->
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="first_name" class="block text-sm font-medium text-gray-700">First Name *</label>
              <input
                id="first_name"
                v-model="form.first_name"
                name="first_name"
                type="text"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
            <div>
              <label for="last_name" class="block text-sm font-medium text-gray-700">Last Name *</label>
              <input
                id="last_name"
                v-model="form.last_name"
                name="last_name"
                type="text"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
          </div>
          
          <div class="mt-4">
            <label for="email" class="block text-sm font-medium text-gray-700">Email Address *</label>
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>
          
          <div class="mt-4">
            <label for="contact_number" class="block text-sm font-medium text-gray-700">Contact Number *</label>
            <input
              id="contact_number"
              v-model="form.contact_number"
              name="contact_number"
              type="tel"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              placeholder="09XXXXXXXXX"
            />
          </div>
          
          <div class="mt-4">
            <label for="address" class="block text-sm font-medium text-gray-700">Home Address *</label>
            <textarea
              id="address"
              v-model="form.address"
              name="address"
              rows="3"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
            ></textarea>
          </div>
          
          <div class="mt-4">
            <label for="date_of_birth" class="block text-sm font-medium text-gray-700">Date of Birth *</label>
            <input
              id="date_of_birth"
              v-model="form.date_of_birth"
              name="date_of_birth"
              type="date"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>
        </div>
        
        <!-- License Information -->
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-lg font-medium text-gray-900 mb-4">License Information</h3>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="license_number" class="block text-sm font-medium text-gray-700">License Number *</label>
              <input
                id="license_number"
                v-model="form.license_number"
                name="license_number"
                type="text"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
            <div>
              <label for="license_expiry_date" class="block text-sm font-medium text-gray-700">License Expiry Date *</label>
              <input
                id="license_expiry_date"
                v-model="form.license_expiry_date"
                name="license_expiry_date"
                type="date"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
          </div>
          
          <div class="mt-4">
            <label for="years_of_experience" class="block text-sm font-medium text-gray-700">Years of Driving Experience *</label>
            <select
              id="years_of_experience"
              v-model="form.years_of_experience"
              name="years_of_experience"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
            >
              <option value="">Select experience</option>
              <option value="Less than 1 year">Less than 1 year</option>
              <option value="1-2 years">1-2 years</option>
              <option value="3-5 years">3-5 years</option>
              <option value="5+ years">5+ years</option>
            </select>
          </div>
          
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700">License Photo *</label>
            <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div class="space-y-1 text-center">
                <div v-if="licensePreview" class="mb-3">
                  <img :src="licensePreview" alt="License preview" class="mx-auto h-32 object-cover" />
                </div>
                <div v-else class="flex text-sm text-gray-600">
                  <label for="license-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-yellow-600 hover:text-yellow-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-yellow-500">
                    <span>Upload a file</span>
                    <input id="license-upload" name="license-upload" type="file" class="sr-only" @change="handleLicenseUpload" accept="image/*" required />
                  </label>
                  <p class="pl-1">or drag and drop</p>
                </div>
                <p class="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Vehicle Information -->
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Vehicle Information</h3>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="motorcycle_plate_number" class="block text-sm font-medium text-gray-700">Motorcycle Plate Number *</label>
              <input
                id="motorcycle_plate_number"
                v-model="form.motorcycle_plate_number"
                name="motorcycle_plate_number"
                type="text"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                style="text-transform: uppercase"
              />
            </div>
            <div>
              <label for="motorcycle_brand" class="block text-sm font-medium text-gray-700">Motorcycle Brand *</label>
              <input
                id="motorcycle_brand"
                v-model="form.motorcycle_brand"
                name="motorcycle_brand"
                type="text"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="e.g., Honda, Yamaha"
              />
            </div>
          </div>
          
          <div class="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label for="vehicle_type" class="block text-sm font-medium text-gray-700">Vehicle Type *</label>
              <input
                id="vehicle_type"
                v-model="form.vehicle_type"
                name="vehicle_type"
                type="text"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="e.g., Scooter, Underbone"
              />
            </div>
            <div>
              <label for="vehicle_color" class="block text-sm font-medium text-gray-700">Vehicle Color *</label>
              <input
                id="vehicle_color"
                v-model="form.vehicle_color"
                name="vehicle_color"
                type="text"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
          </div>
          
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700">OR/CR Photo *</label>
            <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div class="space-y-1 text-center">
                <div v-if="orcrPreview" class="mb-3">
                  <img :src="orcrPreview" alt="OR/CR preview" class="mx-auto h-32 object-cover" />
                </div>
                <div v-else class="flex text-sm text-gray-600">
                  <label for="orcr-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-yellow-600 hover:text-yellow-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-yellow-500">
                    <span>Upload a file</span>
                    <input id="orcr-upload" name="orcr-upload" type="file" class="sr-only" @change="handleOrcrUpload" accept="image/*" required />
                  </label>
                  <p class="pl-1">or drag and drop</p>
                </div>
                <p class="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Profile Photo -->
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Profile Photos</h3>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Profile Picture *</label>
              <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div class="space-y-1 text-center">
                  <div v-if="profilePicturePreview" class="mb-3">
                    <img :src="profilePicturePreview" alt="Profile picture preview" class="mx-auto h-32 object-cover rounded-full" />
                  </div>
                  <div v-else class="flex text-sm text-gray-600">
                    <label for="profile-picture-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-yellow-600 hover:text-yellow-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-yellow-500">
                      <span>Upload a file</span>
                      <input id="profile-picture-upload" name="profile-picture-upload" type="file" class="sr-only" @change="handleProfilePictureUpload" accept="image/*" required />
                    </label>
                    <p class="pl-1">or drag and drop</p>
                  </div>
                  <p class="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Selfie with License *</label>
              <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div class="space-y-1 text-center">
                  <div v-if="selfiePreview" class="mb-3">
                    <img :src="selfiePreview" alt="Selfie preview" class="mx-auto h-32 object-cover" />
                  </div>
                  <div v-else class="flex text-sm text-gray-600">
                    <label for="selfie-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-yellow-600 hover:text-yellow-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-yellow-500">
                      <span>Upload a file</span>
                      <input id="selfie-upload" name="selfie-upload" type="file" class="sr-only" @change="handleSelfieUpload" accept="image/*" required />
                    </label>
                    <p class="pl-1">or drag and drop</p>
                  </div>
                  <p class="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Availability -->
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Availability</h3>
          
          <div>
            <label for="availability_schedule" class="block text-sm font-medium text-gray-700">Availability Schedule *</label>
            <textarea
              id="availability_schedule"
              v-model="form.availability_schedule"
              name="availability_schedule"
              rows="3"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              placeholder="e.g., Monday-Friday: 9AM-5PM, Weekends: 10AM-3PM"
            ></textarea>
          </div>
        </div>
        
        <!-- Account Information -->
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password *</label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              autocomplete="new-password"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              placeholder="Minimum 6 characters"
            />
          </div>
          
          <div class="mt-4">
            <label for="confirm_password" class="block text-sm font-medium text-gray-700">Confirm Password *</label>
            <input
              id="confirm_password"
              v-model="form.confirm_password"
              name="confirm_password"
              type="password"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>
        </div>
        
        <!-- Terms and Conditions -->
        <div class="flex items-center">
          <input
            id="terms"
            v-model="form.acceptTerms"
            name="terms"
            type="checkbox"
            required
            class="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
          />
          <label for="terms" class="ml-2 block text-sm text-gray-900">
            I agree to the 
            <a href="#" class="text-yellow-600 hover:text-yellow-500">Terms and Conditions</a>
            and 
            <a href="#" class="text-yellow-600 hover:text-yellow-500">Privacy Policy</a>
          </label>
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

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <i class="fas fa-spinner fa-spin text-yellow-500"></i>
            </span>
            {{ loading ? 'Submitting application...' : 'Submit Driver Application' }}
          </button>
        </div>
        
        <div class="text-center">
          <router-link to="/login" class="text-sm text-gray-600 hover:text-gray-900">
            Back to login
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/composables/useSupabase'

export default {
  name: 'DriverRegister',
  setup() {
    const router = useRouter()
    
    const form = reactive({
      first_name: '',
      last_name: '',
      email: '',
      contact_number: '',
      address: '',
      date_of_birth: '',
      years_of_experience: '',
      license_number: '',
      license_expiry_date: '',
      motorcycle_plate_number: '',
      motorcycle_brand: '',
      vehicle_type: '',
      vehicle_color: '',
      availability_schedule: '',
      password: '',
      confirm_password: '',
      acceptTerms: false
    })
    
    const error = ref('')
    const success = ref('')
    const loading = ref(false)
    
    // File upload previews and files
    const licenseFile = ref(null)
    const licensePreview = ref('')
    const orcrFile = ref(null)
    const orcrPreview = ref('')
    const profilePictureFile = ref(null)
    const profilePicturePreview = ref('')
    const selfieFile = ref(null)
    const selfiePreview = ref('')
    
    const handleLicenseUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        licenseFile.value = file
        licensePreview.value = URL.createObjectURL(file)
      }
    }
    
    const handleOrcrUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        orcrFile.value = file
        orcrPreview.value = URL.createObjectURL(file)
      }
    }
    
    const handleProfilePictureUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        profilePictureFile.value = file
        profilePicturePreview.value = URL.createObjectURL(file)
      }
    }
    
    const handleSelfieUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        selfieFile.value = file
        selfiePreview.value = URL.createObjectURL(file)
      }
    }
    
    // Create storage bucket if it doesn't exist
    const ensureStorageBucket = async () => {
      try {
        // Check if bucket exists
        const { data: buckets, error: listError } = await supabase.storage.listBuckets()
        
        if (listError) {
          console.warn('Could not list buckets:', listError)
          return false
        }
        
        const bucketExists = buckets.some(bucket => bucket.id === 'driver-documents')
        
        if (!bucketExists) {
          console.log('Creating driver-documents bucket...')
          const { data, error: createError } = await supabase.storage.createBucket('driver-documents', {
            public: true,
            fileSizeLimit: 10485760, // 10MB
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
          })
          
          if (createError) {
            console.warn('Could not create bucket:', createError)
            return false
          }
          
          console.log('Bucket created successfully')
        }
        
        return true
      } catch (error) {
        console.warn('Storage bucket check failed:', error)
        return false
      }
    }
    
    const uploadFile = async (file, folder) => {
      if (!file) return null
      
      try {
        // Ensure bucket exists
        await ensureStorageBucket()
        
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        const filePath = `${folder}/${fileName}`
        
        console.log(`Uploading file to: ${filePath}`)
        
        const { data, error: uploadError } = await supabase.storage
          .from('driver-documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })
        
        if (uploadError) {
          console.error('Upload error:', uploadError)
          throw new Error(`Upload failed: ${uploadError.message}`)
        }
        
        console.log('File uploaded successfully:', data)
        
        const { data: { publicUrl } } = supabase.storage
          .from('driver-documents')
          .getPublicUrl(filePath)
        
        console.log('Public URL:', publicUrl)
        return publicUrl
        
      } catch (error) {
        console.error('File upload failed:', error)
        throw new Error(`Failed to upload file: ${error.message}`)
      }
    }
    
    const handleRegister = async () => {
      error.value = ''
      success.value = ''
      
      // Validate passwords match
      if (form.password !== form.confirm_password) {
        error.value = 'Passwords do not match'
        return
      }
      
      // Validate password strength
      if (form.password.length < 6) {
        error.value = 'Password must be at least 6 characters long'
        return
      }
      
      // Validate terms acceptance
      if (!form.acceptTerms) {
        error.value = 'Please accept the terms and conditions'
        return
      }
      
      // Validate file uploads
      if (!licenseFile.value || !orcrFile.value || !profilePictureFile.value || !selfieFile.value) {
        error.value = 'Please upload all required documents'
        return
      }
      
      loading.value = true
      
      try {
        console.log('Starting driver registration process...')
        
        // 1. Upload all files first
        console.log('Uploading files...')
        const uploadPromises = [
          uploadFile(licenseFile.value, 'licenses'),
          uploadFile(orcrFile.value, 'orcr'),
          uploadFile(profilePictureFile.value, 'profile-pictures'),
          uploadFile(selfieFile.value, 'selfies')
        ]
        
        const [licenseUrl, orcrUrl, profilePictureUrl, selfieUrl] = await Promise.all(uploadPromises)
        
        console.log('All files uploaded successfully')
        
        // 2. Create driver application first
        console.log('Creating driver application...')
        const applicationData = {
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          mobile_number: form.contact_number,
          home_address: form.address,
          date_of_birth: form.date_of_birth,
          years_of_experience: form.years_of_experience,
          license_number: form.license_number,
          license_expiry_date: form.license_expiry_date,
          motorcycle_plate_number: form.motorcycle_plate_number.toUpperCase(),
          motorcycle_brand: form.motorcycle_brand,
          availability_schedule: form.availability_schedule,
          license_url: licenseUrl,
          orcr_url: orcrUrl,
          selfie_url: selfieUrl,
          profile_picture_url: profilePictureUrl,
          status: 'pending',
          applied_at: new Date().toISOString()
        }
        
        const { data: applicationResult, error: applicationError } = await supabase
          .from('driver_applications')
          .insert([applicationData])
          .select()
        
        if (applicationError) {
          console.error('Error creating driver application:', applicationError)
          throw new Error(`Application creation failed: ${applicationError.message}`)
        }
        
        console.log('Driver application created successfully')
        
        // 3. Create user account
        console.log('Creating user account...')
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              first_name: form.first_name,
              last_name: form.last_name,
              contact_number: form.contact_number,
              address: form.address,
              role: 'driver'
            }
          }
        })
        
        if (signUpError) {
          console.error('Supabase signup error:', signUpError)
          throw new Error(`Account creation failed: ${signUpError.message}`)
        }
        
        if (!authData.user) {
          throw new Error('User creation failed - no user returned')
        }
        
        console.log('User account created successfully')
        
        // 4. Create user profile
        console.log('Creating user profile...')
        const profileData = {
          user_id: authData.user.id,
          first_name: form.first_name || '',
          last_name: form.last_name || '',
          email: form.email || '',
          contact_number: form.contact_number || '',
          address: form.address || '',
          role: 'driver',
          email_verified: false,
          is_banned: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([profileData])
        
        if (profileError) {
          console.error('Error creating user profile:', profileError)
          // Don't throw error here, continue with driver profile creation
        } else {
          console.log('User profile created successfully')
        }
        
        // 5. Create driver profile
        console.log('Creating driver profile...')
        const driverProfileData = {
          user_id: authData.user.id,
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          contact_number: form.contact_number,
          address: form.address,
          license_number: form.license_number,
          license_expiry_date: form.license_expiry_date,
          vehicle_type: form.vehicle_type,
          plate_number: form.motorcycle_plate_number.toUpperCase(),
          vehicle_brand: form.motorcycle_brand,
          vehicle_color: form.vehicle_color,
          license_url: licenseUrl,
          orcr_url: orcrUrl,
          selfie_url: selfieUrl,
          profile_picture_url: profilePictureUrl,
          is_active: false,
          is_online: false,
          rating: 0.00,
          total_deliveries: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        const { error: driverProfileError } = await supabase
          .from('driver_profiles')
          .insert([driverProfileData])
        
        if (driverProfileError) {
          console.error('Error creating driver profile:', driverProfileError)
          throw new Error(`Driver profile creation failed: ${driverProfileError.message}`)
        }
        
        console.log('Driver profile created successfully')
        
        // 6. Create notification for admin (optional)
        try {
          const notificationData = {
            user_id: authData.user.id,
            title: 'New Driver Application',
            message: `${form.first_name} ${form.last_name} has applied to be a driver.`,
            type: 'driver_application',
            data: { application_id: applicationResult[0]?.id },
            is_read: false,
            created_at: new Date().toISOString()
          }
          
          await supabase
            .from('notifications')
            .insert([notificationData])
        } catch (notificationError) {
          console.warn('Failed to create notification:', notificationError)
          // Don't fail the registration for this
        }
        
        success.value = 'Your driver application has been submitted successfully! Our team will review your application and contact you soon.'
        
        // Clear form
        Object.keys(form).forEach(key => {
          if (typeof form[key] === 'boolean') {
            form[key] = false
          } else {
            form[key] = ''
          }
        })
        
        // Clear file previews
        licensePreview.value = ''
        orcrPreview.value = ''
        profilePicturePreview.value = ''
        selfiePreview.value = ''
        licenseFile.value = null
        orcrFile.value = null
        profilePictureFile.value = null
        selfieFile.value = null
        
        // Redirect to login after delay
        setTimeout(() => {
          router.push('/driver/login')
        }, 3000)
        
      } catch (err) {
        console.error('Registration error:', err)
        error.value = err.message || 'An unexpected error occurred. Please try again.'
      } finally {
        loading.value = false
      }
    }
    
    return {
      form,
      error,
      success,
      loading,
      licensePreview,
      orcrPreview,
      profilePicturePreview,
      selfiePreview,
      handleLicenseUpload,
      handleOrcrUpload,
      handleProfilePictureUpload,
      handleSelfieUpload,
      handleRegister
    }
  }
}
</script>
