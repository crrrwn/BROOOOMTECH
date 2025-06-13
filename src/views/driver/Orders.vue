<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold mb-6">My Orders</h1>

    <div v-if="loading" class="flex justify-center items-center h-64">
      <LoadingSpinner />
    </div>

    <div v-else>
      <!-- Order Tabs -->
      <div class="mb-6">
        <div class="border-b border-gray-200">
          <nav class="flex -mb-px space-x-8">
            <button
              v-for="tab in tabs"
              :key="tab.value"
              @click="activeTab = tab.value"
              class="py-4 px-1 border-b-2 font-medium text-sm"
              :class="[
                activeTab === tab.value
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              ]"
            >
              {{ tab.label }}
              <span
                v-if="getOrderCountByStatus(tab.value) > 0"
                class="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs"
              >
                {{ getOrderCountByStatus(tab.value) }}
              </span>
            </button>
          </nav>
        </div>
      </div>

      <!-- Available Orders (for "new" tab) -->
      <div v-if="activeTab === 'new'" class="space-y-4">
        <div v-if="availableOrders.length === 0" class="text-center py-8">
          <p class="text-gray-500">No available orders at the moment.</p>
          <p class="text-sm text-gray-400 mt-2">Check back later for new orders.</p>
        </div>

        <div v-else v-for="order in availableOrders" :key="order.id" class="bg-white rounded-lg shadow p-4">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-medium text-gray-900">Order #{{ order.id }}</h3>
              <p class="text-sm text-gray-500">{{ formatDate(order.created_at) }}</p>
            </div>
            <span class="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {{ formatStatus(order.status) }}
            </span>
          </div>

          <div class="mt-4 space-y-2">
            <div class="flex items-start">
              <div class="flex-shrink-0 w-5 h-5 mt-0.5 flex items-center justify-center">
                <i class="fas fa-map-marker-alt text-red-500"></i>
              </div>
              <div class="ml-2">
                <p class="text-xs text-gray-500">Pickup</p>
                <p class="text-sm">{{ order.pickup_address }}</p>
              </div>
            </div>
            <div class="flex items-start">
              <div class="flex-shrink-0 w-5 h-5 mt-0.5 flex items-center justify-center">
                <i class="fas fa-flag-checkered text-green-500"></i>
              </div>
              <div class="ml-2">
                <p class="text-xs text-gray-500">Delivery</p>
                <p class="text-sm">{{ order.delivery_address }}</p>
              </div>
            </div>
          </div>

          <div class="mt-4 flex justify-between items-center">
            <div>
              <p class="text-sm font-medium">Delivery Fee: ₱{{ order.delivery_fee.toFixed(2) }}</p>
            </div>
            <button @click="acceptOrder(order.id)" class="btn-primary text-sm">Accept Order</button>
          </div>
        </div>
      </div>

      <!-- My Orders (for other tabs) -->
      <div v-else class="space-y-4">
        <div v-if="filteredOrders.length === 0" class="text-center py-8">
          <p class="text-gray-500">No {{ activeTab }} orders found.</p>
        </div>

        <div v-else v-for="order in filteredOrders" :key="order.id" class="bg-white rounded-lg shadow overflow-hidden">
          <div class="p-4">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-medium text-gray-900">Order #{{ order.id }}</h3>
                <p class="text-sm text-gray-500">{{ formatDate(order.created_at) }}</p>
              </div>
              <span
                class="px-2 py-1 rounded-full text-xs font-medium"
                :class="{
                  'bg-blue-100 text-blue-800': order.status === 'assigned',
                  'bg-indigo-100 text-indigo-800': order.status === 'picked_up',
                  'bg-purple-100 text-purple-800': order.status === 'in_transit',
                  'bg-green-100 text-green-800': order.status === 'delivered',
                }"
              >
                {{ formatStatus(order.status) }}
              </span>
            </div>

            <div class="mt-4 space-y-2">
              <div class="flex items-start">
                <div class="flex-shrink-0 w-5 h-5 mt-0.5 flex items-center justify-center">
                  <i class="fas fa-map-marker-alt text-red-500"></i>
                </div>
                <div class="ml-2">
                  <p class="text-xs text-gray-500">Pickup</p>
                  <p class="text-sm">{{ order.pickup_address }}</p>
                </div>
              </div>
              <div class="flex items-start">
                <div class="flex-shrink-0 w-5 h-5 mt-0.5 flex items-center justify-center">
                  <i class="fas fa-flag-checkered text-green-500"></i>
                </div>
                <div class="ml-2">
                  <p class="text-xs text-gray-500">Delivery</p>
                  <p class="text-sm">{{ order.delivery_address }}</p>
                </div>
              </div>
            </div>

            <div class="mt-4">
              <p class="text-sm font-medium">Delivery Fee: ₱{{ order.delivery_fee.toFixed(2) }}</p>
            </div>

            <!-- Customer Info -->
            <div v-if="order.user_profiles" class="mt-4 pt-4 border-t border-gray-100">
              <div class="flex items-center">
                <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <i class="fas fa-user text-gray-500"></i>
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium">
                    {{ order.user_profiles.first_name }} {{ order.user_profiles.last_name }}
                  </p>
                  <p class="text-xs text-gray-500">{{ order.user_profiles.contact_number }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Actions -->
          <div class="bg-gray-50 px-4 py-3">
            <div class="flex flex-wrap gap-2">
              <!-- Barcode Verification -->
              <div v-if="order.status === 'assigned' && !order.barcode_verified_at" class="w-full mb-4">
                <h3 class="text-sm font-medium mb-2">Verify Order</h3>
                <BarcodeScanner @code-scanned="code => verifyOrderBarcode(order.id, code)" />
              </div>
              
              <!-- Photo Upload for Pickup -->
              <div v-if="['assigned'].includes(order.status)" class="w-full mb-4">
                <PhotoUploader
                  title="Pickup Photo"
                  description="Take a photo of the item at pickup location"
                  :orderId="order.id"
                  type="pickup"
                  :required="true"
                  :existingUrl="order.pickup_proof_url"
                  @upload-success="handlePhotoUpload"
                />
              </div>
              
              <!-- Photo Upload for Delivery -->
              <div v-if="['picked_up', 'in_transit'].includes(order.status)" class="w-full mb-4">
                <PhotoUploader
                  title="Delivery Photo"
                  description="Take a photo of the item at delivery location"
                  :orderId="order.id"
                  type="delivery"
                  :required="true"
                  :existingUrl="order.delivery_proof_url"
                  @upload-success="handlePhotoUpload"
                />
              </div>
              
              <!-- Location Tracking -->
              <div v-if="['assigned', 'picked_up', 'in_transit'].includes(order.status)" class="w-full mb-4">
                <LocationTracker 
                  :orderId="order.id"
                  :driverId="currentUser.id"
                  :isDriver="true"
                  :pickupLocation="getPickupLocation(order)"
                  :deliveryLocation="getDeliveryLocation(order)"
                  title="Your Location"
                />
              </div>

              <button
                v-if="order.status === 'assigned'"
                @click="updateStatus(order.id, 'picked_up')"
                class="btn-primary text-sm"
              >
                Mark as Picked Up
              </button>

              <button
                v-if="order.status === 'picked_up'"
                @click="updateStatus(order.id, 'in_transit')"
                class="btn-primary text-sm"
              >
                Start Delivery
              </button>

              <button
                v-if="order.status === 'in_transit'"
                @click="updateStatus(order.id, 'delivered')"
                class="btn-success text-sm"
              >
                Complete Delivery
              </button>

              <button
                v-if="['assigned', 'picked_up', 'in_transit'].includes(order.status)"
                @click="showOrderDetails(order.id)"
                class="btn-outline text-sm"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from "vue"
import { useRouter } from "vue-router"
import { useAuth } from "@/composables/useAuth"
import { useOrders } from "@/composables/useOrders"
import { notificationService } from "@/composables/useNotification"
import LoadingSpinner from "@/components/common/LoadingSpinner.vue"
import BarcodeScanner from "@/components/tracking/BarcodeScanner.vue"
import PhotoUploader from "@/components/tracking/PhotoUploader.vue"
import LocationTracker from "@/components/tracking/LocationTracker.vue"

export default {
  name: "DriverOrders",
  components: {
    LoadingSpinner,
    BarcodeScanner,
    PhotoUploader,
    LocationTracker
  },
  setup() {
    const router = useRouter()
    const { currentUser } = useAuth()
    const { getDriverOrders, getAvailableOrders, acceptOrder, updateOrderStatus, verifyOrderBarcode } = useOrders()

    const orders = ref([])
    const availableOrders = ref([])
    const loading = ref(true)
    const activeTab = ref("active")

    const tabs = [
      { label: "New Orders", value: "new" },
      { label: "Active", value: "active" },
      { label: "Completed", value: "completed" },
    ]

    const filteredOrders = computed(() => {
      if (activeTab.value === "active") {
        return orders.value.filter((order) =>
          ["assigned", "picked_up", "in_transit"].includes(order.status)
        )
      } else if (activeTab.value === "completed") {
        return orders.value.filter((order) => order.status === "delivered")
      }
      return orders.value
    })

    const fetchOrders = async () => {
      if (!currentUser.value) return

      loading.value = true

      try {
        const { data, error } = await getDriverOrders(currentUser.value.id)
        if (error) throw error
        orders.value = data || []
      } catch (err) {
        console.error("Error fetching driver orders:", err)
        notificationService.error("Failed to load orders")
      } finally {
        loading.value = false
      }
    }

    const fetchAvailableOrders = async () => {
      if (!currentUser.value) return

      try {
        const { data, error } = await getAvailableOrders()
        if (error) throw error
        availableOrders.value = data || []
      } catch (err) {
        console.error("Error fetching available orders:", err)
      }
    }

    const handleAcceptOrder = async (orderId) => {
      if (!currentUser.value) return

      try {
        const { error } = await acceptOrder(orderId, currentUser.value.id)
        if (error) throw error

        notificationService.success("Order accepted successfully")
        
        // Remove from available orders
        availableOrders.value = availableOrders.value.filter((order) => order.id !== orderId)
        
        // Refresh orders
        await fetchOrders()
        
        // Switch to active tab
        activeTab.value = "active"
      } catch (err) {
        console.error("Error accepting order:", err)
        notificationService.error("Failed to accept order")
      }
    }

    const handleUpdateStatus = async (orderId, status) => {
      try {
        const { error } = await updateOrderStatus(orderId, status)
        if (error) throw error

        notificationService.success(`Order marked as ${formatStatus(status).toLowerCase()}`)
        await fetchOrders()
      } catch (err) {
        console.error("Error updating order status:", err)
        notificationService.error("Failed to update order status")
      }
    }
    
    const handleVerifyOrderBarcode = async (orderId, barcode) => {
      try {
        const { verified, error } = await verifyOrderBarcode(orderId, barcode)
        
        if (error) throw error
        
        if (verified) {
          notificationService.success('Order verified successfully')
          // Refresh orders to update UI
          await fetchOrders()
        } else {
          notificationService.error('Invalid barcode')
        }
      } catch (error) {
        console.error('Error verifying barcode:', error)
        notificationService.error('Failed to verify barcode')
      }
    }
    
    const handlePhotoUpload = async (photoData) => {
      try {
        // Update order status based on photo type
        const newStatus = photoData.type === 'pickup' ? 'picked_up' : 'delivered'
        
        // Update order with photo URL and new status
        const { error } = await updateOrderStatus(
          photoData.metadata.orderId, 
          newStatus
        )
        
        if (error) throw error
        
        notificationService.success(`${photoData.type === 'pickup' ? 'Pickup' : 'Delivery'} confirmed`)
        
        // Refresh orders
        await fetchOrders()
      } catch (error) {
        console.error('Error handling photo upload:', error)
        notificationService.error('Failed to update order status')
      }
    }
    
    const getPickupLocation = (order) => {
      if (!order) return null
      return {
        latitude: order.pickup_latitude,
        longitude: order.pickup_longitude
      }
    }
    
    const getDeliveryLocation = (order) => {
      if (!order) return null
      return {
        latitude: order.delivery_latitude,
        longitude: order.delivery_longitude
      }
    }

    const getOrderCountByStatus = (tabValue) => {
      if (tabValue === "new") {
        return availableOrders.value.length
      } else if (tabValue === "active") {
        return orders.value.filter((order) =>
          ["assigned", "picked_up", "in_transit"].includes(order.status)
        ).length
      } else if (tabValue === "completed") {
        return orders.value.filter((order) => order.status === "delivered").length
      }
      return 0
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    const formatStatus = (status) => {
      const statusMap = {
        placed: "New",
        assigned: "Assigned",
        picked_up: "Picked Up",
        in_transit: "In Transit",
        delivered: "Delivered",
        cancelled: "Cancelled",
      }
      return statusMap[status] || status
    }

    const showOrderDetails = (orderId) => {
      router.push(`/driver/orders/${orderId}`)
    }

    onMounted(async () => {
      await fetchOrders()
      if (activeTab.value === "new") {
        await fetchAvailableOrders()
      }
    })

    watch(activeTab, async (newTab) => {
      if (newTab === "new") {
        await fetchAvailableOrders()
      }
    })

    return {
      orders,
      availableOrders,
      loading,
      activeTab,
      tabs,
      filteredOrders,
      currentUser,
      getOrderCountByStatus,
      formatDate,
      formatStatus,
      acceptOrder: handleAcceptOrder,
      updateStatus: handleUpdateStatus,
      showOrderDetails,
      verifyOrderBarcode: handleVerifyOrderBarcode,
      handlePhotoUpload,
      getPickupLocation,
      getDeliveryLocation
    }
  },
}
</script>
