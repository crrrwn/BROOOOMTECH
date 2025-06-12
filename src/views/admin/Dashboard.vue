<template>
  <div>
    <Navbar />
    
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p class="mt-2 text-gray-600">Welcome to the DeliveryHub admin panel</p>
        </div>
        
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-shopping-bag text-blue-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Today's Orders</p>
                <p class="text-2xl font-bold text-gray-900">{{ todayStats.orders }}</p>
                <p class="text-sm text-gray-600">
                  <span :class="todayStats.ordersChange >= 0 ? 'text-green-600' : 'text-red-600'">
                    {{ todayStats.ordersChange >= 0 ? '+' : '' }}{{ todayStats.ordersChange }}%
                  </span>
                  from yesterday
                </p>
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-peso-sign text-green-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Today's Revenue</p>
                <p class="text-2xl font-bold text-gray-900">₱{{ todayStats.revenue.toLocaleString() }}</p>
                <p class="text-sm text-gray-600">
                  <span :class="todayStats.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'">
                    {{ todayStats.revenueChange >= 0 ? '+' : '' }}{{ todayStats.revenueChange }}%
                  </span>
                  from yesterday
                </p>
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-motorcycle text-yellow-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Active Drivers</p>
                <p class="text-2xl font-bold text-gray-900">{{ todayStats.activeDrivers }}</p>
                <p class="text-sm text-gray-600">
                  {{ todayStats.totalDrivers }} total drivers
                </p>
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-users text-purple-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">New Users</p>
                <p class="text-2xl font-bold text-gray-900">{{ todayStats.newUsers }}</p>
                <p class="text-sm text-gray-600">
                  {{ todayStats.totalUsers }} total users
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Charts and Analytics -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <!-- Order Status Overview -->
          <div class="card">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Order Status Overview</h2>
            
            <div class="space-y-4">
              <div
                v-for="status in orderStatusStats"
                :key="status.status"
                class="flex items-center justify-between"
              >
                <div class="flex items-center space-x-3">
                  <div :class="[
                    'w-4 h-4 rounded-full',
                    getStatusColor(status.status)
                  ]"></div>
                  <span class="text-sm font-medium text-gray-700">{{ formatStatus(status.status) }}</span>
                </div>
                <div class="flex items-center space-x-4">
                  <span class="text-sm text-gray-600">{{ status.count }}</span>
                  <div class="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      :class="[
                        'h-2 rounded-full',
                        getStatusColor(status.status).replace('bg-', 'bg-')
                      ]"
                      :style="{ width: `${(status.count / totalOrdersToday * 100)}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Revenue Chart -->
          <div class="card">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Weekly Revenue</h2>
            
            <div class="space-y-4">
              <div
                v-for="day in weeklyRevenue"
                :key="day.day"
                class="flex items-center justify-between"
              >
                <span class="text-sm font-medium text-gray-700">{{ day.day }}</span>
                <div class="flex items-center space-x-4">
                  <span class="text-sm text-gray-600">₱{{ day.revenue.toLocaleString() }}</span>
                  <div class="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      class="bg-green-600 h-2 rounded-full"
                      :style="{ width: `${(day.revenue / maxDailyRevenue * 100)}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Recent Activity -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Recent Orders -->
          <div class="card">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gray-900">Recent Orders</h2>
              <router-link to="/admin/orders" class="text-green-600 hover:text-green-700 font-medium">
                View all
              </router-link>
            </div>
            
            <LoadingSpinner v-if="loading.orders" />
            
            <div v-else-if="recentOrders.length === 0" class="text-center py-8">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-inbox text-gray-400 text-2xl"></i>
              </div>
              <p class="text-gray-500">No recent orders</p>
            </div>
            
            <div v-else class="space-y-4">
              <div
                v-for="order in recentOrders"
                :key="order.id"
                class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-green-300 transition-colors"
              >
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <i class="fas fa-box text-green-600 text-sm"></i>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">Order #{{ order.id }}</p>
                    <p class="text-xs text-gray-500">{{ order.service_type }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-gray-900">₱{{ order.delivery_fee }}</p>
                  <span :class="getStatusClass(order.status)">
                    {{ formatStatus(order.status) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Driver Applications -->
          <div class="card">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gray-900">Driver Applications</h2>
              <router-link to="/admin/driver-applications" class="text-green-600 hover:text-green-700 font-medium">
                View all
              </router-link>
            </div>
            
            <LoadingSpinner v-if="loading.applications" />
            
            <div v-else-if="recentApplications.length === 0" class="text-center py-8">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-user-clock text-gray-400 text-2xl"></i>
              </div>
              <p class="text-gray-500">No pending applications</p>
            </div>
            
            <div v-else class="space-y-4">
              <div
                v-for="application in recentApplications"
                :key="application.id"
                class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-green-300 transition-colors"
              >
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i class="fas fa-motorcycle text-blue-600 text-sm"></i>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">
                      {{ application.first_name }} {{ application.last_name }}
                    </p>
                    <p class="text-xs text-gray-500">{{ application.email }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-xs text-gray-500">{{ formatDate(application.applied_at) }}</p>
                  <span class="status-badge status-placed">
                    {{ application.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="mt-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <router-link
              to="/admin/orders"
              class="card text-center hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            >
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <i class="fas fa-list text-blue-600 text-xl"></i>
              </div>
              <h3 class="font-medium text-gray-900 text-sm">Manage Orders</h3>
            </router-link>
            
            <router-link
              to="/admin/drivers"
              class="card text-center hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            >
              <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <i class="fas fa-users text-yellow-600 text-xl"></i>
              </div>
              <h3 class="font-medium text-gray-900 text-sm">Manage Drivers</h3>
            </router-link>
            
            <router-link
              to="/admin/users"
              class="card text-center hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            >
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <i class="fas fa-user-friends text-purple-600 text-xl"></i>
              </div>
              <h3 class="font-medium text-gray-900 text-sm">Manage Users</h3>
            </router-link>
            
            <router-link
              to="/admin/fraud-detection"
              class="card text-center hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            >
              <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <i class="fas fa-shield-alt text-red-600 text-xl"></i>
              </div>
              <h3 class="font-medium text-gray-900 text-sm">Fraud Detection</h3>
            </router-link>
            
            <router-link
              to="/admin/dynamic-pricing"
              class="card text-center hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            >
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <i class="fas fa-chart-line text-green-600 text-xl"></i>
              </div>
              <h3 class="font-medium text-gray-900 text-sm">Dynamic Pricing</h3>
            </router-link>
            
            <router-link
              to="/admin/admin-management"
              class="card text-center hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            >
              <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <i class="fas fa-user-shield text-indigo-600 text-xl"></i>
              </div>
              <h3 class="font-medium text-gray-900 text-sm">Admin Accounts</h3>
            </router-link>
            
            <router-link
              to="/admin/driver-applications"
              class="card text-center hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            >
              <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <i class="fas fa-clipboard-check text-orange-600 text-xl"></i>
              </div>
              <h3 class="font-medium text-gray-900 text-sm">Applications</h3>
            </router-link>
            
            <router-link
              to="/admin/settings"
              class="card text-center hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            >
              <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <i class="fas fa-cog text-gray-600 text-xl"></i>
              </div>
              <h3 class="font-medium text-gray-900 text-sm">Settings</h3>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { supabase } from '@/composables/useSupabase'
import { useRealtime } from '@/composables/useRealtime'
import Navbar from '@/components/common/Navbar.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

export default {
  name: 'AdminDashboard',
  components: {
    Navbar,
    LoadingSpinner
  },
  setup() {
    const { subscribeToOrders, subscribeToDriverApplications } = useRealtime()
    
    const loading = reactive({
      orders: false,
      applications: false
    })
    
    const todayStats = reactive({
      orders: 0,
      revenue: 0,
      activeDrivers: 0,
      totalDrivers: 0,
      newUsers: 0,
      totalUsers: 0,
      ordersChange: 0,
      revenueChange: 0
    })
    
    const orderStatusStats = ref([])
    const weeklyRevenue = ref([])
    const recentOrders = ref([])
    const recentApplications = ref([])
    
    const totalOrdersToday = computed(() => {
      return orderStatusStats.value.reduce((sum, status) => sum + status.count, 0)
    })
    
    const maxDailyRevenue = computed(() => {
      return Math.max(...weeklyRevenue.value.map(day => day.revenue))
    })
    
    const loadDashboardStats = async () => {
      try {
        const today = new Date().toDateString()
        const yesterday = new Date(Date.now() - 86400000).toDateString()
        
        // Load today's orders
        const { data: todayOrders } = await supabase
          .from('orders')
          .select('*')
          .gte('created_at', new Date(today).toISOString())
        
        // Load yesterday's orders for comparison
        const { data: yesterdayOrders } = await supabase
          .from('orders')
          .select('*')
          .gte('created_at', new Date(yesterday).toISOString())
          .lt('created_at', new Date(today).toISOString())
        
        todayStats.orders = todayOrders?.length || 0
        todayStats.revenue = todayOrders?.reduce((sum, order) => sum + (order.delivery_fee || 0), 0) || 0
        
        const yesterdayOrderCount = yesterdayOrders?.length || 0
        const yesterdayRevenue = yesterdayOrders?.reduce((sum, order) => sum + (order.delivery_fee || 0), 0) || 0
        
        todayStats.ordersChange = yesterdayOrderCount > 0 
          ? Math.round(((todayStats.orders - yesterdayOrderCount) / yesterdayOrderCount) * 100) 
          : 0
        todayStats.revenueChange = yesterdayRevenue > 0 
          ? Math.round(((todayStats.revenue - yesterdayRevenue) / yesterdayRevenue) * 100) 
          : 0
        
        // Load driver stats
        const { data: drivers } = await supabase
          .from('driver_profiles')
          .select('is_online')
        
        todayStats.totalDrivers = drivers?.length || 0
        todayStats.activeDrivers = drivers?.filter(d => d.is_online)?.length || 0
        
        // Load user stats
        const { data: allUsers } = await supabase
          .from('user_profiles')
          .select('created_at')
        
        todayStats.totalUsers = allUsers?.length || 0
        todayStats.newUsers = allUsers?.filter(user => 
          new Date(user.created_at).toDateString() === today
        )?.length || 0
        
      } catch (error) {
        console.error('Error loading dashboard stats:', error)
      }
    }
    
    const loadOrderStatusStats = async () => {
      try {
        const today = new Date().toDateString()
        
        const { data: orders } = await supabase
          .from('orders')
          .select('status')
          .gte('created_at', new Date(today).toISOString())
        
        if (orders) {
          const statusCounts = orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1
            return acc
          }, {})
          
          orderStatusStats.value = Object.entries(statusCounts).map(([status, count]) => ({
            status,
            count
          }))
        }
      } catch (error) {
        console.error('Error loading order status stats:', error)
      }
    }
    
    const loadWeeklyRevenue = async () => {
      try {
        const weekDays = []
        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          weekDays.push({
            date: date.toDateString(),
            day: date.toLocaleDateString('en-US', { weekday: 'short' })
          })
        }
        
        const revenuePromises = weekDays.map(async (day) => {
          const { data: orders } = await supabase
            .from('orders')
            .select('delivery_fee')
            .gte('created_at', new Date(day.date).toISOString())
            .lt('created_at', new Date(new Date(day.date).getTime() + 86400000).toISOString())
            .eq('status', 'delivered')
          
          const revenue = orders?.reduce((sum, order) => sum + (order.delivery_fee || 0), 0) || 0
          
          return {
            day: day.day,
            revenue
          }
        })
        
        weeklyRevenue.value = await Promise.all(revenuePromises)
      } catch (error) {
        console.error('Error loading weekly revenue:', error)
      }
    }
    
    const loadRecentOrders = async () => {
      try {
        loading.orders = true
        
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5)
        
        if (error) throw error
        
        recentOrders.value = data || []
      } catch (error) {
        console.error('Error loading recent orders:', error)
      } finally {
        loading.orders = false
      }
    }
    
    const loadRecentApplications = async () => {
      try {
        loading.applications = true
        
        const { data, error } = await supabase
          .from('driver_applications')
          .select('*')
          .eq('status', 'pending')
          .order('applied_at', { ascending: false })
          .limit(5)
        
        if (error) throw error
        
        recentApplications.value = data || []
      } catch (error) {
        console.error('Error loading recent applications:', error)
      } finally {
        loading.applications = false
      }
    }
    
    const formatStatus = (status) => {
      return status.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    }
    
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
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
    
    const getStatusColor = (status) => {
      const colors = {
        'placed': 'bg-blue-500',
        'assigned': 'bg-yellow-500',
        'picked_up': 'bg-orange-500',
        'in_transit': 'bg-purple-500',
        'delivered': 'bg-green-500',
        'cancelled': 'bg-red-500'
      }
      return colors[status] || 'bg-gray-500'
    }
    
    let unsubscribeOrders = null
    let unsubscribeApplications = null
    
    onMounted(async () => {
      await Promise.all([
        loadDashboardStats(),
        loadOrderStatusStats(),
        loadWeeklyRevenue(),
        loadRecentOrders(),
        loadRecentApplications()
      ])
      
      // Subscribe to real-time updates
      unsubscribeOrders = subscribeToOrders(() => {
        loadDashboardStats()
        loadOrderStatusStats()
        loadRecentOrders()
      })
      
      unsubscribeApplications = subscribeToDriverApplications(() => {
        loadRecentApplications()
      })
    })
    
    onUnmounted(() => {
      if (unsubscribeOrders) unsubscribeOrders()
      if (unsubscribeApplications) unsubscribeApplications()
    })
    
    return {
      loading,
      todayStats,
      orderStatusStats,
      weeklyRevenue,
      recentOrders,
      recentApplications,
      totalOrdersToday,
      maxDailyRevenue,
      formatStatus,
      formatDate,
      getStatusClass,
      getStatusColor
    }
  }
}
</script>
