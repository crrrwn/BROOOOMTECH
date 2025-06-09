<template>
  <div>
    <Navbar />
    
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Earnings</h1>
          <p class="mt-2 text-gray-600">Track your delivery earnings and performance</p>
        </div>
        
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-peso-sign text-green-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Today's Earnings</p>
                <p class="text-2xl font-bold text-gray-900">₱{{ todayStats.earnings }}</p>
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-calendar-week text-blue-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">This Week</p>
                <p class="text-2xl font-bold text-gray-900">₱{{ weekStats.earnings }}</p>
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-calendar text-purple-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">This Month</p>
                <p class="text-2xl font-bold text-gray-900">₱{{ monthStats.earnings }}</p>
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-check-circle text-yellow-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Total Deliveries</p>
                <p class="text-2xl font-bold text-gray-900">{{ totalDeliveries }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Performance Metrics -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div class="card">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Weekly Performance</h2>
            
            <div class="space-y-4">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700">Delivery Rate</span>
                  <span class="text-sm text-gray-500">{{ weekStats.deliveries }}/{{ weekStats.assigned }} orders</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-green-600 h-2 rounded-full" 
                    :style="{ width: `${(weekStats.deliveries / weekStats.assigned * 100) || 0}%` }"
                  ></div>
                </div>
              </div>
              
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700">Average Rating</span>
                  <span class="text-sm text-gray-500">{{ averageRating }}/5.0</span>
                </div>
                <div class="flex items-center space-x-1">
                  <i 
                    v-for="star in 5" 
                    :key="star"
                    :class="[
                      'fas fa-star',
                      star <= Math.floor(averageRating) ? 'text-yellow-400' : 'text-gray-300'
                    ]"
                  ></i>
                </div>
              </div>
              
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700">Average Delivery Time</span>
                  <span class="text-sm text-gray-500">{{ averageDeliveryTime }} mins</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-blue-600 h-2 rounded-full" 
                    :style="{ width: `${Math.min(averageDeliveryTime / 60 * 100, 100)}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="card">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Earnings Breakdown</h2>
            
            <div class="space-y-4">
              <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <i class="fas fa-check text-white text-sm"></i>
                  </div>
                  <span class="text-sm font-medium text-green-800">Completed Deliveries</span>
                </div>
                <span class="text-lg font-semibold text-green-600">₱{{ completedEarnings }}</span>
              </div>
              
              <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <i class="fas fa-gift text-white text-sm"></i>
                  </div>
                  <span class="text-sm font-medium text-blue-800">Bonuses & Tips</span>
                </div>
                <span class="text-lg font-semibold text-blue-600">₱{{ bonusEarnings }}</span>
              </div>
              
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <i class="fas fa-calculator text-white text-sm"></i>
                  </div>
                  <span class="text-sm font-medium text-gray-800">Platform Fee</span>
                </div>
                <span class="text-lg font-semibold text-gray-600">-₱{{ platformFee }}</span>
              </div>
              
              <div class="border-t border-gray-200 pt-4">
                <div class="flex items-center justify-between">
                  <span class="text-lg font-semibold text-gray-900">Net Earnings</span>
                  <span class="text-2xl font-bold text-green-600">₱{{ netEarnings }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Time Period Filter -->
        <div class="card mb-6">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-gray-900">Earnings History</h2>
            
            <div class="flex items-center space-x-4">
              <select
                v-model="selectedTimePeriod"
                class="input-field w-auto"
                @change="loadEarningsHistory"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="year">This Year</option>
              </select>
              
              <button
                @click="exportEarnings"
                class="btn-secondary"
              >
                <i class="fas fa-download mr-2"></i>
                Export
              </button>
            </div>
          </div>
        </div>
        
        <!-- Earnings History -->
        <div class="card">
          <LoadingSpinner v-if="loading" />
          
          <div v-else-if="earningsHistory.length === 0" class="text-center py-12">
            <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-chart-line text-gray-400 text-3xl"></i>
            </div>
            <h3 class="text-xl font-medium text-gray-900 mb-2">No earnings data</h3>
            <p class="text-gray-500">Complete some deliveries to see your earnings history</p>
          </div>
          
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Type
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Earnings
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="order in earningsHistory"
                  :key="order.id"
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatDate(order.delivered_at || order.created_at) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{{ order.id }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ order.service_type }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ order.user_profiles?.first_name }} {{ order.user_profiles?.last_name }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                    ₱{{ order.delivery_fee }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusClass(order.status)">
                      {{ formatStatus(order.status) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { supabase } from '@/composables/useSupabase'
import Navbar from '@/components/common/Navbar.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

export default {
  name: 'DriverEarnings',
  components: {
    Navbar,
    LoadingSpinner
  },
  setup() {
    const { userProfile } = useAuth()
    
    const loading = ref(false)
    const selectedTimePeriod = ref('month')
    const earningsHistory = ref([])
    const driverOrders = ref([])
    
    // Mock data - replace with real calculations
    const averageRating = ref(4.8)
    const averageDeliveryTime = ref(25)
    const bonusEarnings = ref(150)
    const platformFee = ref(200)
    
    const todayStats = computed(() => {
      const today = new Date().toDateString()
      const todayOrders = driverOrders.value.filter(order => 
        new Date(order.delivered_at || order.created_at).toDateString() === today &&
        order.status === 'delivered'
      )
      
      return {
        earnings: todayOrders.reduce((sum, order) => sum + (order.delivery_fee || 0), 0),
        deliveries: todayOrders.length
      }
    })
    
    const weekStats = computed(() => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      
      const weekOrders = driverOrders.value.filter(order => 
        new Date(order.created_at) >= weekAgo
      )
      
      const deliveredOrders = weekOrders.filter(order => order.status === 'delivered')
      
      return {
        earnings: deliveredOrders.reduce((sum, order) => sum + (order.delivery_fee || 0), 0),
        deliveries: deliveredOrders.length,
        assigned: weekOrders.length
      }
    })
    
    const monthStats = computed(() => {
      const monthAgo = new Date()
      monthAgo.setDate(monthAgo.getDate() - 30)
      
      const monthOrders = driverOrders.value.filter(order => 
        new Date(order.created_at) >= monthAgo &&
        order.status === 'delivered'
      )
      
      return {
        earnings: monthOrders.reduce((sum, order) => sum + (order.delivery_fee || 0), 0),
        deliveries: monthOrders.length
      }
    })
    
    const totalDeliveries = computed(() => {
      return driverOrders.value.filter(order => order.status === 'delivered').length
    })
    
    const completedEarnings = computed(() => {
      return driverOrders.value
        .filter(order => order.status === 'delivered')
        .reduce((sum, order) => sum + (order.delivery_fee || 0), 0)
    })
    
    const netEarnings = computed(() => {
      return completedEarnings.value + bonusEarnings.value - platformFee.value
    })
    
    const loadDriverOrders = async () => {
      try {
        loading.value = true
        
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            user_profiles:user_id (
              first_name,
              last_name
            )
          `)
          .eq('driver_id', userProfile.value.user_id)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        
        driverOrders.value = data || []
      } catch (error) {
        console.error('Error loading driver orders:', error)
      } finally {
        loading.value = false
      }
    }
    
    const loadEarningsHistory = async () => {
      try {
        loading.value = true
        
        let dateFilter = new Date()
        
        switch (selectedTimePeriod.value) {
          case 'week':
            dateFilter.setDate(dateFilter.getDate() - 7)
            break
          case 'month':
            dateFilter.setDate(dateFilter.getDate() - 30)
            break
          case '3months':
            dateFilter.setDate(dateFilter.getDate() - 90)
            break
          case 'year':
            dateFilter.setFullYear(dateFilter.getFullYear() - 1)
            break
        }
        
        const filteredOrders = driverOrders.value.filter(order => 
          new Date(order.created_at) >= dateFilter
        )
        
        earningsHistory.value = filteredOrders
      } catch (error) {
        console.error('Error loading earnings history:', error)
      } finally {
        loading.value = false
      }
    }
    
    const exportEarnings = () => {
      // Create CSV content
      const headers = ['Date', 'Order ID', 'Service Type', 'Customer', 'Earnings', 'Status']
      const csvContent = [
        headers.join(','),
        ...earningsHistory.value.map(order => [
          formatDate(order.delivered_at || order.created_at),
          order.id,
          order.service_type,
          `${order.user_profiles?.first_name || ''} ${order.user_profiles?.last_name || ''}`,
          order.delivery_fee,
          order.status
        ].join(','))
      ].join('\n')
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `earnings_${selectedTimePeriod.value}_${new Date().toISOString().split('T')[0]}.csv`
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
    
    const formatStatus = (status) => {
      return status.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    }
    
    const getStatusClass = (status) => {
      const classes = {
        'delivered': 'status-badge status-delivered',
        'cancelled': 'status-badge status-cancelled',
        'in_transit': 'status-badge status-in-transit'
      }
      return classes[status] || 'status-badge status-delivered'
    }
    
    onMounted(async () => {
      await loadDriverOrders()
      await loadEarningsHistory()
    })
    
    return {
      loading,
      selectedTimePeriod,
      earningsHistory,
      todayStats,
      weekStats,
      monthStats,
      totalDeliveries,
      completedEarnings,
      bonusEarnings,
      platformFee,
      netEarnings,
      averageRating,
      averageDeliveryTime,
      loadEarningsHistory,
      exportEarnings,
      formatDate,
      formatStatus,
      getStatusClass
    }
  }
}
</script>
