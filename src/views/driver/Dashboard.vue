<template>
  <div>
    <Navbar />
    
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-md mx-auto px-4 py-6">
        <!-- Header -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">
                Driver Dashboard
              </h1>
              <p class="text-gray-600">
                Welcome, {{ userProfile?.first_name }}!
              </p>
            </div>
            
            <!-- Online/Offline Toggle -->
            <div class="flex flex-col items-end">
              <button
                @click="toggleOnlineStatus"
                :class="[
                  'relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
                  isOnline ? 'bg-green-600' : 'bg-gray-200'
                ]"
              >
                <span
                  :class="[
                    'pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                    isOnline ? 'translate-x-6' : 'translate-x-0'
                  ]"
                />
              </button>
              <span :class="[
                'mt-1 text-sm font-medium',
                isOnline ? 'text-green-600' : 'text-gray-500'
              ]">
                {{ isOnline ? 'Online' : 'Offline' }}
              </span>
            </div>
          </div>
          
          <!-- Stats Cards -->
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-white rounded-lg p-4 shadow-sm">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-peso-sign text-green-600"></i>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-gray-500">Today</p>
                  <p class="text-lg font-bold text-gray-900">₱{{ todayEarnings }}</p>
                </div>
              </div>
            </div>
            
            <div class="bg-white rounded-lg p-4 shadow-sm">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-check-circle text-blue-600"></i>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-gray-500">Completed</p>
                  <p class="text-lg font-bold text-gray-900">{{ todayDeliveries }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Available Bookings -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">Available Bookings</h2>
            <button
              @click="refreshAvailableOrders"
              class="p-2 text-green-600 hover:bg-green-50 rounded-lg"
              :disabled="loading"
            >
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            </button>
          </div>
          
          <LoadingSpinner v-if="loading && availableOrders.length === 0" />
          
          <div v-else-if="!isOnline" class="text-center py-8 bg-white rounded-lg">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-power-off text-gray-400 text-2xl"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">You're offline</h3>
            <p class="text-gray-500">Turn on your status to see available bookings</p>
          </div>
          
          <div v-else-if="availableOrders.length === 0" class="text-center py-8 bg-white rounded-lg">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-inbox text-gray-400 text-2xl"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No available bookings</h3>
            <p class="text-gray-500">Check back later for new delivery opportunities</p>
          </div>
          
          <div v-else class="space-y-3">
            <div
              v-for="order in availableOrders"
              :key="order.id"
              class="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
            >
              <!-- Booking Header -->
              <div class="flex items-center justify-between mb-3">
                <div>
                  <p class="text-sm font-medium text-gray-900">Booking #{{ order.id }}</p>
                  <p class="text-xs text-gray-500">{{ order.service_type }}</p>
                </div>
                <div class="text-right">
                  <p class="text-lg font-bold text-green-600">₱{{ order.delivery_fee }}</p>
                  <p class="text-xs text-gray-500">{{ calculateDistance(order) }}km</p>
                </div>
              </div>
              
              <!-- Locations -->
              <div class="space-y-2 mb-4">
                <div class="flex items-start space-x-2">
                  <div class="w-3 h-3 bg-blue-500 rounded-full mt-1.5"></div>
                  <div class="flex-1">
                    <p class="text-xs font-medium text-gray-700">Pickup</p>
                    <p class="text-sm text-gray-600">{{ order.pickup_address }}</p>
                  </div>
                </div>
                
                <div class="flex items-start space-x-2">
                  <div class="w-3 h-3 bg-red-500 rounded-full mt-1.5"></div>
                  <div class="flex-1">
                    <p class="text-xs font-medium text-gray-700">Dropoff</p>
                    <p class="text-sm text-gray-600">{{ order.delivery_address }}</p>
                  </div>
                </div>
              </div>
              
              <!-- Action Buttons -->
              <div class="flex space-x-2">
                <button
                  @click="declineOrder(order.id)"
                  class="flex-1 py-2 px-4 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Decline
                </button>
                <button
                  @click="acceptOrder(order)"
                  class="flex-1 py-2 px-4 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- My Assignments -->
        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-4">My Assignments</h2>
          
          <div v-if="myAssignments.length === 0" class="text-center py-8 bg-white rounded-lg">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-clipboard-list text-gray-400 text-2xl"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No active assignments</h3>
            <p class="text-gray-500">Accept bookings to start earning</p>
          </div>
          
          <div v-else class="space-y-3">
            <div
              v-for="order in myAssignments"
              :key="order.id"
              class="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
            >
              <!-- Order Header -->
              <div class="flex items-center justify-between mb-3">
                <div>
                  <p class="text-sm font-medium text-gray-900">Order #{{ order.id }}</p>
                  <p class="text-xs text-gray-500">{{ order.service_type }}</p>
                </div>
                <div class="text-right">
                  <p class="text-lg font-bold text-green-600">₱{{ order.delivery_fee }}</p>
                  <span :class="getStatusClass(order.status)">
                    {{ formatStatus(order.status) }}
                  </span>
                </div>
              </div>
              
              <!-- Customer Info -->
              <div class="flex items-center justify-between mb-3 p-2 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-2">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <i class="fas fa-user text-blue-600 text-xs"></i>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-700">
                      {{ order.user_profiles?.first_name }} {{ order.user_profiles?.last_name }}
                    </p>
                    <p class="text-xs text-gray-500">{{ order.user_profiles?.contact_number }}</p>
                  </div>
                </div>
                
                <div class="flex space-x-2">
                  <a
                    :href="`tel:${order.user_profiles?.contact_number}`"
                    class="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                  >
                    <i class="fas fa-phone text-sm"></i>
                  </a>
                  <button
                    @click="openChat(order.id)"
                    class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <i class="fas fa-comments text-sm"></i>
                  </button>
                </div>
              </div>
              
              <!-- Item Picture -->
              <div v-if="order.item_image_url" class="mb-3">
                <p class="text-xs font-medium text-gray-700 mb-2">Item Picture</p>
                <img
                  :src="order.item_image_url"
                  alt="Order item"
                  class="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer"
                  @click="viewImage(order.item_image_url)"
                />
              </div>
              
              <!-- Locations with Navigation -->
              <div class="space-y-2 mb-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-start space-x-2 flex-1">
                    <div class="w-3 h-3 bg-blue-500 rounded-full mt-1.5"></div>
                    <div class="flex-1">
                      <p class="text-xs font-medium text-gray-700">Pickup</p>
                      <p class="text-sm text-gray-600">{{ order.pickup_address }}</p>
                    </div>
                  </div>
                  <button
                    @click="openNavigation(order.pickup_address)"
                    class="ml-2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <i class="fas fa-navigation text-sm"></i>
                  </button>
                </div>
                
                <div class="flex items-center justify-between">
                  <div class="flex items-start space-x-2 flex-1">
                    <div class="w-3 h-3 bg-red-500 rounded-full mt-1.5"></div>
                    <div class="flex-1">
                      <p class="text-xs font-medium text-gray-700">Dropoff</p>
                      <p class="text-sm text-gray-600">{{ order.delivery_address }}</p>
                    </div>
                  </div>
                  <button
                    @click="openNavigation(order.delivery_address)"
                    class="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <i class="fas fa-navigation text-sm"></i>
                  </button>
                </div>
              </div>
              
              <!-- Status Update Button -->
              <button
                @click="updateOrderStatus(order)"
                class="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                {{ getStatusActionText(order.status) }}
              </button>
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
    const showImageModal = ref(false)
    const selectedImage = ref('')
    
    const myAssignments = computed(() => {
      return driverOrders.value.filter(order => 
        ['assigned', 'picked_up', 'in_transit'].includes(order.status)
      )
    })
    
    const todayEarnings = computed(() => {
      const today = new Date().toDateString()
      const todayOrders = driverOrders.value.filter(order => 
        new Date(order.delivered_at || order.created_at).toDateString() === today &&
        order.status === 'delivered'
      )
      return todayOrders.reduce((sum, order) => sum + (order.delivery_fee || 0), 0)
    })
    
    const todayDeliveries = computed(() => {
      const today = new Date().toDateString()
      return driverOrders.value.filter(order => 
        new Date(order.delivered_at || order.created_at).toDateString() === today &&
        order.status === 'delivered'
      ).length
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
        availableOrders.value = availableOrders.value.filter(o => o.id !== order.id)
        await loadDriverOrders()
      }
    }
    
    const declineOrder = (orderId) => {
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
        if (confirm(`Mark order as ${nextStatus.replace('_', ' ')}?`)) {
          const { error } = await updateStatus(order.id, nextStatus)
          if (!error) {
            await loadDriverOrders()
          }
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
    
    const openNavigation = (address) => {
      const encodedAddress = encodeURIComponent(address)
      const wazeUrl = `https://waze.com/ul?q=${encodedAddress}`
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`
      
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      if (isMobile) {
        window.open(wazeUrl, '_blank')
      } else {
        window.open(googleMapsUrl, '_blank')
      }
    }
    
    const calculateDistance = (order) => {
      return Math.floor(Math.random() * 15) + 1
    }
    
    const formatStatus = (status) => {
      return status.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    }
    
    const getStatusClass = (status) => {
      const classes = {
        'assigned': 'px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full',
        'picked_up': 'px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full',
        'in_transit': 'px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full',
        'delivered': 'px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full'
      }
      return classes[status] || 'px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full'
    }
    
    const getStatusActionText = (status) => {
      const actions = {
        'assigned': 'Mark as Picked Up',
        'picked_up': 'Mark as In Transit',
        'in_transit': 'Mark as Delivered'
      }
      return actions[status] || 'Update Status'
    }
    
    let unsubscribe = null
    
    onMounted(async () => {
      await loadDriverOrders()
      
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
      
      unsubscribe = subscribeToOrders((payload) => {
        if (payload.eventType === 'INSERT' && !payload.new.driver_id) {
          if (isOnline.value) {
            availableOrders.value.unshift(payload.new)
          }
        } else if (payload.eventType === 'UPDATE') {
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
      myAssignments,
      todayEarnings,
      todayDeliveries,
      showChatModal,
      selectedOrderId,
      showImageModal,
      selectedImage,
      loading,
      toggleOnlineStatus,
      refreshAvailableOrders,
      acceptOrder: handleAcceptOrder,
      declineOrder,
      updateOrderStatus: handleUpdateOrderStatus,
      openChat,
      closeChatModal,
      viewImage,
      closeImageModal,
      openNavigation,
      calculateDistance,
      formatStatus,
      getStatusClass,
      getStatusActionText
    }
  }
}
</script>
