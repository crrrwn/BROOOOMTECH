<template>
  <div>
    <Navbar />
    
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">My Orders</h1>
          <p class="mt-2 text-gray-600">Track and manage your delivery orders</p>
        </div>
        
        <!-- Filters -->
        <div class="card mb-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="status in statusFilters"
                :key="status.value"
                @click="selectedStatus = status.value"
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  selectedStatus === status.value
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                {{ status.label }}
              </button>
            </div>
            
            <div class="flex items-center space-x-4">
              <select
                v-model="selectedService"
                class="input-field w-auto"
              >
                <option value="">All Services</option>
                <option v-for="service in serviceTypes" :key="service" :value="service">
                  {{ service }}
                </option>
              </select>
              
              <button
                @click="refreshOrders"
                class="btn-secondary"
                :disabled="loading"
              >
                <i class="fas fa-sync-alt mr-2" :class="{ 'fa-spin': loading }"></i>
                Refresh
              </button>
            </div>
          </div>
        </div>
        
        <!-- Orders List -->
        <LoadingSpinner v-if="loading && orders.length === 0" />
        
        <div v-else-if="filteredOrders.length === 0" class="text-center py-12">
          <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-box text-gray-400 text-3xl"></i>
          </div>
          <h3 class="text-xl font-medium text-gray-900 mb-2">No orders found</h3>
          <p class="text-gray-500 mb-6">
            {{ selectedStatus !== '' ? 'No orders with this status' : 'You haven\'t placed any orders yet' }}
          </p>
          <router-link to="/user/book-service" class="btn-primary">
            Book Your First Service
          </router-link>
        </div>
        
        <div v-else class="space-y-4">
          <div
            v-for="order in filteredOrders"
            :key="order.id"
            class="card hover:shadow-lg transition-shadow duration-200"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <i :class="getServiceIcon(order.service_type)"></i>
                    </div>
                    <div>
                      <h3 class="text-lg font-semibold text-gray-900">
                        Order #{{ order.id }}
                      </h3>
                      <p class="text-sm text-gray-500">
                        {{ order.service_type }} • {{ formatDate(order.created_at) }}
                      </p>
                    </div>
                  </div>
                  
                  <div class="flex items-center space-x-4">
                    <span :class="getStatusClass(order.status)">
                      {{ formatStatus(order.status) }}
                    </span>
                    <span class="text-lg font-semibold text-gray-900">
                      ₱{{ order.delivery_fee }}
                    </span>
                  </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p class="text-sm font-medium text-gray-700">Pickup</p>
                    <p class="text-sm text-gray-600">{{ order.pickup_address }}</p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-700">Delivery</p>
                    <p class="text-sm text-gray-600">{{ order.delivery_address }}</p>
                  </div>
                </div>
                
                <div v-if="order.driver_profiles" class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <i class="fas fa-motorcycle text-blue-600 text-sm"></i>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-700">Driver</p>
                      <p class="text-sm text-gray-600">
                        {{ order.driver_profiles.first_name }} {{ order.driver_profiles.last_name }}
                      </p>
                    </div>
                  </div>
                  
                  <div class="flex items-center space-x-2">
                    <button
                      v-if="order.status !== 'delivered' && order.status !== 'cancelled'"
                      @click="openChat(order.id)"
                      class="btn-secondary text-sm"
                    >
                      <i class="fas fa-comments mr-1"></i>
                      Chat
                    </button>
                    
                    <router-link
                      :to="`/user/orders/${order.id}`"
                      class="btn-outline text-sm"
                    >
                      View Details
                    </router-link>
                  </div>
                </div>
                
                <div v-else class="flex items-center justify-between">
                  <p class="text-sm text-gray-500">
                    {{ order.status === 'placed' ? 'Looking for a driver...' : 'No driver assigned' }}
                  </p>
                  
                  <div class="flex items-center space-x-2">
                    <button
                      v-if="order.status === 'placed'"
                      @click="cancelOrder(order.id)"
                      class="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Cancel Order
                    </button>
                    
                    <router-link
                      :to="`/user/orders/${order.id}`"
                      class="btn-outline text-sm"
                    >
                      View Details
                    </router-link>
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
  name: 'MyOrders',
  components: {
    Navbar,
    LoadingSpinner,
    Modal,
    ChatWindow
  },
  setup() {
    const { userProfile } = useAuth()
    const { orders, getUserOrders, updateOrderStatus, loading } = useOrders()
    const { subscribeToOrders } = useRealtime()
    
    const selectedStatus = ref('')
    const selectedService = ref('')
    const showChatModal = ref(false)
    const selectedOrderId = ref(null)
    
    const statusFilters = [
      { label: 'All', value: '' },
      { label: 'Placed', value: 'placed' },
      { label: 'Assigned', value: 'assigned' },
      { label: 'Picked Up', value: 'picked_up' },
      { label: 'In Transit', value: 'in_transit' },
      { label: 'Delivered', value: 'delivered' },
      { label: 'Cancelled', value: 'cancelled' }
    ]
    
    const serviceTypes = [
      'Food Delivery',
      'Pay Bills',
      'Pick-up',
      'Surprise Delivery',
      'Medicines',
      'Grocery',
      'Pabili'
    ]
    
    const filteredOrders = computed(() => {
      let filtered = orders.value
      
      if (selectedStatus.value) {
        filtered = filtered.filter(order => order.status === selectedStatus.value)
      }
      
      if (selectedService.value) {
        filtered = filtered.filter(order => order.service_type === selectedService.value)
      }
      
      return filtered
    })
    
    const loadOrders = async () => {
      if (userProfile.value?.user_id) {
        await getUserOrders(userProfile.value.user_id)
      }
    }
    
    const refreshOrders = async () => {
      await loadOrders()
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
        'placed': 'status-badge status-placed',
        'assigned': 'status-badge status-assigned',
        'picked_up': 'status-badge status-picked-up',
        'in_transit': 'status-badge status-in-transit',
        'delivered': 'status-badge status-delivered',
        'cancelled': 'status-badge status-cancelled'
      }
      return classes[status] || 'status-badge status-placed'
    }
    
    const formatStatus = (status) => {
      return status.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    }
    
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    const cancelOrder = async (orderId) => {
      if (confirm('Are you sure you want to cancel this order?')) {
        await updateOrderStatus(orderId, 'cancelled')
        await loadOrders()
      }
    }
    
    const openChat = (orderId) => {
      selectedOrderId.value = orderId
      showChatModal.value = true
    }
    
    const closeChatModal = () => {
      showChatModal.value = false
      selectedOrderId.value = null
    }
    
    let unsubscribe = null
    
    onMounted(async () => {
      await loadOrders()
      
      // Subscribe to real-time order updates
      if (userProfile.value?.user_id) {
        unsubscribe = subscribeToOrders((payload) => {
          if (payload.eventType === 'UPDATE') {
            const orderIndex = orders.value.findIndex(order => order.id === payload.new.id)
            if (orderIndex !== -1) {
              orders.value[orderIndex] = { ...orders.value[orderIndex], ...payload.new }
            }
          }
        }, userProfile.value.user_id)
      }
    })
    
    onUnmounted(() => {
      if (unsubscribe) {
        unsubscribe()
      }
    })
    
    return {
      orders,
      filteredOrders,
      selectedStatus,
      selectedService,
      statusFilters,
      serviceTypes,
      showChatModal,
      selectedOrderId,
      loading,
      loadOrders,
      refreshOrders,
      getServiceIcon,
      getStatusClass,
      formatStatus,
      formatDate,
      cancelOrder,
      openChat,
      closeChatModal
    }
  }
}
</script>
