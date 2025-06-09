<template>
  <div>
    <Navbar />
    
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Driver Management</h1>
          <p class="mt-2 text-gray-600">Manage driver accounts and performance</p>
        </div>
        
        <!-- Filters and Actions -->
        <div class="card mb-6">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="filter in statusFilters"
                :key="filter.value"
                @click="selectedFilter = filter.value"
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  selectedFilter === filter.value
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                {{ filter.label }}
                <span v-if="filter.count !== undefined" class="ml-2 px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-xs">
                  {{ filter.count }}
                </span>
              </button>
            </div>
            
            <div class="flex items-center space-x-4">
              <button
                @click="refreshDrivers"
                class="btn-secondary"
                :disabled="loading"
              >
                <i class="fas fa-sync-alt mr-2" :class="{ 'fa-spin': loading }"></i>
                Refresh
              </button>
              
              <button
                @click="exportDrivers"
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
                placeholder="Search by name, email, or contact number..."
              />
            </div>
          </div>
        </div>
        
        <!-- Drivers Grid -->
        <LoadingSpinner v-if="loading && drivers.length === 0" />
        
        <div v-else-if="filteredDrivers.length === 0" class="text-center py-12">
          <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-motorcycle text-gray-400 text-3xl"></i>
          </div>
          <h3 class="text-xl font-medium text-gray-900 mb-2">No drivers found</h3>
          <p class="text-gray-500">
            {{ selectedFilter || searchQuery ? 'Try adjusting your filters' : 'No drivers have been approved yet' }}
          </p>
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="driver in paginatedDrivers"
            :key="driver.user_id"
            class="card hover:shadow-lg transition-shadow duration-200"
          >
            <!-- Driver Header -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <i class="fas fa-motorcycle text-blue-600 text-xl"></i>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">
                    {{ driver.first_name }} {{ driver.last_name }}
                  </h3>
                  <p class="text-sm text-gray-500">{{ driver.email }}</p>
                </div>
              </div>
              
              <div class="flex items-center space-x-2">
                <span :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  driver.is_online 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                ]">
                  {{ driver.is_online ? 'Online' : 'Offline' }}
                </span>
              </div>
            </div>
            
            <!-- Driver Stats -->
            <div class="grid grid-cols-3 gap-4 mb-4">
              <div class="text-center">
                <p class="text-2xl font-bold text-green-600">{{ driver.completed_deliveries || 0 }}</p>
                <p class="text-xs text-gray-500">Deliveries</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-yellow-600">{{ driver.rating || 'N/A' }}</p>
                <p class="text-xs text-gray-500">Rating</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-blue-600">₱{{ driver.total_earnings || 0 }}</p>
                <p class="text-xs text-gray-500">Earnings</p>
              </div>
            </div>
            
            <!-- Driver Details -->
            <div class="space-y-2 mb-4">
              <div class="flex items-center text-sm">
                <i class="fas fa-phone text-gray-400 w-4"></i>
                <span class="ml-2 text-gray-600">{{ driver.contact_number }}</span>
              </div>
              <div v-if="driver.vehicle_info" class="flex items-center text-sm">
                <i class="fas fa-motorcycle text-gray-400 w-4"></i>
                <span class="ml-2 text-gray-600">{{ driver.vehicle_info }}</span>
              </div>
              <div v-if="driver.plate_number" class="flex items-center text-sm">
                <i class="fas fa-id-card text-gray-400 w-4"></i>
                <span class="ml-2 text-gray-600">{{ driver.plate_number }}</span>
              </div>
              <div class="flex items-center text-sm">
                <i class="fas fa-calendar text-gray-400 w-4"></i>
                <span class="ml-2 text-gray-600">Joined {{ formatDate(driver.created_at) }}</span>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                @click="viewDriverDetails(driver)"
                class="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                View Details
              </button>
              
              <div class="flex items-center space-x-2">
                <button
                  @click="viewDriverDocuments(driver)"
                  class="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50"
                  title="View Documents"
                >
                  <i class="fas fa-file-alt"></i>
                </button>
                
                <button
                  @click="viewDriverOrders(driver)"
                  class="text-purple-600 hover:text-purple-700 p-2 rounded-lg hover:bg-purple-50"
                  title="View Orders"
                >
                  <i class="fas fa-list"></i>
                </button>
                
                <div class="relative">
                  <button
                    @click="showDriverActions(driver)"
                    class="text-gray-600 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-50"
                    title="More Actions"
                  >
                    <i class="fas fa-ellipsis-v"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-8 flex items-center justify-center">
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
    
    <!-- Driver Details Modal -->
    <Modal
      :is-open="showDetailsModal"
      title="Driver Details"
      size="xl"
      :show-actions="false"
      @close="closeDetailsModal"
    >
      <div v-if="selectedDriver" class="space-y-6">
        <!-- Personal Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
            <dl class="space-y-2">
              <div>
                <dt class="text-sm font-medium text-gray-500">Full Name</dt>
                <dd class="text-sm text-gray-900">{{ selectedDriver.first_name }} {{ selectedDriver.last_name }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Email</dt>
                <dd class="text-sm text-gray-900">{{ selectedDriver.email }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Contact Number</dt>
                <dd class="text-sm text-gray-900">{{ selectedDriver.contact_number }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Address</dt>
                <dd class="text-sm text-gray-900">{{ selectedDriver.address }}</dd>
              </div>
            </dl>
          </div>
          
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Vehicle Information</h3>
            <dl class="space-y-2">
              <div>
                <dt class="text-sm font-medium text-gray-500">Vehicle Type</dt>
                <dd class="text-sm text-gray-900">{{ selectedDriver.vehicle_type || 'Not specified' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Plate Number</dt>
                <dd class="text-sm text-gray-900">{{ selectedDriver.plate_number || 'Not specified' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Brand & Model</dt>
                <dd class="text-sm text-gray-900">{{ selectedDriver.vehicle_brand || 'Not specified' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Color</dt>
                <dd class="text-sm text-gray-900">{{ selectedDriver.vehicle_color || 'Not specified' }}</dd>
              </div>
            </dl>
          </div>
        </div>
        
        <!-- Performance Stats -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Performance Statistics</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center p-4 bg-green-50 rounded-lg">
              <p class="text-2xl font-bold text-green-600">{{ selectedDriver.completed_deliveries || 0 }}</p>
              <p class="text-sm text-green-800">Completed Deliveries</p>
            </div>
            <div class="text-center p-4 bg-yellow-50 rounded-lg">
              <p class="text-2xl font-bold text-yellow-600">{{ selectedDriver.rating || 'N/A' }}</p>
              <p class="text-sm text-yellow-800">Average Rating</p>
            </div>
            <div class="text-center p-4 bg-blue-50 rounded-lg">
              <p class="text-2xl font-bold text-blue-600">₱{{ selectedDriver.total_earnings || 0 }}</p>
              <p class="text-sm text-blue-800">Total Earnings</p>
            </div>
            <div class="text-center p-4 bg-purple-50 rounded-lg">
              <p class="text-2xl font-bold text-purple-600">{{ selectedDriver.is_online ? 'Online' : 'Offline' }}</p>
              <p class="text-sm text-purple-800">Current Status</p>
            </div>
          </div>
        </div>
        
        <!-- Admin Actions -->
        <div class="border-t border-gray-200 pt-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Admin Actions</h3>
          <div class="flex flex-wrap gap-2">
            <button
              @click="toggleDriverStatus"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium',
                selectedDriver.is_active
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              ]"
            >
              {{ selectedDriver.is_active ? 'Deactivate Driver' : 'Activate Driver' }}
            </button>
            
            <button
              @click="viewDriverDocuments(selectedDriver)"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              View Documents
            </button>
            
            <button
              @click="viewDriverOrders(selectedDriver)"
              class="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
            >
              View Order History
            </button>
          </div>
        </div>
      </div>
    </Modal>
    
    <!-- Documents Modal -->
    <Modal
      :is-open="showDocumentsModal"
      title="Driver Documents"
      size="xl"
      :show-actions="false"
      @close="closeDocumentsModal"
    >
      <div v-if="selectedDriver" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-if="selectedDriver.license_url">
            <h4 class="font-medium text-gray-900 mb-2">Driver's License</h4>
            <img
              :src="selectedDriver.license_url"
              alt="Driver's License"
              class="w-full h-48 object-cover rounded-lg border border-gray-200 cursor-pointer"
              @click="viewFullImage(selectedDriver.license_url)"
            />
          </div>
          
          <div v-if="selectedDriver.orcr_url">
            <h4 class="font-medium text-gray-900 mb-2">ORCR</h4>
            <img
              :src="selectedDriver.orcr_url"
              alt="ORCR"
              class="w-full h-48 object-cover rounded-lg border border-gray-200 cursor-pointer"
              @click="viewFullImage(selectedDriver.orcr_url)"
            />
          </div>
          
          <div v-if="selectedDriver.selfie_url">
            <h4 class="font-medium text-gray-900 mb-2">Selfie with ID</h4>
            <img
              :src="selectedDriver.selfie_url"
              alt="Selfie with ID"
              class="w-full h-48 object-cover rounded-lg border border-gray-200 cursor-pointer"
              @click="viewFullImage(selectedDriver.selfie_url)"
            />
          </div>
          
          <div v-if="selectedDriver.profile_picture_url">
            <h4 class="font-medium text-gray-900 mb-2">Profile Picture</h4>
            <img
              :src="selectedDriver.profile_picture_url"
              alt="Profile Picture"
              class="w-full h-48 object-cover rounded-lg border border-gray-200 cursor-pointer"
              @click="viewFullImage(selectedDriver.profile_picture_url)"
            />
          </div>
        </div>
      </div>
    </Modal>
    
    <!-- Full Image Modal -->
    <Modal
      :is-open="showImageModal"
      title="Document View"
      size="lg"
      :show-actions="false"
      @close="closeImageModal"
    >
      <div class="text-center">
        <img
          v-if="selectedImage"
          :src="selectedImage"
          alt="Document"
          class="max-w-full max-h-96 mx-auto rounded-lg"
        />
      </div>
    </Modal>
    
    <!-- Driver Orders Modal -->
    <Modal
      :is-open="showOrdersModal"
      title="Driver Order History"
      size="xl"
      :show-actions="false"
      @close="closeOrdersModal"
    >
      <div v-if="driverOrders.length === 0" class="text-center py-8">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-clipboard-list text-gray-400 text-2xl"></i>
        </div>
        <p class="text-gray-500">No orders found for this driver</p>
      </div>
      
      <div v-else class="space-y-4 max-h-96 overflow-y-auto">
        <div
          v-for="order in driverOrders"
          :key="order.id"
          class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
        >
          <div class="flex items-center space-x-4">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-box text-green-600"></i>
            </div>
            <div>
              <p class="font-medium text-gray-900">Order #{{ order.id }}</p>
              <p class="text-sm text-gray-500">{{ order.service_type }}</p>
              <p class="text-xs text-gray-400">{{ formatDateTime(order.created_at) }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-medium text-gray-900">₱{{ order.delivery_fee }}</p>
            <span :class="getStatusClass(order.status)">
              {{ formatStatus(order.status) }}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/composables/useSupabase'
import Navbar from '@/components/common/Navbar.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import Modal from '@/components/common/Modal.vue'

export default {
  name: 'AdminDrivers',
  components: {
    Navbar,
    LoadingSpinner,
    Modal
  },
  setup() {
    const loading = ref(false)
    const drivers = ref([])
    const driverOrders = ref([])
    
    const selectedFilter = ref('')
    const searchQuery = ref('')
    const currentPage = ref(1)
    const itemsPerPage = 12
    
    // Modals
    const showDetailsModal = ref(false)
    const showDocumentsModal = ref(false)
    const showImageModal = ref(false)
    const showOrdersModal = ref(false)
    const selectedDriver = ref(null)
    const selectedImage = ref('')
    
    const statusFilters = computed(() => {
      const onlineCount = drivers.value.filter(d => d.is_online).length
      const activeCount = drivers.value.filter(d => d.is_active !== false).length
      
      return [
        { label: 'All', value: '', count: drivers.value.length },
        { label: 'Online', value: 'online', count: onlineCount },
        { label: 'Offline', value: 'offline', count: drivers.value.length - onlineCount },
        { label: 'Active', value: 'active', count: activeCount },
        { label: 'Inactive', value: 'inactive', count: drivers.value.length - activeCount }
      ]
    })
    
    const filteredDrivers = computed(() => {
      let filtered = drivers.value
      
      if (selectedFilter.value === 'online') {
        filtered = filtered.filter(driver => driver.is_online)
      } else if (selectedFilter.value === 'offline') {
        filtered = filtered.filter(driver => !driver.is_online)
      } else if (selectedFilter.value === 'active') {
        filtered = filtered.filter(driver => driver.is_active !== false)
      } else if (selectedFilter.value === 'inactive') {
        filtered = filtered.filter(driver => driver.is_active === false)
      }
      
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(driver => 
          `${driver.first_name} ${driver.last_name}`.toLowerCase().includes(query) ||
          driver.email.toLowerCase().includes(query) ||
          driver.contact_number?.includes(query)
        )
      }
      
      return filtered
    })
    
    const totalPages = computed(() => {
      return Math.ceil(filteredDrivers.value.length / itemsPerPage)
    })
    
    const paginatedDrivers = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return filteredDrivers.value.slice(start, end)
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
    
    const loadDrivers = async () => {
      try {
        loading.value = true
        
        // Get driver profiles with user data
        const { data: driverProfiles, error: profileError } = await supabase
          .from('driver_profiles')
          .select(`
            *,
            user_profiles!inner (
              first_name,
              last_name,
              email,
              contact_number,
              address,
              created_at
            )
          `)
        
        if (profileError) throw profileError
        
        // Get driver statistics
        const driversWithStats = await Promise.all(
          (driverProfiles || []).map(async (driver) => {
            // Get order statistics
            const { data: orders } = await supabase
              .from('orders')
              .select('delivery_fee, status')
              .eq('driver_id', driver.user_id)
            
            const completedOrders = orders?.filter(order => order.status === 'delivered') || []
            
            return {
              ...driver,
              ...driver.user_profiles,
              completed_deliveries: completedOrders.length,
              total_earnings: completedOrders.reduce((sum, order) => sum + (order.delivery_fee || 0), 0),
              rating: 4.8 // Mock rating - implement actual rating system
            }
          })
        )
        
        drivers.value = driversWithStats
      } catch (error) {
        console.error('Error loading drivers:', error)
      } finally {
        loading.value = false
      }
    }
    
    const refreshDrivers = async () => {
      await loadDrivers()
    }
    
    const viewDriverDetails = (driver) => {
      selectedDriver.value = driver
      showDetailsModal.value = true
    }
    
    const closeDetailsModal = () => {
      showDetailsModal.value = false
      selectedDriver.value = null
    }
    
    const viewDriverDocuments = (driver) => {
      selectedDriver.value = driver
      showDocumentsModal.value = true
    }
    
    const closeDocumentsModal = () => {
      showDocumentsModal.value = false
      selectedDriver.value = null
    }
    
    const viewFullImage = (imageUrl) => {
      selectedImage.value = imageUrl
      showImageModal.value = true
    }
    
    const closeImageModal = () => {
      showImageModal.value = false
      selectedImage.value = ''
    }
    
    const viewDriverOrders = async (driver) => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('driver_id', driver.user_id)
          .order('created_at', { ascending: false })
          .limit(20)
        
        if (error) throw error
        
        driverOrders.value = data || []
        selectedDriver.value = driver
        showOrdersModal.value = true
      } catch (error) {
        console.error('Error loading driver orders:', error)
      }
    }
    
    const closeOrdersModal = () => {
      showOrdersModal.value = false
      selectedDriver.value = null
      driverOrders.value = []
    }
    
    const showDriverActions = (driver) => {
      viewDriverDetails(driver)
    }
    
    const toggleDriverStatus = async () => {
      if (!selectedDriver.value) return
      
      const newStatus = !selectedDriver.value.is_active
      
      try {
        const { error } = await supabase
          .from('driver_profiles')
          .update({ is_active: newStatus })
          .eq('user_id', selectedDriver.value.user_id)
        
        if (error) throw error
        
        selectedDriver.value.is_active = newStatus
        
        // Update in drivers list
        const driverIndex = drivers.value.findIndex(d => d.user_id === selectedDriver.value.user_id)
        if (driverIndex !== -1) {
          drivers.value[driverIndex].is_active = newStatus
        }
        
        alert(`Driver ${newStatus ? 'activated' : 'deactivated'} successfully!`)
      } catch (error) {
        console.error('Error updating driver status:', error)
        alert('Error updating driver status: ' + error.message)
      }
    }
    
    const exportDrivers = () => {
      const headers = ['Name', 'Email', 'Contact', 'Status', 'Deliveries', 'Rating', 'Earnings', 'Joined']
      const csvContent = [
        headers.join(','),
        ...filteredDrivers.value.map(driver => [
          `${driver.first_name} ${driver.last_name}`,
          driver.email,
          driver.contact_number,
          driver.is_online ? 'Online' : 'Offline',
          driver.completed_deliveries,
          driver.rating,
          driver.total_earnings,
          formatDate(driver.created_at)
        ].join(','))
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `drivers_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    }
    
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
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
    
    onMounted(() => {
      loadDrivers()
    })
    
    return {
      loading,
      drivers,
      driverOrders,
      selectedFilter,
      searchQuery,
      currentPage,
      statusFilters,
      filteredDrivers,
      paginatedDrivers,
      totalPages,
      visiblePages,
      showDetailsModal,
      showDocumentsModal,
      showImageModal,
      showOrdersModal,
      selectedDriver,
      selectedImage,
      refreshDrivers,
      viewDriverDetails,
      closeDetailsModal,
      viewDriverDocuments,
      closeDocumentsModal,
      viewFullImage,
      closeImageModal,
      viewDriverOrders,
      closeOrdersModal,
      showDriverActions,
      toggleDriverStatus,
      exportDrivers,
      formatDate,
      formatDateTime,
      formatStatus,
      getStatusClass
    }
  }
}
</script>
