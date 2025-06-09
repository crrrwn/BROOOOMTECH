import { ref, onUnmounted } from 'vue'
import { supabase } from './useSupabase'

export const useRealtime = () => {
  const subscriptions = ref(new Map())
  
  const subscribeToOrders = (callback, userId = null, driverId = null) => {
    let channel = supabase
      .channel('orders-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: userId ? `user_id=eq.${userId}` : driverId ? `driver_id=eq.${driverId}` : undefined
        },
        callback
      )
      .subscribe()
    
    const subscriptionKey = `orders-${userId || driverId || 'all'}`
    subscriptions.value.set(subscriptionKey, channel)
    
    return () => {
      channel.unsubscribe()
      subscriptions.value.delete(subscriptionKey)
    }
  }
  
  const subscribeToChat = (orderId, callback) => {
    let channel = supabase
      .channel(`chat-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_chats',
          filter: `order_id=eq.${orderId}`
        },
        callback
      )
      .subscribe()
    
    const subscriptionKey = `chat-${orderId}`
    subscriptions.value.set(subscriptionKey, channel)
    
    return () => {
      channel.unsubscribe()
      subscriptions.value.delete(subscriptionKey)
    }
  }
  
  const subscribeToDriverApplications = (callback) => {
    let channel = supabase
      .channel('driver-applications-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'driver_applications'
        },
        callback
      )
      .subscribe()
    
    subscriptions.value.set('driver-applications', channel)
    
    return () => {
      channel.unsubscribe()
      subscriptions.value.delete('driver-applications')
    }
  }
  
  const unsubscribeAll = () => {
    subscriptions.value.forEach((channel) => {
      channel.unsubscribe()
    })
    subscriptions.value.clear()
  }
  
  onUnmounted(() => {
    unsubscribeAll()
  })
  
  return {
    subscribeToOrders,
    subscribeToChat,
    subscribeToDriverApplications,
    unsubscribeAll
  }
}
