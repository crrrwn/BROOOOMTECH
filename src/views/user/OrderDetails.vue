<template>
  <div>
    <Navbar />
    
    <div class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <LoadingSpinner v-if="loading" />
        
        <!-- Debug Info -->
        <div v-if="debugMode" class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
          <h3 class="font-medium text-yellow-800">Debug Information</h3>
          <p class="text-sm text-yellow-700">User ID: {{ userProfile?.user_id || 'Not logged in' }}</p>
          <p class="text-sm text-yellow-700">Order ID: {{ $route.params.id }}</p>
          <p class="text-sm text-yellow-700">Loading: {{ loading }}</p>
          <p class="text-sm text-yellow-700">Error: {{ error }}</p>
        </div>
        
        <div v-else-if="error" class="text-center py-12">
          <div class="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-exclamation-triangle text-red-400 text-3xl"></i>
          </div>
          <h3 class="text-xl font-medium text-gray-900 mb-2">Error Loading Order</h3>
          <p class="text-gray-500 mb-6">{{ error }}</p>
          <router-link to="/user/orders" class="btn-primary">
            Back to Orders
          </router-link>
        </div>
        
        <div v-else-if="!order" class="text-center py-12">
          <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-exclamation-triangle text-gray-400 text-3xl"></i>
          </div>
          <h3 class="text-xl font-medium text-gray-900 mb-2">Order not found</h3>
          <p class="text-gray-500 mb-6">The order you're looking for doesn't exist or you don't have access to it.</p>
          <router-link to="/user/orders" class="btn-primary">
            Back to Orders
          </router-link>
        </div>
        
        <div v-else class="space-y-6">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Order #{{ order.id }}</h1>
              <p class="mt-2 text-gray-600">{{ order.service_type }} • {{ formatDate(order.created_at) }}</p>
            </div>
            
            <div class="flex items-center space-x-4">
              <span :class="getStatusClass(order.status)">
                {{ formatStatus(order.status) }}
              </span>
              <router-link to="/user/orders" class="btn-secondary">
                <i class="fas fa-arrow-left mr-2"></i>
                Back to Orders
              </router-link>
            </div>
          </div>
          
          <!-- Order Status Timeline -->
          <div class="card">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gray-900">Order Status</h2>
              <div v-if="estimatedDeliveryTime && order.status !== 'delivered' && order.status !== 'cancelled'" 
                   class="text-sm text-gray-600">
                <i class="fas fa-clock mr-1"></i>
                ETA: {{ formatDateTime(estimatedDeliveryTime) }}
              </div>
            </div>
            
            <div class="space-y-6">
              <div
                v-for="(step, index) in statusSteps"
                :key="step.status"
                class="flex items-start"
              >
                <div class="flex items-center flex-shrink-0">
                  <div
                    :class="[
                      'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium',
                      step.completed
                        ? 'bg-green-600 text-white'
                        : step.current
                        ? 'bg-green-100 text-green-600 border-2 border-green-600 animate-pulse'
                        : 'bg-gray-100 text-gray-400'
                    ]"
                  >
                    <i :class="step.icon"></i>
                  </div>
                  
                  <div
                    v-if="index < statusSteps.length - 1"
                    :class="[
                      'w-0.5 h-16 ml-5 -mb-6',
                      step.completed ? 'bg-green-600' : 'bg-gray-200'
                    ]"
                  ></div>
                </div>
                
                <div class="ml-4 flex-1">
                  <div class="flex items-center justify-between">
                    <p :class="[
                      'font-medium',
                      step.completed || step.current ? 'text-gray-900' : 'text-gray-500'
                    ]">
                      {{ step.label }}
                    </p>
                    <p v-if="step.timestamp" class="text-sm text-gray-500">
                      {{ formatDateTime(step.timestamp) }}
                    </p>
                  </div>
                  <p :class="[
                    'text-sm mt-1',
                    step.completed || step.current ? 'text-gray-600' : 'text-gray-400'
                  ]">
                    {{ step.description }}
                  </p>
                  
                  <!-- Live tracking for current status -->
                  <div v-if="step.current && order.status === 'in_transit'" 
                       class="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div class="flex items-center">
                      <div class="animate-pulse w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span class="text-sm text-green-800 font-medium">Live tracking active</span>
                    </div>
                    <p class="text-xs text-green-600 mt-1">
                      Driver is currently en route to your delivery address
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Tracking Updates -->
            <div v-if="trackingUpdates.length > 0" class="mt-6 border-t border-gray-200 pt-6">
              <h3 class="text-sm font-medium text-gray-900 mb-3">Recent Updates</h3>
              <div class="space-y-2">
                <div
                  v-for="update in trackingUpdates.slice(0, 3)"
                  :key="update.id"
                  class="flex items-center text-sm"
                >
                  <div class="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span class="text-gray-600">{{ update.message }}</span>
                  <span class="text-gray-400 ml-auto">{{ formatTime(update.created_at) }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Order Details -->
            <div class="card">
              <h2 class="text-xl font-semibold text-gray-900 mb-6">Order Details</h2>
              
              <div class="space-y-4">
                <div>
                  <p class="text-sm font-medium text-gray-700">Service Type</p>
                  <p class="text-gray-900">{{ order.service_type }}</p>
                </div>
                
                <div>
                  <p class="text-sm font-medium text-gray-700">Pickup Address</p>
                  <p class="text-gray-900">{{ order.pickup_address }}</p>
                </div>
                
                <div>
                  <p class="text-sm font-medium text-gray-700">Delivery Address</p>
                  <p class="text-gray-900">{{ order.delivery_address }}</p>
                </div>
                
                <div>
                  <p class="text-sm font-medium text-gray-700">Payment Method</p>
                  <p class="text-gray-900">{{ order.payment_method }}</p>
                </div>
                
                <div>
                  <p class="text-sm font-medium text-gray-700">Delivery Fee</p>
                  <p class="text-xl font-semibold text-green-600">₱{{ order.delivery_fee }}</p>
                </div>
                
                <div v-if="order.special_instructions">
                  <p class="text-sm font-medium text-gray-700">Special Instructions</p>
                  <p class="text-gray-900">{{ order.special_instructions }}</p>
                </div>
                
                <!-- Service-specific details -->
                <div v-if="order.service_details" class="border-t border-gray-200 pt-4">
                  <p class="text-sm font-medium text-gray-700 mb-2">Service Details</p>
                  <div class="space-y-2">
                    <div
                      v-for="(value, key) in order.service_details"
                      :key="key"
                      v-if="value"
                    >
                      <span class="text-sm text-gray-600">{{ formatKey(key) }}:</span>
                      <span class="text-sm text-gray-900 ml-2">{{ value }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- Item Image -->
                <div v-if="order.item_image_url" class="border-t border-gray-200 pt-4">
                  <p class="text-sm font-medium text-gray-700 mb-2">Item Picture</p>
                  <img
                    :src="order.item_image_url"
                    alt="Order item"
                    class="w-32 h-32 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              </div>
            </div>
            
            <!-- Payment Proof Section -->
            <div v-if="order.payment_proof_url" class="card">
              <h2 class="text-xl font-semibold text-gray-900 mb-6">Payment Proof</h2>
              
              <div class="text-center">
                <div class="mb-4">
                  <img 
                    :src="order.payment_proof_url" 
                    alt="Payment Proof"
                    class="max-w-full h-auto max-h-96 mx-auto border border-gray-200 rounded-lg shadow-sm"
                  />
                </div>
                <div class="flex items-center justify-center text-sm text-green-600">
                  <i class="fas fa-check-circle mr-2"></i>
                  <span>Payment proof submitted</span>
                </div>
              </div>
            </div>
            
            <!-- Driver Information -->
            <div class="card">
              <h2 class="text-xl font-semibold text-gray-900 mb-6">Driver Information</h2>
              
              <div v-if="order.driver_profiles" class="space-y-4">
                <div class="flex items-center space-x-4">
                  <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <img v-if="order.driver_profiles.profile_picture_url" :src="order.driver_profiles.profile_picture_url" alt="Driver Profile" class="w-full h-full object-cover rounded-full">
                    <i v-else class="fas fa-motorcycle text-blue-600 text-2xl"></i>
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900">
                      {{ order.driver_profiles.first_name }} {{ order.driver_profiles.last_name }}
                    </p>
                    <p class="text-sm text-gray-600">Driver</p>
                  </div>
                </div>
                
                <div>
                  <p class="text-sm font-medium text-gray-700">Contact Number</p>
                  <p class="text-gray-900">{{ order.driver_profiles.contact_number }}</p>
                </div>
                
                <div v-if="order.driver_profiles.vehicle_info">
                  <p class="text-sm font-medium text-gray-700">Vehicle</p>
                  <p class="text-gray-900">{{ order.driver_profiles.vehicle_info }}</p>
                </div>
                
                <!-- Action buttons -->
                <div class="space-y-2 pt-4 border-t border-gray-200">
                  <button
                    v-if="order.status !== 'delivered' && order.status !== 'cancelled'"
                    @click="openChat"
                    class="w-full btn-primary"
                  >
                    <i class="fas fa-comments mr-2"></i>
                    Chat with Driver
                  </button>
                  
                  <a
                    :href="`tel:${order.driver_profiles.contact_number}`"
                    class="w-full btn-secondary flex items-center justify-center"
                  >
                    <i class="fas fa-phone mr-2"></i>
                    Call Driver
                  </a>
                </div>
              </div>
              
              <div v-else class="text-center py-8">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-search text-gray-400 text-2xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Looking for a driver</h3>
                <p class="text-gray-500">We're finding the best driver for your order</p>
                
                <div v-if="canCancelOrder" class="mt-4">
                  <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                    <p class="text-sm text-yellow-800 font-medium">
                      <i class="fas fa-clock mr-1"></i>
                      You can cancel this order for {{ cancellationTimeRemaining }} more seconds
                    </p>
                  </div>
                  <button
                    @click="cancelOrder"
                    class="text-red-600 hover:text-red-700 font-medium px-4 py-2 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                  >
                    Cancel Order
                  </button>
                </div>
                
                <div v-else-if="order.status === 'placed'" class="mt-4">
                  <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p class="text-sm text-gray-600">
                      <i class="fas fa-info-circle mr-1"></i>
                      Cancellation period has expired (30 seconds)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Real-time tracking info -->
          <div v-if="order.status === 'in_transit'" class="card bg-green-50 border-green-200">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <i class="fas fa-truck text-green-600 text-2xl"></i>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-green-800">Your order is on the way!</h3>
                <p class="text-green-600">The driver is currently delivering your order.</p>
                <p v-if="estimatedDeliveryTime" class="text-green-600">
                  Estimated delivery time: {{ formatDateTime(estimatedDeliveryTime) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Chat Modal -->
    <Modal
      :is-open="showChatModal"
      :title="`Chat - Order #${order?.id}`"
      size="lg"
      :show-actions="false"
      @close="closeChatModal"
    >
      <ChatWindow
        v-if="order"
        :order-id="order.id"
        @close="closeChatModal"
      />
    </Modal>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useRealtime } from '@/composables/useRealtime'
import { useOrders } from '@/composables/useOrders'
import { supabase } from '@/composables/useSupabase'
import Navbar from '@/components/common/Navbar.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import Modal from '@/components/common/Modal.vue'
import ChatWindow from '@/components/chat/ChatWindow.vue'

export default {
  name: 'OrderDetails',
  components: {
    Navbar,
    LoadingSpinner,
    Modal,
    ChatWindow
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const { userProfile } = useAuth()
    const { subscribeToOrders } = useRealtime()
    const { getOrderById, updateOrderStatus, getTrackingUpdates } = useOrders()
    
    const order = ref(null)
    const loading = ref(false)
    const showChatModal = ref(false)
    const error = ref(null)
    const debugMode = ref(false) // Set to true for debugging

    // Add these new reactive variables
    const estimatedDeliveryTime = ref(null)
    const trackingUpdates = ref([])

    let unsubscribe = null;
    
    const cancelOrder = async () => {
      if (!order.value) return
      
      // Check if order can be cancelled
      if (order.value.status !== 'placed') {
        alert('This order cannot be cancelled as it has already been processed.')
        return
      }
      
      // Check if order was placed within the last 30 seconds
      const orderTime = new Date(order.value.created_at)
      const currentTime = new Date()
      const timeDifference = (currentTime - orderTime) / 1000 // in seconds
      
      if (timeDifference > 30) {
        alert('Cancellation period has expired. Orders can only be cancelled within 30 seconds of placement.')
        return
      }
      
      if (confirm('Are you sure you want to cancel this order?')) {
        try {
          loading.value = true
          const { data, error: updateError } = await updateOrderStatus(order.value.id, 'cancelled')

          if (updateError) {
            console.error('Error cancelling order:', updateError)
            error.value = updateError.message || "Failed to cancel order"
          } else {
            // Update the local order object
            order.value = { ...order.value, status: 'cancelled' }
            alert('Order cancelled successfully')
          }
        } catch (err) {
          console.error('Error cancelling order:', err)
          error.value = err.message || "An unexpected error occurred"
        } finally {
          loading.value = false
        }
      }
    }
    
    // Add computed property to check if order can be cancelled
    const canCancelOrder = computed(() => {
      if (!order.value) return false
      
      // Can only cancel if status is 'placed'
      if (order.value.status !== 'placed') return false
      
      // Check if within 30 seconds of placement
      const orderTime = new Date(order.value.created_at)
      const currentTime = new Date()
      const timeDifference = (currentTime - orderTime) / 1000 // in seconds
      
      return timeDifference <= 30
    })

    // Add computed property for remaining cancellation time
    const cancellationTimeRemaining = computed(() => {
      if (!order.value || order.value.status !== 'placed') return 0
      
      const orderTime = new Date(order.value.created_at)
      const currentTime = new Date()
      const timeDifference = (currentTime - orderTime) / 1000 // in seconds
      
      return Math.max(0, 30 - Math.floor(timeDifference))
    })
    
    const openChat = () => {
      showChatModal.value = true
    }
    
    const closeChatModal = () => {
      showChatModal.value = false
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return ''
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      } catch (error) {
        console.error('Error formatting date:', error)
        return ''
      }
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

    const formatTime = (dateString) => {
      if (!dateString) return ''
      try {
        const date = new Date(dateString)
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      } catch (error) {
        console.error('Error formatting time:', error)
        return ''
      }
    }
    
    const formatStatus = (status) => {
      const statusMap = {
        'placed': 'Order Placed',
        'assigned': 'Driver Assigned',
        'picked_up': 'Item Picked Up',
        'in_transit': 'In Transit',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled'
      }
      return statusMap[status] || 'Unknown'
    }
    
    const formatKey = (key) => {
      const keyMap = {
        'item_name': 'Item Name',
        'item_quantity': 'Item Quantity',
        'item_weight': 'Item Weight',
        'fragile': 'Fragile',
        'live_animal': 'Live Animal'
      }
      return keyMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
    
    const getStatusClass = (status) => {
      const statusClassMap = {
        'placed': 'px-2 py-1 rounded-full text-yellow-700 bg-yellow-100 font-medium',
        'assigned': 'px-2 py-1 rounded-full text-blue-700 bg-blue-100 font-medium',
        'picked_up': 'px-2 py-1 rounded-full text-purple-700 bg-purple-100 font-medium',
        'in_transit': 'px-2 py-1 rounded-full text-green-700 bg-green-100 font-medium',
        'delivered': 'px-2 py-1 rounded-full text-green-700 bg-green-100 font-medium',
        'cancelled': 'px-2 py-1 rounded-full text-red-700 bg-red-100 font-medium'
      }
      return statusClassMap[status] || 'px-2 py-1 rounded-full text-gray-700 bg-gray-100 font-medium'
    }
    
    // Add this method to calculate estimated delivery time
    const calculateEstimatedDelivery = () => {
      if (!order.value) return
      
      const statusTimes = {
        'placed': 5, // 5 minutes to assign driver
        'assigned': 15, // 15 minutes to pickup
        'picked_up': 20, // 20 minutes to deliver (based on distance)
        'in_transit': 10 // 10 minutes remaining
      }
      
      let remainingMinutes = 0
      const currentStatus = order.value.status
      
      if (currentStatus === 'placed') {
        remainingMinutes = statusTimes.placed + statusTimes.assigned + statusTimes.picked_up
      } else if (currentStatus === 'assigned') {
        remainingMinutes = statusTimes.assigned + statusTimes.picked_up
      } else if (currentStatus === 'picked_up') {
        remainingMinutes = statusTimes.picked_up
      } else if (currentStatus === 'in_transit') {
        remainingMinutes = statusTimes.in_transit
      }
      
      // Adjust based on distance
      if (order.value.distance_km) {
        remainingMinutes += Math.max(0, (order.value.distance_km - 5) * 2) // +2 min per km over 5km
      }
      
      if (remainingMinutes > 0) {
        const estimatedTime = new Date()
        estimatedTime.setMinutes(estimatedTime.getMinutes() + remainingMinutes)
        estimatedDeliveryTime.value = estimatedTime
      }
    }
    
    // Update the statusSteps computed property
    const statusSteps = computed(() => {
      if (!order.value) return []
      
      const steps = [
        { 
          status: 'placed', 
          label: 'Order Placed', 
          timestamp: order.value.created_at,
          icon: 'fas fa-clipboard-check',
          description: 'Your order has been received and is being processed'
        },
        { 
          status: 'assigned', 
          label: 'Driver Assigned', 
          timestamp: order.value.assigned_at,
          icon: 'fas fa-user-check',
          description: 'A driver has been assigned to your order'
        },
        { 
          status: 'picked_up', 
          label: 'Item Picked Up', 
          timestamp: order.value.picked_up_at,
          icon: 'fas fa-box',
          description: 'Driver has collected your item'
        },
        { 
          status: 'in_transit', 
          label: 'In Transit', 
          timestamp: order.value.in_transit_at,
          icon: 'fas fa-truck',
          description: 'Your order is on the way to delivery address'
        },
        { 
          status: 'delivered', 
          label: 'Delivered', 
          timestamp: order.value.delivered_at,
          icon: 'fas fa-check-circle',
          description: 'Your order has been successfully delivered'
        }
      ]
      
      const currentStatusIndex = steps.findIndex(step => step.status === order.value.status)
      
      return steps.map((step, index) => ({
        ...step,
        completed: index < currentStatusIndex || (index === currentStatusIndex && order.value.status === 'delivered'),
        current: index === currentStatusIndex && order.value.status !== 'delivered'
      }))
    })
    
    // Update the loadOrder method to include tracking updates
    const loadOrder = async () => {
      try {
        if (!userProfile.value?.user_id) {
          console.error("Cannot load order: User not logged in")
          error.value = "User not logged in"
          return
        }
        
        const orderId = route.params.id
        if (!orderId) {
          console.error("Cannot load order: No order ID provided")
          error.value = "No order ID provided"
          return
        }
        
        loading.value = true
        error.value = null
        
        console.log(`Loading order ${orderId} for user ${userProfile.value.user_id}`)
        
        const { data, error: orderError } = await getOrderById(orderId, userProfile.value.user_id)
        
        if (orderError) {
          console.error("Error loading order:", orderError)
          error.value = orderError.message || "Failed to load order"
          order.value = null
        } else if (!data) {
          console.error("Order not found")
          error.value = "Order not found"
          order.value = null
        } else {
          console.log("Order loaded successfully:", data)
          order.value = data
          calculateEstimatedDelivery()
          
          // Load tracking updates
          await loadTrackingUpdates()
        }
      } catch (err) {
        console.error("Unexpected error loading order:", err)
        error.value = err.message || "An unexpected error occurred"
        order.value = null
      } finally {
        loading.value = false
      }
    }

    const loadTrackingUpdates = async () => {
      if (!order.value?.id) return
      
      try {
        const { data, error: trackingError } = await getTrackingUpdates(order.value.id)
        
        if (trackingError) {
          console.error("Error loading tracking updates:", trackingError)
        } else {
          trackingUpdates.value = data || []
        }
      } catch (err) {
        console.error("Error loading tracking updates:", err)
      }
    }
    
    // Watch for changes in userProfile or route params
    watch([() => userProfile.value?.user_id, () => route.params.id], 
      ([newUserId, newOrderId], [oldUserId, oldOrderId]) => {
        if ((newUserId && newUserId !== oldUserId) || (newOrderId && newOrderId !== oldOrderId)) {
          console.log('User profile or order ID changed, reloading order')
          loadOrder()
        }
      }
    )
    
    // Update the real-time subscription
    onMounted(async () => {
      console.log('OrderDetails component mounted')
      
      await loadOrder()
      
      // Subscribe to real-time order updates
      if (order.value) {
        unsubscribe = subscribeToOrders((payload) => {
          console.log('Real-time order update:', payload)
          
          if (payload.eventType === 'UPDATE' && payload.new.id === order.value.id) {
            const oldStatus = order.value.status
            order.value = { ...order.value, ...payload.new }
            
            // Recalculate estimated delivery time if status changed
            if (oldStatus !== payload.new.status) {
              calculateEstimatedDelivery()
              loadTrackingUpdates() // Reload tracking updates when status changes
            }
          }
        })
      }
    })
    
    onUnmounted(() => {
      if (unsubscribe) {
        unsubscribe()
      }
    })
    
    return {
      order,
      loading,
      statusSteps,
      showChatModal,
      cancelOrder,
      canCancelOrder,
      cancellationTimeRemaining,
      openChat,
      closeChatModal,
      formatDate,
      formatDateTime,
      formatStatus,
      formatKey,
      getStatusClass,
      estimatedDeliveryTime,
      trackingUpdates,
      formatTime,
      error,
      userProfile,
      debugMode
    }
  }
}
</script>

<style scoped>
/* Add any additional styles here */
</style>
