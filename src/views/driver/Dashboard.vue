<template>
  <div>
    <Navbar />
    
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">
                Driver Dashboard
              </h1>
              <p class="mt-2 text-gray-600">
                Welcome back, {{ userProfile?.first_name }}!
              </p>
            </div>
            
            <!-- Online/Offline Toggle -->
            <div class="flex items-center space-x-4">
              <div class="flex items-center">
                <span class="text-sm font-medium text-gray-700 mr-3">Status:</span>
                <button
                  @click="toggleOnlineStatus"
                  :class="[
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
                    isOnline ? 'bg-green-600' : 'bg-gray-200'
                  ]"
                >
                  <span
                    :class="[
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                      isOnline ? 'translate-x-5' : 'translate-x-0'
                    ]"
                  />
                </button>
                <span :class="[
                  'ml-3 text-sm font-medium',
                  isOnline ? 'text-green-600' : 'text-gray-500'
                ]">
                  {{ isOnline ? 'Online' : 'Offline' }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-check-circle text-green-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Today's Deliveries</p>
                <p class="text-2xl font-bold text-gray-900">{{ todayStats.deliveries }}</p>
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-peso-sign text-blue-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Today's Earnings</p>
                <p class="text-2xl font-bold text-gray-900">₱{{ todayStats.earnings }}</p>
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-clock text-yellow-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Active Orders</p>
                <p class="text-2xl font-bold text-gray-900">{{ activeOrders.length }}</p>
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-star text-purple-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Rating</p>
                <p class="text-2xl font-bold text-gray-900">{{ driverStats.rating || 'N/A' }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Available Orders -->
          <div class="card">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gray-900">Available Orders</h2>
              <button
                @click="refreshAvailableOrders"
                class="btn-secondary"
                :disabled="loading"
              >
                <i class="fas fa-sync-alt mr-2" :class="{ 'fa-spin': loading }"></i>
                Refresh
              </button>
            </div>
            
            <LoadingSpinner v-if="loading && availableOrders.length === 0" />
            
            <div v-else-if="!isOnline" class="text-center py-8">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-power-off text-gray-400 text-2xl"></i>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">You're offline</h3>
              <p class="text-gray-500">Turn on your status to see available orders</p>
            </div>
            
            <div v-else-if="availableOrders.length === 0" class="text-center py-8">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-inbox text-gray-400 text-2xl"></i>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">No available orders</h3>
              <p class="text-gray-500">Check back later for new delivery opportunities</p>
            </div>
            
            <div v-else class="space-y-4 max-h-96 overflow-y-auto">
              <div
                v-for="order in availableOrders"
                :key="order.id"
                class="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors"
              >
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <h4 class="font-medium text-gray-900">{{ order.service_type }}</h4>
                    <p class="text-sm text-gray-500">Order #{{ order.id }}</p>
                  </div>
                  <span class="text-lg font-semibold text-green-600">₱{{ order.delivery_fee }}</span>
                </div>
                
                <div class="space-y-2 mb-4">
                  <div class="flex items-start space-x-2">
                    <i class="fas fa-map-marker-alt text-blue-500 mt-1"></i>
                    <div>
                      <p class="text-sm font-medium text-gray-700">Pickup</p>
                      <p class="text-sm text-gray-600">{{ order.pickup_address }}</p>
                    </div>
                  </div>
                  
                  <div class="flex items-start space-x-2">
                    <i class="fas fa-map-marker-alt text-red-500 mt-1"></i>
                    <div>
                      <p class="text-sm font-medium text-gray-700">Delivery</p>
                      <p class="text-sm text-gray-600">{{ order.delivery_address }}</p>
                    </div>
                  </div>
                </div>
                
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <span class="text-sm text-gray-500">
                      <i class="fas fa-clock mr-1"></i>
                      {{ formatTimeAgo(order.created_at) }}
                    </span>
                    <span class="text-sm text-gray-500">
                      <i class="fas fa-route mr-1"></i>
                      ~{{ calculateDistance(order) }}km
                    </span>
                  </div>
                  
                  <div class="flex space-x-2">
                    <button
                      @click="declineOrder(order.id)"
                      class="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Decline
                    </button>
                    <button
                      @click="acceptOrder(order)"
                      class="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Active Assignments -->
          <div class="card">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gray-900">My Assignments</h2>
              <router-link to="/driver/orders" class="text-green-600 hover:text-green-700 font-medium">
                View all
              </router-link>
            </div>
            
            <div v-if="activeOrders.length === 0" class="text-center py-8">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-clipboard-list text-gray-400 text-2xl"></i>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">No active assignments</h3>
              <p class="text-gray-500">Accept orders to start earning</p>
            </div>
            
            <div v-else class="space-y-4 max-h-96 overflow-y-auto">
              <div
                v-for="order in activeOrders"
                :key="order.id"
                class="border border-gray-200 rounded-lg p-4"
              >
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <h4 class="font-medium text-gray-900">{{ order.service_type }}</h4>
                    <p class="text-sm text-gray-500">Order #{{ order.id }}</p>
                  </div>
                  <div class="text-right">
                    <span class="text-lg font-semibold text-green-600">₱{{ order.delivery_fee }}</span>
                    <br>
                    <span :class="getStatusClass(order.status)">
                      {{ formatStatus(order.status) }}
                    </span>
                  </div>
                </div>
                
                <div class="space-y-2 mb-4">
                  <div class="flex items-start space-x-2">
                    <i class="fas fa-map-marker-alt text-blue-500 mt-1"></i>
                    <div>
                      <p class="text-sm font-medium text-gray-700">Pickup</p>
                      <p class="text-sm text-gray-600">{{ order.pickup_address }}</p>
                    </div>
                  </div>
                  
                  <div class="flex items-start space-x-2">
                    <i class="fas fa-map-marker-alt text-red-500 mt-1"></i>
                    <div>
                      <p class="text-sm font-medium text-gray-700">Delivery</p>
                      <p class="text-sm text-gray-600">{{ order.delivery_address }}</p>
                    </div>
                  </div>
                </div>
                
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <div class="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <i class="fas fa-user text-gray-600 text-xs"></i>
                    </div>
                    <span class="text-sm text-gray-600">
                      {{ order.user_profiles?.first_name }} {{ order.user_profiles?.last_name }}
                    </span>
                  </div>
                  
                  <div class="flex space-x-2">
                    <button
                      @click="openOrderChat(order.id)"
                      class="px-3 py-1 text-sm text-green-600 border border-green-300 rounded hover:bg-green-50"
                    >
                      <i class="fas fa-comments mr-1"></i>
                      Chat
                    </button>
                    <button
                      @click="updateOrderStatus(order)"
                      class="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      {{ getStatusActionText(order.status) }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Chat Modal -->
    <Modal
      :is-open="showChatModal"
      :title="`Chat - Order #${selectedOrderId}`"
      size="lg"
      :show-actions="false"
      @close="closeChatModal"
    >
      <ChatWindow
        v-if="selectedOrderId"
        :order-id="selectedOrderId"
        @close="closeChatModal"
      />
    </Modal>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useOrders } from '@/composables/useOrders'
import { useRealtime } from '@/composables/useRealtime'
import { supabase } from '@/composables/useSupabase'
import Navbar from '@/components/common/Navbar.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import Modal from '@/components/common/Modal.vue'
import ChatWindow from '@/components/chat/ChatWindow.vue'

export default {
  name: 'DriverDashboard',
  components: {
    Navbar,
    LoadingSpinner,
    Modal,
    ChatWindow
  },
  setup() {
    const { userProfile } = useAuth()
    const { getAvailableOrders, getDriverOrders, acceptOrder, updateOrderStatus: updateStatus, loading } = useOrders()
    const { subscribeToOrders } = useRealtime()
    
    const isOnline = ref(false)
    const availableOrders = ref([])
    const driverOrders = ref([])
    const showChatModal = ref(false)
    const selectedOrderId = ref(null)
    const driverStats = ref({
      rating: 4.8,
      totalDeliveries: 0
    })
    
    const activeOrders = computed(() => {
      return driverOrders.value.filter(order => 
        ['assigned', 'picked_up', 'in_transit'].includes(order.status)
      )
    })
    
    const todayStats = computed(() => {
      const today = new Date().toDateString()
      const todayOrders = driverOrders.value.filter(order => 
        new Date(order.created_at).toDateString() === today &&
        order.status === 'delivered'
      )
      
      return {
        deliveries: todayOrders.length,
        earnings: todayOrders.reduce((sum, order) => sum + (order.delivery_fee || 0), 0)
      }
    })
    
    const loadAvailableOrders = async () => {
      if (isOnline.value) {
        const { data } = await getAvailableOrders()
        availableOrders.value = data || []
      } else {
        availableOrders.value = []
      }
    }
    
    const loadDriverOrders = async () => {
      if (userProfile.value?.user_id) {
        const { data } = await getDriverOrders(userProfile.value.user_id)
        driverOrders.value = data || []
      }
    }
    
    const refreshAvailableOrders = async () => {
      await loadAvailableOrders()
    }
    
    const toggleOnlineStatus = async () => {
      isOnline.value = !isOnline.value
      
      // Update driver status in database
      try {
        await supabase
          .from('driver_profiles')
          .update({ is_online: isOnline.value })
          .eq('user_id', userProfile.value.user_id)
      } catch (error) {
        console.error('Error updating online status:', error)
      }
      
      if (isOnline.value) {
        await loadAvailableOrders()
      } else {
        availableOrders.value = []
      }
    }
    
    const handleAcceptOrder = async (order) => {
      const { error } = await acceptOrder(order.id, userProfile.value.user_id)
      
      if (!error) {
        // Remove from available orders
        availableOrders.value = availableOrders.value.filter(o => o.id !== order.id)
        // Reload driver orders
        await loadDriverOrders()
      }
    }
    
    const declineOrder = (orderId) => {
      // Remove from available orders (temporary decline)
      availableOrders.value = availableOrders.value.filter(o => o.id !== orderId)
    }
    
    const handleUpdateOrderStatus = async (order) => {
      const statusFlow = {
        'assigned': 'picked_up',
        'picked_up': 'in_transit',
        'in_transit': 'delivered'
      }
      
      const nextStatus = statusFlow[order.status]
      if (nextStatus) {
        const { error } = await updateStatus(order.id, nextStatus)
        if (!error) {
          await loadDriverOrders()
        }
      }
    }
    
    const openOrderChat = (orderId) => {
      selectedOrderId.value = orderId
      showChatModal.value = true
    }
    
    const closeChatModal = () => {
      showChatModal.value = false
      selectedOrderId.value = null
    }
    
    const formatTimeAgo = (date) => {
      const now = new Date()
      const orderDate = new Date(date)
      const diffMs = now - orderDate
      const diffMins = Math.floor(diffMs / 60000)
      
      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
      return `${Math.floor(diffMins / 1440)}d ago`
    }
    
    const calculateDistance = (order) => {
      // Simple distance calculation - in real app this would use actual coordinates
      return Math.floor(Math.random() * 15) + 1
    }
    
    const formatStatus = (status) => {
      return status.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    }
    
    const getStatusClass = (status) => {
      const classes = {
        'assigned': 'status-badge status-assigned',
        'picked_up': 'status-badge status-picked-up',
        'in_transit': 'status-badge status-in-transit',
        'delivered': 'status-badge status-delivered'
      }
      return classes[status] || 'status-badge status-assigned'
    }
    
    const getStatusActionText = (status) => {
      const actions = {
        'assigned': 'Mark Picked Up',
        'picked_up': 'Mark In Transit',
        'in_transit': 'Mark Delivered'
      }
      return actions[status] || 'Update Status'
    }
    
    let unsubscribe = null
    
    onMounted(async () => {
      // Load initial data
      await loadDriverOrders()
      
      // Check driver online status
      try {
        const { data } = await supabase
          .from('driver_profiles')
          .select('is_online')
          .eq('user_id', userProfile.value.user_id)
          .single()
        
        if (data) {
          isOnline.value = data.is_online || false
          if (isOnline.value) {
            await loadAvailableOrders()
          }
        }
      } catch (error) {
        console.error('Error loading driver status:', error)
      }
      
      // Subscribe to real-time updates
      unsubscribe = subscribeToOrders((payload) => {
        if (payload.eventType === 'INSERT' && !payload.new.driver_id) {
          // New available order
          if (isOnline.value) {
            availableOrders.value.unshift(payload.new)
          }
        } else if (payload.eventType === 'UPDATE') {
          // Order status update
          if (payload.new.driver_id === userProfile.value.user_id) {
            const orderIndex = driverOrders.value.findIndex(o => o.id === payload.new.id)
            if (orderIndex !== -1) {
              driverOrders.value[orderIndex] = { ...driverOrders.value[orderIndex], ...payload.new }
            }
          }
        }
      })
    })
    
    onUnmounted(() => {
      if (unsubscribe) {
        unsubscribe()
      }
    })
    
    return {
      userProfile,
      isOnline,
      availableOrders,
      activeOrders,
      todayStats,
      driverStats,
      showChatModal,
      selectedOrderId,
      loading,
      toggleOnlineStatus,
      refreshAvailableOrders,
      acceptOrder: handleAcceptOrder,
      declineOrder,
      updateOrderStatus: handleUpdateOrderStatus,
      openOrderChat,
      closeChatModal,
      formatTimeAgo,
      calculateDistance,
      formatStatus,
      getStatusClass,
      getStatusActionText
    }
  }
}
</script>
