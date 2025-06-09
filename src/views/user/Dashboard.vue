<template>
  <div>
    <Navbar />
    
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">
            Welcome back, {{ userProfile?.first_name }}!
          </h1>
          <p class="mt-2 text-gray-600">Ready to get something delivered?</p>
        </div>
        
        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <router-link
            to="/user/book-service"
            class="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
          >
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-plus text-green-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-gray-900">Book Service</h3>
                <p class="text-sm text-gray-500">Start a new delivery</p>
              </div>
            </div>
          </router-link>
          
          <router-link
            to="/user/orders"
            class="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
          >
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-list text-blue-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-gray-900">My Orders</h3>
                <p class="text-sm text-gray-500">Track your deliveries</p>
              </div>
            </div>
          </router-link>
          
          <router-link
            to="/user/profile"
            class="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
          >
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-user text-purple-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-gray-900">Profile</h3>
                <p class="text-sm text-gray-500">Manage your account</p>
              </div>
            </div>
          </router-link>
          
          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-headset text-yellow-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-gray-900">Support</h3>
                <p class="text-sm text-gray-500">Get help anytime</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Recent Orders -->
        <div class="card">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900">Recent Orders</h2>
            <router-link to="/user/orders" class="text-green-600 hover:text-green-700 font-medium">
              View all
            </router-link>
          </div>
          
          <LoadingSpinner v-if="loading" />
          
          <div v-else-if="recentOrders.length === 0" class="text-center py-8">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-box text-gray-400 text-2xl"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p class="text-gray-500 mb-4">Start by booking your first delivery service</p>
            <router-link to="/user/book-service" class="btn-primary">
              Book a Service
            </router-link>
          </div>
          
          <div v-else class="space-y-4">
            <div
              v-for="order in recentOrders"
              :key="order.id"
              class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors"
            >
              <div class="flex items-center space-x-4">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-box text-green-600"></i>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900">{{ order.service_type }}</h4>
                  <p class="text-sm text-gray-500">{{ formatDate(order.created_at) }}</p>
                </div>
              </div>
              <div class="flex items-center space-x-4">
                <span :class="getStatusClass(order.status)">
                  {{ formatStatus(order.status) }}
                </span>
                <router-link
                  :to="`/user/orders/${order.id}`"
                  class="text-green-600 hover:text-green-700"
                >
                  <i class="fas fa-arrow-right"></i>
                </router-link>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Service Categories -->
        <div class="mt-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Popular Services</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div
              v-for="service in services"
              :key="service.name"
              @click="bookService(service.name)"
              class="card text-center cursor-pointer hover:shadow-lg transition-shadow duration-200"
            >
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <i :class="`${service.icon} text-green-600 text-xl`"></i>
              </div>
              <h3 class="font-medium text-gray-900 text-sm">{{ service.name }}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useOrders } from '@/composables/useOrders'
import Navbar from '@/components/common/Navbar.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

export default {
  name: 'UserDashboard',
  components: {
    Navbar,
    LoadingSpinner
  },
  setup() {
    const router = useRouter()
    const { userProfile } = useAuth()
    const { getUserOrders, loading } = useOrders()
    
    const recentOrders = ref([])
    
    const services = [
      { name: 'Food Delivery', icon: 'fas fa-utensils' },
      { name: 'Pay Bills', icon: 'fas fa-file-invoice-dollar' },
      { name: 'Pick-up', icon: 'fas fa-hand-paper' },
      { name: 'Surprise Delivery', icon: 'fas fa-gift' },
      { name: 'Medicines', icon: 'fas fa-pills' },
      { name: 'Grocery', icon: 'fas fa-shopping-cart' }
    ]
    
    const loadRecentOrders = async () => {
      if (userProfile.value?.user_id) {
        const { data } = await getUserOrders(userProfile.value.user_id)
        recentOrders.value = data?.slice(0, 5) || []
      }
    }
    
    const bookService = (serviceType) => {
      router.push({
        name: 'BookService',
        query: { service: serviceType }
      })
    }
    
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }
    
    const formatStatus = (status) => {
      return status.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    }
    
    const getStatusClass = (status) => {
      const classes = {
        'placed': 'status-badge status-placed',
        'assigned': 'status-badge status-assigned',
        'picked_up': 'status-badge status-picked-up',
        'in_transit': 'status-badge status-in-transit',
        'delivered': 'status-badge status-delivered',
        'cancelled': 'status-badge status-cancelled'
      }
      return classes[status] || 'status-badge status-placed'
    }
    
    onMounted(() => {
      loadRecentOrders()
    })
    
    return {
      userProfile,
      recentOrders,
      services,
      loading,
      bookService,
      formatDate,
      formatStatus,
      getStatusClass
    }
  }
}
</script>
