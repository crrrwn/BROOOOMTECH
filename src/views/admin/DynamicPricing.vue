<template>
  <div>
    <Navbar />
    
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">AI Dynamic Pricing Controls</h1>
          <p class="mt-2 text-gray-600">Configure and monitor intelligent pricing algorithms</p>
        </div>
        
        <!-- Current Pricing Overview -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-peso-sign text-green-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Base Fee</p>
                <p class="text-2xl font-bold text-gray-900">₱{{ pricingConfig.base_fee }}</p>
                <p class="text-sm text-green-600">Current rate</p>
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-route text-blue-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Per KM Rate</p>
                <p class="text-2xl font-bold text-gray-900">₱{{ pricingConfig.per_km_rate }}</p>
                <p class="text-sm text-blue-600">Distance pricing</p>
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-clock text-yellow-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Peak Multiplier</p>
                <p class="text-2xl font-bold text-gray-900">{{ pricingConfig.peak_hour_multiplier }}x</p>
                <p class="text-sm text-yellow-600">Rush hour surge</p>
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-motorcycle text-purple-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Driver Multiplier</p>
                <p class="text-2xl font-bold text-gray-900">{{ pricingConfig.driver_availability_multiplier }}x</p>
                <p class="text-sm text-purple-600">Low availability</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- AI Suggestions -->
        <div class="card mb-8" v-if="aiSuggestions.length > 0">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-xl font-semibold text-gray-900">AI Pricing Suggestions</h2>
              <p class="text-sm text-gray-600">Based on current market conditions and demand patterns</p>
            </div>
            <button
              @click="refreshSuggestions"
              class="btn-secondary"
              :disabled="loading.suggestions"
            >
              <i class="fas fa-sync-alt mr-2" :class="{ 'fa-spin': loading.suggestions }"></i>
              Refresh
            </button>
          </div>
          
          <div class="space-y-4">
            <div
              v-for="suggestion in aiSuggestions"
              :key="suggestion.id"
              class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors"
            >
              <div class="flex items-center space-x-4">
                <div :class="[
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  suggestion.priority === 'high' ? 'bg-red-100' :
                  suggestion.priority === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                ]">
                  <i :class="[
                    'fas',
                    suggestion.type === 'increase' ? 'fa-arrow-up' : 'fa-arrow-down',
                    suggestion.priority === 'high' ? 'text-red-600' :
                    suggestion.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                  ]"></i>
                </div>
                <div>
                  <h3 class="font-medium text-gray-900">{{ suggestion.title }}</h3>
                  <p class="text-sm text-gray-600">{{ suggestion.description }}</p>
                  <div class="flex items-center space-x-4 mt-2">
                    <span class="text-xs text-gray-500">
                      <i class="fas fa-chart-line mr-1"></i>
                      Expected impact: {{ suggestion.expected_impact }}
                    </span>
                    <span class="text-xs text-gray-500">
                      <i class="fas fa-clock mr-1"></i>
                      {{ suggestion.timeframe }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <button
                  @click="applySuggestion(suggestion)"
                  class="btn-primary text-sm"
                >
                  Apply
                </button>
                <button
                  @click="dismissSuggestion(suggestion)"
                  class="btn-outline text-sm"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Pricing Configuration -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <!-- Base Pricing Rules -->
          <div class="card">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Base Pricing Rules</h2>
            
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Base Delivery Fee (₱)
                </label>
                <input
                  v-model.number="pricingConfig.base_fee"
                  type="number"
                  min="0"
                  step="5"
                  class="input-field"
                />
                <p class="text-xs text-gray-500 mt-1">Minimum charge for any delivery</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Per Kilometer Rate (₱)
                </label>
                <input
                  v-model.number="pricingConfig.per_km_rate"
                  type="number"
                  min="0"
                  step="1"
                  class="input-field"
                />
                <p class="text-xs text-gray-500 mt-1">Additional charge per kilometer</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Delivery Distance (km)
                </label>
                <input
                  v-model.number="pricingConfig.max_distance"
                  type="number"
                  min="1"
                  max="100"
                  class="input-field"
                />
                <p class="text-xs text-gray-500 mt-1">Orders beyond this distance will be rejected</p>
              </div>
            </div>
          </div>
          
          <!-- Dynamic Multipliers -->
          <div class="card">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Dynamic Multipliers</h2>
            
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Peak Hour Multiplier
                </label>
                <input
                  v-model.number="pricingConfig.peak_hour_multiplier"
                  type="number"
                  min="1"
                  max="3"
                  step="0.1"
                  class="input-field"
                />
                <p class="text-xs text-gray-500 mt-1">Price increase during rush hours</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Driver Availability Multiplier
                </label>
                <input
                  v-model.number="pricingConfig.driver_availability_multiplier"
                  type="number"
                  min="1"
                  max="2"
                  step="0.1"
                  class="input-field"
                />
                <p class="text-xs text-gray-500 mt-1">Price increase when few drivers are available</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Weather Multiplier
                </label>
                <input
                  v-model.number="pricingConfig.weather_multiplier"
                  type="number"
                  min="1"
                  max="2"
                  step="0.1"
                  class="input-field"
                />
                <p class="text-xs text-gray-500 mt-1">Price increase during bad weather</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Peak Hours Configuration -->
        <div class="card mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Peak Hours Configuration</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Morning Peak Start
              </label>
              <input
                v-model="pricingConfig.morning_peak_start"
                type="time"
                class="input-field"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Morning Peak End
              </label>
              <input
                v-model="pricingConfig.morning_peak_end"
                type="time"
                class="input-field"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Lunch Peak Start
              </label>
              <input
                v-model="pricingConfig.lunch_peak_start"
                type="time"
                class="input-field"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Lunch Peak End
              </label>
              <input
                v-model="pricingConfig.lunch_peak_end"
                type="time"
                class="input-field"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Evening Peak Start
              </label>
              <input
                v-model="pricingConfig.evening_peak_start"
                type="time"
                class="input-field"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Evening Peak End
              </label>
              <input
                v-model="pricingConfig.evening_peak_end"
                type="time"
                class="input-field"
              />
            </div>
          </div>
        </div>
        
        <!-- Service Type Multipliers -->
        <div class="card mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Service Type Multipliers</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="service in serviceMultipliers"
              :key="service.type"
              class="p-4 border border-gray-200 rounded-lg"
            >
              <div class="flex items-center mb-3">
                <i :class="service.icon + ' text-green-600 mr-3'"></i>
                <h3 class="font-medium text-gray-900">{{ service.type }}</h3>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Multiplier
                </label>
                <input
                  v-model.number="service.multiplier"
                  type="number"
                  min="0.5"
                  max="2"
                  step="0.1"
                  class="input-field"
                />
                <p class="text-xs text-gray-500 mt-1">{{ service.description }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- AI Settings -->
        <div class="card mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">AI Pricing Settings</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div class="flex items-center justify-between mb-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">
                    Enable AI Dynamic Pricing
                  </label>
                  <p class="text-xs text-gray-500">
                    Allow AI to automatically adjust prices based on demand
                  </p>
                </div>
                <button
                  @click="toggleAIPricing"
                  :class="[
                    aiSettings.enabled 
                      ? 'bg-green-600' 
                      : 'bg-gray-200',
                    'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                  ]"
                >
                  <span
                    :class="[
                      aiSettings.enabled 
                        ? 'translate-x-5' 
                        : 'translate-x-0',
                      'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                    ]"
                  />
                </button>
              </div>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Auto Adjustment (%)
                  </label>
                  <input
                    v-model.number="aiSettings.max_adjustment"
                    type="number"
                    min="0"
                    max="100"
                    class="input-field"
                    :disabled="!aiSettings.enabled"
                  />
                  <p class="text-xs text-gray-500 mt-1">Maximum percentage AI can adjust prices</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Adjustment Frequency (minutes)
                  </label>
                  <select
                    v-model="aiSettings.adjustment_frequency"
                    class="input-field"
                    :disabled="!aiSettings.enabled"
                  >
                    <option value="5">Every 5 minutes</option>
                    <option value="15">Every 15 minutes</option>
                    <option value="30">Every 30 minutes</option>
                    <option value="60">Every hour</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div>
              <h3 class="text-sm font-medium text-gray-700 mb-4">AI Factors</h3>
              <div class="space-y-3">
                <div
                  v-for="factor in aiFactor"
                  :key="factor.name"
                  class="flex items-center justify-between"
                >
                  <div>
                    <label class="text-sm text-gray-700">{{ factor.label }}</label>
                    <p class="text-xs text-gray-500">{{ factor.description }}</p>
                  </div>
                  <button
                    @click="factor.enabled = !factor.enabled"
                    :class="[
                      factor.enabled 
                        ? 'bg-green-600' 
                        : 'bg-gray-200',
                      'relative inline-flex flex-shrink-0 h-5 w-9 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200'
                    ]"
                    :disabled="!aiSettings.enabled"
                  >
                    <span
                      :class="[
                        factor.enabled 
                          ? 'translate-x-4' 
                          : 'translate-x-0',
                        'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                      ]"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Save Button -->
        <div class="flex justify-end space-x-4">
          <button
            @click="resetToDefaults"
            class="btn-outline"
          >
            Reset to Defaults
          </button>
          
          <button
            @click="savePricingConfig"
            :disabled="loading.save"
            class="btn-primary"
          >
            <i v-if="loading.save" class="fas fa-spinner fa-spin mr-2"></i>
            <i v-else class="fas fa-save mr-2"></i>
            {{ loading.save ? 'Saving...' : 'Save Configuration' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { supabase } from '@/composables/useSupabase'
import Navbar from '@/components/common/Navbar.vue'

export default {
  name: 'DynamicPricing',
  components: {
    Navbar
  },
  setup() {
    const loading = reactive({
      save: false,
      suggestions: false
    })
    
    const pricingConfig = reactive({
      base_fee: 50,
      per_km_rate: 15,
      max_distance: 50,
      peak_hour_multiplier: 1.5,
      driver_availability_multiplier: 1.2,
      weather_multiplier: 1.3,
      morning_peak_start: '07:00',
      morning_peak_end: '09:00',
      lunch_peak_start: '12:00',
      lunch_peak_end: '14:00',
      evening_peak_start: '18:00',
      evening_peak_end: '20:00'
    })
    
    const serviceMultipliers = ref([
      {
        type: 'Food Delivery',
        icon: 'fas fa-utensils',
        multiplier: 1.0,
        description: 'Standard food delivery rate'
      },
      {
        type: 'Pay Bills',
        icon: 'fas fa-file-invoice-dollar',
        multiplier: 0.8,
        description: 'Discount for bill payments'
      },
      {
        type: 'Pick-up',
        icon: 'fas fa-hand-paper',
        multiplier: 1.0,
        description: 'Standard pickup rate'
      },
      {
        type: 'Surprise Delivery',
        icon: 'fas fa-gift',
        multiplier: 1.2,
        description: 'Premium for special handling'
      },
      {
        type: 'Medicines',
        icon: 'fas fa-pills',
        multiplier: 1.3,
        description: 'Premium for urgent items'
      },
      {
        type: 'Grocery',
        icon: 'fas fa-shopping-cart',
        multiplier: 1.1,
        description: 'Slightly higher for bulky items'
      },
      {
        type: 'Pabili',
        icon: 'fas fa-shopping-bag',
        multiplier: 1.0,
        description: 'Standard shopping rate'
      }
    ])
    
    const aiSettings = reactive({
      enabled: true,
      max_adjustment: 25,
      adjustment_frequency: 15
    })
    
    const aiFactor = ref([
      {
        name: 'demand',
        label: 'Order Demand',
        description: 'Adjust based on current order volume',
        enabled: true
      },
      {
        name: 'driver_availability',
        label: 'Driver Availability',
        description: 'Increase prices when few drivers online',
        enabled: true
      },
      {
        name: 'weather',
        label: 'Weather Conditions',
        description: 'Adjust for rain, storms, etc.',
        enabled: true
      },
      {
        name: 'time_of_day',
        label: 'Time of Day',
        description: 'Peak hour adjustments',
        enabled: true
      },
      {
        name: 'day_of_week',
        label: 'Day of Week',
        description: 'Weekend and holiday adjustments',
        enabled: true
      },
      {
        name: 'distance',
        label: 'Distance Surge',
        description: 'Extra charges for long distances',
        enabled: true
      }
    ])
    
    const aiSuggestions = ref([
      {
        id: 1,
        type: 'increase',
        priority: 'high',
        title: 'Increase Peak Hour Multiplier',
        description: 'High demand detected during lunch hours. Suggest increasing multiplier from 1.5x to 1.8x',
        expected_impact: '+15% revenue',
        timeframe: 'Next 2 hours',
        changes: {
          peak_hour_multiplier: 1.8
        }
      },
      {
        id: 2,
        type: 'decrease',
        priority: 'medium',
        title: 'Reduce Base Fee for Pay Bills',
        description: 'Low adoption for bill payment service. Suggest temporary reduction to boost usage',
        expected_impact: '+30% bill payment orders',
        timeframe: 'This week',
        changes: {
          service_multipliers: {
            'Pay Bills': 0.7
          }
        }
      },
      {
        id: 3,
        type: 'increase',
        priority: 'low',
        title: 'Weather Adjustment',
        description: 'Rain forecast for tomorrow. Consider enabling weather multiplier',
        expected_impact: '+10% driver retention',
        timeframe: 'Tomorrow',
        changes: {
          weather_multiplier: 1.4
        }
      }
    ])
    
    const loadPricingConfig = async () => {
      try {
        // Load pricing configuration from database
        const { data, error } = await supabase
          .from('pricing_config')
          .select('*')
          .single()
        
        if (error && error.code !== 'PGRST116') {
          throw error
        }
        
        if (data) {
          Object.assign(pricingConfig, data)
        }
      } catch (error) {
        console.error('Error loading pricing config:', error)
      }
    }
    
    const savePricingConfig = async () => {
      loading.save = true
      
      try {
        const { error } = await supabase
          .from('pricing_config')
          .upsert({
            ...pricingConfig,
            service_multipliers: serviceMultipliers.value,
            ai_settings: aiSettings,
            ai_factors: aiFactor.value,
            updated_at: new Date().toISOString()
          })
        
        if (error) throw error
        
        alert('Pricing configuration saved successfully!')
        
      } catch (error) {
        console.error('Error saving pricing config:', error)
        alert('Error saving configuration: ' + error.message)
      } finally {
        loading.save = false
      }
    }
    
    const refreshSuggestions = async () => {
      loading.suggestions = true
      
      try {
        // Simulate AI analysis
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // In a real implementation, this would call an AI service
        console.log('AI suggestions refreshed')
        
      } catch (error) {
        console.error('Error refreshing suggestions:', error)
      } finally {
        loading.suggestions = false
      }
    }
    
    const applySuggestion = async (suggestion) => {
      if (!confirm(`Apply this pricing suggestion?\n\n${suggestion.description}`)) return
      
      try {
        // Apply the suggested changes
        if (suggestion.changes.peak_hour_multiplier) {
          pricingConfig.peak_hour_multiplier = suggestion.changes.peak_hour_multiplier
        }
        
        if (suggestion.changes.weather_multiplier) {
          pricingConfig.weather_multiplier = suggestion.changes.weather_multiplier
        }
        
        if (suggestion.changes.service_multipliers) {
          Object.entries(suggestion.changes.service_multipliers).forEach(([serviceType, multiplier]) => {
            const service = serviceMultipliers.value.find(s => s.type === serviceType)
            if (service) {
              service.multiplier = multiplier
            }
          })
        }
        
        // Remove suggestion from list
        const index = aiSuggestions.value.findIndex(s => s.id === suggestion.id)
        if (index !== -1) {
          aiSuggestions.value.splice(index, 1)
        }
        
        alert('Suggestion applied successfully!')
        
      } catch (error) {
        console.error('Error applying suggestion:', error)
        alert('Error applying suggestion: ' + error.message)
      }
    }
    
    const dismissSuggestion = (suggestion) => {
      const index = aiSuggestions.value.findIndex(s => s.id === suggestion.id)
      if (index !== -1) {
        aiSuggestions.value.splice(index, 1)
      }
    }
    
    const toggleAIPricing = () => {
      aiSettings.enabled = !aiSettings.enabled
    }
    
    const resetToDefaults = () => {
      if (!confirm('Reset all pricing settings to default values?')) return
      
      pricingConfig.base_fee = 50
      pricingConfig.per_km_rate = 15
      pricingConfig.max_distance = 50
      pricingConfig.peak_hour_multiplier = 1.5
      pricingConfig.driver_availability_multiplier = 1.2
      pricingConfig.weather_multiplier = 1.3
      
      serviceMultipliers.value.forEach(service => {
        if (service.type === 'Food Delivery') service.multiplier = 1.0
        else if (service.type === 'Pay Bills') service.multiplier = 0.8
        else if (service.type === 'Pick-up') service.multiplier = 1.0
        else if (service.type === 'Surprise Delivery') service.multiplier = 1.2
        else if (service.type === 'Medicines') service.multiplier = 1.3
        else if (service.type === 'Grocery') service.multiplier = 1.1
        else if (service.type === 'Pabili') service.multiplier = 1.0
      })
      
      aiSettings.enabled = true
      aiSettings.max_adjustment = 25
      aiSettings.adjustment_frequency = 15
      
      aiFactor.value.forEach(factor => {
        factor.enabled = true
      })
    }
    
    onMounted(() => {
      loadPricingConfig()
    })
    
    return {
      loading,
      pricingConfig,
      serviceMultipliers,
      aiSettings,
      aiFactor,
      aiSuggestions,
      savePricingConfig,
      refreshSuggestions,
      applySuggestion,
      dismissSuggestion,
      toggleAIPricing,
      resetToDefaults
    }
  }
}
</script>
