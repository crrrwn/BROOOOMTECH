<template>
  <nav class="bg-white shadow-lg border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <router-link to="/" class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <i class="fas fa-truck text-white text-sm"></i>
            </div>
            <span class="text-xl font-bold text-gray-800">DeliveryHub</span>
          </router-link>
        </div>
        
        <div class="flex items-center space-x-4">
          <template v-if="isAuthenticated">
            <!-- Role-based navigation -->
            <div class="hidden md:flex items-center space-x-4">
              <template v-if="userProfile?.role === 'user'">
                <router-link to="/user/dashboard" class="nav-link">Dashboard</router-link>
                <router-link to="/user/book-service" class="nav-link">Book Service</router-link>
                <router-link to="/user/orders" class="nav-link">My Orders</router-link>
              </template>
              
              <template v-if="userProfile?.role === 'driver'">
                <router-link to="/driver/dashboard" class="nav-link">Dashboard</router-link>
                <router-link to="/driver/orders" class="nav-link">Orders</router-link>
                <router-link to="/driver/earnings" class="nav-link">Earnings</router-link>
              </template>
              
              <template v-if="userProfile?.role === 'admin'">
                <router-link to="/admin/dashboard" class="nav-link">Dashboard</router-link>
                <router-link to="/admin/orders" class="nav-link">Orders</router-link>
                <router-link to="/admin/drivers" class="nav-link">Drivers</router-link>
                <router-link to="/admin/users" class="nav-link">Users</router-link>
              </template>
            </div>
            
            <!-- User menu -->
            <div class="relative" ref="userMenuRef">
              <button
                @click="showUserMenu = !showUserMenu"
                class="flex items-center space-x-2 text-gray-700 hover:text-green-600 focus:outline-none"
              >
                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <i class="fas fa-user text-green-600 text-sm"></i>
                </div>
                <span class="hidden md:block text-sm font-medium">
                  {{ userProfile?.first_name || 'User' }}
                </span>
                <i class="fas fa-chevron-down text-xs"></i>
              </button>
              
              <div
                v-if="showUserMenu"
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
              >
                <router-link
                  :to="`/${userProfile?.role}/profile`"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="showUserMenu = false"
                >
                  Profile
                </router-link>
                <button
                  @click="handleSignOut"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </template>
          
          <template v-else>
            <router-link to="/login" class="btn-outline">Login</router-link>
            <router-link to="/register" class="btn-primary">Register</router-link>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

export default {
  name: 'Navbar',
  setup() {
    const router = useRouter()
    const { isAuthenticated, userProfile, signOut } = useAuth()
    const showUserMenu = ref(false)
    const userMenuRef = ref(null)
    
    const handleSignOut = async () => {
      await signOut()
      showUserMenu.value = false
      router.push('/login')
    }
    
    const handleClickOutside = (event) => {
      if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
        showUserMenu.value = false
      }
    }
    
    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })
    
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })
    
    return {
      isAuthenticated,
      userProfile,
      showUserMenu,
      userMenuRef,
      handleSignOut
    }
  }
}
</script>

<style scoped>
.nav-link {
  @apply text-gray-600 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200;
}

.nav-link.router-link-active {
  @apply text-green-600 bg-green-50;
}
</style>
