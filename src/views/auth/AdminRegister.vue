<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="mx-auto h-12 w-12 bg-red-600 rounded-lg flex items-center justify-center">
          <i class="fas fa-shield-alt text-white text-xl"></i>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Admin Registration
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Create a new administrator account
        </p>
        <div class="mt-2 text-center">
          <div class="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50">
            <i class="fas fa-exclamation-triangle mr-2"></i>
            Restricted Access
          </div>
        </div>
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
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
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
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
          
          <div class="mt-4">
            <label for="middle_name" class="block text-sm font-medium text-gray-700">Middle Name</label>
            <input
              id="middle_name"
              v-model="form.middle_name"
              name="middle_name"
              type="text"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
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
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              placeholder="09XXXXXXXXX"
            />
          </div>
        </div>
        
        <!-- Account Information -->
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
          
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email Address *</label>
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
          </div>
          
          <div class="mt-4">
            <label for="password" class="block text-sm font-medium text-gray-700">Password *</label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              autocomplete="new-password"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              placeholder="Minimum 8 characters"
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
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </div>
        
        <!-- Admin Code -->
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Security</h3>
          
          <div>
            <label for="admin_code" class="block text-sm font-medium text-gray-700">Admin Registration Code *</label>
            <input
              id="admin_code"
              v-model="form.admin_code"
              name="admin_code"
              type="password"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              placeholder="Enter admin registration code"
            />
            <p class="mt-1 text-xs text-gray-500">
              This code is stored in the system settings and is required to create an admin account.
            </p>
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
            class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
          />
          <label for="terms" class="ml-2 block text-sm text-gray-900">
            I agree to the 
            <a href="#" class="text-red-600 hover:text-red-500">Terms and Conditions</a>
            and 
            <a href="#" class="text-red-600 hover:text-red-500">Privacy Policy</a>
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
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <i class="fas fa-spinner fa-spin text-red-300"></i>
            </span>
            {{ loading ? 'Creating account...' : 'Register as Administrator' }}
          </button>
        </div>
        
        <div class="text-center">
          <router-link to="/admin/login" class="text-sm text-gray-600 hover:text-gray-900">
            Back to admin login
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
import { useNotification } from '@/composables/useNotification'

export default {
  name: 'AdminRegister',
  setup() {
    const router = useRouter()
    const { addNotification } = useNotification()
    
    const form = reactive({
      first_name: '',
      last_name: '',
      middle_name: '',
      email: '',
      contact_number: '',
      password: '',
      confirm_password: '',
      admin_code: '',
      acceptTerms: false
    })
    
    const error = ref('')
    const success = ref('')
    const loading = ref(false)
    
    const getAdminRegistrationCode = async () => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('setting_value')
          .eq('setting_key', 'admin_registration_code')
          .single()
        
        if (error) {
          console.error('Error fetching admin registration code:', error)
          // Return default code if not found in database
          return 'BROOMTECH-ADMIN-2024'
        }
        
        return data?.setting_value || 'BROOMTECH-ADMIN-2024'
      } catch (err) {
        console.error('Error getting admin registration code:', err)
        // Return default code as fallback
        return 'BROOMTECH-ADMIN-2024'
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
      if (form.password.length < 8) {
        error.value = 'Password must be at least 8 characters long'
        return
      }
      
      // Validate terms acceptance
      if (!form.acceptTerms) {
        error.value = 'Please accept the terms and conditions'
        return
      }
      
      loading.value = true
      
      try {
        // Get admin registration code from database
        const validAdminCode = await getAdminRegistrationCode()
        
        // Validate admin code
        if (form.admin_code !== validAdminCode) {
          error.value = 'Invalid admin registration code'
          loading.value = false
          return
        }
        
        console.log('Starting admin registration process...')
        
        // 1. Create user account with admin role
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              first_name: form.first_name,
              last_name: form.last_name,
              middle_name: form.middle_name || '',
              contact_number: form.contact_number,
              role: 'admin'
            }
          }
        })
        
        if (signUpError) {
          console.error('Supabase signup error:', signUpError)
          error.value = signUpError.message
          loading.value = false
          return
        }
        
        console.log('Auth user created:', authData.user?.id)
        
        // 2. Create user profile with admin role
        if (authData.user) {
          const profileData = {
            user_id: authData.user.id,
            first_name: form.first_name,
            last_name: form.last_name,
            middle_name: form.middle_name || null,
            email: form.email,
            contact_number: form.contact_number,
            address: null,
            profile_picture_url: null,
            role: 'admin',
            email_verified: false,
            is_banned: false,
            last_login: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          console.log('Creating profile with data:', profileData)
          
          const { data: profileResult, error: profileError } = await supabase
            .from('user_profiles')
            .insert([profileData])
            .select()
          
          if (profileError) {
            console.error('Error creating admin profile:', profileError)
            console.error('Profile error details:', {
              code: profileError.code,
              message: profileError.message,
              details: profileError.details,
              hint: profileError.hint
            })
            
            // Try to delete the auth user if profile creation failed
            try {
              await supabase.auth.admin.deleteUser(authData.user.id)
            } catch (deleteError) {
              console.error('Error cleaning up auth user:', deleteError)
            }
            
            error.value = `Error creating profile: ${profileError.message}`
            loading.value = false
            return
          }
          
          console.log('Profile created successfully:', profileResult)
          
          // 3. Log admin creation in audit log (optional, don't fail if this fails)
          try {
            const auditData = {
              admin_id: authData.user.id,
              action: 'admin_created',
              target_type: 'user',
              target_id: authData.user.id,
              old_values: null,
              new_values: {
                email: form.email,
                role: 'admin',
                created_at: new Date().toISOString()
              },
              ip_address: null,
              user_agent: navigator.userAgent,
              created_at: new Date().toISOString()
            }
            
            await supabase
              .from('admin_audit_log')
              .insert([auditData])
              
            console.log('Audit log created')
          } catch (auditError) {
            console.warn('Failed to create audit log (non-critical):', auditError)
          }
        }
        
        success.value = 'Admin account created successfully! Please check your email to verify your account, then you can sign in.'
        
        // Clear form
        Object.keys(form).forEach(key => {
          if (typeof form[key] === 'string') {
            form[key] = ''
          } else if (typeof form[key] === 'boolean') {
            form[key] = false
          }
        })
        
        // Redirect to admin login after delay
        setTimeout(() => {
          router.push('/admin/login')
        }, 3000)
        
      } catch (err) {
        console.error('Registration error:', err)
        error.value = 'An unexpected error occurred. Please try again.'
      } finally {
        loading.value = false
      }
    }
    
    return {
      form,
      error,
      success,
      loading,
      handleRegister
    }
  }
}
</script>
