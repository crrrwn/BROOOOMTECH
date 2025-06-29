import { ref, nextTick } from "vue"
import { supabase } from "./useSupabase"
import { notificationService } from "./useNotification"

const orders = ref([])
const loading = ref(false)
const error = ref(null)

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

      // Generate a unique barcode for the order
      const generateOrderBarcode = (userId) => {
        // Generate a unique barcode based on user ID and timestamp
        const timestamp = Date.now().toString()
        const randomPart = Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0")
        const userPart = userId.substring(0, 8).replace(/-/g, "")

        // Format: BT-{userPart}-{timestamp}-{random}
        return `BT-${userPart}-${timestamp.substring(timestamp.length - 6)}-${randomPart}`
      }

      const barcode = generateOrderBarcode(orderData.user_id)

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
        payment_proof_url: orderData.payment_proof_url || null,
        created_at: new Date().toISOString(),
        barcode: barcode, // Add the barcode
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
      console.log(
        "Orders by status:",
        data?.reduce((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1
          return acc
        }, {}),
      )

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

  const updateOrderStatus = async (orderId, status, driverId = null, proofUrl = null) => {
    try {
      loading.value = true
      console.log(`Updating order ${orderId} to status: ${status}`)

      const now = new Date().toISOString()
      const updateData = {
        status,
        updated_at: now,
      }

      // Add timestamp for the specific status change
      const timestampField = `${status}_at`
      updateData[timestampField] = now

      if (driverId) {
        updateData.driver_id = driverId
      }

      // Add proof URL if provided
      if (proofUrl) {
        if (status === "picked_up") {
          updateData.pickup_proof_url = proofUrl
        } else if (status === "delivered") {
          updateData.delivery_proof_url = proofUrl
        }
      }

      console.log("Update data being sent to Supabase:", updateData)

      // IMMEDIATELY update the local state BEFORE the database call
      const orderIndex = orders.value.findIndex((order) => order.id === orderId)
      if (orderIndex !== -1) {
        const updatedOrder = {
          ...orders.value[orderIndex],
          ...updateData,
          id: Number.parseInt(orderId),
        }

        // Create a new array to trigger reactivity
        const newOrders = [...orders.value]
        newOrders[orderIndex] = updatedOrder
        orders.value = newOrders

        console.log("Local order updated IMMEDIATELY:", updatedOrder)
      }

      // Force Vue to update the DOM
      await nextTick()

      // Now update the database
      const { data, error } = await supabase.from("orders").update(updateData).eq("id", orderId).select()

      if (error) {
        console.error("Error updating order in database:", error)

        // Revert the local change if database update failed
        if (orderIndex !== -1) {
          const revertedOrders = [...orders.value]
          revertedOrders[orderIndex] = { ...revertedOrders[orderIndex], status: "placed" } // Revert to original status
          orders.value = revertedOrders
        }

        throw error
      }

      console.log("Order updated successfully in database:", data)

      // Manually add entry to order_status_history to bypass RLS
      // Method 1: Try using the comprehensive update function first
      try {
        const { error: updateError } = await supabase.rpc("admin_update_order_status", {
          p_order_id: orderId,
          p_status: status,
        })

        if (!updateError) {
          console.log("Order status updated successfully using admin function")

          // Update local state and return success
          const orderIndex = orders.value.findIndex((order) => order.id === orderId)
          if (orderIndex !== -1) {
            const updatedOrder = {
              ...orders.value[orderIndex],
              status,
              updated_at: now,
              [`${status}_at`]: now,
            }
            const newOrders = [...orders.value]
            newOrders[orderIndex] = updatedOrder
            orders.value = newOrders
          }

          return { data: { id: orderId, status }, error: null }
        } else {
          console.warn("Admin update function failed:", updateError)
        }
      } catch (updateError) {
        console.warn("Admin update function error:", updateError)
      }

      // Method 2: Try simple update if comprehensive fails
      try {
        const { error: simpleError } = await supabase.rpc("admin_simple_update_order", {
          p_order_id: orderId,
          p_status: status,
        })

        if (!simpleError) {
          console.log("Order status updated successfully using simple function")

          // Update local state and return success
          const orderIndex = orders.value.findIndex((order) => order.id === orderId)
          if (orderIndex !== -1) {
            const updatedOrder = {
              ...orders.value[orderIndex],
              status,
              updated_at: now,
              [`${status}_at`]: now,
            }
            const newOrders = [...orders.value]
            newOrders[orderIndex] = updatedOrder
            orders.value = newOrders
          }

          return { data: { id: orderId, status }, error: null }
        } else {
          console.warn("Simple update function failed:", simpleError)
        }
      } catch (simpleError) {
        console.warn("Simple update function error:", simpleError)
      }

      // Try to add status history using the new function
      try {
        const { error: historyError } = await supabase.rpc("admin_add_order_status_history", {
          p_order_id: orderId,
          p_status: status,
          p_notes: `Status updated to ${status} by admin`,
        })

        if (historyError) {
          console.warn("Status history update failed:", historyError)
          // Continue anyway since the main order update succeeded
        } else {
          console.log("Status history added successfully")
        }
      } catch (historyError) {
        console.warn("Failed to add status history:", historyError)
        // Continue anyway since the main order update succeeded
      }

      // Verify the database update by checking the returned data
      const updatedOrderFromDB = Array.isArray(data) ? data[0] : data
      if (updatedOrderFromDB) {
        console.log("Database confirmed update:", {
          id: updatedOrderFromDB.id,
          status: updatedOrderFromDB.status,
          cancelled_at: updatedOrderFromDB.cancelled_at,
          updated_at: updatedOrderFromDB.updated_at,
        })

        // Update local state with the confirmed database data
        if (orderIndex !== -1) {
          const confirmedOrders = [...orders.value]
          confirmedOrders[orderIndex] = { ...confirmedOrders[orderIndex], ...updatedOrderFromDB }
          orders.value = confirmedOrders
        }
      }

      return { data: updatedOrderFromDB, error: null }
    } catch (error) {
      console.error("Update order status error:", error)
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }

  const acceptOrder = async (orderId, driverId) => {
    return await updateOrderStatus(orderId, "assigned", driverId)
  }

  const uploadOrderImage = async (file, orderId, type = "item") => {
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${orderId}_${type}_${Date.now()}.${fileExt}`

      const { data, error } = await supabase.storage
        .from("order-images")
        .upload(fileName, file, { cacheControl: "3600", upsert: false })

      if (error) throw error

      const {
        data: { publicUrl },
      } = supabase.storage.from("order-images").getPublicUrl(fileName)

      // Update order with image URL based on type
      let updateData = {}

      if (type === "item") {
        updateData = { item_image_url: publicUrl }
      } else if (type === "pickup") {
        updateData = {
          pickup_proof_url: publicUrl,
          status: "picked_up",
          picked_up_at: new Date().toISOString(),
        }
      } else if (type === "delivery") {
        updateData = {
          delivery_proof_url: publicUrl,
          status: "delivered",
          delivered_at: new Date().toISOString(),
        }
      }

      await supabase.from("orders").update(updateData).eq("id", orderId)

      return { data: publicUrl, error: null, type }
    } catch (error) {
      return { data: null, error, type }
    }
  }

  const verifyOrderBarcode = async (orderId, barcode) => {
    loading.value = true
    error.value = null

    try {
      // Get the order to check its barcode
      const { data: order, error: fetchError } = await supabase
        .from("orders")
        .select("barcode")
        .eq("id", orderId)
        .single()

      if (fetchError) throw fetchError

      // Check if barcode matches
      if (order.barcode === barcode) {
        // Update the order to mark barcode as verified
        const { error: updateError } = await supabase
          .from("orders")
          .update({ barcode_verified_at: new Date().toISOString() })
          .eq("id", orderId)

        if (updateError) throw updateError

        // Add tracking entry
        await addOrderTrackingEntry(orderId, "Barcode verified successfully")

        return { verified: true }
      } else {
        return { verified: false }
      }
    } catch (err) {
      console.error("Error verifying barcode:", err)
      error.value = err.message
      return { verified: false, error: err.message }
    } finally {
      loading.value = false
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

    // Peak hours (higher demand): 7-9 AM, 11 AM-1 PM, 5-7 PM
    const isPeakHour = (hour >= 7 && hour <= 9) || (hour >= 11 && hour <= 13) || (hour >= 17 && hour <= 19)
    if (isPeakHour) {
      totalFee *= 1.2 // 20% surge during peak hours
    }

    // Weekend rates
    const isWeekend = day === 0 || day === 6
    if (isWeekend) {
      totalFee *= 1.1 // 10% extra on weekends
    }

    // Night rates (10 PM - 6 AM)
    const isNightTime = hour >= 22 || hour < 6
    if (isNightTime) {
      totalFee *= 1.25 // 25% extra for night deliveries
    }

    // Weather conditions (if provided)
    if (options.weather) {
      const weatherMultipliers = {
        rainy: 1.15,
        stormy: 1.3,
        flooding: 1.5,
      }
      const weatherMultiplier = weatherMultipliers[options.weather.toLowerCase()] || 1.0
      totalFee *= weatherMultiplier
    }

    // Traffic conditions (if provided)
    if (options.traffic) {
      const trafficMultipliers = {
        light: 0.95,
        moderate: 1.0,
        heavy: 1.2,
        severe: 1.35,
      }
      const trafficMultiplier = trafficMultipliers[options.traffic.toLowerCase()] || 1.0
      totalFee *= trafficMultiplier
    }

    // Round to nearest peso
    return Math.round(totalFee)
  }

  const addTrackingUpdate = async (orderId, message, metadata = {}) => {
    try {
      const { error } = await supabase.from("order_tracking").insert({
        order_id: orderId,
        message,
        metadata,
        timestamp: new Date().toISOString(),
      })

      if (error) throw error
      return { success: true, error: null }
    } catch (error) {
      console.error("Error adding tracking update:", error)
      return { success: false, error }
    }
  }

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

  // Update order status and handle photo uploads
  const updateOrderWithProof = async (orderId, status, photoUrl, photoType) => {
    loading.value = true
    error.value = null

    try {
      // Prepare update data
      const updateData = {
        status,
        updated_at: new Date().toISOString(),
      }

      // Set timestamp based on status
      if (status === "picked_up") {
        updateData.picked_up_at = new Date().toISOString()
      } else if (status === "in_transit") {
        updateData.in_transit_at = new Date().toISOString()
      } else if (status === "delivered") {
        updateData.delivered_at = new Date().toISOString()
      }

      // Add photo URL based on type
      if (photoType === "pickup") {
        updateData.pickup_proof_url = photoUrl
      } else if (photoType === "delivery") {
        updateData.delivery_proof_url = photoUrl
      }

      // Update the order
      const { error: updateError } = await supabase.from("orders").update(updateData).eq("id", orderId)

      if (updateError) throw updateError

      // Add tracking entry
      const message = `Order ${status} with ${photoType} photo proof`
      await addOrderTrackingEntry(orderId, message)

      notificationService.success(`Order status updated to ${status}`)
      return { success: true }
    } catch (err) {
      console.error("Error updating order with proof:", err)
      error.value = err.message
      notificationService.error("Failed to update order status")
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Add a tracking entry for an order
  const addOrderTrackingEntry = async (orderId, message, metadata = {}) => {
    try {
      const { error: insertError } = await supabase.from("order_tracking").insert({
        order_id: orderId,
        message,
        metadata,
      })

      if (insertError) throw insertError

      return { success: true }
    } catch (err) {
      console.error("Error adding tracking entry:", err)
      return { success: false, error: err.message }
    }
  }

  // Update driver location
  const updateDriverLocation = async (driverId, orderId, latitude, longitude, accuracy) => {
    try {
      const { error } = await supabase.from("driver_locations").upsert({
        driver_id: driverId,
        order_id: orderId,
        latitude,
        longitude,
        accuracy,
        timestamp: new Date().toISOString(),
      })

      if (error) throw error

      return { success: true }
    } catch (err) {
      console.error("Error updating driver location:", err)
      return { success: false, error: err.message }
    }
  }

  // Get driver location for an order
  const getDriverLocation = async (orderId) => {
    try {
      const { data, error } = await supabase
        .from("driver_locations")
        .select("*")
        .eq("order_id", orderId)
        .order("timestamp", { ascending: false })
        .limit(1)
        .single()

      if (error) throw error

      return { location: data }
    } catch (err) {
      console.error("Error getting driver location:", err)
      return { location: null, error: err.message }
    }
  }

  return {
    orders,
    loading,
    error,
    createOrder,
    getUserOrders,
    getOrderById,
    getDriverOrders,
    getAvailableOrders,
    getAllOrders,
    updateOrderStatus,
    acceptOrder,
    uploadOrderImage,
    verifyOrderBarcode,
    calculateDeliveryFee,
    calculateDynamicDeliveryFee,
    addTrackingUpdate,
    getTrackingUpdates,
    updateOrderWithProof,
    updateDriverLocation,
    getDriverLocation,
  }
}
