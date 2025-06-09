<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="mx-auto h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center">
          <i class="fas fa-truck text-white text-xl"></i>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Or
          <router-link to="/login" class="font-medium text-green-600 hover:text-green-500">
            sign in to your existing account
          </router-link>
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="first_name" class="block text-sm font-medium text-gray-700">First Name</label>
              <input
                id="first_name"
                v-model="form.first_name"
                name="first_name"
                type="text"
                required
                class="mt-1 input-field"
                placeholder="First Name"
              />
            </div>
            <div>
              <label for="last_name" class="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                id="last_name"
                v-model="form.last_name"
                name="last_name"
                type="text"
                required
                class="mt-1 input-field"
                placeholder="Last Name"
              />
            </div>
          </div>
          
          <div>
            <label for="middle_name" class="block text-sm font-medium text-gray-700">Middle Name</label>
            <input
              id="middle_name"
              v-model="form.middle_name"
              name="middle_name"
              type="text"
              class="mt-1 input-field"
              placeholder="Middle Name (Optional)"
            />
          </div>
          
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="mt-1 input-field"
              placeholder="Email address"
            />
          </div>
          
          <div>
            <label for="contact_number" class="block text-sm font-medium text-gray-700">Contact Number</label>
            <input
              id="contact_number"
              v-model="form.contact_number"
              name="contact_number"
              type="tel"
              required
              class="mt-1 input-field"
              placeholder="Contact Number"
            />
          </div>
          
          <div>
            <label for="address" class="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              id="address"
              v-model="form.address"
              name="address"
              rows="3"
              required
              class="mt-1 input-field"
              placeholder="Complete Address"
            ></textarea>
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              autocomplete="new-password"
              required
              class="mt-1 input-field"
              placeholder="Password"
            />
          </div>
          
          <div>
            <label for="confirm_password" class="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              id="confirm_password"
              v-model="form.confirm_password"
              name="confirm_password"
              type="password"
              required
              class="mt-1 input-field"
              placeholder="Confirm Password"
            />
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

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <i class="fas fa-spinner fa-spin text-green-500"></i>
            </span>
            {{ loading ? 'Creating account...' : 'Create account' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

export default {
  name: 'Register',
  setup() {
    const router = useRouter()
    const { signUp, loading } = useAuth()
    
    const form = reactive({
      first_name: '',
      last_name: '',
      middle_name: '',
      email: '',
      contact_number: '',
      address: '',
      password: '',
      confirm_password: ''
    })
    
    const error = ref('')
    const success = ref('')
    
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
      
      const userData = {
        first_name: form.first_name,
        last_name: form.last_name,
        middle_name: form.middle_name,
        contact_number: form.contact_number,
        address: form.address,
        role: 'user'
      }
      
      const { data, error: signUpError } = await signUp(form.email, form.password, userData)
      
      if (signUpError) {
        error.value = signUpError.message
        return
      }
      
      success.value = 'Account created successfully! Please check your email to verify your account.'
      
      // Redirect to login after a delay
      setTimeout(() => {
        router.push('/login')
      }, 3000)
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
