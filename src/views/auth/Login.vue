<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="mx-auto h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center">
          <i class="fas fa-truck text-white text-xl"></i>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to DeliveryHub
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Book delivery services with ease
        </p>
      </div>
      
      <!-- Customer Login Form -->
      <form class="mt-8 space-y-6" @submit.prevent="handleCustomerLogin">
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
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
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
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
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

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>

          <div class="text-sm">
            <router-link to="/forgot-password" class="font-medium text-green-600 hover:text-green-500">
              Forgot your password?
            </router-link>
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
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <i class="fas fa-spinner fa-spin text-green-500"></i>
            </span>
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </div>
      </form>
      
      <!-- Registration Link -->
      <div class="mt-6">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300" />
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-gray-50 text-gray-500">New to DeliveryHub?</span>
          </div>
        </div>
        
        <div class="mt-6 text-center">
          <router-link
            to="/register"
            class="inline-flex items-center px-4 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <i class="fas fa-user-plus mr-2"></i>
            Register as Customer
          </router-link>
        </div>
      </div>
      
      <!-- Hidden links for direct access (not visible in UI) -->
      <div class="hidden">
        <router-link to="/driver/login">Driver Login</router-link>
        <router-link to="/admin/login">Admin Login</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/composables/useSupabase'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const form = reactive({
      email: '',
      password: ''
    })
    
    const error = ref('')
    const loading = ref(false)
    const showPassword = ref(false)
    
    const handleCustomerLogin = async () => {
      error.value = ''
      loading.value = true
      
      try {
        console.log('Starting customer login process...')
        
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
        
        console.log('Login successful, checking user profile...')
        
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .single()
        
        if (profileError) {
          console.error('Error fetching profile:', profileError)
          error.value = 'Profile not found. Please contact support.'
          loading.value = false
          return
        }
        
        console.log('User profile loaded:', profile)
        
        // Redirect based on role
        if (profile.role === 'admin') {
          console.log('Admin detected, redirecting to admin dashboard')
          window.location.href = '/admin/dashboard'
        } else if (profile.role === 'driver') {
          console.log('Driver detected, redirecting to driver dashboard')
          window.location.href = '/driver/dashboard'
        } else {
          console.log('Customer detected, redirecting to user dashboard')
          window.location.href = '/user/dashboard'
        }
        
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
      handleCustomerLogin
    }
  }
}
</script>
