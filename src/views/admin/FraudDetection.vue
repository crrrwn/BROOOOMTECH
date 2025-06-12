<template>
  <div>
    <Navbar />
    
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">AI Fraud Detection</h1>
          <p class="mt-2 text-gray-600">Monitor and manage suspicious activities</p>
        </div>
        
        <!-- Alert Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">High Risk Users</p>
                <p class="text-2xl font-bold text-gray-900">{{ fraudStats.highRisk }}</p>
                <p class="text-sm text-red-600">Requires immediate attention</p>
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-flag text-yellow-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Flagged Orders</p>
                <p class="text-2xl font-bold text-gray-900">{{ fraudStats.flaggedOrders }}</p>
                <p class="text-sm text-yellow-600">Under review</p>
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-ban text-orange-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Excessive Cancellations</p>
                <p class="text-2xl font-bold text-gray-900">{{ fraudStats.excessiveCancellations }}</p>
                <p class="text-sm text-orange-600">Above threshold</p>
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-map-marker-alt text-purple-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Invalid Addresses</p>
                <p class="text-2xl font-bold text-gray-900">{{ fraudStats.invalidAddresses }}</p>
                <p class="text-sm text-purple-600">Fake/incomplete</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Filters -->
        <div class="card mb-6">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="filter in riskFilters"
                :key="filter.value"
                @click="selectedRiskLevel = filter.value"
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  selectedRiskLevel === filter.value
                    ? 'bg-red-600 text-white'
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
                v-model="selectedFraudType"
                class="input-field w-auto"
              >
                <option value="">All Fraud Types</option>
                <option value="excessive_cancellations">Excessive Cancellations</option>
                <option value="fake_addresses">Fake Addresses</option>
                <option value="failed_deliveries">Failed Deliveries</option>
                <option value="suspicious_patterns">Suspicious Patterns</option>
              </select>
              
              <button
                @click="refreshFraudData"
                class="btn-secondary"
                :disabled="loading"
              >
                <i class="fas fa-sync-alt mr-2" :class="{ 'fa-spin': loading }"></i>
                Refresh
              </button>
            </div>
          </div>
        </div>
        
        <!-- Flagged Users Table -->
        <div class="card">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900">Flagged Users</h2>
            <button
              @click="runFraudDetection"
              class="btn-primary"
              :disabled="loading"
            >
              <i class="fas fa-search mr-2"></i>
              Run AI Detection
            </button>
          </div>
          
          <LoadingSpinner v-if="loading && flaggedUsers.length === 0" />
          
          <div v-else-if="filteredFlaggedUsers.length === 0" class="text-center py-12">
            <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-shield-check text-gray-400 text-3xl"></i>
            </div>
            <h3 class="text-xl font-medium text-gray-900 mb-2">No fraud detected</h3>
            <p class="text-gray-500">All users appear to be legitimate</p>
          </div>
          
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Level
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fraud Indicators
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statistics
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="user in paginatedFlaggedUsers"
                  :key="user.user_id"
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div class="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                          <i class="fas fa-user text-red-600"></i>
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
                    <span :class="getRiskLevelClass(user.risk_level)">
                      {{ formatRiskLevel(user.risk_level) }}
                    </span>
                    <div class="text-xs text-gray-500 mt-1">
                      Score: {{ user.fraud_score }}/100
                    </div>
                  </td>
                  
                  <td class="px-6 py-4">
                    <div class="space-y-1">
                      <div
                        v-for="indicator in user.fraud_indicators"
                        :key="indicator.type"
                        class="flex items-center text-sm"
                      >
                        <i :class="getFraudIcon(indicator.type)" class="mr-2"></i>
                        <span class="text-gray-700">{{ indicator.description }}</span>
                        <span class="ml-2 text-red-600 font-medium">({{ indicator.severity }})</span>
                      </div>
                    </div>
                  </td>
                  
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                      <div>Orders: {{ user.total_orders }}</div>
                      <div>Cancellations: {{ user.cancellation_count }} ({{ user.cancellation_rate }}%)</div>
                      <div>Failed: {{ user.failed_deliveries }}</div>
                    </div>
                  </td>
                  
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex items-center space-x-2">
                      <button
                        @click="viewUserDetails(user)"
                        class="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <i class="fas fa-eye"></i>
                      </button>
                      
                      <button
                        @click="reviewUser(user)"
                        class="text-green-600 hover:text-green-900"
                        title="Review Case"
                      >
                        <i class="fas fa-gavel"></i>
                      </button>
                      
                      <button
                        @click="banUser(user)"
                        class="text-red-600 hover:text-red-900"
                        title="Ban User"
                      >
                        <i class="fas fa-ban"></i>
                      </button>
                      
                      <button
                        @click="dismissAlert(user)"
                        class="text-gray-600 hover:text-gray-900"
                        title="Dismiss Alert"
                      >
                        <i class="fas fa-times"></i>
                      </button>
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
                  <span class="font-medium">{{ Math.min(endIndex, filteredFlaggedUsers.length) }}</span>
                  of
                  <span class="font-medium">{{ filteredFlaggedUsers.length }}</span>
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
                        ? 'z-10 bg-red-50 border-red-500 text-red-600'
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
    
    <!-- User Review Modal -->
    <Modal
      :is-open="showReviewModal"
      title="Review Fraud Case"
      size="xl"
      @close="closeReviewModal"
      @confirm="submitReview"
    >
      <div v-if="selectedUser" class="space-y-6">
        <!-- User Information -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <h3 class="text-lg font-medium text-gray-900 mb-4">User Information</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm font-medium text-gray-500">Name</p>
              <p class="text-sm text-gray-900">{{ selectedUser.first_name }} {{ selectedUser.last_name }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Email</p>
              <p class="text-sm text-gray-900">{{ selectedUser.email }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Risk Score</p>
              <p class="text-sm text-gray-900">{{ selectedUser.fraud_score }}/100</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Risk Level</p>
              <span :class="getRiskLevelClass(selectedUser.risk_level)">
                {{ formatRiskLevel(selectedUser.risk_level) }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Fraud Indicators -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Fraud Indicators</h3>
          <div class="space-y-3">
            <div
              v-for="indicator in selectedUser.fraud_indicators"
              :key="indicator.type"
              class="flex items-start p-3 bg-red-50 rounded-lg"
            >
              <i :class="getFraudIcon(indicator.type)" class="mt-1 mr-3"></i>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">{{ indicator.description }}</p>
                <p class="text-xs text-gray-600 mt-1">{{ indicator.details }}</p>
                <span :class="[
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2',
                  indicator.severity === 'high' ? 'bg-red-100 text-red-800' :
                  indicator.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                ]">
                  {{ indicator.severity }} severity
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Review Decision -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Review Decision</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Action</label>
              <select
                v-model="reviewForm.action"
                class="mt-1 input-field"
              >
                <option value="">Select action</option>
                <option value="dismiss">Dismiss - False positive</option>
                <option value="monitor">Monitor - Keep watching</option>
                <option value="warn">Warn - Send warning to user</option>
                <option value="restrict">Restrict - Limit account features</option>
                <option value="ban">Ban - Permanently ban user</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                v-model="reviewForm.notes"
                rows="4"
                class="mt-1 input-field"
                placeholder="Add your review notes..."
              ></textarea>
            </div>
          </div>
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
  name: 'FraudDetection',
  components: {
    Navbar,
    LoadingSpinner,
    Modal
  },
  setup() {
    const loading = ref(false)
    const flaggedUsers = ref([])
    const selectedRiskLevel = ref('')
    const selectedFraudType = ref('')
    const currentPage = ref(1)
    const itemsPerPage = 20
    
    // Modals
    const showReviewModal = ref(false)
    const selectedUser = ref(null)
    
    const reviewForm = reactive({
      action: '',
      notes: ''
    })
    
    const fraudStats = reactive({
      highRisk: 0,
      flaggedOrders: 0,
      excessiveCancellations: 0,
      invalidAddresses: 0
    })
    
    const riskFilters = computed(() => {
      const riskCounts = flaggedUsers.value.reduce((acc, user) => {
        acc[user.risk_level] = (acc[user.risk_level] || 0) + 1
        return acc
      }, {})
      
      return [
        { label: 'All', value: '', count: flaggedUsers.value.length },
        { label: 'High Risk', value: 'high', count: riskCounts.high || 0 },
        { label: 'Medium Risk', value: 'medium', count: riskCounts.medium || 0 },
        { label: 'Low Risk', value: 'low', count: riskCounts.low || 0 }
      ]
    })
    
    const filteredFlaggedUsers = computed(() => {
      let filtered = flaggedUsers.value
      
      if (selectedRiskLevel.value) {
        filtered = filtered.filter(user => user.risk_level === selectedRiskLevel.value)
      }
      
      if (selectedFraudType.value) {
        filtered = filtered.filter(user => 
          user.fraud_indicators.some(indicator => indicator.type === selectedFraudType.value)
        )
      }
      
      return filtered
    })
    
    const totalPages = computed(() => {
      return Math.ceil(filteredFlaggedUsers.value.length / itemsPerPage)
    })
    
    const startIndex = computed(() => {
      return (currentPage.value - 1) * itemsPerPage
    })
    
    const endIndex = computed(() => {
      return startIndex.value + itemsPerPage
    })
    
    const paginatedFlaggedUsers = computed(() => {
      return filteredFlaggedUsers.value.slice(startIndex.value, endIndex.value)
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
    
    const runFraudDetection = async () => {
      loading.value = true
      
      try {
        // Get all users with their order statistics
        const { data: users, error: usersError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('role', 'user')
        
        if (usersError) throw usersError
        
        const flaggedUsersData = []
        
        for (const user of users) {
          // Get user's orders
          const { data: orders } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', user.user_id)
          
          if (!orders || orders.length === 0) continue
          
          const totalOrders = orders.length
          const cancelledOrders = orders.filter(order => order.status === 'cancelled')
          const failedDeliveries = orders.filter(order => order.status === 'failed')
          const cancellationRate = Math.round((cancelledOrders.length / totalOrders) * 100)
          
          const fraudIndicators = []
          let fraudScore = 0
          
          // Check for excessive cancellations
          if (cancellationRate > 30) {
            fraudIndicators.push({
              type: 'excessive_cancellations',
              description: `High cancellation rate: ${cancellationRate}%`,
              details: `${cancelledOrders.length} out of ${totalOrders} orders cancelled`,
              severity: cancellationRate > 50 ? 'high' : 'medium'
            })
            fraudScore += cancellationRate > 50 ? 30 : 20
          }
          
          // Check for failed deliveries
          if (failedDeliveries.length > 3) {
            fraudIndicators.push({
              type: 'failed_deliveries',
              description: `Multiple failed deliveries: ${failedDeliveries.length}`,
              details: 'Possible fake addresses or unavailable recipient',
              severity: failedDeliveries.length > 5 ? 'high' : 'medium'
            })
            fraudScore += failedDeliveries.length > 5 ? 25 : 15
          }
          
          // Check for suspicious address patterns
          const uniqueAddresses = new Set(orders.map(order => order.delivery_address))
          if (uniqueAddresses.size < totalOrders * 0.3) {
            fraudIndicators.push({
              type: 'fake_addresses',
              description: 'Limited address variety',
              details: `Only ${uniqueAddresses.size} unique addresses for ${totalOrders} orders`,
              severity: 'medium'
            })
            fraudScore += 15
          }
          
          // Check for rapid order patterns
          const recentOrders = orders.filter(order => {
            const orderDate = new Date(order.created_at)
            const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
            return orderDate > dayAgo
          })
          
          if (recentOrders.length > 10) {
            fraudIndicators.push({
              type: 'suspicious_patterns',
              description: 'Unusual order frequency',
              details: `${recentOrders.length} orders in the last 24 hours`,
              severity: 'high'
            })
            fraudScore += 20
          }
          
          // Only flag users with fraud indicators
          if (fraudIndicators.length > 0) {
            let riskLevel = 'low'
            if (fraudScore >= 50) riskLevel = 'high'
            else if (fraudScore >= 25) riskLevel = 'medium'
            
            flaggedUsersData.push({
              ...user,
              fraud_indicators: fraudIndicators,
              fraud_score: Math.min(fraudScore, 100),
              risk_level: riskLevel,
              total_orders: totalOrders,
              cancellation_count: cancelledOrders.length,
              cancellation_rate: cancellationRate,
              failed_deliveries: failedDeliveries.length
            })
          }
        }
        
        flaggedUsers.value = flaggedUsersData.sort((a, b) => b.fraud_score - a.fraud_score)
        
        // Update stats
        fraudStats.highRisk = flaggedUsersData.filter(u => u.risk_level === 'high').length
        fraudStats.flaggedOrders = flaggedUsersData.reduce((sum, u) => sum + u.total_orders, 0)
        fraudStats.excessiveCancellations = flaggedUsersData.filter(u => 
          u.fraud_indicators.some(i => i.type === 'excessive_cancellations')
        ).length
        fraudStats.invalidAddresses = flaggedUsersData.filter(u => 
          u.fraud_indicators.some(i => i.type === 'fake_addresses')
        ).length
        
      } catch (error) {
        console.error('Error running fraud detection:', error)
        alert('Error running fraud detection: ' + error.message)
      } finally {
        loading.value = false
      }
    }
    
    const refreshFraudData = async () => {
      await runFraudDetection()
    }
    
    const viewUserDetails = (user) => {
      // Navigate to user details in Users management
      window.open(`/admin/users?user=${user.user_id}`, '_blank')
    }
    
    const reviewUser = (user) => {
      selectedUser.value = user
      reviewForm.action = ''
      reviewForm.notes = ''
      showReviewModal.value = true
    }
    
    const closeReviewModal = () => {
      showReviewModal.value = false
      selectedUser.value = null
    }
    
    const submitReview = async () => {
      if (!reviewForm.action) {
        alert('Please select an action')
        return
      }
      
      try {
        // Log the review decision
        const reviewData = {
          user_id: selectedUser.value.user_id,
          admin_id: 'current_admin_id', // Replace with actual admin ID
          action: reviewForm.action,
          notes: reviewForm.notes,
          fraud_score: selectedUser.value.fraud_score,
          risk_level: selectedUser.value.risk_level,
          reviewed_at: new Date().toISOString()
        }
        
        // In a real implementation, save to fraud_reviews table
        console.log('Review submitted:', reviewData)
        
        // Apply the action
        if (reviewForm.action === 'ban') {
          await banUser(selectedUser.value)
        } else if (reviewForm.action === 'dismiss') {
          await dismissAlert(selectedUser.value)
        }
        
        alert('Review submitted successfully!')
        closeReviewModal()
        
      } catch (error) {
        console.error('Error submitting review:', error)
        alert('Error submitting review: ' + error.message)
      }
    }
    
    const banUser = async (user) => {
      if (!confirm(`Are you sure you want to ban ${user.first_name} ${user.last_name}?`)) return
      
      try {
        const { error } = await supabase
          .from('user_profiles')
          .update({ is_banned: true })
          .eq('user_id', user.user_id)
        
        if (error) throw error
        
        // Remove from flagged users list
        const index = flaggedUsers.value.findIndex(u => u.user_id === user.user_id)
        if (index !== -1) {
          flaggedUsers.value.splice(index, 1)
        }
        
        alert('User banned successfully!')
        
      } catch (error) {
        console.error('Error banning user:', error)
        alert('Error banning user: ' + error.message)
      }
    }
    
    const dismissAlert = async (user) => {
      // Remove from flagged users list
      const index = flaggedUsers.value.findIndex(u => u.user_id === user.user_id)
      if (index !== -1) {
        flaggedUsers.value.splice(index, 1)
      }
      
      alert('Alert dismissed')
    }
    
    const getRiskLevelClass = (riskLevel) => {
      const classes = {
        'high': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800',
        'medium': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
        'low': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'
      }
      return classes[riskLevel] || classes.low
    }
    
    const formatRiskLevel = (riskLevel) => {
      return riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1) + ' Risk'
    }
    
    const getFraudIcon = (type) => {
      const icons = {
        'excessive_cancellations': 'fas fa-ban text-red-500',
        'fake_addresses': 'fas fa-map-marker-alt text-purple-500',
        'failed_deliveries': 'fas fa-exclamation-triangle text-orange-500',
        'suspicious_patterns': 'fas fa-search text-blue-500'
      }
      return icons[type] || 'fas fa-flag text-gray-500'
    }
    
    onMounted(() => {
      runFraudDetection()
    })
    
    return {
      loading,
      flaggedUsers,
      selectedRiskLevel,
      selectedFraudType,
      currentPage,
      fraudStats,
      riskFilters,
      filteredFlaggedUsers,
      paginatedFlaggedUsers,
      totalPages,
      startIndex,
      endIndex,
      visiblePages,
      showReviewModal,
      selectedUser,
      reviewForm,
      runFraudDetection,
      refreshFraudData,
      viewUserDetails,
      reviewUser,
      closeReviewModal,
      submitReview,
      banUser,
      dismissAlert,
      getRiskLevelClass,
      formatRiskLevel,
      getFraudIcon
    }
  }
}
</script>
