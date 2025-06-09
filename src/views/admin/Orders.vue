<template>
  <div>
    <Navbar />
    
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Order Management</h1>
          <p class="mt-2 text-gray-600">Monitor and manage all delivery orders</p>
        </div>
        
        <!-- Filters and Actions -->
        <div class="card mb-6">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
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
                <span v-if="status.count !== undefined" class="ml-2 px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-xs">
                  {{ status.count }}
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
              
              <select
                v-model="selectedPaymentMethod"
                class="input-field w-auto"
              >
                <option value="">All Payment Methods</option>
                <option value="GCash">GCash</option>
                <option value="PayMaya">PayMaya</option>
                <option value="GoTyme">GoTyme</option>
                <option value="COD">Cash on Delivery</option>
              </select>
              
              <button
                @click="refreshOrders"
                class="btn-secondary"
                :disabled="loading"
              >
                <i class="fas fa-sync-alt mr-2" :class="{ 'fa-spin': loading }"></i>
                Refresh
              </button>
              
              <button
                @click="exportOrders"
                class="btn-outline"
              >
                <i class="fas fa-download mr-2"></i>
                Export
              </button>
            </div>
          </div>
          
          <!-- Search -->
          <div class="mt-4">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-search text-gray-400"></i>
              </div>
              <input
                v-model="searchQuery"
                type="text"
                class="input-field pl-10"
                placeholder="Search by order ID, customer name, or driver name..."
              />
            </div>
          </div>
        </div>
        
        <!-- Orders Table -->
        <div class="card">
          <LoadingSpinner v-if="loading && orders.length === 0" />
          
          <div v-else-if="filteredOrders.length === 0" class="text-center py-12">
            <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-inbox text-gray-400 text-3xl"></i>
            </div>
            <h3 class="text-xl font-medium text-gray-900 mb-2">No orders found</h3>
            <p class="text-gray-500">
              {{ selectedStatus || searchQuery ? 'Try adjusting your filters' : 'No orders have been placed yet' }}
            </p>
          </div>
          
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="order in paginatedOrders"
                  :key="order.id"
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div class="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <i :class="getServiceIcon(order.service_type)"></i>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          Order #{{ order.id }}
                        </div>
                        <div class="text-sm text-gray-500">
                          {{ order.service_type }}
                        </div>
                        <div class="text-xs text-gray-400">
                          {{ formatDateTime(order.created_at) }}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      {{ order.user_profiles?.first_name }} {{ order.user_profiles?.last_name }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ order.user_profiles?.contact_number }}
                    </div>
                  </td>
                  
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div v-if="order.driver_profiles" class="text-sm">
                      <div class="font-medium text-gray-900">
                        {{ order.driver_profiles.first_name }} {{ order.driver_profiles.last_name }}
                      </div>
                      <div class="text-gray-500">
                        {{ order.driver_profiles.contact_number }}
                      </div>
                    </div>
                    <div v-else class="text-sm text-gray-400">
                      No driver assigned
                    </div>
                  </td>
                  
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusClass(order.status)">
                      {{ formatStatus(order.status) }}
                    </span>
                  </td>
                  
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">₱{{ order.delivery_fee }}</div>
                    <div class="text-sm text-gray-500">{{ order.payment_method }}</div>
                  </td>
                  
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex items-center space-x-2">
                      <button
                        @click="viewOrderDetails(order)"
                        class="text-green-600 hover:text-green-900"
                        title="View Details"
                      >
                        <i class="fas fa-eye"></i>
                      </button>
                      
                      <button
                        v-if="order.item_image_url"
                        @click="viewOrderImage(order.item_image_url)"
                        class="text-blue-600 hover:text-blue-900"
                        title="View Item Picture"
                      >
                        <i class="fas fa-image"></i>
                      </button>
                      
                      <button
                        @click="viewOrderChat(order.id)"
                        class="text-purple-600 hover:text-purple-900"
                        title="View Chat History"
                      >
                        <i class="fas fa-comments"></i>
                      </button>
                      
                      <div class="relative" v-if="canManageOrder(order)">
                        <button
                          @click="showOrderActions(order)"
                          class="text-gray-600 hover:text-gray-900"
                          title="More Actions"
                        >
                          <i class="fas fa-ellipsis-v"></i>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Pagination -->
          <div v-if="totalPages > 1" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div class="flex-1 flex justify-between sm:hidden">
              <button
                @click="currentPage = Math.max(1, currentPage - 1)"
                :disabled="currentPage === 1"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Showing
                  <span class="font-medium">{{ startIndex + 1 }}</span>
                  to
                  <span class="font-medium">{{ Math.min(endIndex, filteredOrders.length) }}</span>
                  of
                  <span class="font-medium">{{ filteredOrders.length }}</span>
                  results
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    @click="currentPage = Math.max(1, currentPage - 1)"
                    :disabled="currentPage === 1"
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i class="fas fa-chevron-left"></i>
                  </button>
                  
                  <button
                    v-for="page in visiblePages"
                    :key="page"
                    @click="currentPage = page"
                    :class="[
                      'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                      page === currentPage
                        ? 'z-10 bg-green-50 border-green-500 text-green-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    ]"
                  >
                    {{ page }}
                  </button>
                  
                  <button
                    @click="currentPage = Math.min(totalPages, currentPage + 1)"
                    :disabled="currentPage === totalPages"
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Order Details Modal -->
    <Modal
      :is-open="showDetailsModal"
      title="Order Details"
      size="xl"
      :show-actions="false"
      @close="closeDetailsModal"
    >
      <div v-if="selectedOrder" class="space-y-6">
        <!-- Order Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Order Information</h3>
            <dl class="space-y-2">
              <div>
                <dt class="text-sm font-medium text-gray-500">Order ID</dt>
                <dd class="text-sm text-gray-900">#{{ selectedOrder.id }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Service Type</dt>
                <dd class="text-sm text-gray-900">{{ selectedOrder.service_type }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Status</dt>
                <dd>
                  <span :class="getStatusClass(selectedOrder.status)">
                    {{ formatStatus(selectedOrder.status) }}
                  </span>
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Created</dt>
                <dd class="text-sm text-gray-900">{{ formatDateTime(selectedOrder.created_at) }}</dd>
              </div>
            </dl>
          </div>
          
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
            <dl class="space-y-2">
              <div>
                <dt class="text-sm font-medium text-gray-500">Delivery Fee</dt>
                <dd class="text-sm text-gray-900">₱{{ selectedOrder.delivery_fee }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Payment Method</dt>
                <dd class="text-sm text-gray-900">{{ selectedOrder.payment_method }}</dd>
              </div>
            </dl>
          </div>
        </div>
        
        <!-- Addresses -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Pickup Address</h3>
            <p class="text-sm text-gray-600">{{ selectedOrder.pickup_address }}</p>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Delivery Address</h3>
            <p class="text-sm text-gray-600">{{ selectedOrder.delivery_address }}</p>
          </div>
        </div>
        
        <!-- Service Details -->
        <div v-if="selectedOrder.service_details">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Service Details</h3>
          <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="(value, key) in selectedOrder.service_details"
              :key="key"
              v-if="value"
            >
              <dt class="text-sm font-medium text-gray-500">{{ formatKey(key) }}</dt>
              <dd class="text-sm text-gray-900">{{ value }}</dd>
            </div>
          </dl>
        </div>
        
        <!-- Special Instructions -->
        <div v-if="selectedOrder.special_instructions">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Special Instructions</h3>
          <p class="text-sm text-gray-600">{{ selectedOrder.special_instructions }}</p>
        </div>
        
        <!-- Admin Actions -->
        <div class="border-t border-gray-200 pt-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Admin Actions</h3>
          <div class="flex flex-wrap gap-2">
            <select
              v-model="newOrderStatus"
              class="input-field w-auto"
            >
              <option value="">Change Status</option>
              <option value="placed">Placed</option>
              <option value="assigned">Assigned</option>
              <option value="picked_up">Picked Up</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <button
              @click="updateOrderStatus"
              :disabled="!newOrderStatus || newOrderStatus === selectedOrder.status"
              class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Update Status
            </button>
            
            <select
              v-if="selectedOrder.status === 'placed'"
              v-model="selectedDriverId"
              class="input-field w-auto"
            >
              <option value="">Assign Driver</option>
              <option
                v-for="driver in availableDrivers"
                :key="driver.user_id"
                :value="driver.user_id"
              >
                {{ driver.first_name }} {{ driver.last_name }}
              </option>
            </select>
            
            <button
              v-if="selectedOrder.status === 'placed'"
              @click="assignDriver"
              :disabled="!selectedDriverId"
              class="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Assign Driver
            </button>
          </div>
        </div>
      </div>
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
    
    <!-- Chat History Modal -->
    <Modal
      :is-open="showChatModal"
      :title="`Chat History - Order #${selectedOrderId}`"
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
import { supabase } from '@/composables/useSupabase'
import { useRealtime } from '@/composables/useRealtime'
import Navbar from '@/components/common/Navbar.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import Modal from '@/components/common/Modal.vue'
import ChatWindow from '@/components/chat/ChatWindow.vue'

export default {
  name: 'AdminOrders',
  components: {
    Navbar,
    LoadingSpinner,
    Modal,
    ChatWindow
  },
  setup() {
    const { subscribeToOrders } = useRealtime()
    
    const loading = ref(false)
    const orders = ref([])
    const availableDrivers = ref([])
    
    const selectedStatus = ref('')
    const selectedService = ref('')
    const selectedPaymentMethod = ref('')
    const searchQuery = ref('')
    const currentPage = ref(1)
    const itemsPerPage = 20
    
    // Modals
    const showDetailsModal = ref(false)
    const showImageModal = ref(false)
    const showChatModal = ref(false)
    const selectedOrder = ref(null)
    const selectedImage = ref('')
    const selectedOrderId = ref(null)
    const newOrderStatus = ref('')
    const selectedDriverId = ref('')
    
    const serviceTypes = [
      'Food Delivery',
      'Pay Bills',
      'Pick-up',
      'Surprise Delivery',
      'Medicines',
      'Grocery',
      'Pabili'
    ]
    
    const statusFilters = computed(() => {
      const statusCounts = orders.value.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1
        return acc
      }, {})
      
      return [
        { label: 'All', value: '', count: orders.value.length },
        { label: 'Placed', value: 'placed', count: statusCounts.placed || 0 },
        { label: 'Assigned', value: 'assigned', count: statusCounts.assigned || 0 },
        { label: 'Picked Up', value: 'picked_up', count: statusCounts.picked_up || 0 },
        { label: 'In Transit', value: 'in_transit', count: statusCounts.in_transit || 0 },
        { label: 'Delivered', value: 'delivered', count: statusCounts.delivered || 0 },
        { label: 'Cancelled', value: 'cancelled', count: statusCounts.cancelled || 0 }
      ]
    })
    
    const filteredOrders = computed(() => {
      let filtered = orders.value
      
      if (selectedStatus.value) {
        filtered = filtered.filter(order => order.status === selectedStatus.value)
      }
      
      if (selectedService.value) {
        filtered = filtered.filter(order => order.service_type === selectedService.value)
      }
      
      if (selectedPaymentMethod.value) {
        filtered = filtered.filter(order => order.payment_method === selectedPaymentMethod.value)
      }
      
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(order => 
          order.id.toString().includes(query) ||
          `${order.user_profiles?.first_name} ${order.user_profiles?.last_name}`.toLowerCase().includes(query) ||
          `${order.driver_profiles?.first_name} ${order.driver_profiles?.last_name}`.toLowerCase().includes(query)
        )
      }
      
      return filtered
    })
    
    const totalPages = computed(() => {
      return Math.ceil(filteredOrders.value.length / itemsPerPage)
    })
    
    const startIndex = computed(() => {
      return (currentPage.value - 1) * itemsPerPage
    })
    
    const endIndex = computed(() => {
      return startIndex.value + itemsPerPage
    })
    
    const paginatedOrders = computed(() => {
      return filteredOrders.value.slice(startIndex.value, endIndex.value)
    })
    
    const visiblePages = computed(() => {
      const pages = []
      const maxVisible = 5
      const half = Math.floor(maxVisible / 2)
      
      let start = Math.max(1, currentPage.value - half)
      let end = Math.min(totalPages.value, start + maxVisible - 1)
      
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1)
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      return pages
    })
    
    const loadOrders = async () => {
      try {
        loading.value = true
        
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            user_profiles:user_id (
              first_name,
              last_name,
              contact_number
            ),
            driver_profiles:driver_id (
              first_name,
              last_name,
              contact_number
            )
          `)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        
        orders.value = data || []
      } catch (error) {
        console.error('Error loading orders:', error)
      } finally {
        loading.value = false
      }
    }
    
    const loadAvailableDrivers = async () => {
      try {
        const { data, error } = await supabase
          .from('driver_profiles')
          .select('user_id, first_name, last_name, is_online')
          .eq('is_online', true)
        
        if (error) throw error
        
        availableDrivers.value = data || []
      } catch (error) {
        console.error('Error loading available drivers:', error)
      }
    }
    
    const refreshOrders = async () => {
      await loadOrders()
    }
    
    const viewOrderDetails = (order) => {
      selectedOrder.value = order
      newOrderStatus.value = ''
      selectedDriverId.value = ''
      showDetailsModal.value = true
      loadAvailableDrivers()
    }
    
    const closeDetailsModal = () => {
      showDetailsModal.value = false
      selectedOrder.value = null
    }
    
    const viewOrderImage = (imageUrl) => {
      selectedImage.value = imageUrl
      showImageModal.value = true
    }
    
    const closeImageModal = () => {
      showImageModal.value = false
      selectedImage.value = ''
    }
    
    const viewOrderChat = (orderId) => {
      selectedOrderId.value = orderId
      showChatModal.value = true
    }
    
    const closeChatModal = () => {
      showChatModal.value = false
      selectedOrderId.value = null
    }
    
    const updateOrderStatus = async () => {
      if (!selectedOrder.value || !newOrderStatus.value) return
      
      try {
        const { error } = await supabase
          .from('orders')
          .update({ status: newOrderStatus.value })
          .eq('id', selectedOrder.value.id)
        
        if (error) throw error
        
        selectedOrder.value.status = newOrderStatus.value
        
        // Update in orders list
        const orderIndex = orders.value.findIndex(order => order.id === selectedOrder.value.id)
        if (orderIndex !== -1) {
          orders.value[orderIndex].status = newOrderStatus.value
        }
        
        newOrderStatus.value = ''
        alert('Order status updated successfully!')
      } catch (error) {
        console.error('Error updating order status:', error)
        alert('Error updating order status: ' + error.message)
      }
    }
    
    const assignDriver = async () => {
      if (!selectedOrder.value || !selectedDriverId.value) return
      
      try {
        const { error } = await supabase
          .from('orders')
          .update({ 
            driver_id: selectedDriverId.value,
            status: 'assigned'
          })
          .eq('id', selectedOrder.value.id)
        
        if (error) throw error
        
        // Update selected order
        selectedOrder.value.driver_id = selectedDriverId.value
        selectedOrder.value.status = 'assigned'
        
        // Update in orders list
        const orderIndex = orders.value.findIndex(order => order.id === selectedOrder.value.id)
        if (orderIndex !== -1) {
          orders.value[orderIndex].driver_id = selectedDriverId.value
          orders.value[orderIndex].status = 'assigned'
        }
        
        selectedDriverId.value = ''
        alert('Driver assigned successfully!')
      } catch (error) {
        console.error('Error assigning driver:', error)
        alert('Error assigning driver: ' + error.message)
      }
    }
    
    const canManageOrder = (order) => {
      return ['placed', 'assigned', 'picked_up', 'in_transit'].includes(order.status)
    }
    
    const showOrderActions = (order) => {
      viewOrderDetails(order)
    }
    
    const exportOrders = () => {
      const headers = ['Order ID', 'Service Type', 'Customer', 'Driver', 'Status', 'Payment Method', 'Amount', 'Created']
      const csvContent = [
        headers.join(','),
        ...filteredOrders.value.map(order => [
          order.id,
          order.service_type,
          `${order.user_profiles?.first_name || ''} ${order.user_profiles?.last_name || ''}`,
          order.driver_profiles ? `${order.driver_profiles.first_name} ${order.driver_profiles.last_name}` : 'Unassigned',
          order.status,
          order.payment_method,
          order.delivery_fee,
          formatDateTime(order.created_at)
        ].join(','))
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    }
    
    const formatDateTime = (date) => {
      return new Date(date).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
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
    
    let unsubscribe = null
    
    onMounted(async () => {
      await loadOrders()
      
      // Subscribe to real-time order updates
      unsubscribe = subscribeToOrders((payload) => {
        if (payload.eventType === 'INSERT') {
          orders.value.unshift(payload.new)
        } else if (payload.eventType === 'UPDATE') {
          const orderIndex = orders.value.findIndex(order => order.id === payload.new.id)
          if (orderIndex !== -1) {
            orders.value[orderIndex] = { ...orders.value[orderIndex], ...payload.new }
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
      loading,
      orders,
      availableDrivers,
      selectedStatus,
      selectedService,
      selectedPaymentMethod,
      searchQuery,
      currentPage,
      statusFilters,
      serviceTypes,
      filteredOrders,
      paginatedOrders,
      totalPages,
      startIndex,
      endIndex,
      visiblePages,
      showDetailsModal,
      showImageModal,
      showChatModal,
      selectedOrder,
      selectedImage,
      selectedOrderId,
      newOrderStatus,
      selectedDriverId,
      refreshOrders,
      viewOrderDetails,
      closeDetailsModal,
      viewOrderImage,
      closeImageModal,
      viewOrderChat,
      closeChatModal,
      updateOrderStatus,
      assignDriver,
      canManageOrder,
      showOrderActions,
      exportOrders,
      formatDateTime,
      formatStatus,
      formatKey,
      getStatusClass,
      getServiceIcon
    }
  }
}
</script>
