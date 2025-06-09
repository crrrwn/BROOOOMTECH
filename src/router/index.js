import { createRouter, createWebHistory } from "vue-router"
import { supabase } from "@/composables/useSupabase"

// Homepage
import Homepage from "@/views/Homepage.vue"

// Auth Views
import Login from "@/views/auth/Login.vue"
import Register from "@/views/auth/Register.vue"
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

const routes = [
  {
    path: "/",
    name: "Homepage",
    component: Homepage,
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { requiresGuest: true },
  },
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
  },
  {
    path: "/user/profile",
    name: "UserProfile",
    component: UserProfile,
  },
  {
    path: "/user/book-service",
    name: "BookService",
    component: BookService,
  },
  {
    path: "/user/orders",
    name: "MyOrders",
    component: MyOrders,
  },
  {
    path: "/user/orders/:id",
    name: "OrderDetails",
    component: OrderDetails,
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
  },
  {
    path: "/driver/profile",
    name: "DriverProfile",
    component: DriverProfile,
  },
  {
    path: "/driver/orders",
    name: "DriverOrders",
    component: DriverOrders,
  },
  {
    path: "/driver/earnings",
    name: "DriverEarnings",
    component: DriverEarnings,
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
  },
  {
    path: "/admin/orders",
    name: "AdminOrders",
    component: AdminOrders,
  },
  {
    path: "/admin/drivers",
    name: "AdminDrivers",
    component: AdminDrivers,
  },
  {
    path: "/admin/users",
    name: "AdminUsers",
    component: AdminUsers,
  },
  {
    path: "/admin/settings",
    name: "AdminSettings",
    component: AdminSettings,
  },
  {
    path: "/admin/driver-applications",
    name: "AdminDriverApplications",
    component: AdminDriverApplications,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Simple navigation guard
router.beforeEach(async (to, from, next) => {
  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // For debugging
  console.log("Navigation guard - Current route:", to.path)
  console.log("Navigation guard - User authenticated:", !!user)

  // Routes that require guest access only
  if (to.meta.requiresGuest && user) {
    console.log("Authenticated user trying to access guest route, redirecting to dashboard")
    next("/user/dashboard")
    return
  }

  // Allow all routes for now to fix the redirect issue
  next()
})

export default router
