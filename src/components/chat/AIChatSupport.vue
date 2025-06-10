<template>
  <!-- Floating Chat Button -->
  <div
    v-if="!isOpen"
    @click="openChat"
    class="fixed bottom-6 right-6 w-14 h-14 bg-green-600 hover:bg-green-700 rounded-full shadow-lg cursor-pointer flex items-center justify-center z-50 transition-all duration-300 hover:scale-110"
  >
    <i class="fas fa-comments text-white text-xl"></i>
    <div v-if="hasUnreadMessages" class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
      <span class="text-white text-xs">!</span>
    </div>
  </div>

  <!-- Chat Window -->
  <div
    v-if="isOpen"
    class="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl z-50 flex flex-col border border-gray-200"
  >
    <!-- Chat Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-green-600 text-white rounded-t-lg">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <i class="fas fa-robot text-white text-sm"></i>
        </div>
        <div>
          <h3 class="font-medium">DeliveryHub Assistant</h3>
          <p class="text-xs opacity-90">{{ isTyping ? 'Typing...' : 'Online' }}</p>
        </div>
      </div>
      <button
        @click="closeChat"
        class="text-white hover:text-gray-200 focus:outline-none"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <!-- Messages -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
      <!-- Welcome Message -->
      <div v-if="messages.length === 0" class="flex justify-start">
        <div class="max-w-xs bg-gray-100 rounded-lg p-3">
          <p class="text-sm text-gray-800">
            Hi {{ userProfile?.first_name || 'there' }}! 👋 What can we deliver for you today?
          </p>
          <div class="mt-3 space-y-2">
            <button
              v-for="suggestion in quickSuggestions"
              :key="suggestion.text"
              @click="sendQuickMessage(suggestion.text)"
              class="block w-full text-left text-xs bg-white hover:bg-gray-50 border border-gray-200 rounded px-2 py-1 transition-colors"
            >
              {{ suggestion.text }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Chat Messages -->
      <div
        v-for="message in messages"
        :key="message.id"
        class="flex"
        :class="message.isUser ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-xs rounded-lg p-3 text-sm"
          :class="
            message.isUser
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-800'
          "
        >
          <p v-html="message.text"></p>
          <p class="text-xs mt-1 opacity-75">
            {{ formatTime(message.timestamp) }}
          </p>
        </div>
      </div>
      
      <!-- Typing Indicator -->
      <div v-if="isTyping" class="flex justify-start">
        <div class="max-w-xs bg-gray-100 rounded-lg p-3">
          <div class="flex space-x-1">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Message Input -->
    <div class="p-4 border-t border-gray-200">
      <form @submit.prevent="sendMessage" class="flex space-x-2">
        <input
          v-model="newMessage"
          type="text"
          placeholder="Type your message..."
          class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          :disabled="isTyping"
        />
        <button
          type="submit"
          :disabled="!newMessage.trim() || isTyping"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i class="fas fa-paper-plane"></i>
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, nextTick, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useOrders } from '@/composables/useOrders'
import { useRouter } from 'vue-router'

export default {
  name: 'AIChatSupport',
  setup() {
    const { userProfile } = useAuth()
    const { orders, getUserOrders } = useOrders()
    const router = useRouter()
    
    const isOpen = ref(false)
    const messages = ref([])
    const newMessage = ref('')
    const isTyping = ref(false)
    const hasUnreadMessages = ref(false)
    const messagesContainer = ref(null)
    
    const quickSuggestions = [
      { text: 'How to book a service?', action: 'faq_booking' },
      { text: 'Track my order', action: 'track_order' },
      { text: 'Delivery fees', action: 'faq_fees' },
      { text: 'Cancel order', action: 'faq_cancel' }
    ]
    
    const openChat = () => {
      isOpen.value = true
      hasUnreadMessages.value = false
    }
    
    const closeChat = () => {
      isOpen.value = false
    }
    
    const sendMessage = async () => {
      if (!newMessage.value.trim()) return
      
      const userMessage = {
        id: Date.now(),
        text: newMessage.value,
        isUser: true,
        timestamp: new Date()
      }
      
      messages.value.push(userMessage)
      const messageText = newMessage.value
      newMessage.value = ''
      
      await scrollToBottom()
      await processMessage(messageText)
    }
    
    const sendQuickMessage = async (text) => {
      newMessage.value = text
      await sendMessage()
    }
    
    const processMessage = async (message) => {
      isTyping.value = true
      
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const response = await generateAIResponse(message)
      
      const aiMessage = {
        id: Date.now(),
        text: response.text,
        isUser: false,
        timestamp: new Date()
      }
      
      messages.value.push(aiMessage)
      isTyping.value = false
      
      // Execute any actions
      if (response.action) {
        executeAction(response.action)
      }
      
      await scrollToBottom()
    }
    
    const generateAIResponse = async (message) => {
      const lowerMessage = message.toLowerCase()
      
      // Intent Recognition
      if (lowerMessage.includes('track') || lowerMessage.includes('where') || lowerMessage.includes('status')) {
        return await handleTrackOrder()
      }
      
      if (lowerMessage.includes('book') || lowerMessage.includes('order') || lowerMessage.includes('service')) {
        return handleBookService(lowerMessage)
      }
      
      if (lowerMessage.includes('cancel')) {
        return handleCancelOrder()
      }
      
      if (lowerMessage.includes('fee') || lowerMessage.includes('cost') || lowerMessage.includes('price')) {
        return handleDeliveryFees()
      }
      
      if (lowerMessage.includes('food') || lowerMessage.includes('restaurant')) {
        return {
          text: "🍽️ I can help you order food! We deliver from various restaurants in Calapan City. Would you like me to open the food delivery booking form?",
          action: { type: 'suggest_service', service: 'Food Delivery' }
        }
      }
      
      if (lowerMessage.includes('medicine') || lowerMessage.includes('pharmacy')) {
        return {
          text: "💊 Need medicines? I can help you get them delivered from nearby pharmacies. Shall I open the medicine delivery form?",
          action: { type: 'suggest_service', service: 'Medicines' }
        }
      }
      
      if (lowerMessage.includes('grocery') || lowerMessage.includes('groceries')) {
        return {
          text: "🛒 I can help you with grocery shopping! Just provide your list and budget, and we'll get everything delivered. Want to start?",
          action: { type: 'suggest_service', service: 'Grocery' }
        }
      }
      
      if (lowerMessage.includes('bill') || lowerMessage.includes('payment')) {
        return {
          text: "💳 I can help you pay bills! We support electricity, water, internet, and other utility bills. Would you like to proceed?",
          action: { type: 'suggest_service', service: 'Pay Bills' }
        }
      }
      
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return {
          text: `Hello ${userProfile.value?.first_name || 'there'}! 👋 I'm here to help you with deliveries. What would you like me to help you with today?`
        }
      }
      
      if (lowerMessage.includes('help')) {
        return {
          text: `I can help you with:
          <br>• 📦 Booking delivery services
          <br>• 📍 Tracking your orders
          <br>• 💰 Understanding delivery fees
          <br>• ❌ Canceling orders
          <br>• 🍽️ Food delivery
          <br>• 💊 Medicine delivery
          <br>• 🛒 Grocery shopping
          <br>• 💳 Bill payments
          <br><br>What would you like to know more about?`
        }
      }
      
      // Default response
      return {
        text: `I understand you're asking about "${message}". Let me help you with that! Here are some things I can assist you with:
        <br><br>• Book a new delivery service
        <br>• Track your current orders
        <br>• Answer questions about our services
        <br>• Help with delivery fees
        <br><br>What would you like to do?`
      }
    }
    
    const handleTrackOrder = async () => {
      // Load user orders if not already loaded
      if (userProfile.value?.user_id && orders.value.length === 0) {
        await getUserOrders(userProfile.value.user_id)
      }
      
      const activeOrders = orders.value.filter(order => 
        ['placed', 'assigned', 'picked_up', 'in_transit'].includes(order.status)
      )
      
      if (activeOrders.length === 0) {
        return {
          text: "📦 You don't have any active orders right now. Would you like to book a new service?",
          action: { type: 'suggest_booking' }
        }
      }
      
      let response = "📍 Here are your active orders:<br><br>"
      activeOrders.forEach(order => {
        response += `• Order #${order.id} - ${order.service_type}<br>`
        response += `  Status: ${order.status.replace('_', ' ').toUpperCase()}<br>`
        response += `  Fee: ₱${order.delivery_fee}<br><br>`
      })
      
      return {
        text: response + "Would you like to view detailed tracking for any order?",
        action: { type: 'suggest_orders_page' }
      }
    }
    
    const handleBookService = (message) => {
      const services = {
        'food': 'Food Delivery',
        'medicine': 'Medicines',
        'grocery': 'Grocery',
        'bill': 'Pay Bills',
        'pickup': 'Pick-up',
        'surprise': 'Surprise Delivery',
        'pabili': 'Pabili'
      }
      
      for (const [key, service] of Object.entries(services)) {
        if (message.includes(key)) {
          return {
            text: `Great! I can help you book ${service}. Let me open the booking form for you.`,
            action: { type: 'open_booking', service }
          }
        }
      }
      
      return {
        text: `I can help you book any of our services:
        <br>• 🍽️ Food Delivery
        <br>• 💊 Medicines
        <br>• 🛒 Grocery
        <br>• 💳 Pay Bills
        <br>• 📦 Pick-up
        <br>• 🎁 Surprise Delivery
        <br>• 🛍️ Pabili
        <br><br>Which service would you like to book?`,
        action: { type: 'suggest_booking' }
      }
    }
    
    const handleCancelOrder = () => {
      return {
        text: `To cancel an order:
        <br>• Go to "My Orders" page
        <br>• Find your order
        <br>• Click "Cancel Order" (only available before pickup)
        <br><br>Note: Orders can only be cancelled before the driver picks them up. Would you like me to show your orders?`,
        action: { type: 'suggest_orders_page' }
      }
    }
    
    const handleDeliveryFees = () => {
      return {
        text: `💰 Our delivery fees are calculated as:
        <br>• Base fee: ₱50
        <br>• Distance fee: ₱15 per kilometer
        <br>• Service type may affect pricing
        <br><br>Example: 3km delivery = ₱50 + (₱15 × 3) = ₱95
        <br><br>The exact fee will be calculated when you book a service based on your pickup and delivery locations.`
      }
    }
    
    const executeAction = (action) => {
      if (!action) return
      
      switch (action.type) {
        case 'open_booking':
          router.push({
            path: '/user/book-service',
            query: action.service ? { service: action.service } : {}
          })
          closeChat()
          break
        case 'suggest_booking':
          router.push('/user/book-service')
          closeChat()
          break
        case 'suggest_orders_page':
          router.push('/user/orders')
          closeChat()
          break
        case 'suggest_service':
          router.push({
            path: '/user/book-service',
            query: { service: action.service }
          })
          closeChat()
          break
      }
    }
    
    const scrollToBottom = async () => {
      await nextTick()
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    }
    
    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    onMounted(() => {
      // Load user orders for better chat responses
      if (userProfile.value?.user_id) {
        getUserOrders(userProfile.value.user_id)
      }
    })
    
    return {
      isOpen,
      messages,
      newMessage,
      isTyping,
      hasUnreadMessages,
      messagesContainer,
      quickSuggestions,
      userProfile,
      openChat,
      closeChat,
      sendMessage,
      sendQuickMessage,
      formatTime
    }
  }
}
</script>
