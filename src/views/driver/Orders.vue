<template>
  <div>
    <Navbar />
    
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">My Orders</h1>
          <p class="mt-2 text-gray-600">Manage your assigned deliveries</p>
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
            <i class="fas fa-clipboard-list text-gray-400 text-3xl"></i>
          </div>
          <h3 class="text-xl font-medium text-gray-900 mb-2">No orders found</h3>
          <p class="text-gray-500 mb-6">
            {{ selectedStatus !== '' ? 'No orders with this status' : 'You haven\'t been assigned any orders yet' }}
          </p>
        </div>
        
        <div v-else class="space-y-4">
          <div
            v-for="order in filteredOrders"
            :key="order.id"
            class="card hover:shadow-lg transition-shadow duration-200"
          >
            <div class="flex items-start justify-between mb-4">
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
                <span class="text-lg font-semibold text-green-600">
                  ₱{{ order.delivery_fee }}
                </span>
              </div>
            </div>
            
            <!-- Customer Info -->
            <div class="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <i class="fas fa-user text-blue-600 text-sm"></i>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-700">Customer</p>
                  <p class="text-sm text-gray-600">
                    {{ order.user_profiles?.first_name }} {{ order.user_profiles?.last_name }}
                  </p>
                </div>
              </div>
              
              <div class="flex items-center space-x-2">
                <a
                  :href="`tel:${order.user_profiles?.contact_number}`"
                  class="text-green-600 hover:text-green-700 p-2 rounded-lg hover:bg-green-50"
                  title="Call customer"
                >
                  <i class="fas fa-phone"></i>
                </a>
                <button
                  @click="openChat(order.id)"
                  class="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50"
                  title="Chat with customer"
                >
                  <i class="fas fa-comments"></i>
                </button>
              </div>
            </div>
            
            <!-- Addresses -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div class="flex items-start space-x-3">
                <i class="fas fa-map-marker-alt text-blue-500 mt-1"></i>
                <div>
                  <p class="text-sm font-medium text-gray-700">Pickup Address</p>
                  <p class="text-sm text-gray-600">{{ order.pickup_address }}</p>
                  <button
                    @click="openNavigation(order.pickup_address, 'pickup')"
                    class="text-xs text-blue-600 hover:text-blue-700 mt-1"
                  >
                    <i class="fas fa-navigation mr-1"></i>
                    Navigate
                  </button>
                </div>
              </div>
              
              <div class="flex items-start space-x-3">
                <i class="fas fa-map-marker-alt text-red-500 mt-1"></i>
                <div>
                  <p class="text-sm font-medium text-gray-700">Delivery Address</p>
                  <p class="text-sm text-gray-600">{{ order.delivery_address }}</p>
                  <button
                    @click="openNavigation(order.delivery_address, 'delivery')"
                    class="text-xs text-red-600 hover:text-red-700 mt-1"
                  >
                    <i class="fas fa-navigation mr-1"></i>
                    Navigate
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Service Details -->
            <div v-if="order.service_details && Object.keys(order.service_details).length > 0" 
                 class="mb-4 p-3 bg-blue-50 rounded-lg">
              <p class="text-sm font-medium text-blue-800 mb-2">Service Details</p>
              <div class="space-y-1">
                <div
                  v-for="(value, key) in order.service_details"
                  :key="key"
                  v-if="value"
                  class="text-sm"
                >
                  <span class="text-blue-700">{{ formatKey(key) }}:</span>
                  <span class="text-blue-900 ml-2">{{ value }}</span>
                </div>
              </div>
            </div>
            
            <!-- Special Instructions -->
            <div v-if="order.special_instructions" class="mb-4 p-3 bg-yellow-50 rounded-lg">
              <p class="text-sm font-medium text-yellow-800 mb-1">Special Instructions</p>
              <p class="text-sm text-yellow-900">{{ order.special_instructions }}</p>
            </div>
            
            <!-- Item Image -->
            <div v-if="order.item_image_url" class="mb-4">
              <p class="text-sm font-medium text-gray-700 mb-2">Item Picture</p>
              <img
                :src="order.item_image_url"
                alt="Order item"
                class="w-32 h-32 object-cover rounded-lg border border-gray-200 cursor-pointer"
                @click="viewImage(order.item_image_url)"
              />
            </div>
            
            <!-- Action Buttons -->
            <div class="flex items-center justify-between pt-4 border-t border-gray-200">
              <div class="text-sm text-gray-500">
                <i class="fas fa-clock mr-1"></i>
                {{ getOrderTimeInfo(order) }}
              </div>
              
              <div class="flex space-x-2">
                <button
                  v-if="order.status === 'assigned'"
                  @click="updateOrderStatus(order.id, 'picked_up')"
                  class="btn-primary text-sm"
                >
                  Mark as Picked Up
                </button>
                
                <button
                  v-else-if="order.status === 'picked_up'"
                  @click="updateOrderStatus(order.id, 'in_transit')"
                  class="btn-primary text-sm"
                >
                  Mark as In Transit
                </button>
                
                <button
                  v-else-if="order.status === 'in_transit'"
                  @click="updateOrderStatus(order.id, 'delivered')"
                  class="btn-primary text-sm"
                >
                  Mark as Delivered
                </button>
                
                <button
                  v-if="order.status !== 'delivered' && order.status !== 'cancelled'"
                  @click="openChat(order.id)"
                  class="btn-secondary text-sm"
                >
                  <i class="fas fa-comments mr-1"></i>
                  Chat
                </button>
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
    
    <!-- Image Viewer Modal -->
    <Modal
      :is-open="showImageModal"
      title="Item Picture"
      size="lg"
      :show-actions="false"
      @close="closeImageModal"
    >
      <div class="text-center">
        <img
          v-if="selectedImage"
          :src="selectedImage"
          alt="Item picture"
          class="max-w-full max-h-96 mx-auto rounded-lg"
        />
      </div>
    </Modal>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useOrders } from '@/composables/useOrders'
import { useRealtime } from '@/composables/useRealtime'
import Navbar from '@/components/common/Navbar.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import Modal from '@/components/common/Modal.vue'
import ChatWindow from '@/components/chat/ChatWindow.vue'

export default {
  name: 'DriverOrders',
  components: {
    Navbar,
    LoadingSpinner,
    Modal,
    ChatWindow
  },
  setup() {
    const { userProfile } = useAuth()
    const { orders, getDriverOrders, updateOrderStatus, loading } = useOrders()
    const { subscribeToOrders } = useRealtime()
    
    const selectedStatus = ref('')
    const selectedService = ref('')
    const showChatModal = ref(false)
    const selectedOrderId = ref(null)
    const showImageModal = ref(false)
    const selectedImage = ref('')
    
    const statusFilters = [
      { label: 'All', value: '' },
      { label: 'Assigned', value: 'assigned' },
      { label: 'Picked Up', value: 'picked_up' },
      { label: 'In Transit', value: 'in_transit' },
      { label: 'Delivered', value: 'delivered' }
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
        await getDriverOrders(userProfile.value.user_id)
      }
    }
    
    const refreshOrders = async () => {
      await loadOrders()
    }
    
    const handleUpdateOrderStatus = async (orderId, newStatus) => {
      if (confirm(`Are you sure you want to mark this order as ${newStatus.replace('_', ' ')}?`)) {
        const { error } = await updateOrderStatus(orderId, newStatus)
        if (!error) {
          await loadOrders()
        }
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
    
    const viewImage = (imageUrl) => {
      selectedImage.value = imageUrl
      showImageModal.value = true
    }
    
    const closeImageModal = () => {
      showImageModal.value = false
      selectedImage.value = ''
    }
    
    const openNavigation = (address, type) => {
      const encodedAddress = encodeURIComponent(address)
      const wazeUrl = `https://waze.com/ul?q=${encodedAddress}`
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`
      
      // Try to open Waze first, fallback to Google Maps
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      if (isMobile) {
        window.open(wazeUrl, '_blank')
      } else {
        window.open(googleMapsUrl, '_blank')
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
        'assigned': 'status-badge status-assigned',
        'picked_up': 'status-badge status-picked-up',
        'in_transit': 'status-badge status-in-transit',
        'delivered': 'status-badge status-delivered',
        'cancelled': 'status-badge status-cancelled'
      }
      return classes[status] || 'status-badge status-assigned'
    }
    
    const formatStatus = (status) => {
      return status.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    }
    
    const formatKey = (key) => {
      return key.split('_').map(word => 
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
    
    const getOrderTimeInfo = (order) => {
      const now = new Date()
      const orderDate = new Date(order.created_at)
      const diffMs = now - orderDate
      const diffMins = Math.floor(diffMs / 60000)
      
      if (diffMins < 60) return `${diffMins} minutes ago`
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`
      return formatDate(order.created_at)
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
          } else if (payload.eventType === 'INSERT' && payload.new.driver_id === userProfile.value.user_id) {
            orders.value.unshift(payload.new)
          }
        }, null, userProfile.value.user_id)
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
      showImageModal,
      selectedImage,
      loading,
      refreshOrders,
      updateOrderStatus: handleUpdateOrderStatus,
      openChat,
      closeChatModal,
      viewImage,
      closeImageModal,
      openNavigation,
      getServiceIcon,
      getStatusClass,
      formatStatus,
      formatKey,
      formatDate,
      getOrderTimeInfo
    }
  }
}
</script>
