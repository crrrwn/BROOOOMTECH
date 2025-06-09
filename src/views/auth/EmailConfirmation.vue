<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <div class="mx-auto h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center">
          <i class="fas fa-truck text-white text-xl"></i>
        </div>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          Email Confirmation
        </h2>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center">
        <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-green-500 bg-white">
          <i class="fas fa-spinner fa-spin mr-2"></i>
          Confirming your email...
        </div>
      </div>

      <!-- Success State -->
      <div v-else-if="confirmed && !error" class="text-center space-y-4">
        <div class="rounded-md bg-green-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <i class="fas fa-check-circle text-green-400 text-xl"></i>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">
                Email confirmed successfully!
              </h3>
              <div class="mt-2 text-sm text-green-700">
                <p>Your account has been activated. You can now sign in.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="text-center">
          <p class="text-sm text-gray-600 mb-4">
            Redirecting to login in {{ countdown }} seconds...
          </p>
          <button
            @click="goToLogin"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Go to Login
          </button>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center space-y-4">
        <div class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <i class="fas fa-exclamation-circle text-red-400 text-xl"></i>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                Confirmation failed
              </h3>
              <div class="mt-2 text-sm text-red-700">
                <p>{{ error }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="text-center">
          <button
            @click="goToLogin"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Back to Login
          </button>
        </div>
      </div>

      <!-- Default State -->
      <div v-else class="text-center">
        <p class="text-gray-600">Processing email confirmation...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/composables/useSupabase'

export default {
  name: 'EmailConfirmation',
  setup() {
    const router = useRouter()
    const route = useRoute()
    
    const loading = ref(true)
    const confirmed = ref(false)
    const error = ref('')
    const countdown = ref(5)
    
    const handleEmailConfirmation = async () => {
      try {
        console.log('Route query params:', route.query)
        
        // Handle both old and new token formats
        const token_hash = route.query.token_hash || route.query.access_token
        const type = route.query.type || 'signup'
        
        if (!token_hash) {
          throw new Error('No confirmation token found in URL')
        }
        
        console.log('Attempting to verify with token_hash:', token_hash)
        
        // Try the new method first
        let result
        try {
          result = await supabase.auth.verifyOtp({
            token_hash,
            type: type === 'signup' ? 'email' : type
          })
        } catch (otpError) {
          console.log('OTP verification failed, trying session method:', otpError)
          
          // Fallback: try to get session from URL
          const { data, error: sessionError } = await supabase.auth.getSession()
          if (sessionError) throw sessionError
          
          if (data.session) {
            result = { data: { user: data.session.user }, error: null }
          } else {
            throw new Error('Unable to confirm email. Please try clicking the link again.')
          }
        }
        
        if (result.error) {
          throw result.error
        }
        
        if (result.data.user) {
          console.log('Email confirmed for user:', result.data.user.email)
          confirmed.value = true
          startCountdown()
        } else {
          throw new Error('No user data received after confirmation')
        }
        
      } catch (err) {
        console.error('Email confirmation error:', err)
        error.value = err.message || 'Failed to confirm email'
      } finally {
        loading.value = false
      }
    }
    
    const startCountdown = () => {
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
          goToLogin()
        }
      }, 1000)
    }
    
    const goToLogin = () => {
      router.push('/login')
    }
    
    onMounted(() => {
      // Small delay to ensure route is fully loaded
      setTimeout(() => {
        handleEmailConfirmation()
      }, 100)
    })
    
    return {
      loading,
      confirmed,
      error,
      countdown,
      goToLogin
    }
  }
}
</script>
