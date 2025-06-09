<template>
  <div class="flex flex-col h-96 bg-white rounded-lg shadow-lg">
    <!-- Chat Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200">
      <div class="flex items-center space-x-2">
        <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <i class="fas fa-comments text-green-600 text-sm"></i>
        </div>
        <h3 class="font-medium text-gray-800">Order Chat</h3>
      </div>
      <button
        @click="$emit('close')"
        class="text-gray-400 hover:text-gray-600 focus:outline-none"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <!-- Messages -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-3">
      <div
        v-for="message in messages"
        :key="message.id"
        class="flex"
        :class="message.sender_type === currentUserType ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm"
          :class="
            message.sender_type === currentUserType
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-800'
          "
        >
          <p>{{ message.message }}</p>
          <p class="text-xs mt-1 opacity-75">
            {{ formatTime(message.created_at) }}
          </p>
        </div>
      </div>
      
      <div v-if="messages.length === 0" class="text-center text-gray-500 py-8">
        No messages yet. Start the conversation!
      </div>
    </div>
    
    <!-- Message Input -->
    <div class="p-4 border-t border-gray-200">
      <form @submit.prevent="sendMessage" class="flex space-x-2">
        <input
          v-model="newMessage"
          type="text"
          placeholder="Type your message..."
          class="flex-1 input-field"
          :disabled="loading"
        />
        <button
          type="submit"
          :disabled="!newMessage.trim() || loading"
          class="btn-primary px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i class="fas fa-paper-plane"></i>
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { supabase } from '@/composables/useSupabase'
import { useAuth } from '@/composables/useAuth'
import { useRealtime } from '@/composables/useRealtime'

export default {
  name: 'ChatWindow',
  props: {
    orderId: {
      type: Number,
      required: true
    }
  },
  emits: ['close'],
  setup(props) {
    const { userProfile } = useAuth()
    const { subscribeToChat } = useRealtime()
    
    const messages = ref([])
    const newMessage = ref('')
    const loading = ref(false)
    const messagesContainer = ref(null)
    
    const currentUserType = ref(userProfile.value?.role || 'user')
    
    const loadMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('order_chats')
          .select('*')
          .eq('order_id', props.orderId)
          .order('created_at', { ascending: true })
        
        if (error) throw error
        
        messages.value = data || []
        await nextTick()
        scrollToBottom()
      } catch (error) {
        console.error('Error loading messages:', error)
      }
    }
    
    const sendMessage = async () => {
      if (!newMessage.value.trim()) return
      
      try {
        loading.value = true
        
        const { error } = await supabase
          .from('order_chats')
          .insert({
            order_id: props.orderId,
            sender_id: userProfile.value.user_id,
            sender_type: currentUserType.value,
            message: newMessage.value.trim()
          })
        
        if (error) throw error
        
        newMessage.value = ''
      } catch (error) {
        console.error('Error sending message:', error)
      } finally {
        loading.value = false
      }
    }
    
    const scrollToBottom = () => {
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
    
    let unsubscribe = null
    
    onMounted(async () => {
      await loadMessages()
      
      // Subscribe to new messages
      unsubscribe = subscribeToChat(props.orderId, (payload) => {
        if (payload.eventType === 'INSERT') {
          messages.value.push(payload.new)
          nextTick(() => scrollToBottom())
        }
      })
    })
    
    onUnmounted(() => {
      if (unsubscribe) {
        unsubscribe()
      }
    })
    
    watch(() => messages.value.length, () => {
      nextTick(() => scrollToBottom())
    })
    
    return {
      messages,
      newMessage,
      loading,
      messagesContainer,
      currentUserType,
      sendMessage,
      formatTime
    }
  }
}
</script>
