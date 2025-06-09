<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">User Dashboard</h1>
    
    <div class="bg-white shadow rounded-lg p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">Welcome, {{ userProfile?.first_name || 'User' }}!</h2>
      <p class="text-gray-600">
        This is your dashboard where you can manage your delivery orders and account.
      </p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Quick Actions -->
      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-semibold mb-4">Quick Actions</h3>
        <div class="space-y-4">
          <router-link 
            to="/user/book-service" 
            class="flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition"
          >
            <div class="bg-green-100 p-2 rounded-full mr-3">
              <i class="fas fa-plus text-green-600"></i>
            </div>
            <div>
              <p class="font-medium">Book a Service</p>
              <p class="text-sm text-gray-500">Request a new delivery</p>
            </div>
          </router-link>
          
          <router-link 
            to="/user/orders" 
            class="flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
          >
            <div class="bg-blue-100 p-2 rounded-full mr-3">
              <i class="fas fa-list text-blue-600"></i>
            </div>
            <div>
              <p class="font-medium">My Orders</p>
              <p class="text-sm text-gray-500">View your order history</p>
            </div>
          </router-link>
          
          <router-link 
            to="/user/profile" 
            class="flex items-center p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
          >
            <div class="bg-purple-100 p-2 rounded-full mr-3">
              <i class="fas fa-user text-purple-600"></i>
            </div>
            <div>
              <p class="font-medium">My Profile</p>
              <p class="text-sm text-gray-500">Update your information</p>
            </div>
          </router-link>
        </div>
      </div>
      
      <!-- Recent Orders -->
      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-semibold mb-4">Recent Orders</h3>
        <div v-if="loading" class="flex justify-center py-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
        <div v-else-if="recentOrders.length === 0" class="text-center py-4 text-gray-500">
          <i class="fas fa-inbox text-3xl mb-2"></i>
          <p>No recent orders</p>
        </div>
        <ul v-else class="divide-y divide-gray-200">
          <li v-for="order in recentOrders" :key="order.id" class="py-3">
            <div class="flex justify-between">
              <div>
                <p class="font-medium">Order #{{ order.id }}</p>
                <p class="text-sm text-gray-500">{{ formatDate(order.created_at) }}</p>
              </div>
              <div>
                <span 
                  :class="{
                    'bg-yellow-100 text-yellow-800': order.status === 'placed',
                    'bg-blue-100 text-blue-800': order.status === 'assigned',
                    'bg-purple-100 text-purple-800': order.status === 'picked_up',
                    'bg-indigo-100 text-indigo-800': order.status === 'in_transit',
                    'bg-green-100 text-green-800': order.status === 'delivered',
                    'bg-red-100 text-red-800': order.status === 'cancelled'
                  }"
                  class="px-2 py-1 text-xs rounded-full"
                >
                  {{ formatStatus(order.status) }}
                </span>
              </div>
            </div>
          </li>
        </ul>
        <div class="mt-4 text-center">
          <router-link to="/user/orders" class="text-sm text-green-600 hover:text-green-500">
            View all orders
          </router-link>
        </div>
      </div>
      
      <!-- Service Categories -->
      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-semibold mb-4">Our Services</h3>
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-gray-50 p-3 rounded-lg text-center">
            <div class="bg-green-100 p-2 rounded-full inline-flex justify-center mb-2">
              <i class="fas fa-utensils text-green-600"></i>
            </div>
            <p class="text-sm font-medium">Food Delivery</p>
          </div>
          <div class="bg-gray-50 p-3 rounded-lg text-center">
            <div class="bg-blue-100 p-2 rounded-full inline-flex justify-center mb-2">
              <i class="fas fa-file-invoice-dollar text-blue-600"></i>
            </div>
            <p class="text-sm font-medium">Pay Bills</p>
          </div>
          <div class="bg-gray-50 p-3 rounded-lg text-center">
            <div class="bg-purple-100 p-2 rounded-full inline-flex justify-center mb-2">
              <i class="fas fa-hand-paper text-purple-600"></i>
            </div>
            <p class="text-sm font-medium">Pick-up</p>
          </div>
          <div class="bg-gray-50 p-3 rounded-lg text-center">
            <div class="bg-pink-100 p-2 rounded-full inline-flex justify-center mb-2">
              <i class="fas fa-gift text-pink-600"></i>
            </div>
            <p class="text-sm font-medium">Surprise Delivery</p>
          </div>
        </div>
        <div class="mt-4 text-center">
          <router-link to="/user/book-service" class="text-sm text-green-600 hover:text-green-500">
            Book a service now
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { supabase } from '@/composables/useSupabase'

export default {
  name: 'UserDashboard',
  setup() {
    const userProfile = ref(null)
    const recentOrders = ref([])
    const loading = ref(true)
    
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single()
            
          if (error) {
            console.error('Error fetching user profile:', error)
          } else {
            userProfile.value = data
          }
          
          // Get recent orders
          const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5)
            
          if (ordersError) {
            console.error('Error fetching orders:', ordersError)
          } else {
            recentOrders.value = orders
          }
        }
      } catch (error) {
        console.error('Error getting current user:', error)
      } finally {
        loading.value = false
      }
    }
    
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    }
    
    const formatStatus = (status) => {
      return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
    
    onMounted(() => {
      getCurrentUser()
    })
    
    return {
      userProfile,
      recentOrders,
      loading,
      formatDate,
      formatStatus
    }
  }
}
</script>
