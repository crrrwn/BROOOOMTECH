<template>
  <div>
    <Navbar />
    
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Welcome Section -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">
            Welcome back, {{ userProfile?.first_name || 'User' }}!
          </h1>
          <p class="mt-2 text-gray-600">What can we deliver for you today?</p>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="card text-center">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <i class="fas fa-box text-blue-600 text-xl"></i>
            </div>
            <h3 class="text-2xl font-bold text-gray-900">{{ stats.totalOrders }}</h3>
            <p class="text-sm text-gray-600">Total Orders</p>
          </div>
          
          <div class="card text-center">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <i class="fas fa-truck text-green-600 text-xl"></i>
            </div>
            <h3 class="text-2xl font-bold text-gray-900">{{ stats.activeOrders }}</h3>
            <p class="text-sm text-gray-600">Active Orders</p>
          </div>
          
          <div class="card text-center">
            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <i class="fas fa-clock text-yellow-600 text-xl"></i>
            </div>
            <h3 class="text-2xl font-bold text-gray-900">{{ stats.pendingOrders }}</h3>
            <p class="text-sm text-gray-600">Pending Orders</p>
          </div>
          
          <div class="card text-center">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <i class="fas fa-star text-purple-600 text-xl"></i>
            </div>
            <h3 class="text-2xl font-bold text-gray-900">{{ stats.completedOrders }}</h3>
            <p class="text-sm text-gray-600">Completed</p>
          </div>
        </div>

        <!-- Service Categories -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Our Services</h2>
            <router-link to="/user/book-service" class="text-green-600 hover:text-green-700 font-medium">
              View All Services →
            </router-link>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div
              v-for="service in services"
              :key="service.name"
              @click="bookService(service.name)"
              class="card cursor-pointer text-center transition-all duration-200 hover:shadow-lg hover:scale-105"
            >
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <i :class="`${service.icon} text-green-600 text-xl`"></i>
              </div>
              <h3 class="font-medium text-gray-900 text-sm">{{ service.name }}</h3>
              <p class="text-xs text-gray-500 mt-1">{{ service.description }}</p>
            </div>
          </div>
        </div>

        <!-- Recent Orders -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="card">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-gray-900">Recent Orders</h2>
              <router-link to="/user/orders" class="text-green-600 hover:text-green-700 font-medium text-sm">
                View All →
              </router-link>
            </div>
            
            <LoadingSpinner v-if="loadingOrders" />
            
            <div v-else-if="recentOrders.length === 0" class="text-center py-8">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-box text-gray-400 text-2xl"></i>
              </div>
              <p class="text-gray-500 mb-4">No orders yet</p>
              <router-link to="/user/book-service" class="btn-primary text-sm">
                Book Your First Service
              </router-link>
            </div>
            
            <div v-else class="space-y-4">
              <div
                v-for="order in recentOrders"
                :key="order.id"
                class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                @click="viewOrder(order.id)"
              >
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <i :class="getServiceIcon(order.service_type)"></i>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">Order #{{ order.id }}</p>
                    <p class="text-sm text-gray-600">{{ order.service_type }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <span :class="getStatusClass(order.status)">
                    {{ formatStatus(order.status) }}
                  </span>
                  <p class="text-sm text-gray-600 mt-1">₱{{ order.delivery_fee }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="card">
            <h2 class="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            
            <div class="space-y-4">
              <router-link
                to="/user/book-service"
                class="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
              >
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200">
                  <i class="fas fa-plus text-green-600"></i>
                </div>
                <div class="ml-4">
                  <p class="font-medium text-gray-900">Book New Service</p>
                  <p class="text-sm text-gray-600">Order food, pay bills, and more</p>
                </div>
                <i class="fas fa-chevron-right text-gray-400 ml-auto"></i>
              </router-link>
              
              <router-link
                to="/user/orders"
                class="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
              >
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200">
                  <i class="fas fa-list text-blue-600"></i>
                </div>
                <div class="ml-4">
                  <p class="font-medium text-gray-900">Track Orders</p>
                  <p class="text-sm text-gray-600">View order status and history</p>
                </div>
                <i class="fas fa-chevron-right text-gray-400 ml-auto"></i>
              </router-link>
              
              <router-link
                to="/user/profile"
                class="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
              >
                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200">
                  <i class="fas fa-user text-purple-600"></i>
                </div>
                <div class="ml-4">
                  <p class="font-medium text-gray-900">Update Profile</p>
                  <p class="text-sm text-gray-600">Edit personal information</p>
                </div>
                <i class="fas fa-chevron-right text-gray-400 ml-auto"></i>
              </router-link>
              
              <button
                @click="openChat"
                class="w-full flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors group"
              >
                <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200">
                  <i class="fas fa-comments text-yellow-600"></i>
                </div>
                <div class="ml-4 text-left">
                  <p class="font-medium text-gray-900">Need Help?</p>
                  <p class="text-sm text-gray-600">Chat with our AI assistant</p>
                </div>
                <i class="fas fa-chevron-right text-gray-400 ml-auto"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI Chat Support -->
    <AIChatSupport ref="chatSupport" />
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useOrders } from '@/composables/useOrders'
import Navbar from '@/components/common/Navbar.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AIChatSupport from '@/components/chat/AIChatSupport.vue'

export default {
  name: 'UserDashboard',
  components: {
    Navbar,
    LoadingSpinner,
    AIChatSupport
  },
  setup() {
    const router = useRouter()
    const { userProfile } = useAuth()
    const { orders, getUserOrders, loading: loadingOrders } = useOrders()
    
    const chatSupport = ref(null)
    
    const services = [
      { name: 'Food Delivery', icon: 'fas fa-utensils', description: 'Order from restaurants' },
      { name: 'Pay Bills', icon: 'fas fa-file-invoice-dollar', description: 'Pay utilities & bills' },
      { name: 'Pick-up', icon: 'fas fa-hand-paper', description: 'Pick up items' },
      { name: 'Surprise Delivery', icon: 'fas fa-gift', description: 'Send surprises' },
      { name: 'Medicines', icon: 'fas fa-pills', description: 'Get medicines' },
      { name: 'Grocery', icon: 'fas fa-shopping-cart', description: 'Buy groceries' },
      { name: 'Pabili', icon: 'fas fa-shopping-bag', description: 'Buy anything' }
    ]
    
    const stats = computed(() => {
      const totalOrders = orders.value.length
      const activeOrders = orders.value.filter(order => 
        ['placed', 'assigned', 'picked_up', 'in_transit'].includes(order.status)
      ).length
      const pendingOrders = orders.value.filter(order => order.status === 'placed').length
      const completedOrders = orders.value.filter(order => order.status === 'delivered').length
      
      return {
        totalOrders,
        activeOrders,
        pendingOrders,
        completedOrders
      }
    })
    
    const recentOrders = computed(() => {
      return orders.value.slice(0, 5)
    })
    
    const loadDashboardData = async () => {
      if (userProfile.value?.user_id) {
        await getUserOrders(userProfile.value.user_id)
      }
    }
    
    const bookService = (serviceName) => {
      router.push({
        path: '/user/book-service',
        query: { service: serviceName }
      })
    }
    
    const viewOrder = (orderId) => {
      router.push(`/user/orders/${orderId}`)
    }
    
    const openChat = () => {
      if (chatSupport.value) {
        chatSupport.value.openChat()
      }
    }
    
    const getServiceIcon = (serviceType) => {
      const icons = {
        'Food Delivery': 'fas fa-utensils text-green-600',
        'Pay Bills': 'fas fa-file-invoice-dollar text-green-600',
        'Pick-up': 'fas fa-hand-paper text-green-600',
        'Surprise Delivery': 'fas fa-gift text-green-600',
        'Medicines': 'fas fa-pills text-green-600',
        'Grocery': 'fas fa-shopping-cart text-green-600',
        'Pabili': 'fas fa-shopping-bag text-green-600'
      }
      return icons[serviceType] || 'fas fa-box text-green-600'
    }
    
    const getStatusClass = (status) => {
      const classes = {
        'placed': 'px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full',
        'assigned': 'px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full',
        'picked_up': 'px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full',
        'in_transit': 'px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full',
        'delivered': 'px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full',
        'cancelled': 'px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full'
      }
      return classes[status] || classes['placed']
    }
    
    const formatStatus = (status) => {
      return status.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    }
    
    onMounted(() => {
      loadDashboardData()
    })
    
    return {
      userProfile,
      services,
      stats,
      recentOrders,
      loadingOrders,
      chatSupport,
      bookService,
      viewOrder,
      openChat,
      getServiceIcon,
      getStatusClass,
      formatStatus
    }
  }
}
</script>
