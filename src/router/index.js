import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

// Auth Views
import Login from '@/views/auth/Login.vue'
import Register from '@/views/auth/Register.vue'
import ForgotPassword from '@/views/auth/ForgotPassword.vue'

// User Views
import UserDashboard from '@/views/user/Dashboard.vue'
import UserProfile from '@/views/user/Profile.vue'
import BookService from '@/views/user/BookService.vue'
import MyOrders from '@/views/user/MyOrders.vue'
import OrderDetails from '@/views/user/OrderDetails.vue'

// Driver Views
import DriverDashboard from '@/views/driver/Dashboard.vue'
import DriverProfile from '@/views/driver/Profile.vue'
import DriverOrders from '@/views/driver/Orders.vue'
import DriverEarnings from '@/views/driver/Earnings.vue'
import DriverApply from '@/views/driver/Apply.vue'

// Admin Views
import AdminDashboard from '@/views/admin/Dashboard.vue'
import AdminOrders from '@/views/admin/Orders.vue'
import AdminDrivers from '@/views/admin/Drivers.vue'
import AdminUsers from '@/views/admin/Users.vue'
import AdminSettings from '@/views/admin/Settings.vue'
import AdminDriverApplications from '@/views/admin/DriverApplications.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword
  },
  {
    path: '/driver/apply',
    name: 'DriverApply',
    component: DriverApply
  },
  // User Routes
  {
    path: '/user',
    redirect: '/user/dashboard',
    meta: { requiresAuth: true, role: 'user' }
  },
  {
    path: '/user/dashboard',
    name: 'UserDashboard',
    component: UserDashboard,
    meta: { requiresAuth: true, role: 'user' }
  },
  {
    path: '/user/profile',
    name: 'UserProfile',
    component: UserProfile,
    meta: { requiresAuth: true, role: 'user' }
  },
  {
    path: '/user/book-service',
    name: 'BookService',
    component: BookService,
    meta: { requiresAuth: true, role: 'user' }
  },
  {
    path: '/user/orders',
    name: 'MyOrders',
    component: MyOrders,
    meta: { requiresAuth: true, role: 'user' }
  },
  {
    path: '/user/orders/:id',
    name: 'OrderDetails',
    component: OrderDetails,
    meta: { requiresAuth: true, role: 'user' }
  },
  // Driver Routes
  {
    path: '/driver',
    redirect: '/driver/dashboard',
    meta: { requiresAuth: true, role: 'driver' }
  },
  {
    path: '/driver/dashboard',
    name: 'DriverDashboard',
    component: DriverDashboard,
    meta: { requiresAuth: true, role: 'driver' }
  },
  {
    path: '/driver/profile',
    name: 'DriverProfile',
    component: DriverProfile,
    meta: { requiresAuth: true, role: 'driver' }
  },
  {
    path: '/driver/orders',
    name: 'DriverOrders',
    component: DriverOrders,
    meta: { requiresAuth: true, role: 'driver' }
  },
  {
    path: '/driver/earnings',
    name: 'DriverEarnings',
    component: DriverEarnings,
    meta: { requiresAuth: true, role: 'driver' }
  },
  // Admin Routes
  {
    path: '/admin',
    redirect: '/admin/dashboard',
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/orders',
    name: 'AdminOrders',
    component: AdminOrders,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/drivers',
    name: 'AdminDrivers',
    component: AdminDrivers,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: AdminUsers,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/settings',
    name: 'AdminSettings',
    component: AdminSettings,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/driver-applications',
    name: 'AdminDriverApplications',
    component: AdminDriverApplications,
    meta: { requiresAuth: true, role: 'admin' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const { user, userProfile, loading, getCurrentUser } = useAuth()
  
  if (loading.value) {
    await getCurrentUser()
  }
  
  if (to.meta.requiresAuth && !user.value) {
    next('/login')
    return
  }
  
  if (to.meta.role && userProfile.value?.role !== to.meta.role) {
    if (userProfile.value?.role === 'user') {
      next('/user/dashboard')
    } else if (userProfile.value?.role === 'driver') {
      next('/driver/dashboard')
    } else if (userProfile.value?.role === 'admin') {
      next('/admin/dashboard')
    } else {
      next('/login')
    }
    return
  }
  
  next()
})

export default router
