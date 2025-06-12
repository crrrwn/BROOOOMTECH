import { createRouter, createWebHistory } from "vue-router"
import { supabase } from "@/composables/useSupabase"

// Homepage
import Homepage from "@/views/Homepage.vue"

// Auth Views
import Login from "@/views/auth/Login.vue"
import DriverLogin from "@/views/auth/DriverLogin.vue"
import AdminLogin from "@/views/auth/AdminLogin.vue"
import Register from "@/views/auth/Register.vue"
import DriverRegister from "@/views/auth/DriverRegister.vue"
import AdminRegister from "@/views/auth/AdminRegister.vue"
import ForgotPassword from "@/views/auth/ForgotPassword.vue"
import EmailConfirmation from "@/views/auth/EmailConfirmation.vue"

// User Views
import UserDashboard from "@/views/user/Dashboard.vue"
import UserProfile from "@/views/user/Profile.vue"
import BookService from "@/views/user/BookService.vue"
import MyOrders from "@/views/user/MyOrders.vue"
import OrderDetails from "@/views/user/OrderDetails.vue"

// Driver Views
import DriverDashboard from "@/views/driver/Dashboard.vue"
import DriverProfile from "@/views/driver/Profile.vue"
import DriverOrders from "@/views/driver/Orders.vue"
import DriverEarnings from "@/views/driver/Earnings.vue"
import DriverApply from "@/views/driver/Apply.vue"

// Admin Views
import AdminDashboard from "@/views/admin/Dashboard.vue"
import AdminOrders from "@/views/admin/Orders.vue"
import AdminDrivers from "@/views/admin/Drivers.vue"
import AdminUsers from "@/views/admin/Users.vue"
import AdminSettings from "@/views/admin/Settings.vue"
import AdminDriverApplications from "@/views/admin/DriverApplications.vue"
import AdminFraudDetection from "@/views/admin/FraudDetection.vue"
import AdminDynamicPricing from "@/views/admin/DynamicPricing.vue"
import AdminManagement from "@/views/admin/AdminManagement.vue"

const routes = [
  {
    path: "/",
    name: "Homepage",
    component: Homepage,
  },
  // Main Login (Customer/User selection)
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { requiresGuest: true },
  },
  // Driver Authentication
  {
    path: "/driver/login",
    name: "DriverLogin",
    component: DriverLogin,
    meta: { requiresGuest: true },
  },
  {
    path: "/driver/register",
    name: "DriverRegister",
    component: DriverRegister,
    meta: { requiresGuest: true },
  },
  // Admin Authentication
  {
    path: "/admin/login",
    name: "AdminLogin",
    component: AdminLogin,
    meta: { requiresGuest: true },
  },
  {
    path: "/admin/register",
    name: "AdminRegister",
    component: AdminRegister,
    meta: { requiresGuest: true },
  },
  // Customer Registration
  {
    path: "/register",
    name: "Register",
    component: Register,
    meta: { requiresGuest: true },
  },
  {
    path: "/forgot-password",
    name: "ForgotPassword",
    component: ForgotPassword,
    meta: { requiresGuest: true },
  },
  {
    path: "/confirm-email",
    name: "EmailConfirmation",
    component: EmailConfirmation,
  },
  {
    path: "/driver/apply",
    name: "DriverApply",
    component: DriverApply,
  },
  // User Routes
  {
    path: "/user",
    redirect: "/user/dashboard",
  },
  {
    path: "/user/dashboard",
    name: "UserDashboard",
    component: UserDashboard,
    meta: { requiresAuth: true, role: "user" },
  },
  {
    path: "/user/profile",
    name: "UserProfile",
    component: UserProfile,
    meta: { requiresAuth: true, role: "user" },
  },
  {
    path: "/user/book-service",
    name: "BookService",
    component: BookService,
    meta: { requiresAuth: true, role: "user" },
  },
  {
    path: "/user/orders",
    name: "MyOrders",
    component: MyOrders,
    meta: { requiresAuth: true, role: "user" },
  },
  {
    path: "/user/orders/:id",
    name: "OrderDetails",
    component: OrderDetails,
    meta: { requiresAuth: true, role: "user" },
  },
  // Driver Routes
  {
    path: "/driver",
    redirect: "/driver/dashboard",
  },
  {
    path: "/driver/dashboard",
    name: "DriverDashboard",
    component: DriverDashboard,
    meta: { requiresAuth: true, role: "driver" },
  },
  {
    path: "/driver/profile",
    name: "DriverProfile",
    component: DriverProfile,
    meta: { requiresAuth: true, role: "driver" },
  },
  {
    path: "/driver/orders",
    name: "DriverOrders",
    component: DriverOrders,
    meta: { requiresAuth: true, role: "driver" },
  },
  {
    path: "/driver/earnings",
    name: "DriverEarnings",
    component: DriverEarnings,
    meta: { requiresAuth: true, role: "driver" },
  },
  // Admin Routes
  {
    path: "/admin",
    redirect: "/admin/dashboard",
  },
  {
    path: "/admin/dashboard",
    name: "AdminDashboard",
    component: AdminDashboard,
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/admin/orders",
    name: "AdminOrders",
    component: AdminOrders,
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/admin/drivers",
    name: "AdminDrivers",
    component: AdminDrivers,
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/admin/users",
    name: "AdminUsers",
    component: AdminUsers,
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/admin/settings",
    name: "AdminSettings",
    component: AdminSettings,
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/admin/driver-applications",
    name: "AdminDriverApplications",
    component: AdminDriverApplications,
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/admin/fraud-detection",
    name: "AdminFraudDetection",
    component: AdminFraudDetection,
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/admin/dynamic-pricing",
    name: "AdminDynamicPricing",
    component: AdminDynamicPricing,
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/admin/admin-management",
    name: "AdminManagement",
    component: AdminManagement,
    meta: { requiresAuth: true, role: "admin" },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Enhanced navigation guard with role-based access
router.beforeEach(async (to, from, next) => {
  console.log("Navigation guard - Current route:", to.path)

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log("Navigation guard - User authenticated:", !!user)

  // Routes that require guest access only (login/register pages)
  if (to.meta.requiresGuest && user) {
    console.log("Authenticated user trying to access guest route")

    // Get user profile to determine redirect
    try {
      const { data: profile } = await supabase.from("user_profiles").select("role").eq("user_id", user.id).single()

      if (profile) {
        const redirectMap = {
          user: "/user/dashboard",
          driver: "/driver/dashboard",
          admin: "/admin/dashboard",
        }
        next(redirectMap[profile.role] || "/user/dashboard")
        return
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }

    next("/user/dashboard") // fallback
    return
  }

  // Routes that require authentication
  if (to.meta.requiresAuth && !user) {
    console.log("Unauthenticated user trying to access protected route")
    next("/login")
    return
  }

  // Role-based access control
  if (to.meta.requiresAuth && to.meta.role && user) {
    try {
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("user_id", user.id)
        .single()

      if (error) {
        console.error("Error fetching user profile:", error)
        next("/login")
        return
      }

      if (profile.role !== to.meta.role) {
        console.log(`User role ${profile.role} doesn't match required role ${to.meta.role}`)

        // Redirect to appropriate dashboard based on user's actual role
        const redirectMap = {
          user: "/user/dashboard",
          driver: "/driver/dashboard",
          admin: "/admin/dashboard",
        }
        next(redirectMap[profile.role] || "/login")
        return
      }
    } catch (error) {
      console.error("Error in role check:", error)
      next("/login")
      return
    }
  }

  next()
})

export default router
