<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="mx-auto h-12 w-12 bg-red-600 rounded-lg flex items-center justify-center">
          <i class="fas fa-shield-alt text-white text-xl"></i>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Administrator Login
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Secure access to platform management
        </p>
      </div>
      
      <div class="rounded-md bg-red-50 p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <i class="fas fa-exclamation-triangle text-red-400"></i>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              Restricted Access Area
            </h3>
            <p class="text-sm text-red-700 mt-2">
              This login is for authorized administrators only. Unauthorized access attempts are monitored and logged.
            </p>
          </div>
        </div>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleAdminLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">Email address</label>
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
          </div>
          <div class="relative">
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
              placeholder="Password"
            />
            <button 
              type="button" 
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
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

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <i class="fas fa-spinner fa-spin text-red-500"></i>
            </span>
            {{ loading ? 'Authenticating...' : 'Sign in' }}
          </button>
        </div>
      </form>
      
      <div class="mt-6 text-center">
        <router-link to="/" class="text-sm text-gray-600 hover:text-gray-900">
          <i class="fas fa-arrow-left mr-1"></i> Back to main page
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/composables/useSupabase'

export default {
  name: 'AdminLogin',
  setup() {
    const router = useRouter()
    const form = reactive({
      email: '',
      password: ''
    })
    
    const error = ref('')
    const loading = ref(false)
    const showPassword = ref(false)
    
    const handleAdminLogin = async () => {
      error.value = ''
      loading.value = true
      
      try {
        console.log('Starting admin login process...')
        
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password
        })
        
        if (loginError) {
          console.error('Login error:', loginError)
          error.value = loginError.message
          loading.value = false
          return
        }
        
        console.log('Login successful, checking admin profile...')
        
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .single()
        
        if (profileError) {
          console.error('Error fetching profile:', profileError)
          error.value = 'Profile not found. Please contact support.'
          loading.value = false
          await supabase.auth.signOut()
          return
        }
        
        // Check if user is actually an admin
        if (profile.role !== 'admin') {
          console.error('Non-admin attempted to access admin area:', profile)
          error.value = 'Access denied. This account does not have administrator privileges.'
          loading.value = false
          await supabase.auth.signOut()
          return
        }
        
        console.log('Admin profile verified, redirecting...')
        window.location.href = '/admin/dashboard'
        
      } catch (err) {
        console.error('Unexpected error during login:', err)
        error.value = 'An unexpected error occurred. Please try again.'
        loading.value = false
      }
    }
    
    return {
      form,
      error,
      loading,
      showPassword,
      handleAdminLogin
    }
  }
}
</script>
