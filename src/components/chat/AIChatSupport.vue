<template>
  <!-- Floating Chat Button -->
  <div
    v-if="!isOpen"
    @click="openChat"
    class="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-full shadow-xl cursor-pointer flex items-center justify-center z-50 transition-all duration-300 hover:scale-110 animate-pulse"
  >
    <i class="fas fa-robot text-white text-2xl"></i>
    <div v-if="hasUnreadMessages" class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
      <span class="text-white text-xs font-bold">!</span>
    </div>
    <!-- Floating message preview -->
    <div class="absolute -top-12 -left-20 bg-white rounded-lg shadow-lg px-3 py-2 text-sm text-gray-700 opacity-90 pointer-events-none">
      <div class="flex items-center space-x-2">
        <i class="fas fa-comments text-green-500"></i>
        <span>Need help? Chat with AI!</span>
      </div>
      <div class="absolute bottom-0 left-8 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
    </div>
  </div>

  <!-- Chat Window -->
  <div
    v-if="isOpen"
    class="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col border border-gray-100 overflow-hidden"
  >
    <!-- Chat Header -->
    <div class="flex items-center justify-between p-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
      <div class="flex items-center space-x-3">
        <div class="relative">
          <div class="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <i class="fas fa-robot text-white text-lg"></i>
          </div>
          <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
        </div>
        <div>
          <h3 class="font-semibold text-lg">DeliveryHub AI</h3>
          <p class="text-xs opacity-90 flex items-center">
            <span class="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            {{ isTyping ? 'AI is thinking...' : 'Online & Ready to Help' }}
          </p>
        </div>
      </div>
      <button
        @click="closeChat"
        class="text-white hover:text-gray-200 focus:outline-none p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all"
      >
        <i class="fas fa-times text-lg"></i>
      </button>
    </div>
    
    <!-- Messages -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
      <!-- Welcome Message -->
      <div v-if="messages.length === 0" class="space-y-4">
        <div class="flex justify-start">
          <div class="max-w-xs bg-white rounded-2xl rounded-tl-md p-4 shadow-sm border">
            <div class="flex items-center space-x-2 mb-2">
              <i class="fas fa-robot text-green-500"></i>
              <span class="font-medium text-gray-800">DeliveryHub AI</span>
            </div>
            <p class="text-sm text-gray-700 mb-3">
              Hi {{ userProfile?.first_name || 'there' }}! 👋 I'm your AI delivery assistant. What can I help you with today?
            </p>
            <div class="space-y-2">
              <p class="text-xs text-gray-500 font-medium">Quick Actions:</p>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="suggestion in quickSuggestions"
                  :key="suggestion.text"
                  @click="sendQuickMessage(suggestion.text)"
                  class="text-left text-xs bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg px-3 py-2 transition-all duration-200 hover:shadow-sm"
                >
                  <i :class="suggestion.icon" class="text-green-500 mr-2"></i>
                  {{ suggestion.text }}
                </button>
              </div>
            </div>
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
        <div class="max-w-xs">
          <!-- User Message -->
          <div
            v-if="message.isUser"
            class="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl rounded-br-md p-3 shadow-sm"
          >
            <p class="text-sm" v-html="message.text"></p>
            <p class="text-xs mt-2 opacity-75">
              {{ formatTime(message.timestamp) }}
            </p>
          </div>
          
          <!-- AI Message -->
          <div v-else class="bg-white rounded-2xl rounded-tl-md p-4 shadow-sm border">
            <div class="flex items-center space-x-2 mb-2">
              <i class="fas fa-robot text-green-500 text-sm"></i>
              <span class="font-medium text-gray-800 text-sm">AI Assistant</span>
            </div>
            <p class="text-sm text-gray-700" v-html="message.text"></p>
            
            <!-- Action Buttons -->
            <div v-if="message.actions && message.actions.length > 0" class="mt-3 space-y-2">
              <button
                v-for="action in message.actions"
                :key="action.text"
                @click="executeAction(action)"
                class="block w-full text-left text-xs bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg px-3 py-2 transition-all duration-200 hover:shadow-sm"
              >
                <i :class="action.icon" class="text-green-500 mr-2"></i>
                {{ action.text }}
              </button>
            </div>
            
            <p class="text-xs mt-2 text-gray-400">
              {{ formatTime(message.timestamp) }}
            </p>
          </div>
        </div>
      </div>
      
      <!-- Typing Indicator -->
      <div v-if="isTyping" class="flex justify-start">
        <div class="bg-white rounded-2xl rounded-tl-md p-4 shadow-sm border">
          <div class="flex items-center space-x-2 mb-2">
            <i class="fas fa-robot text-green-500 text-sm"></i>
            <span class="font-medium text-gray-800 text-sm">AI Assistant</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="flex space-x-1">
              <div class="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-green-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
              <div class="w-2 h-2 bg-green-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
            <span class="text-xs text-gray-500">Thinking...</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Message Input -->
    <div class="p-4 border-t border-gray-200 bg-white">
      <form @submit.prevent="sendMessage" class="flex space-x-3">
        <div class="flex-1 relative">
          <input
            v-model="newMessage"
            type="text"
            placeholder="Type your message..."
            class="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm pr-12"
            :disabled="isTyping"
          />
          <button
            type="button"
            @click="toggleVoiceInput"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-500 transition-colors"
          >
            <i class="fas fa-microphone"></i>
          </button>
        </div>
        <button
          type="submit"
          :disabled="!newMessage.trim() || isTyping"
          class="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <i class="fas fa-paper-plane"></i>
        </button>
      </form>
      
      <!-- Suggested Responses -->
      <div v-if="suggestedResponses.length > 0" class="mt-3">
        <p class="text-xs text-gray-500 mb-2">Suggested:</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="suggestion in suggestedResponses"
            :key="suggestion"
            @click="sendQuickMessage(suggestion)"
            class="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full px-3 py-1 transition-colors"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, nextTick, onMounted, computed } from 'vue'
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
    const suggestedResponses = ref([])
    
    const quickSuggestions = [
      { text: 'How to book?', icon: 'fas fa-plus-circle', action: 'faq_booking' },
      { text: 'Track order', icon: 'fas fa-map-marker-alt', action: 'track_order' },
      { text: 'Delivery fees', icon: 'fas fa-money-bill-wave', action: 'faq_fees' },
      { text: 'Cancel order', icon: 'fas fa-times-circle', action: 'faq_cancel' }
    ]
    
    // AI Knowledge Base
    const knowledgeBase = {
      faq: {
        booking: {
          question: "How to book a service?",
          answer: `📱 <strong>Booking is super easy!</strong><br><br>
          <strong>Step 1:</strong> Click "Book Service" on your dashboard<br>
          <strong>Step 2:</strong> Choose your service type (Food, Medicine, Grocery, etc.)<br>
          <strong>Step 3:</strong> Set pickup and delivery locations<br>
          <strong>Step 4:</strong> Add item details and special instructions<br>
          <strong>Step 5:</strong> Choose payment method<br>
          <strong>Step 6:</strong> Confirm your order!<br><br>
          💡 <em>Pro tip: Upload a photo of items for faster service!</em>`,
          actions: [
            { text: 'Book Service Now', icon: 'fas fa-plus', type: 'open_booking' },
            { text: 'View Tutorial', icon: 'fas fa-play', type: 'tutorial' }
          ]
        },
        fees: {
          question: "How much is the delivery fee?",
          answer: `💰 <strong>Our delivery fees are transparent:</strong><br><br>
          🏠 <strong>Base Fee:</strong> ₱50<br>
          📍 <strong>Distance Fee:</strong> ₱15 per kilometer<br>
          🎯 <strong>Service Fee:</strong> Varies by service type<br><br>
          <strong>Example Calculation:</strong><br>
          3km delivery = ₱50 + (₱15 × 3) = <strong>₱95</strong><br><br>
          🤖 <strong>AI Dynamic Pricing:</strong> We adjust prices based on demand and time to ensure fair rates!`,
          actions: [
            { text: 'Calculate My Fee', icon: 'fas fa-calculator', type: 'calculate_fee' },
            { text: 'View All Rates', icon: 'fas fa-list', type: 'view_rates' }
          ]
        },
        cancel: {
          question: "How to cancel an order?",
          answer: `❌ <strong>Cancellation Policy:</strong><br><br>
          ⏰ <strong>Time Limit:</strong> 30 seconds after booking<br>
          📱 <strong>How to Cancel:</strong><br>
          1. Go to "My Orders"<br>
          2. Find your order<br>
          3. Click "Cancel Order" (if within 30s)<br><br>
          🚫 <strong>Cannot Cancel After:</strong><br>
          • 30 seconds have passed<br>
          • Driver has been assigned<br>
          • Order is picked up<br><br>
          💡 <em>Quick cancellation protects our drivers!</em>`,
          actions: [
            { text: 'View My Orders', icon: 'fas fa-list-alt', type: 'view_orders' },
            { text: 'Contact Support', icon: 'fas fa-headset', type: 'contact_support' }
          ]
        },
        track: {
          question: "How to track my order?",
          answer: `📍 <strong>Real-time Order Tracking:</strong><br><br>
          🎯 <strong>Track Methods:</strong><br>
          • "My Orders" page<br>
          • Order details view<br>
          • Real-time notifications<br><br>
          📊 <strong>Order Statuses:</strong><br>
          🟡 <strong>Placed:</strong> Looking for driver<br>
          🔵 <strong>Assigned:</strong> Driver assigned<br>
          🟠 <strong>Picked Up:</strong> Items collected<br>
          🟢 <strong>In Transit:</strong> On the way<br>
          ✅ <strong>Delivered:</strong> Completed!`
        }
      },
      
      intents: {
        greetings: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
        booking: ['book', 'order', 'service', 'delivery', 'want to order'],
        tracking: ['track', 'where', 'status', 'location', 'my order'],
        cancellation: ['cancel', 'stop', 'remove'],
        fees: ['fee', 'cost', 'price', 'how much', 'rate'],
        services: {
          food: ['food', 'restaurant', 'meal', 'eat', 'hungry'],
          medicine: ['medicine', 'pharmacy', 'drug', 'pills', 'medical'],
          grocery: ['grocery', 'groceries', 'shopping', 'market'],
          bills: ['bill', 'payment', 'pay', 'electricity', 'water']
        }
      }
    }
    
    const openChat = () => {
      isOpen.value = true
      hasUnreadMessages.value = false
      // Load user orders for better responses
      if (userProfile.value?.user_id) {
        getUserOrders(userProfile.value.user_id)
      }
    }
    
    const closeChat = () => {
      isOpen.value = false
      suggestedResponses.value = []
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
      suggestedResponses.value = []
      
      await scrollToBottom()
      await processMessage(messageText)
    }
    
    const sendQuickMessage = async (text) => {
      // Handle quick suggestions with specific intents
      if (text === 'Delivery fees') {
        const response = {
          text: knowledgeBase.faq.fees.answer,
          actions: knowledgeBase.faq.fees.actions,
          suggestions: ['Calculate my fee', 'Book a service', 'View all services']
        }
        
        const aiMessage = {
          id: Date.now(),
          text: response.text,
          isUser: false,
          timestamp: new Date(),
          actions: response.actions || []
        }
        
        // Add user message first
        const userMessage = {
          id: Date.now() - 1,
          text: text,
          isUser: true,
          timestamp: new Date()
        }
        
        messages.value.push(userMessage)
        
        // Simulate typing
        isTyping.value = true
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        messages.value.push(aiMessage)
        isTyping.value = false
        
        if (response.suggestions) {
          suggestedResponses.value = response.suggestions
        }
        
        await scrollToBottom()
        return
      }
      
      // Default behavior for other messages
      newMessage.value = text
      await sendMessage()
    }
    
    const processMessage = async (message) => {
      isTyping.value = true
      
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 1500))
      
      const response = await generateAIResponse(message)
      
      const aiMessage = {
        id: Date.now(),
        text: response.text,
        isUser: false,
        timestamp: new Date(),
        actions: response.actions || []
      }
      
      messages.value.push(aiMessage)
      isTyping.value = false
      
      // Set suggested responses
      if (response.suggestions) {
        suggestedResponses.value = response.suggestions
      }
      
      await scrollToBottom()
    }
    
    const generateAIResponse = async (message) => {
      const lowerMessage = message.toLowerCase()
      
      // Intent Recognition with AI-like responses
      
      // FAQ Intent - Check for fees FIRST before other intents
      if (lowerMessage.includes('delivery fees') || lowerMessage.includes('delivery fee') || 
          lowerMessage.includes('fee') || lowerMessage.includes('cost') || 
          lowerMessage.includes('price') || lowerMessage.includes('how much') || 
          lowerMessage.includes('rate')) {
        return {
          text: knowledgeBase.faq.fees.answer,
          actions: knowledgeBase.faq.fees.actions,
          suggestions: ['Calculate my fee', 'Book a service', 'View all services']
        }
      }
      
      // Greeting Intent
      if (knowledgeBase.intents.greetings.some(greeting => lowerMessage.includes(greeting))) {
        const greetings = [
          `Hello ${userProfile.value?.first_name || 'there'}! 👋 I'm your AI delivery assistant.`,
          `Hi ${userProfile.value?.first_name || 'friend'}! 🤖 Ready to help with your deliveries!`,
          `Hey there! 🌟 What delivery magic can I help you with today?`
        ]
        return {
          text: greetings[Math.floor(Math.random() * greetings.length)] + " What would you like to do?",
          suggestions: ['Book a service', 'Track my order', 'Check delivery fees', 'Get help']
        }
      }
      
      // Tracking Intent
      if (knowledgeBase.intents.tracking.some(word => lowerMessage.includes(word))) {
        return await handleTrackingIntent()
      }
      
      // Booking Intent
      if (knowledgeBase.intents.booking.some(word => lowerMessage.includes(word))) {
        return handleBookingIntent(lowerMessage)
      }
      
      // Service-specific intents
      for (const [service, keywords] of Object.entries(knowledgeBase.intents.services)) {
        if (keywords.some(keyword => lowerMessage.includes(keyword))) {
          return handleServiceIntent(service, lowerMessage)
        }
      }
      
      // FAQ Intent
      if (lowerMessage.includes('cancel')) {
        return {
          text: knowledgeBase.faq.cancel.answer,
          actions: knowledgeBase.faq.cancel.actions,
          suggestions: ['View my orders', 'Book new service', 'Contact support']
        }
      }
      
      if (lowerMessage.includes('how') && (lowerMessage.includes('book') || lowerMessage.includes('order'))) {
        return {
          text: knowledgeBase.faq.booking.answer,
          actions: knowledgeBase.faq.booking.actions,
          suggestions: ['Book service now', 'View tutorial', 'Check fees']
        }
      }
      
      // Help Intent
      if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
        return {
          text: `🤖 <strong>I'm here to help!</strong> I can assist you with:<br><br>
          📦 <strong>Booking Services:</strong> Food, Medicine, Grocery, Bills<br>
          📍 <strong>Order Tracking:</strong> Real-time status updates<br>
          💰 <strong>Pricing Info:</strong> Transparent fee calculation<br>
          ❌ <strong>Cancellations:</strong> Policy and procedures<br>
          🎯 <strong>Smart Suggestions:</strong> Personalized recommendations<br><br>
          Just ask me anything in natural language! 💬`,
          suggestions: ['Book a service', 'Track order', 'Check fees', 'View my orders']
        }
      }
      
      // Default AI Response with context awareness
      const contextResponses = [
        `🤔 I understand you're asking about "${message}". Let me help you with that!`,
        `💭 Interesting question! Based on what you're asking, here's what I can help with:`,
        `🎯 I'm analyzing your request about "${message}". Here are your options:`
      ]
      
      return {
        text: contextResponses[Math.floor(Math.random() * contextResponses.length)] + `<br><br>
        🚀 <strong>Popular Actions:</strong><br>
        📱 Book a new delivery service<br>
        📍 Track your current orders<br>
        💰 Check delivery fees<br>
        ❓ Get help with our services<br><br>
        What would you like to do?`,
        suggestions: ['Book service', 'Track orders', 'Check fees', 'Get help']
      }
    }
    
    const handleTrackingIntent = async () => {
      // Load orders if not already loaded
      if (userProfile.value?.user_id && orders.value.length === 0) {
        await getUserOrders(userProfile.value.user_id)
      }
      
      const activeOrders = orders.value.filter(order => 
        ['placed', 'assigned', 'picked_up', 'in_transit'].includes(order.status)
      )
      
      if (activeOrders.length === 0) {
        return {
          text: `📦 <strong>No Active Orders</strong><br><br>
          You don't have any orders in progress right now. Ready to place a new order?<br><br>
          🎯 <strong>Quick Services:</strong><br>
          🍽️ Food Delivery<br>
          💊 Medicine Delivery<br>
          🛒 Grocery Shopping<br>
          💳 Bill Payments`,
          actions: [
            { text: 'Book New Service', icon: 'fas fa-plus', type: 'open_booking' },
            { text: 'View Order History', icon: 'fas fa-history', type: 'view_orders' }
          ],
          suggestions: ['Book food delivery', 'Order medicine', 'Grocery shopping']
        }
      }
      
      let response = `📍 <strong>Your Active Orders:</strong><br><br>`
      activeOrders.forEach((order, index) => {
        const statusEmoji = {
          'placed': '🟡',
          'assigned': '🔵', 
          'picked_up': '🟠',
          'in_transit': '🟢'
        }
        response += `${statusEmoji[order.status]} <strong>Order #${order.id}</strong><br>`
        response += `📦 ${order.service_type}<br>`
        response += `📊 Status: ${order.status.replace('_', ' ').toUpperCase()}<br>`
        response += `💰 Fee: ₱${order.delivery_fee}<br>`
        if (index < activeOrders.length - 1) response += `<br>`
      })
      
      return {
        text: response,
        actions: [
          { text: 'View Detailed Tracking', icon: 'fas fa-map-marker-alt', type: 'view_orders' },
          { text: 'Book Another Service', icon: 'fas fa-plus', type: 'open_booking' }
        ],
        suggestions: ['View order details', 'Book new service', 'Contact driver']
      }
    }
    
    const handleBookingIntent = (message) => {
      return {
        text: `🚀 <strong>Let's get you booked!</strong><br><br>
        I can help you order any of our services:<br><br>
        🍽️ <strong>Food Delivery</strong> - From restaurants<br>
        💊 <strong>Medicine</strong> - From pharmacies<br>
        🛒 <strong>Grocery</strong> - Shopping assistance<br>
        💳 <strong>Pay Bills</strong> - Utility payments<br>
        📦 <strong>Pick-up</strong> - Item collection<br>
        🎁 <strong>Surprise Delivery</strong> - Special occasions<br>
        🛍️ <strong>Pabili</strong> - General shopping<br><br>
        Which service interests you?`,
        actions: [
          { text: 'Open Booking Form', icon: 'fas fa-plus-circle', type: 'open_booking' },
          { text: 'Food Delivery', icon: 'fas fa-utensils', type: 'book_food' },
          { text: 'Medicine Delivery', icon: 'fas fa-pills', type: 'book_medicine' }
        ],
        suggestions: ['Food delivery', 'Medicine', 'Grocery shopping', 'Pay bills']
      }
    }
    
    const handleServiceIntent = (service, message) => {
      const serviceInfo = {
        food: {
          name: 'Food Delivery',
          icon: '🍽️',
          description: 'Order from restaurants and food establishments',
          tips: 'Pro tip: Specify dietary preferences for better recommendations!'
        },
        medicine: {
          name: 'Medicine Delivery',
          icon: '💊',
          description: 'Get medicines from nearby pharmacies',
          tips: 'Upload prescription photos for faster processing!'
        },
        grocery: {
          name: 'Grocery Shopping',
          icon: '🛒',
          description: 'Personal shopping assistance for groceries',
          tips: 'Provide a detailed list and budget for best results!'
        },
        bills: {
          name: 'Bill Payment',
          icon: '💳',
          description: 'Pay utility bills and other services',
          tips: 'Have your account numbers ready for quick processing!'
        }
      }
      
      const info = serviceInfo[service]
      return {
        text: `${info.icon} <strong>${info.name}</strong><br><br>
        ${info.description}<br><br>
        💡 <em>${info.tips}</em><br><br>
        Ready to book this service?`,
        actions: [
          { text: `Book ${info.name}`, icon: 'fas fa-plus', type: `book_${service}` },
          { text: 'View All Services', icon: 'fas fa-list', type: 'open_booking' }
        ],
        suggestions: [`Book ${service}`, 'Check delivery fees', 'View other services']
      }
    }
    
    const executeAction = (action) => {
      if (!action) return
      
      switch (action.type) {
        case 'open_booking':
          router.push('/user/book-service')
          closeChat()
          break
        case 'book_food':
          router.push({ path: '/user/book-service', query: { service: 'Food Delivery' } })
          closeChat()
          break
        case 'book_medicine':
          router.push({ path: '/user/book-service', query: { service: 'Medicines' } })
          closeChat()
          break
        case 'book_grocery':
          router.push({ path: '/user/book-service', query: { service: 'Grocery' } })
          closeChat()
          break
        case 'book_bills':
          router.push({ path: '/user/book-service', query: { service: 'Pay Bills' } })
          closeChat()
          break
        case 'view_orders':
          router.push('/user/orders')
          closeChat()
          break
        case 'calculate_fee':
          // Could open a fee calculator modal
          sendQuickMessage('How much does delivery cost?')
          break
        case 'contact_support':
          sendQuickMessage('I need human support')
          break
      }
    }
    
    const toggleVoiceInput = () => {
      // Voice input functionality could be implemented here
      console.log('Voice input toggled')
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
    
    return {
      isOpen,
      messages,
      newMessage,
      isTyping,
      hasUnreadMessages,
      messagesContainer,
      quickSuggestions,
      suggestedResponses,
      userProfile,
      openChat,
      closeChat,
      sendMessage,
      sendQuickMessage,
      executeAction,
      toggleVoiceInput,
      formatTime
    }
  }
}
</script>
