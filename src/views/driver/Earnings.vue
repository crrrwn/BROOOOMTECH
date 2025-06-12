<template>
  <div>
    <Navbar />
    
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-md mx-auto px-4 py-6">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Earnings</h1>
          <p class="text-gray-600">Track your delivery earnings</p>
        </div>
        
        <!-- Summary Cards -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="bg-white rounded-lg p-4 shadow-sm">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-peso-sign text-green-600"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm text-gray-500">Today</p>
                <p class="text-lg font-bold text-gray-900">₱{{ todayEarnings }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg p-4 shadow-sm">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-calendar-week text-blue-600"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm text-gray-500">This Week</p>
                <p class="text-lg font-bold text-gray-900">₱{{ weeklyEarnings }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Daily Earnings -->
        <div class="bg-white rounded-lg p-4 shadow-sm mb-4">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">Daily Earnings</h2>
            <button
              @click="refreshEarnings"
              class="p-2 text-green-600 hover:bg-green-50 rounded-lg"
              :disabled="loading"
            >
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            </button>
          </div>
          
          <LoadingSpinner v-if="loading && dailyOrders.length === 0" />
          
          <div v-else-if="dailyOrders.length === 0" class="text-center py-8">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-chart-line text-gray-400 text-2xl"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No earnings today</h3>
            <p class="text-gray-500">Complete deliveries to start earning</p>
          </div>
          
          <div v-else>
            <div class="mb-4 p-3 bg-green-50 rounded-lg">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-green-800">Total Today</span>
                <span class="text-lg font-bold text-green-600">₱{{ todayEarnings }}</span>
              </div>
              <div class="flex items-center justify-between mt-1">
                <span class="text-xs text-green-700">{{ dailyOrders.length }} completed orders</span>
                <span class="text-xs text-green-700">Avg: ₱{{ Math.round(todayEarnings / dailyOrders.length) }}</span>
              </div>
            </div>
            
            <div class="space-y-3 max-h-64 overflow-y-auto">
              <div
                v-for="order in dailyOrders"
                :key="order.id"
                class="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-medium text-gray-900">Order #{{ order.id }}</p>
                    <span class="text-sm font-semibold text-green-600">₱{{ order.delivery_fee }}</span>
                  </div>
                  <p class="text-xs text-gray-500">{{ order.service_type }}</p>
                  <p class="text-xs text-gray-500">{{ formatTime(order.delivered_at || order.created_at) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Weekly Summary -->
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Weekly Summary</h2>
          
          <div v-if="weeklyOrders.length === 0" class="text-center py-8">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-calendar-week text-gray-400 text-2xl"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No earnings this week</h3>
            <p class="text-gray-500">Complete deliveries to see weekly summary</p>
          </div>
          
          <div v-else>
            <div class="mb-4 p-3 bg-blue-50 rounded-lg">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-blue-800">Total This Week</span>
                <span class="text-lg font-bold text-blue-600">₱{{ weeklyEarnings }}</span>
              </div>
              <div class="flex items-center justify-between mt-1">
                <span class="text-xs text-blue-700">{{ weeklyOrders.length }} completed orders</span>
                <span class="text-xs text-blue-700">Daily avg: ₱{{ Math.round(weeklyEarnings / 7) }}</span>
              </div>
            </div>
            
            <!-- Daily Breakdown -->
            <div class="space-y-2">
              <h3 class="text-sm font-medium text-gray-700 mb-2">Daily Breakdown</h3>
              <div
                v-for="day in weeklyBreakdown"
                :key="day.date"
                class="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ day.dayName }}</p>
                  <p class="text-xs text-gray-500">{{ day.orders }} orders</p>
                </div>
                <span class="text-sm font-semibold text-gray-900">₱{{ day.earnings }}</span>
              </div>
            </div>
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
    const driverOrders = ref([])
    
    const dailyOrders = computed(() => {
      const today = new Date().toDateString()
      return driverOrders.value.filter(order => 
        new Date(order.delivered_at || order.created_at).toDateString() === today &&
        order.status === 'delivered'
      )
    })
    
    const weeklyOrders = computed(() => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      
      return driverOrders.value.filter(order => 
        new Date(order.delivered_at || order.created_at) >= weekAgo &&
        order.status === 'delivered'
      )
    })
    
    const todayEarnings = computed(() => {
      return dailyOrders.value.reduce((sum, order) => sum + (order.delivery_fee || 0), 0)
    })
    
    const weeklyEarnings = computed(() => {
      return weeklyOrders.value.reduce((sum, order) => sum + (order.delivery_fee || 0), 0)
    })
    
    const weeklyBreakdown = computed(() => {
      const breakdown = []
      const today = new Date()
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateString = date.toDateString()
        
        const dayOrders = driverOrders.value.filter(order => 
          new Date(order.delivered_at || order.created_at).toDateString() === dateString &&
          order.status === 'delivered'
        )
        
        breakdown.push({
          date: dateString,
          dayName: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          orders: dayOrders.length,
          earnings: dayOrders.reduce((sum, order) => sum + (order.delivery_fee || 0), 0)
        })
      }
      
      return breakdown
    })
    
    const loadDriverOrders = async () => {
      try {
        loading.value = true
        
        const { data, error } = await supabase
          .from('orders')
          .select('*')
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
    
    const refreshEarnings = async () => {
      await loadDriverOrders()
    }
    
    const formatTime = (date) => {
      return new Date(date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }
    
    onMounted(async () => {
      await loadDriverOrders()
    })
    
    return {
      loading,
      dailyOrders,
      weeklyOrders,
      todayEarnings,
      weeklyEarnings,
      weeklyBreakdown,
      refreshEarnings,
      formatTime
    }
  }
}
</script>
