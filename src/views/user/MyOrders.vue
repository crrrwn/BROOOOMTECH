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
                <span v-if="getOrderCountByStatus(status.value)" class="ml-2 bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
                  {{ getOrderCountByStatus(status.value) }}
                </span>
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
            {{ selectedStatus !== '' ? `No orders with status: ${formatStatus(selectedStatus)}` : 'You haven\'t placed any orders yet' }}
          </p>
          <router-link to="/user/book-service" class="btn-primary">
            Book Your First Service
          </router-link>
        </div>
        
        <div v-else class="space-y-4">
          <div
            v-for="order in filteredOrders"
            :key="`order-${order.id}-${order.status}-${order.updated_at}`"
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
                
                <!-- Show cancellation reason if cancelled -->
                <div v-if="order.status === 'cancelled'" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div class="flex items-center">
                    <i class="fas fa-times-circle text-red-500 mr-2"></i>
                    <span class="text-sm font-medium text-red-800">Order Cancelled</span>
                  </div>
                  <p class="text-sm text-red-600 mt-1">
                    Cancelled on {{ formatDateTime(order.cancelled_at || order.updated_at) }}
                  </p>
                </div>
                
                <div v-if="order.driver_profiles && order.status !== 'cancelled'" class="flex items-center justify-between">
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
                
                <div v-else-if="order.status !== 'cancelled'" class="flex items-center justify-between">
                  <p class="text-sm text-gray-500">
                    {{ order.status === 'placed' ? 'Looking for a driver...' : 'No driver assigned' }}
                  </p>
                  
                  <div class="flex items-center space-x-2">
                    <!-- Show cancel button only if within 30 seconds -->
                    <div v-if="order.status === 'placed'" class="flex items-center space-x-2">
                      <button
                        v-if="canCancelOrder(order)"
                        @click="cancelOrder(order.id)"
                        class="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-1"
                        :disabled="cancellingOrderId === order.id"
                      >
                        <i class="fas fa-times-circle"></i>
                        <span>{{ cancellingOrderId === order.id ? 'Cancelling...' : 'Cancel Order' }}</span>
                      </button>
                      
                      <!-- Show countdown timer -->
                      <span
                        v-if="canCancelOrder(order)"
                        class="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full"
                      >
                        {{ formatTimeLeft(getCancellationTimeLeft(order)) }}
                      </span>
                      
                      <!-- Show expired message -->
                      <div v-if="!canCancelOrder(order)" class="flex items-center space-x-2">
                        <span class="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full flex items-center space-x-1">
                          <i class="fas fa-clock"></i>
                          <span>Cancellation period expired (30s limit)</span>
                        </span>
                      </div>
                    </div>
                    
                    <router-link
                      :to="`/user/orders/${order.id}`"
                      class="btn-outline text-sm"
                    >
                      View Details
                    </router-link>
                  </div>
                </div>
                
                <!-- For cancelled orders, just show view details -->
                <div v-else class="flex justify-end">
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

    <!-- Cancel Order Confirmation Dialog -->
    <ConfirmDialog
      :is-open="showConfirmDialog"
      type="danger"
      title="Cancel Order"
      message="Are you sure you want to cancel this order? This action cannot be undone."
      confirm-text="Yes, Cancel Order"
      cancel-text="Keep Order"
      @confirm="confirmCancelOrder"
      @cancel="closeCancelDialog"
      @close="closeCancelDialog"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useOrders } from '@/composables/useOrders'
import { useRealtime } from '@/composables/useRealtime'
import { notificationService } from '@/composables/useNotification'
import { supabase } from '@/composables/useSupabase'
import Navbar from '@/components/common/Navbar.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import Modal from '@/components/common/Modal.vue'
import ChatWindow from '@/components/chat/ChatWindow.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { useRoute } from 'vue-router'

export default {
  name: 'MyOrders',
  components: {
    Navbar,
    LoadingSpinner,
    Modal,
    ChatWindow,
    ConfirmDialog
  },
  setup() {
  onMounted(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    if (status) {
      selectedStatus.value = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }
  });
    const { userProfile } = useAuth()
    const { orders, getUserOrders, updateOrderStatus, loading } = useOrders()
    const { subscribeToOrders } = useRealtime()
    
    const selectedStatus = ref('')
    const selectedService = ref('')
    const showChatModal = ref(false)
    const selectedOrderId = ref(null)
    const showConfirmDialog = ref(false)
    const orderToCancel = ref(null)
    const cancellingOrderId = ref(null)
    
    // Add route handling
    const route = useRoute()

    // Initialize selectedStatus from URL parameter
    const initializeFromURL = () => {
      const statusParam = route.query.status
      if (statusParam && statusFilters.some(filter => filter.value === statusParam)) {
        selectedStatus.value = statusParam
        console.log('Setting status from URL parameter:', statusParam)
      }
    }
    
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
      let filtered = orders.value || []
      
      if (selectedStatus.value) {
        filtered = filtered.filter(order => (selectedStatus === 'All' || order.status === selectedStatus).value)
      }
      
      if (selectedService.value) {
        filtered = filtered.filter(order => order.service_type === selectedService.value)
      }
      
      return filtered
    })
    
    const getOrderCountByStatus = (status) => {
      if (!orders.value) return 0
      if (status === '') return orders.value.length
      return orders.value.filter(order => order.status === status).length
    }
    
    const canCancelOrder = (order) => {
      if (order.status !== 'placed') return false
      const orderTime = new Date(order.created_at).getTime()
      const timeDiff = currentTime.value - orderTime
      return timeDiff < 30000 // 30 seconds in milliseconds
    }

    const getCancellationTimeLeft = (order) => {
      const orderTime = new Date(order.created_at).getTime()
      const currentTime = new Date().getTime()
      const timeDiff = currentTime - orderTime
      const timeLeft = 30000 - timeDiff // 30 seconds - elapsed time
      return Math.max(0, Math.ceil(timeLeft / 1000)) // Convert to seconds
    }

    const formatTimeLeft = (seconds) => {
      return `${seconds}s left to cancel`
    }

    // Add reactive time tracking
    const currentTime = ref(new Date().getTime())
    
    const loadOrders = async () => {
      if (userProfile.value?.user_id) {
        console.log('Loading orders for user:', userProfile.value.user_id)
        const result = await getUserOrders(userProfile.value.user_id)
        console.log('Orders loaded:', result)
        
        // Force reactivity update
        await nextTick()
      }
    }
    
    const refreshOrders = async () => {
      console.log('Refreshing orders...')
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
        'placed': 'px-3 py-1 rounded-full text-yellow-700 bg-yellow-100 font-medium text-sm',
        'assigned': 'px-3 py-1 rounded-full text-blue-700 bg-blue-100 font-medium text-sm',
        'picked_up': 'px-3 py-1 rounded-full text-purple-700 bg-purple-100 font-medium text-sm',
        'in_transit': 'px-3 py-1 rounded-full text-green-700 bg-green-100 font-medium text-sm',
        'delivered': 'px-3 py-1 rounded-full text-green-700 bg-green-100 font-medium text-sm',
        'cancelled': 'px-3 py-1 rounded-full text-red-700 bg-red-100 font-medium text-sm'
      }
      return classes[status] || 'px-3 py-1 rounded-full text-gray-700 bg-gray-100 font-medium text-sm'
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
    
    const formatDateTime = (dateString) => {
      if (!dateString) return ''
      try {
        const date = new Date(dateString)
        return date.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      } catch (error) {
        console.error('Error formatting date and time:', error)
        return ''
      }
    }
    
    const cancelOrder = (orderId) => {
      orderToCancel.value = orderId
      showConfirmDialog.value = true
    }

    const confirmCancelOrder = async () => {
      if (orderToCancel.value) {
        try {
          cancellingOrderId.value = orderToCancel.value
          console.log('Attempting to cancel order:', orderToCancel.value)
          
          const { data, error } = await updateOrderStatus(orderToCancel.value, 'cancelled')
          
          if (error) {
            console.error('Error cancelling order:', error)
            notificationService.error('Failed to cancel order: ' + (error.message || 'Unknown error'))
          } else {
            console.log('Order cancelled successfully:', data)
            
            // Show success notification
            notificationService.success('You have successfully cancelled your booking!')
            
            // Force immediate update of the orders array
            await nextTick()
            
            // If currently viewing "Placed" orders, switch to "Cancelled" to show the result
            if (selectedStatus.value === 'placed') {
              selectedStatus.value = 'cancelled'
            }
            
            // Force refresh to ensure consistency
            await loadOrders()
          }
        } catch (err) {
          console.error('Unexpected error cancelling order:', err)
          notificationService.error('An unexpected error occurred while cancelling the order: ' + err.message)
        } finally {
          cancellingOrderId.value = null
          orderToCancel.value = null
          showConfirmDialog.value = false
        }
      }
    }

    const closeCancelDialog = () => {
      showConfirmDialog.value = false
      orderToCancel.value = null
    }
    
    const openChat = (orderId) => {
      selectedOrderId.value = orderId
      showChatModal.value = true
    }
    
    const closeChatModal = () => {
      showChatModal.value = false
      selectedOrderId.value = null
    }

    // Update current time every second
    const updateCurrentTime = () => {
      currentTime.value = new Date().getTime()
    }
    
    // Watch for changes in orders to trigger reactivity
    watch(orders, (newOrders) => {
      console.log('Orders updated:', newOrders?.length || 0, 'orders')
      console.log('Orders by status:', newOrders?.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1
        return acc
      }, {}))
    }, { deep: true })

    // Watch for route changes
    watch(() => route.query.status, (newStatus) => {
      if (newStatus && statusFilters.some(filter => filter.value === newStatus)) {
        selectedStatus.value = newStatus
        console.log('Status changed from route:', newStatus)
      }
    })
    
    let unsubscribe = null
    let timeInterval = null
    
    onMounted(async () => {
      console.log('MyOrders component mounted')
      
      // Initialize status from URL parameter first
      initializeFromURL()
      
      await loadOrders()
      
      // Start time interval for real-time updates
      timeInterval = setInterval(updateCurrentTime, 1000)
      
      // Subscribe to real-time order updates
      if (userProfile.value?.user_id) {
        unsubscribe = subscribeToOrders((payload) => {
          console.log('Real-time order update received:', payload)
          if (payload.eventType === 'UPDATE') {
            const orderIndex = orders.value.findIndex(order => order.id === payload.new.id)
            if (orderIndex !== -1) {
              // Create new array to trigger reactivity
              const newOrders = [...orders.value]
              newOrders[orderIndex] = { ...newOrders[orderIndex], ...payload.new }
              orders.value = newOrders
              console.log('Order updated via real-time:', newOrders[orderIndex])
            } else {
              // Order not found, refresh all orders
              console.log('Order not found in local state, refreshing all orders')
              loadOrders()
            }
          }
        }, userProfile.value.user_id)
      }
      
      // Listen for order cancellation events from OrderDetails
      window.addEventListener('order-cancelled', (event) => {
        console.log('Order cancelled event received:', event.detail.orderId);
        // Refresh orders to get the latest data
        loadOrders();
      });
    })
    
    onUnmounted(() => {
      if (unsubscribe) {
        unsubscribe()
      }
      if (timeInterval) {
        clearInterval(timeInterval)
      }
      // Remove the event listener
      window.removeEventListener('order-cancelled', () => {});
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
      formatDateTime,
      cancelOrder,
      openChat,
      closeChatModal,
      showConfirmDialog,
      orderToCancel,
      confirmCancelOrder,
      closeCancelDialog,
      canCancelOrder,
      getCancellationTimeLeft,
      formatTimeLeft,
      currentTime,
      getOrderCountByStatus,
      cancellingOrderId,
      initializeFromURL
    }
  }
}
</script>
