<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="mx-auto h-12 w-12 bg-yellow-600 rounded-lg flex items-center justify-center">
          <i class="fas fa-motorcycle text-white text-xl"></i>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Driver Sign In
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Access your driver account
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleDriverLogin">
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
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
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
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
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
              class="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>

          <div class="text-sm">
            <router-link to="/forgot-password" class="font-medium text-yellow-600 hover:text-yellow-500">
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
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <i class="fas fa-spinner fa-spin text-yellow-500"></i>
            </span>
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </div>
      </form>
      
      <div class="mt-6">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300" />
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-gray-50 text-gray-500">Don't have a driver account?</span>
          </div>
        </div>
        
        <div class="mt-6 text-center">
          <router-link
            to="/driver/register"
            class="inline-flex items-center px-4 py-2 border border-yellow-300 text-sm font-medium rounded-md text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            <i class="fas fa-user-plus mr-2"></i>
            Register as Driver
          </router-link>
        </div>
      </div>
      
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
  name: 'DriverLogin',
  setup() {
    const router = useRouter()
    const form = reactive({
      email: '',
      password: ''
    })
    
    const error = ref('')
    const loading = ref(false)
    const showPassword = ref(false)
    
    const handleDriverLogin = async () => {
      error.value = ''
      loading.value = true
      
      try {
        console.log('Starting driver login process...')
        
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
        
        console.log('Login successful, checking driver profile...')
        
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
        
        // Check if user is actually a driver
        if (profile.role !== 'driver') {
          error.value = 'This account is not registered as a driver. Please use the correct login page.'
          loading.value = false
          await supabase.auth.signOut()
          return
        }
        
        console.log('Driver profile verified, redirecting...')
        window.location.href = '/driver/dashboard'
        
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
      handleDriverLogin
    }
  }
}
</script>
