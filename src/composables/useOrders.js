import { ref } from "vue"
import { supabase } from "./useSupabase"

const orders = ref([])
const loading = ref(false)

export const useOrders = () => {
  const createOrder = async (orderData) => {
    try {
      loading.value = true
      console.log("Creating order with data:", orderData)

      // Validate required fields
      if (!orderData.user_id) {
        throw new Error("User ID is required")
      }
      if (!orderData.service_type) {
        throw new Error("Service type is required")
      }
      if (!orderData.pickup_address || !orderData.delivery_address) {
        throw new Error("Pickup and delivery addresses are required")
      }

      // Prepare the order data for Supabase
      const orderToInsert = {
        user_id: orderData.user_id,
        service_type: orderData.service_type,
        pickup_address: orderData.pickup_address,
        delivery_address: orderData.delivery_address,
        pickup_latitude: orderData.pickup_latitude,
        pickup_longitude: orderData.pickup_longitude,
        delivery_latitude: orderData.delivery_latitude,
        delivery_longitude: orderData.delivery_longitude,
        payment_method: orderData.payment_method || "COD",
        special_instructions: orderData.special_instructions || "",
        delivery_fee: orderData.delivery_fee || 0,
        status: "placed",
        service_details: orderData.service_details || {},
        created_at: new Date().toISOString(),
      }

      console.log("Inserting order:", orderToInsert)

      const { data, error } = await supabase.from("orders").insert(orderToInsert).select().single()

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
      console.log("Fetching orders for user:", userId)

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          driver_profiles:driver_id (
            first_name,
            last_name,
            contact_number,
            profile_picture_url
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching user orders:", error)
        throw error
      }

      console.log("User orders fetched successfully:", data)
      orders.value = data || []
      return { data, error: null }
    } catch (error) {
      console.error("Get user orders error:", error)
      orders.value = []
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }

  const getOrderById = async (orderId, userId) => {
    try {
      loading.value = true
      console.log(`Fetching order ${orderId} for user ${userId}`)

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          driver_profiles:driver_id (
            first_name,
            last_name,
            contact_number,
            vehicle_info,
            profile_picture_url
          )
        `)
        .eq("id", orderId)
        .eq("user_id", userId)
        .single()

      if (error) {
        console.error("Error fetching order by ID:", error)
        if (error.code === "PGRST116") {
          // No rows returned
          return { data: null, error: { message: "Order not found" } }
        }
        throw error
      }

      console.log("Order fetched successfully:", data)
      return { data, error: null }
    } catch (error) {
      console.error("Get order by ID error:", error)
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

      // Add timestamp for the status change
      const timestampField = `${status}_at`
      updateData[timestampField] = new Date().toISOString()

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

  // AI-powered dynamic pricing
  const calculateDynamicDeliveryFee = (distance, serviceType, options = {}) => {
    // Base calculation
    const baseFee = 50
    const perKmRate = 15
    const distanceFee = distance * perKmRate
    let totalFee = baseFee + distanceFee

    // Service type multipliers
    const serviceMultipliers = {
      "Food Delivery": 1.0,
      "Pay Bills": 0.8, // Discount for bill payments
      "Pick-up": 1.0,
      "Surprise Delivery": 1.2, // Premium for special handling
      Medicines: 1.3, // Premium for urgent/important items
      Grocery: 1.1, // Slightly higher for potentially bulky items
      Pabili: 1.0,
    }

    // Apply service multiplier
    const serviceMultiplier = serviceMultipliers[serviceType] || 1.0
    totalFee *= serviceMultiplier

    // Time-based factors
    const now = options.currentTime || new Date()
    const hour = now.getHours()
    const day = now.getDay() // 0 = Sunday, 6 = Saturday

    // Peak hours (7-9 AM, 12-2 PM, 6-8 PM)
    if ((hour >= 7 && hour <= 9) || (hour >= 12 && hour <= 14) || (hour >= 18 && hour <= 20)) {
      totalFee *= 1.25 // 25% increase during peak hours
    }

    // Weekend premium (Saturday and Sunday)
    if (day === 0 || day === 6) {
      totalFee *= 1.15 // 15% increase on weekends
    }

    // Weather conditions (if provided)
    if (options.weather === "rainy") {
      totalFee *= 1.2 // 20% increase during rainy weather
    }

    // Distance surge for long distances
    if (distance > 10) {
      totalFee *= 1.1 // 10% increase for distances over 10km
    }

    // Demand-based pricing (if provided)
    if (options.highDemand) {
      totalFee *= 1.15 // 15% increase during high demand
    }

    return Math.round(totalFee)
  }

  // Add tracking update
  const addTrackingUpdate = async (orderId, message) => {
    try {
      const { data, error } = await supabase
        .from("order_tracking")
        .insert({
          order_id: orderId,
          message: message,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error("Error adding tracking update:", error)
      return { data: null, error }
    }
  }

  // Get tracking updates
  const getTrackingUpdates = async (orderId) => {
    try {
      const { data, error } = await supabase
        .from("order_tracking")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error("Error getting tracking updates:", error)
      return { data: [], error }
    }
  }

  return {
    orders,
    loading,
    createOrder,
    getUserOrders,
    getOrderById,
    getDriverOrders,
    getAvailableOrders,
    getAllOrders,
    updateOrderStatus,
    acceptOrder,
    uploadOrderImage,
    calculateDeliveryFee,
    calculateDynamicDeliveryFee,
    addTrackingUpdate,
    getTrackingUpdates,
  }
}
