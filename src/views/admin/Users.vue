<template>
  <div>
    <Navbar />
    
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">User Management</h1>
          <p class="mt-2 text-gray-600">Manage customer accounts and activity</p>
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
              <select
                v-model="sortBy"
                class="input-field w-auto"
                @change="sortUsers"
              >
                <option value="created_at">Sort by Join Date</option>
                <option value="last_login">Sort by Last Login</option>
                <option value="first_name">Sort by Name</option>
                <option value="total_orders">Sort by Total Orders</option>
              </select>
              
              <button
                @click="refreshUsers"
                class="btn-secondary"
                :disabled="loading"
              >
                <i class="fas fa-sync-alt mr-2" :class="{ 'fa-spin': loading }"></i>
                Refresh
              </button>
              
              <button
                @click="exportUsers"
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
        
        <!-- Users Table -->
        <div class="card">
          <LoadingSpinner v-if="loading && users.length === 0" />
          
          <div v-else-if="filteredUsers.length === 0" class="text-center py-12">
            <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-users text-gray-400 text-3xl"></i>
            </div>
            <h3 class="text-xl font-medium text-gray-900 mb-2">No users found</h3>
            <p class="text-gray-500">
              {{ selectedFilter || searchQuery ? 'Try adjusting your filters' : 'No users have registered yet' }}
            </p>
          </div>
          
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Information
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="user in paginatedUsers"
                  :key="user.user_id"
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div class="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                          <i class="fas fa-user text-green-600"></i>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          {{ user.first_name }} {{ user.last_name }}
                        </div>
                        <div class="text-sm text-gray-500">
                          {{ user.email }}
                        </div>
                        <div class="text-xs text-gray-400">
                          ID: {{ user.user_id.slice(0, 8) }}...
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                      {{ user.contact_number }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ user.address ? truncateText(user.address, 30) : 'No address provided' }}
                    </div>
                  </td>
                  
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                      {{ user.total_orders || 0 }} orders
                    </div>
                    <div class="text-sm text-gray-500">
                      ₱{{ user.total_spent || 0 }} spent
                    </div>
                    <div class="text-xs text-gray-400">
                      Joined {{ formatDate(user.created_at) }}
                    </div>
                  </td>
                  
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      user.is_banned 
                        ? 'bg-red-100 text-red-800' 
                        : user.email_verified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    ]">
                      {{ getUserStatus(user) }}
                    </span>
                    <div v-if="user.last_login" class="text-xs text-gray-400 mt-1">
                      Last login: {{ formatDateTime(user.last_login) }}
                    </div>
                  </td>
                  
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex items-center space-x-2">
                      <button
                        @click="viewUserDetails(user)"
                        class="text-green-600 hover:text-green-900"
                        title="View Details"
                      >
                        <i class="fas fa-eye"></i>
                      </button>
                      
                      <button
                        @click="viewUserOrders(user)"
                        class="text-blue-600 hover:text-blue-900"
                        title="View Orders"
                      >
                        <i class="fas fa-shopping-bag"></i>
                      </button>
                      
                      <button
                        @click="sendUserMessage(user)"
                        class="text-purple-600 hover:text-purple-900"
                        title="Send Message"
                      >
                        <i class="fas fa-envelope"></i>
                      </button>
                      
                      <div class="relative">
                        <button
                          @click="showUserActions(user)"
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
                  <span class="font-medium">{{ Math.min(endIndex, filteredUsers.length) }}</span>
                  of
                  <span class="font-medium">{{ filteredUsers.length }}</span>
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
    
    <!-- User Details Modal -->
    <Modal
      :is-open="showDetailsModal"
      title="User Details"
      size="xl"
      :show-actions="false"
      @close="closeDetailsModal"
    >
      <div v-if="selectedUser" class="space-y-6">
        <!-- Personal Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
            <dl class="space-y-2">
              <div>
                <dt class="text-sm font-medium text-gray-500">Full Name</dt>
                <dd class="text-sm text-gray-900">
                  {{ selectedUser.first_name }} {{ selectedUser.middle_name }} {{ selectedUser.last_name }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Email</dt>
                <dd class="text-sm text-gray-900">{{ selectedUser.email }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Contact Number</dt>
                <dd class="text-sm text-gray-900">{{ selectedUser.contact_number }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Address</dt>
                <dd class="text-sm text-gray-900">{{ selectedUser.address || 'Not provided' }}</dd>
              </div>
            </dl>
          </div>
          
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
            <dl class="space-y-2">
              <div>
                <dt class="text-sm font-medium text-gray-500">User ID</dt>
                <dd class="text-sm text-gray-900 font-mono">{{ selectedUser.user_id }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Account Status</dt>
                <dd>
                  <span :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    selectedUser.is_banned 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  ]">
                    {{ selectedUser.is_banned ? 'Banned' : 'Active' }}
                  </span>
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Email Verified</dt>
                <dd class="text-sm text-gray-900">
                  {{ selectedUser.email_verified ? 'Yes' : 'No' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Member Since</dt>
                <dd class="text-sm text-gray-900">{{ formatDateTime(selectedUser.created_at) }}</dd>
              </div>
              <div v-if="selectedUser.last_login">
                <dt class="text-sm font-medium text-gray-500">Last Login</dt>
                <dd class="text-sm text-gray-900">{{ formatDateTime(selectedUser.last_login) }}</dd>
              </div>
            </dl>
          </div>
        </div>
        
        <!-- Activity Statistics -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Activity Statistics</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center p-4 bg-blue-50 rounded-lg">
              <p class="text-2xl font-bold text-blue-600">{{ selectedUser.total_orders || 0 }}</p>
              <p class="text-sm text-blue-800">Total Orders</p>
            </div>
            <div class="text-center p-4 bg-green-50 rounded-lg">
              <p class="text-2xl font-bold text-green-600">₱{{ selectedUser.total_spent || 0 }}</p>
              <p class="text-sm text-green-800">Total Spent</p>
            </div>
            <div class="text-center p-4 bg-yellow-50 rounded-lg">
              <p class="text-2xl font-bold text-yellow-600">{{ selectedUser.cancelled_orders || 0 }}</p>
              <p class="text-sm text-yellow-800">Cancelled Orders</p>
            </div>
            <div class="text-center p-4 bg-purple-50 rounded-lg">
              <p class="text-2xl font-bold text-purple-600">{{ selectedUser.avg_rating || 'N/A' }}</p>
              <p class="text-sm text-purple-800">Average Rating</p>
            </div>
          </div>
        </div>
        
        <!-- Admin Actions -->
        <div class="border-t border-gray-200 pt-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Admin Actions</h3>
          <div class="flex flex-wrap gap-2">
            <button
              @click="toggleUserBan"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium',
                selectedUser.is_banned
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
              ]"
            >
              {{ selectedUser.is_banned ? 'Unban User' : 'Ban User' }}
            </button>
            
            <button
              @click="resetUserPassword"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Reset Password
            </button>
            
            <button
              @click="viewUserOrders(selectedUser)"
              class="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
            >
              View Order History
            </button>
            
            <button
              @click="sendUserMessage(selectedUser)"
              class="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700"
            >
              Send Message
            </button>
          </div>
        </div>
      </div>
    </Modal>
    
    <!-- User Orders Modal -->
    <Modal
      :is-open="showOrdersModal"
      title="User Order History"
      size="xl"
      :show-actions="false"
      @close="closeOrdersModal"
    >
      <div v-if="userOrders.length === 0" class="text-center py-8">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-shopping-bag text-gray-400 text-2xl"></i>
        </div>
        <p class="text-gray-500">No orders found for this user</p>
      </div>
      
      <div v-else class="space-y-4 max-h-96 overflow-y-auto">
        <div
          v-for="order in userOrders"
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
    
    <!-- Send Message Modal -->
    <Modal
      :is-open="showMessageModal"
      title="Send Message to User"
      size="lg"
      @close="closeMessageModal"
      @confirm="sendMessage"
    >
      <div v-if="selectedUser" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Recipient: {{ selectedUser.first_name }} {{ selectedUser.last_name }}
          </label>
          <p class="text-sm text-gray-500">{{ selectedUser.email }}</p>
        </div>
        
        <div>
          <label for="message-subject" class="block text-sm font-medium text-gray-700">
            Subject
          </label>
          <input
            id="message-subject"
            v-model="messageForm.subject"
            type="text"
            class="mt-1 input-field"
            placeholder="Enter message subject"
          />
        </div>
        
        <div>
          <label for="message-content" class="block text-sm font-medium text-gray-700">
            Message
          </label>
          <textarea
            id="message-content"
            v-model="messageForm.content"
            rows="6"
            class="mt-1 input-field"
            placeholder="Enter your message..."
          ></textarea>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { supabase } from '@/composables/useSupabase'
import Navbar from '@/components/common/Navbar.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import Modal from '@/components/common/Modal.vue'

export default {
  name: 'AdminUsers',
  components: {
    Navbar,
    LoadingSpinner,
    Modal
  },
  setup() {
    const loading = ref(false)
    const users = ref([])
    const userOrders = ref([])
    
    const selectedFilter = ref('')
    const searchQuery = ref('')
    const sortBy = ref('created_at')
    const currentPage = ref(1)
    const itemsPerPage = 20
    
    // Modals
    const showDetailsModal = ref(false)
    const showOrdersModal = ref(false)
    const showMessageModal = ref(false)
    const selectedUser = ref(null)
    
    const messageForm = reactive({
      subject: '',
      content: ''
    })
    
    const statusFilters = computed(() => {
      const activeCount = users.value.filter(u => !u.is_banned).length
      const bannedCount = users.value.filter(u => u.is_banned).length
      const verifiedCount = users.value.filter(u => u.email_verified).length
      
      return [
        { label: 'All', value: '', count: users.value.length },
        { label: 'Active', value: 'active', count: activeCount },
        { label: 'Banned', value: 'banned', count: bannedCount },
        { label: 'Verified', value: 'verified', count: verifiedCount },
        { label: 'Unverified', value: 'unverified', count: users.value.length - verifiedCount }
      ]
    })
    
    const filteredUsers = computed(() => {
      let filtered = users.value
      
      if (selectedFilter.value === 'active') {
        filtered = filtered.filter(user => !user.is_banned)
      } else if (selectedFilter.value === 'banned') {
        filtered = filtered.filter(user => user.is_banned)
      } else if (selectedFilter.value === 'verified') {
        filtered = filtered.filter(user => user.email_verified)
      } else if (selectedFilter.value === 'unverified') {
        filtered = filtered.filter(user => !user.email_verified)
      }
      
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(user => 
          `${user.first_name} ${user.last_name}`.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.contact_number?.includes(query)
        )
      }
      
      return filtered
    })
    
    const totalPages = computed(() => {
      return Math.ceil(filteredUsers.value.length / itemsPerPage)
    })
    
    const startIndex = computed(() => {
      return (currentPage.value - 1) * itemsPerPage
    })
    
    const endIndex = computed(() => {
      return startIndex.value + itemsPerPage
    })
    
    const paginatedUsers = computed(() => {
      return filteredUsers.value.slice(startIndex.value, endIndex.value)
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
    
    const loadUsers = async () => {
      try {
        loading.value = true
        
        // Get user profiles
        const { data: userProfiles, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('role', 'user')
        
        if (profileError) throw profileError
        
        // Get user statistics
        const usersWithStats = await Promise.all(
          (userProfiles || []).map(async (user) => {
            // Get order statistics
            const { data: orders } = await supabase
              .from('orders')
              .select('delivery_fee, status')
              .eq('user_id', user.user_id)
            
            const completedOrders = orders?.filter(order => order.status === 'delivered') || []
            const cancelledOrders = orders?.filter(order => order.status === 'cancelled') || []
            
            return {
              ...user,
              total_orders: orders?.length || 0,
              total_spent: completedOrders.reduce((sum, order) => sum + (order.delivery_fee || 0), 0),
              cancelled_orders: cancelledOrders.length,
              avg_rating: 4.8, // Mock rating - implement actual rating system
              is_banned: user.is_banned || false,
              email_verified: user.email_verified || false,
              last_login: user.last_login || null
            }
          })
        )
        
        users.value = usersWithStats
        sortUsers()
      } catch (error) {
        console.error('Error loading users:', error)
      } finally {
        loading.value = false
      }
    }
    
    const sortUsers = () => {
      users.value.sort((a, b) => {
        if (sortBy.value === 'created_at' || sortBy.value === 'last_login') {
          return new Date(b[sortBy.value] || 0) - new Date(a[sortBy.value] || 0)
        } else if (sortBy.value === 'first_name') {
          return a.first_name.localeCompare(b.first_name)
        } else if (sortBy.value === 'total_orders') {
          return (b.total_orders || 0) - (a.total_orders || 0)
        }
        return 0
      })
    }
    
    const refreshUsers = async () => {
      await loadUsers()
    }
    
    const viewUserDetails = (user) => {
      selectedUser.value = user
      showDetailsModal.value = true
    }
    
    const closeDetailsModal = () => {
      showDetailsModal.value = false
      selectedUser.value = null
    }
    
    const viewUserOrders = async (user) => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.user_id)
          .order('created_at', { ascending: false })
          .limit(20)
        
        if (error) throw error
        
        userOrders.value = data || []
        selectedUser.value = user
        showOrdersModal.value = true
      } catch (error) {
        console.error('Error loading user orders:', error)
      }
    }
    
    const closeOrdersModal = () => {
      showOrdersModal.value = false
      selectedUser.value = null
      userOrders.value = []
    }
    
    const sendUserMessage = (user) => {
      selectedUser.value = user
      messageForm.subject = ''
      messageForm.content = ''
      showMessageModal.value = true
    }
    
    const closeMessageModal = () => {
      showMessageModal.value = false
      selectedUser.value = null
      messageForm.subject = ''
      messageForm.content = ''
    }
    
    const sendMessage = async () => {
      if (!selectedUser.value || !messageForm.subject || !messageForm.content) {
        alert('Please fill in all fields')
        return
      }
      
      try {
        // In a real implementation, you would send the message via email or notification system
        // For now, we'll just show a success message
        alert(`Message sent to ${selectedUser.value.first_name} ${selectedUser.value.last_name}`)
        closeMessageModal()
      } catch (error) {
        console.error('Error sending message:', error)
        alert('Error sending message: ' + error.message)
      }
    }
    
    const showUserActions = (user) => {
      viewUserDetails(user)
    }
    
    const toggleUserBan = async () => {
      if (!selectedUser.value) return
      
      const newBanStatus = !selectedUser.value.is_banned
      const action = newBanStatus ? 'ban' : 'unban'
      
      if (!confirm(`Are you sure you want to ${action} this user?`)) return
      
      try {
        const { error } = await supabase
          .from('user_profiles')
          .update({ is_banned: newBanStatus })
          .eq('user_id', selectedUser.value.user_id)
        
        if (error) throw error
        
        selectedUser.value.is_banned = newBanStatus
        
        // Update in users list
        const userIndex = users.value.findIndex(u => u.user_id === selectedUser.value.user_id)
        if (userIndex !== -1) {
          users.value[userIndex].is_banned = newBanStatus
        }
        
        alert(`User ${action}ned successfully!`)
      } catch (error) {
        console.error('Error updating user ban status:', error)
        alert('Error updating user status: ' + error.message)
      }
    }
    
    const resetUserPassword = async () => {
      if (!selectedUser.value) return
      
      if (!confirm('Are you sure you want to send a password reset email to this user?')) return
      
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(selectedUser.value.email)
        
        if (error) throw error
        
        alert('Password reset email sent successfully!')
      } catch (error) {
        console.error('Error sending password reset:', error)
        alert('Error sending password reset: ' + error.message)
      }
    }
    
    const exportUsers = () => {
      const headers = ['Name', 'Email', 'Contact', 'Address', 'Total Orders', 'Total Spent', 'Status', 'Joined']
      const csvContent = [
        headers.join(','),
        ...filteredUsers.value.map(user => [
          `${user.first_name} ${user.last_name}`,
          user.email,
          user.contact_number,
          user.address || '',
          user.total_orders,
          user.total_spent,
          user.is_banned ? 'Banned' : 'Active',
          formatDate(user.created_at)
        ].join(','))
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `users_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    }
    
    const getUserStatus = (user) => {
      if (user.is_banned) return 'Banned'
      if (!user.email_verified) return 'Unverified'
      return 'Active'
    }
    
    const truncateText = (text, length) => {
      if (!text) return ''
      return text.length > length ? text.substring(0, length) + '...' : text
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
      loadUsers()
    })
    
    return {
      loading,
      users,
      userOrders,
      selectedFilter,
      searchQuery,
      sortBy,
      currentPage,
      statusFilters,
      filteredUsers,
      paginatedUsers,
      totalPages,
      startIndex,
      endIndex,
      visiblePages,
      showDetailsModal,
      showOrdersModal,
      showMessageModal,
      selectedUser,
      messageForm,
      refreshUsers,
      sortUsers,
      viewUserDetails,
      closeDetailsModal,
      viewUserOrders,
      closeOrdersModal,
      sendUserMessage,
      closeMessageModal,
      sendMessage,
      showUserActions,
      toggleUserBan,
      resetUserPassword,
      exportUsers,
      getUserStatus,
      truncateText,
      formatDate,
      formatDateTime,
      formatStatus,
      getStatusClass
    }
  }
}
</script>
