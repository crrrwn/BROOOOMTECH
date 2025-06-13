<template>
  <div>
    
    <div class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Loading state -->
        <div v-if="loading" class="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
        
        <!-- Error state -->
        <div v-else-if="error" class="text-center py-12">
          <div class="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-exclamation-triangle text-red-400 text-3xl"></i>
          </div>
          <h3 class="text-xl font-medium text-gray-900 mb-2">Error Loading Order</h3>
          <p class="text-gray-500 mb-6">{{ error.message || "Failed to load order details" }}</p>
          <router-link to="/user/orders" class="btn-primary">
            Back to Orders
          </router-link>
        </div>
        
        <!-- No order found state -->
        <div v-else-if="!order" class="text-center py-12">
          <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-search text-gray-400 text-3xl"></i>
          </div>
          <h3 class="text-xl font-medium text-gray-900 mb-2">Order not found</h3>
          <p class="text-gray-500 mb-6">The order you're looking for doesn't exist or you don't have access to it.</p>
          <router-link to="/user/orders" class="btn-primary">
            Back to Orders
          </router-link>
        </div>
        
        <!-- Order details -->
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
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Order Status</h2>
            <OrderStatusTimeline :order="order" />
          </div>
          
          <!-- Order Barcode -->
          <div v-if="order.barcode" class="card">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Order Barcode</h2>
            <div class="flex flex-col items-center">
              <BarcodeGenerator :orderId="order.id" :barcodeValue="order.barcode" />
              <p class="mt-2 text-sm text-gray-600">{{ order.barcode }}</p>
            </div>
          </div>
          
          <!-- Location Tracking -->
          <div v-if="order.status === 'in_transit' && order.driver_id" class="card">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Driver Location</h2>
            <LocationTracker 
              :orderId="order.id"
              :driverId="order.driver_id"
              :pickupLocation="pickupLocation"
              :deliveryLocation="deliveryLocation"
            />
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
              
              <div v-if="order.driver_profiles && order.status !== 'cancelled'" class="space-y-4">
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
                    @click="contactSupport"
                    class="w-full btn-primary"
                  >
                    <i class="fas fa-comments mr-2"></i>
                    Chat with Support
                  </button>
                  
                  <a
                    v-if="order.driver_profiles.contact_number"
                    :href="`tel:${order.driver_profiles.contact_number}`"
                    class="w-full btn-secondary flex items-center justify-center"
                  >
                    <i class="fas fa-phone mr-2"></i>
                    Call Driver
                  </a>
                </div>
              </div>
              
              <div v-else-if="order.status === 'cancelled'" class="text-center py-8">
                <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-times-circle text-red-400 text-2xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Order Cancelled</h3>
                <p class="text-gray-500">This order has been cancelled</p>
              </div>
              
              <div v-else class="text-center py-8">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-search text-gray-400 text-2xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Looking for a driver</h3>
                <p class="text-gray-500">We're finding the best driver for your order</p>
                
                <div class="mt-4">
                  <div v-if="canCancel" class="mb-2">
                    <p class="text-sm text-gray-600 mb-1">Time remaining to cancel:</p>
                    <p class="text-lg font-semibold text-red-600">{{ formatCountdown }}</p>
                  </div>
                  <button
                    @click="cancelOrder"
                    :disabled="!canCancel"
                    class="text-red-600 hover:text-red-700 font-medium px-4 py-2 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                    :class="{'opacity-50 cursor-not-allowed': !canCancel}"
                  >
                    Cancel Order
                  </button>
                  <p v-if="!canCancel" class="text-xs text-gray-500 mt-1">
                    Cancellation period has expired
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Confirm Dialog for Cancel -->
    <ConfirmDialog
      :is-open="showCancelConfirm"
      title="Cancel Order"
      message="Are you sure you want to cancel this order? This action cannot be undone."
      confirm-text="Yes, Cancel Order"
      cancel-text="No, Keep Order"
      @confirm="confirmCancelOrder"
      @cancel="showCancelConfirm = false"
    />

    <!-- Rating Modal -->
    <Modal
      :is-open="showRatingModal"
      title="Rate Your Order"
      @close="showRatingModal = false"
      @confirm="submitRating"
      confirm-text="Submit Rating"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Rate your experience</label>
          <div class="flex space-x-2">
            <button
              v-for="star in 5"
              :key="star"
              @click="rating = star"
              class="text-2xl focus:outline-none"
              :class="star <= rating ? 'text-yellow-400' : 'text-gray-300'"
            >
              ★
            </button>
          </div>
        </div>
        <div>
          <label for="feedback" class="block text-sm font-medium text-gray-700 mb-1">
            Additional feedback (optional)
          </label>          <textarea
            id="feedback"
            v-model="feedback"
            rows="3"
            class="input-field"
            placeholder="Tell us about your experience..."
          ></textarea>
        </div>
      </div>
    </Modal>

    <!-- Chat Support Modal -->
    <Modal
      :is-open="showChatModal"
      title="Customer Support"
      size="lg"
      @close="showChatModal = false"
    >
      <AIChatSupport :order-id="orderId" />
    </Modal>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useAuth } from "@/composables/useAuth"
import { useOrders } from "@/composables/useOrders"
import { notificationService } from "@/composables/useNotification"
import LoadingSpinner from "@/components/common/LoadingSpinner.vue"
import ConfirmDialog from "@/components/common/ConfirmDialog.vue"
import Modal from "@/components/common/Modal.vue"
import AIChatSupport from "@/components/chat/AIChatSupport.vue"
import OrderStatusTimeline from "@/components/tracking/OrderStatusTimeline.vue"
import BarcodeGenerator from "@/components/tracking/BarcodeGenerator.vue"
import LocationTracker from "@/components/tracking/LocationTracker.vue"

export default {
  name: "OrderDetails",
  components: {
    LoadingSpinner,
    ConfirmDialog,
    Modal,
    AIChatSupport,
    OrderStatusTimeline,
    BarcodeGenerator,
    LocationTracker
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const { userProfile } = useAuth()
    const { getOrderById, updateOrderStatus } = useOrders()

    const orderId = ref(route.params.id)
    const order = ref(null)
    const loading = ref(true)
    const error = ref(null)
    const showCancelConfirm = ref(false)
    const showRatingModal = ref(false)
    const showChatModal = ref(false)
    const rating = ref(0)
    const feedback = ref("")

    // Computed properties for location tracking
    const pickupLocation = computed(() => {
      if (!order.value) return null
      return {
        latitude: order.value.pickup_latitude,
        longitude: order.value.pickup_longitude
      }
    })
    
    const deliveryLocation = computed(() => {
      if (!order.value) return null
      return {
        latitude: order.value.delivery_latitude,
        longitude: order.value.delivery_longitude
      }
    })

    // Countdown timer for order cancellation
    const cancellationTimeLimit = 30 * 1000; // 30 seconds in milliseconds (changed from 15 minutes)
    const timeRemaining = ref(0);
    const countdownInterval = ref(null);

    const canCancel = computed(() => {
      return order.value && 
             order.value.status === 'placed' && 
             timeRemaining.value > 0;
    });

    const formatCountdown = computed(() => {
      if (timeRemaining.value <= 0) return '00:00';
      
      const minutes = Math.floor(timeRemaining.value / 60000);
      const seconds = Math.floor((timeRemaining.value % 60000) / 1000);
      
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    });

    const startCancellationCountdown = () => {
      if (!order.value || order.value.status !== 'placed') return;
      
      // Calculate time elapsed since order was placed
      const orderTime = new Date(order.value.created_at).getTime();
      const currentTime = new Date().getTime();
      const timeElapsed = currentTime - orderTime;
      
      // Calculate remaining time
      const remaining = Math.max(0, cancellationTimeLimit - timeElapsed);
      timeRemaining.value = remaining;
      
      // Clear any existing interval
      if (countdownInterval.value) {
        clearInterval(countdownInterval.value);
      }
      
      // Start countdown if time remaining
      if (timeRemaining.value > 0) {
        countdownInterval.value = setInterval(() => {
          timeRemaining.value -= 1000;
          
          if (timeRemaining.value <= 0) {
            clearInterval(countdownInterval.value);
          }
        }, 1000);
      }
    };

    // Watch for order changes to restart countdown
    watch(() => order.value, (newOrder) => {
      if (newOrder) {
        startCancellationCountdown();
      }
    }, { immediate: false });

    const fetchOrderDetails = async () => {
      loading.value = true
      error.value = null

      try {
        console.log("Fetching order details for ID:", orderId.value)
        console.log("Current user:", userProfile.value)
        
        if (!userProfile.value || !userProfile.value.user_id) {
          console.error("User not logged in or user_id missing")
          error.value = { message: "Please log in to view order details" }
          loading.value = false
          return
        }

        const { data, error: fetchError } = await getOrderById(orderId.value, userProfile.value.user_id)

        if (fetchError) {
          console.error("Error fetching order:", fetchError)
          error.value = fetchError
          loading.value = false
          return
        }

        if (!data) {
          console.error("No order data returned")
          error.value = { message: "Order not found" }
          loading.value = false
          return
        }

        console.log("Order data received:", data)
        order.value = data
      } catch (err) {
        console.error("Unexpected error fetching order details:", err)
        error.value = { message: "An unexpected error occurred" }
      } finally {
        loading.value = false
      }
    }

    const formatStatus = (status) => {
      const statusMap = {
        placed: "Order Placed",
        assigned: "Driver Assigned",
        picked_up: "Picked Up",
        in_transit: "In Transit",
        delivered: "Delivered",
        cancelled: "Cancelled",
      }
      return statusMap[status] || status
    }

    const cancelOrder = () => {
      showCancelConfirm.value = true
    }

    const confirmCancelOrder = async () => {
      try {
        const { error: updateError } = await updateOrderStatus(orderId.value, "cancelled")

        if (updateError) {
          notificationService.error("Failed to cancel order")
          return
        }

        notificationService.success("Order cancelled successfully")
        
        // Update the local order state immediately
        if (order.value) {
          order.value.status = "cancelled"
          order.value.cancelled_at = new Date().toISOString()
        }
        
        // Refresh order details to get the latest data
        fetchOrderDetails()
        
        // Emit an event that can be listened to by parent components
        const cancelEvent = new CustomEvent('order-cancelled', { 
          detail: { orderId: orderId.value } 
        });
        window.dispatchEvent(cancelEvent);
        
        // Redirect to the orders page after a short delay
        setTimeout(() => {
          router.push('/user/orders?status=cancelled');
        }, 1500);
      } catch (err) {
        console.error("Error cancelling order:", err)
        notificationService.error("An unexpected error occurred")
      } finally {
        showCancelConfirm.value = false
      }
    }

    const rateOrder = () => {
      showRatingModal.value = true
    }

    const submitRating = async () => {
      try {
        // Here you would submit the rating to your backend
        // For now, we'll just show a success message
        notificationService.success("Thank you for your feedback!")
        showRatingModal.value = false
      } catch (err) {
        console.error("Error submitting rating:", err)
        notificationService.error("Failed to submit rating")
      }
    }

    const contactSupport = () => {
      showChatModal.value = true
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

    onMounted(() => {
      console.log("OrderDetails component mounted");
      fetchOrderDetails().then(() => {
        if (order.value) {
          startCancellationCountdown();
        }
      });
    })

    return {
      orderId,
      order,
      loading,
      error,
      showCancelConfirm,
      showRatingModal,
      showChatModal,
      rating,
      feedback,
      pickupLocation,
      deliveryLocation,
      formatStatus,
      formatDate,
      formatKey,
      getStatusClass,
      cancelOrder,
      confirmCancelOrder,
      rateOrder,
      submitRating,
      contactSupport,
      canCancel,
      formatCountdown,
    }
  },
}
</script>
