import { ref } from "vue"
import { supabase } from "./useSupabase"

const orders = ref([])
const loading = ref(false)

export const useOrders = () => {
  const createOrder = async (orderData) => {
    try {
      loading.value = true
      console.log("Creating order with data:", orderData)

      const { data, error } = await supabase.from("orders").insert(orderData).select().single()

      if (error) {
        console.error("Order creation error:", error)
        throw error
      }

      console.log("Order created successfully:", data)
      return { data, error: null }
    } catch (error) {
      console.error("Create order error:", error)
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }

  const getUserOrders = async (userId) => {
    try {
      loading.value = true

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          driver_profiles:driver_id (
            first_name,
            last_name,
            contact_number
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error

      orders.value = data || []
      return { data, error: null }
    } catch (error) {
      orders.value = []
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }

  const getDriverOrders = async (driverId) => {
    try {
      loading.value = true

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          user_profiles:user_id (
            first_name,
            last_name,
            contact_number
          )
        `)
        .eq("driver_id", driverId)
        .order("created_at", { ascending: false })

      if (error) throw error

      orders.value = data || []
      return { data, error: null }
    } catch (error) {
      orders.value = []
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }

  const getAvailableOrders = async () => {
    try {
      loading.value = true

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          user_profiles:user_id (
            first_name,
            last_name,
            contact_number
          )
        `)
        .eq("status", "placed")
        .is("driver_id", null)
        .order("created_at", { ascending: false })

      if (error) throw error

      return { data: data || [], error: null }
    } catch (error) {
      return { data: [], error }
    } finally {
      loading.value = false
    }
  }

  const getAllOrders = async () => {
    try {
      loading.value = true

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          user_profiles:user_id (
            first_name,
            last_name,
            contact_number
          ),
          driver_profiles:driver_id (
            first_name,
            last_name,
            contact_number
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      orders.value = data || []
      return { data, error: null }
    } catch (error) {
      orders.value = []
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }

  const updateOrderStatus = async (orderId, status, driverId = null) => {
    try {
      loading.value = true

      const updateData = { status }
      if (driverId) {
        updateData.driver_id = driverId
      }

      const { data, error } = await supabase.from("orders").update(updateData).eq("id", orderId).select().single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }

  const acceptOrder = async (orderId, driverId) => {
    return await updateOrderStatus(orderId, "assigned", driverId)
  }

  const uploadOrderImage = async (file, orderId) => {
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${orderId}_${Date.now()}.${fileExt}`

      const { data, error } = await supabase.storage.from("order-images").upload(fileName, file)

      if (error) throw error

      const {
        data: { publicUrl },
      } = supabase.storage.from("order-images").getPublicUrl(fileName)

      // Update order with image URL
      await supabase.from("orders").update({ item_image_url: publicUrl }).eq("id", orderId)

      return { data: publicUrl, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const calculateDeliveryFee = (distance, serviceType = "standard") => {
    const baseFee = 50
    const perKmRate = 15
    const serviceFeeMultiplier = serviceType === "express" ? 1.5 : 1

    const distanceFee = distance * perKmRate
    const totalFee = (baseFee + distanceFee) * serviceFeeMultiplier

    return Math.round(totalFee)
  }

  return {
    orders,
    loading,
    createOrder,
    getUserOrders,
    getDriverOrders,
    getAvailableOrders,
    getAllOrders,
    updateOrderStatus,
    acceptOrder,
    uploadOrderImage,
    calculateDeliveryFee,
  }
}
