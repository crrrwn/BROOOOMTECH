<template>
  <div>
    <Navbar />
    
    <div class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <LoadingSpinner v-if="loading" />
        
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
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Order Status</h2>
            
            <div class="space-y-4">
              <div
                v-for="(step, index) in statusSteps"
                :key="step.status"
                class="flex items-center"
              >
                <div class="flex items-center flex-shrink-0">
                  <div
                    :class="[
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                      step.completed
                        ? 'bg-green-600 text-white'
                        : step.current
                        ? 'bg-green-100 text-green-600 border-2 border-green-600'
                        : 'bg-gray-100 text-gray-400'
                    ]"
                  >
                    <i v-if="step.completed" class="fas fa-check"></i>
                    <span v-else>{{ index + 1 }}</span>
                  </div>
                  
                  <div
                    v-if="index < statusSteps.length - 1"
                    :class="[
                      'w-16 h-0.5 ml-4',
                      step.completed ? 'bg-green-600' : 'bg-gray-200'
                    ]"
                  ></div>
                </div>
                
                <div class="ml-4 flex-1">
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
            
            <!-- Driver Information -->
            <div class="card">
              <h2 class="text-xl font-semibold text-gray-900 mb-6">Driver Information</h2>
              
              <div v-if="order.driver_profiles" class="space-y-4">
                <div class="flex items-center space-x-4">
                  <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <i class="fas fa-motorcycle text-blue-600 text-2xl"></i>
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
                
                <div v-if="order.status === 'placed'" class="mt-4">
                  <button
                    @click="cancelOrder"
                    class="text-red-600 hover:text-red-700 font-medium"
                  >
                    Cancel Order
                  </button>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useRealtime } from '@/composables/useRealtime'
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
    
    const order = ref(null)
    const loading = ref(false)
    const showChatModal = ref(false)
    
    const statusSteps = computed(() => {
      if (!order.value) return []
      
      const steps = [
        { status: 'placed', label: 'Order Placed', timestamp: order.value.created_at },
        { status: 'assigned', label: 'Driver Assigned', timestamp: order.value.assigned_at },
        { status: 'picked_up', label: 'Item Picked Up', timestamp: order.value.picked_up_at },
        { status: 'in_transit', label: 'In Transit', timestamp: order.value.in_transit_at },
        { status: 'delivered', label: 'Delivered', timestamp: order.value.delivered_at }
      ]
      
      const currentStatusIndex = steps.findIndex(step => step.status === order.value.status)
      
      return steps.map((step, index) => ({
        ...step,
        completed: index < currentStatusIndex || (index === currentStatusIndex && order.value.status === 'delivered'),
        current: index === currentStatusIndex && order.value.status !== 'delivered'
      }))
    })
    
    const loadOrder = async () => {
      try {
        loading.value = true
        
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            driver_profiles:driver_id (
              first_name,
              last_name,
              contact_number,
              vehicle_info
            )
          `)
          .eq('id', route.params.id)
          .eq('user_id', userProfile.value.user_id)
          .single()
        
        if (error) {
          if (error.code === 'PGRST116') {
            // No rows returned
            order.value = null
          } else {
            throw error
          }
        } else {
          order.value = data
        }
      } catch (error) {
        console.error('Error loading order:', error)
        order.value = null
      } finally {
        loading.value = false
      }
    }
    
    const cancelOrder = async () => {
      if (!order.value || !confirm('Are you sure you want to cancel this order?')) return
      
      try {
        const { error } = await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', order.value.id)
        
        if (error) throw error
        
        order.value.status = 'cancelled'
      } catch (error) {
        console.error('Error cancelling order:', error)
      }
    }
    
    const openChat = () => {
      showChatModal.value = true
    }
    
    const closeChatModal = () => {
      showChatModal.value = false
    }
    
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    }
    
    const formatDateTime = (date) => {
      return new Date(date).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
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
    
    let unsubscribe = null
    
    onMounted(async () => {
      await loadOrder()
      
      // Subscribe to real-time order updates
      if (order.value) {
        unsubscribe = subscribeToOrders((payload) => {
          if (payload.eventType === 'UPDATE' && payload.new.id === order.value.id) {
            order.value = { ...order.value, ...payload.new }
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
      openChat,
      closeChatModal,
      formatDate,
      formatDateTime,
      formatStatus,
      formatKey,
      getStatusClass
    }
  }
}
</script>
