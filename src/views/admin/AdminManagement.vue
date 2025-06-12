<template>
  <div>
    <Navbar />
    
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Admin Account Management</h1>
          <p class="mt-2 text-gray-600">Manage administrator accounts and permissions</p>
        </div>
        
        <!-- Admin Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-shield-alt text-red-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Total Admins</p>
                <p class="text-2xl font-bold text-gray-900">{{ adminStats.total }}</p>
                <p class="text-sm text-gray-600">System administrators</p>
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-user-check text-green-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Active Admins</p>
                <p class="text-2xl font-bold text-gray-900">{{ adminStats.active }}</p>
                <p class="text-sm text-green-600">Currently active</p>
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-clock text-blue-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Recent Logins</p>
                <p class="text-2xl font-bold text-gray-900">{{ adminStats.recentLogins }}</p>
                <p class="text-sm text-blue-600">Last 24 hours</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Actions Bar -->
        <div class="card mb-6">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div class="flex items-center space-x-4">
              <button
                @click="showCreateModal = true"
                class="btn-primary"
              >
                <i class="fas fa-plus mr-2"></i>
                Create Admin
              </button>
              
              <button
                @click="refreshAdmins"
                class="btn-secondary"
                :disabled="loading"
              >
                <i class="fas fa-sync-alt mr-2" :class="{ 'fa-spin': loading }"></i>
                Refresh
              </button>
            </div>
            
            <div class="flex items-center space-x-4">
              <select
                v-model="selectedFilter"
                class="input-field w-auto"
              >
                <option value="">All Admins</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
                <option value="recent">Recent Logins</option>
              </select>
              
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="fas fa-search text-gray-400"></i>
                </div>
                <input
                  v-model="searchQuery"
                  type="text"
                  class="input-field pl-10"
                  placeholder="Search admins..."
                />
              </div>
            </div>
          </div>
        </div>
        
        <!-- Admins Table -->
        <div class="card">
          <LoadingSpinner v-if="loading && admins.length === 0" />
          
          <div v-else-if="filteredAdmins.length === 0" class="text-center py-12">
            <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-user-shield text-gray-400 text-3xl"></i>
            </div>
            <h3 class="text-xl font-medium text-gray-900 mb-2">No administrators found</h3>
            <p class="text-gray-500">
              {{ selectedFilter || searchQuery ? 'Try adjusting your filters' : 'Create your first admin account' }}
            </p>
          </div>
          
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Administrator
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Information
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Activity
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="admin in paginatedAdmins"
                  :key="admin.user_id"
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div class="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                          <i class="fas fa-user-shield text-red-600"></i>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          {{ admin.first_name }} {{ admin.last_name }}
                        </div>
                        <div class="text-sm text-gray-500">
                          {{ admin.email }}
                        </div>
                        <div class="text-xs text-gray-400">
                          ID: {{ admin.user_id.slice(0, 8) }}...
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                      {{ admin.contact_number || 'Not provided' }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ admin.address || 'No address' }}
                    </div>
                  </td>
                  
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      admin.is_banned 
                        ? 'bg-red-100 text-red-800' 
                        : admin.email_verified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    ]">
                      {{ getAdminStatus(admin) }}
                    </span>
                    <div class="text-xs text-gray-500 mt-1">
                      Created {{ formatDate(admin.created_at) }}
                    </div>
                  </td>
                  
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div v-if="admin.last_login" class="text-sm text-gray-900">
                      {{ formatDateTime(admin.last_login) }}
                    </div>
                    <div v-else class="text-sm text-gray-500">
                      Never logged in
                    </div>
                  </td>
                  
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex items-center space-x-2">
                      <button
                        @click="editAdmin(admin)"
                        class="text-blue-600 hover:text-blue-900"
                        title="Edit Admin"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      
                      <button
                        @click="viewAdminActivity(admin)"
                        class="text-green-600 hover:text-green-900"
                        title="View Activity"
                      >
                        <i class="fas fa-history"></i>
                      </button>
                      
                      <button
                        @click="resetAdminPassword(admin)"
                        class="text-yellow-600 hover:text-yellow-900"
                        title="Reset Password"
                      >
                        <i class="fas fa-key"></i>
                      </button>
                      
                      <button
                        v-if="admin.user_id !== currentAdminId"
                        @click="toggleAdminStatus(admin)"
                        :class="[
                          admin.is_banned 
                            ? 'text-green-600 hover:text-green-900' 
                            : 'text-red-600 hover:text-red-900'
                        ]"
                        :title="admin.is_banned ? 'Activate Admin' : 'Deactivate Admin'"
                      >
                        <i :class="admin.is_banned ? 'fas fa-user-check' : 'fas fa-user-times'"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Pagination -->
          <div v-if="totalPages > 1" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div class="flex-1 flex justify-between sm:hidden">
              <button
                @click="currentPage = Math.max(1, currentPage - 1)"
                :disabled="currentPage === 1"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Showing
                  <span class="font-medium">{{ startIndex + 1 }}</span>
                  to
                  <span class="font-medium">{{ Math.min(endIndex, filteredAdmins.length) }}</span>
                  of
                  <span class="font-medium">{{ filteredAdmins.length }}</span>
                  results
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    @click="currentPage = Math.max(1, currentPage - 1)"
                    :disabled="currentPage === 1"
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i class="fas fa-chevron-left"></i>
                  </button>
                  
                  <button
                    v-for="page in visiblePages"
                    :key="page"
                    @click="currentPage = page"
                    :class="[
                      'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                      page === currentPage
                        ? 'z-10 bg-red-50 border-red-500 text-red-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    ]"
                  >
                    {{ page }}
                  </button>
                  
                  <button
                    @click="currentPage = Math.min(totalPages, currentPage + 1)"
                    :disabled="currentPage === totalPages"
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Create Admin Modal -->
    <Modal
      :is-open="showCreateModal"
      title="Create New Administrator"
      size="lg"
      @close="closeCreateModal"
      @confirm="createAdmin"
    >
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">First Name *</label>
            <input
              v-model="adminForm.first_name"
              type="text"
              required
              class="mt-1 input-field"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Last Name *</label>
            <input
              v-model="adminForm.last_name"
              type="text"
              required
              class="mt-1 input-field"
            />
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700">Email Address *</label>
          <input
            v-model="adminForm.email"
            type="email"
            required
            class="mt-1 input-field"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700">Contact Number</label>
          <input
            v-model="adminForm.contact_number"
            type="tel"
            class="mt-1 input-field"
            placeholder="09XXXXXXXXX"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700">Temporary Password *</label>
          <input
            v-model="adminForm.password"
            type="password"
            required
            class="mt-1 input-field"
            placeholder="Minimum 8 characters"
          />
          <p class="text-xs text-gray-500 mt-1">
            Admin will be required to change password on first login
          </p>
        </div>
      </div>
    </Modal>
    
    <!-- Edit Admin Modal -->
    <Modal
      :is-open="showEditModal"
      title="Edit Administrator"
      size="lg"
      @close="closeEditModal"
      @confirm="updateAdmin"
    >
      <div v-if="selectedAdmin" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">First Name *</label>
            <input
              v-model="editForm.first_name"
              type="text"
              required
              class="mt-1 input-field"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Last Name *</label>
            <input
              v-model="editForm.last_name"
              type="text"
              required
              class="mt-1 input-field"
            />
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700">Email Address *</label>
          <input
            v-model="editForm.email"
            type="email"
            required
            class="mt-1 input-field"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700">Contact Number</label>
          <input
            v-model="editForm.contact_number"
            type="tel"
            class="mt-1 input-field"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700">Address</label>
          <textarea
            v-model="editForm.address"
            rows="3"
            class="mt-1 input-field"
          ></textarea>
        </div>
      </div>
    </Modal>
    
    <!-- Activity Modal -->
    <Modal
      :is-open="showActivityModal"
      title="Administrator Activity Log"
      size="xl"
      :show-actions="false"
      @close="closeActivityModal"
    >
      <div v-if="selectedAdmin" class="space-y-6">
        <div class="bg-gray-50 p-4 rounded-lg">
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            {{ selectedAdmin.first_name }} {{ selectedAdmin.last_name }}
          </h3>
          <p class="text-sm text-gray-600">{{ selectedAdmin.email }}</p>
        </div>
        
        <div v-if="adminActivity.length === 0" class="text-center py-8">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-history text-gray-400 text-2xl"></i>
          </div>
          <p class="text-gray-500">No activity recorded</p>
        </div>
        
        <div v-else class="space-y-4 max-h-96 overflow-y-auto">
          <div
            v-for="activity in adminActivity"
            :key="activity.id"
            class="flex items-start p-4 border border-gray-200 rounded-lg"
          >
            <div class="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <i :class="getActivityIcon(activity.action)" class="text-blue-600 text-sm"></i>
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900">{{ activity.description }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ formatDateTime(activity.created_at) }}</p>
              <div v-if="activity.details" class="text-xs text-gray-600 mt-2">
                {{ activity.details }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { supabase } from '@/composables/useSupabase'
import { useAuth } from '@/composables/useAuth'
import Navbar from '@/components/common/Navbar.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import Modal from '@/components/common/Modal.vue'

export default {
  name: 'AdminManagement',
  components: {
    Navbar,
    LoadingSpinner,
    Modal
  },
  setup() {
    const { user } = useAuth()
    const loading = ref(false)
    const admins = ref([])
    const adminActivity = ref([])
    
    const selectedFilter = ref('')
    const searchQuery = ref('')
    const currentPage = ref(1)
    const itemsPerPage = 20
    
    // Modals
    const showCreateModal = ref(false)
    const showEditModal = ref(false)
    const showActivityModal = ref(false)
    const selectedAdmin = ref(null)
    
    const adminForm = reactive({
      first_name: '',
      last_name: '',
      email: '',
      contact_number: '',
      password: ''
    })
    
    const editForm = reactive({
      first_name: '',
      last_name: '',
      email: '',
      contact_number: '',
      address: ''
    })
    
    const adminStats = reactive({
      total: 0,
      active: 0,
      recentLogins: 0
    })
    
    const currentAdminId = computed(() => user.value?.id)
    
    const filteredAdmins = computed(() => {
      let filtered = admins.value
      
      if (selectedFilter.value === 'active') {
        filtered = filtered.filter(admin => !admin.is_banned && admin.email_verified)
      } else if (selectedFilter.value === 'inactive') {
        filtered = filtered.filter(admin => admin.is_banned || !admin.email_verified)
      } else if (selectedFilter.value === 'recent') {
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        filtered = filtered.filter(admin => admin.last_login && new Date(admin.last_login) > dayAgo)
      }
      
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(admin => 
          `${admin.first_name} ${admin.last_name}`.toLowerCase().includes(query) ||
          admin.email.toLowerCase().includes(query)
        )
      }
      
      return filtered
    })
    
    const totalPages = computed(() => {
      return Math.ceil(filteredAdmins.value.length / itemsPerPage)
    })
    
    const startIndex = computed(() => {
      return (currentPage.value - 1) * itemsPerPage
    })
    
    const endIndex = computed(() => {
      return startIndex.value + itemsPerPage
    })
    
    const paginatedAdmins = computed(() => {
      return filteredAdmins.value.slice(startIndex.value, endIndex.value)
    })
    
    const visiblePages = computed(() => {
      const pages = []
      const maxVisible = 5
      const half = Math.floor(maxVisible / 2)
      
      let start = Math.max(1, currentPage.value - half)
      let end = Math.min(totalPages.value, start + maxVisible - 1)
      
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1)
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      return pages
    })
    
    const loadAdmins = async () => {
      try {
        loading.value = true
        
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('role', 'admin')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        
        admins.value = data || []
        
        // Update stats
        adminStats.total = admins.value.length
        adminStats.active = admins.value.filter(admin => !admin.is_banned && admin.email_verified).length
        
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        adminStats.recentLogins = admins.value.filter(admin => 
          admin.last_login && new Date(admin.last_login) > dayAgo
        ).length
        
      } catch (error) {
        console.error('Error loading admins:', error)
      } finally {
        loading.value = false
      }
    }
    
    const refreshAdmins = async () => {
      await loadAdmins()
    }
    
    const createAdmin = async () => {
      if (!adminForm.first_name || !adminForm.last_name || !adminForm.email || !adminForm.password) {
        alert('Please fill in all required fields')
        return
      }
      
      if (adminForm.password.length < 8) {
        alert('Password must be at least 8 characters long')
        return
      }
      
      try {
        // Create auth user
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: adminForm.email,
          password: adminForm.password,
          options: {
            data: {
              first_name: adminForm.first_name,
              last_name: adminForm.last_name,
              contact_number: adminForm.contact_number || '',
              role: 'admin'
            }
          }
        })
        
        if (signUpError) throw signUpError
        
        // Create user profile
        if (authData.user) {
          const profileData = {
            user_id: authData.user.id,
            first_name: adminForm.first_name,
            last_name: adminForm.last_name,
            email: adminForm.email,
            contact_number: adminForm.contact_number || null,
            address: null,
            role: 'admin',
            email_verified: false,
            is_banned: false,
            created_at: new Date().toISOString()
          }
          
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert([profileData])
          
          if (profileError) throw profileError
        }
        
        alert('Administrator created successfully!')
        closeCreateModal()
        await loadAdmins()
        
      } catch (error) {
        console.error('Error creating admin:', error)
        alert('Error creating administrator: ' + error.message)
      }
    }
    
    const editAdmin = (admin) => {
      selectedAdmin.value = admin
      editForm.first_name = admin.first_name
      editForm.last_name = admin.last_name
      editForm.email = admin.email
      editForm.contact_number = admin.contact_number || ''
      editForm.address = admin.address || ''
      showEditModal.value = true
    }
    
    const updateAdmin = async () => {
      if (!selectedAdmin.value) return
      
      try {
        const { error } = await supabase
          .from('user_profiles')
          .update({
            first_name: editForm.first_name,
            last_name: editForm.last_name,
            email: editForm.email,
            contact_number: editForm.contact_number || null,
            address: editForm.address || null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', selectedAdmin.value.user_id)
        
        if (error) throw error
        
        alert('Administrator updated successfully!')
        closeEditModal()
        await loadAdmins()
        
      } catch (error) {
        console.error('Error updating admin:', error)
        alert('Error updating administrator: ' + error.message)
      }
    }
    
    const toggleAdminStatus = async (admin) => {
      const action = admin.is_banned ? 'activate' : 'deactivate'
      
      if (!confirm(`Are you sure you want to ${action} this administrator?`)) return
      
      try {
        const { error } = await supabase
          .from('user_profiles')
          .update({ 
            is_banned: !admin.is_banned,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', admin.user_id)
        
        if (error) throw error
        
        admin.is_banned = !admin.is_banned
        alert(`Administrator ${action}d successfully!`)
        
      } catch (error) {
        console.error('Error updating admin status:', error)
        alert('Error updating administrator status: ' + error.message)
      }
    }
    
    const resetAdminPassword = async (admin) => {
      if (!confirm(`Send password reset email to ${admin.email}?`)) return
      
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(admin.email)
        
        if (error) throw error
        
        alert('Password reset email sent successfully!')
        
      } catch (error) {
        console.error('Error sending password reset:', error)
        alert('Error sending password reset: ' + error.message)
      }
    }
    
    const viewAdminActivity = async (admin) => {
      selectedAdmin.value = admin
      
      try {
        // Load admin activity log
        const { data, error } = await supabase
          .from('admin_audit_log')
          .select('*')
          .eq('admin_id', admin.user_id)
          .order('created_at', { ascending: false })
          .limit(50)
        
        if (error) throw error
        
        adminActivity.value = data || []
        showActivityModal.value = true
        
      } catch (error) {
        console.error('Error loading admin activity:', error)
        adminActivity.value = []
        showActivityModal.value = true
      }
    }
    
    const closeCreateModal = () => {
      showCreateModal.value = false
      Object.keys(adminForm).forEach(key => {
        adminForm[key] = ''
      })
    }
    
    const closeEditModal = () => {
      showEditModal.value = false
      selectedAdmin.value = null
    }
    
    const closeActivityModal = () => {
      showActivityModal.value = false
      selectedAdmin.value = null
      adminActivity.value = []
    }
    
    const getAdminStatus = (admin) => {
      if (admin.is_banned) return 'Deactivated'
      if (!admin.email_verified) return 'Unverified'
      return 'Active'
    }
    
    const getActivityIcon = (action) => {
      const icons = {
        'login': 'fas fa-sign-in-alt',
        'logout': 'fas fa-sign-out-alt',
        'user_created': 'fas fa-user-plus',
        'user_updated': 'fas fa-user-edit',
        'order_updated': 'fas fa-edit',
        'settings_changed': 'fas fa-cog',
        'admin_created': 'fas fa-user-shield'
      }
      return icons[action] || 'fas fa-info-circle'
    }
    
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }
    
    const formatDateTime = (date) => {
      return new Date(date).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    onMounted(() => {
      loadAdmins()
    })
    
    return {
      loading,
      admins,
      adminActivity,
      selectedFilter,
      searchQuery,
      currentPage,
      adminStats,
      currentAdminId,
      filteredAdmins,
      paginatedAdmins,
      totalPages,
      startIndex,
      endIndex,
      visiblePages,
      showCreateModal,
      showEditModal,
      showActivityModal,
      selectedAdmin,
      adminForm,
      editForm,
      refreshAdmins,
      createAdmin,
      editAdmin,
      updateAdmin,
      toggleAdminStatus,
      resetAdminPassword,
      viewAdminActivity,
      closeCreateModal,
      closeEditModal,
      closeActivityModal,
      getAdminStatus,
      getActivityIcon,
      formatDate,
      formatDateTime
    }
  }
}
</script>
