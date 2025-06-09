<template>
  <div>
    <Navbar />
    
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Driver Applications</h1>
          <p class="mt-2 text-gray-600">Review and manage driver applications</p>
        </div>
        
        <!-- Filters and Actions -->
        <div class="card mb-6">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="status in statusFilters"
                :key="status.value"
                @click="selectedStatus = status.value"
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  selectedStatus === status.value
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                {{ status.label }}
                <span v-if="status.count !== undefined" class="ml-2 px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-xs">
                  {{ status.count }}
                </span>
              </button>
            </div>
            
            <div class="flex items-center space-x-4">
              <select
                v-model="sortBy"
                class="input-field w-auto"
                @change="sortApplications"
              >
                <option value="applied_at">Sort by Application Date</option>
                <option value="first_name">Sort by Name</option>
                <option value="experience">Sort by Experience</option>
              </select>
              
              <button
                @click="refreshApplications"
                class="btn-secondary"
                :disabled="loading"
              >
                <i class="fas fa-sync-alt mr-2" :class="{ 'fa-spin': loading }"></i>
                Refresh
              </button>
              
              <button
                @click="exportApplications"
                class="btn-outline"
              >
                <i class="fas fa-download mr-2"></i>
                Export
              </button>
            </div>
          </div>
          
          <!-- Search -->
          <div class="mt-4">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-search text-gray-400"></i>
              </div>
              <input
                v-model="searchQuery"
                type="text"
                class="input-field pl-10"
                placeholder="Search by name, email, or license number..."
              />
            </div>
          </div>
        </div>
        
        <!-- Applications Grid -->
        <LoadingSpinner v-if="loading && applications.length === 0" />
        
        <div v-else-if="filteredApplications.length === 0" class="text-center py-12">
          <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-user-clock text-gray-400 text-3xl"></i>
          </div>
          <h3 class="text-xl font-medium text-gray-900 mb-2">No applications found</h3>
          <p class="text-gray-500">
            {{ selectedStatus || searchQuery ? 'Try adjusting your filters' : 'No driver applications have been submitted yet' }}
          </p>
        </div>
        
        <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <div
            v-for="application in paginatedApplications"
            :key="application.id"
            class="card hover:shadow-lg transition-shadow duration-200"
          >
            <!-- Application Header -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <i class="fas fa-motorcycle text-blue-600 text-xl"></i>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">
                    {{ application.first_name }} {{ application.last_name }}
                  </h3>
                  <p class="text-sm text-gray-500">{{ application.email }}</p>
                </div>
              </div>
              
              <span :class="getStatusClass(application.status)">
                {{ formatStatus(application.status) }}
              </span>
            </div>
            
            <!-- Application Details -->
            <div class="space-y-3 mb-4">
              <div class="flex items-center text-sm">
                <i class="fas fa-phone text-gray-400 w-5"></i>
                <span class="ml-2 text-gray-600">{{ application.mobile_number }}</span>
              </div>
              
              <div class="flex items-center text-sm">
                <i class="fas fa-id-card text-gray-400 w-5"></i>
                <span class="ml-2 text-gray-600">{{ application.license_number }}</span>
              </div>
              
              <div class="flex items-center text-sm">
                <i class="fas fa-motorcycle text-gray-400 w-5"></i>
                <span class="ml-2 text-gray-600">{{ application.motorcycle_plate_number }}</span>
              </div>
              
              <div class="flex items-center text-sm">
                <i class="fas fa-calendar text-gray-400 w-5"></i>
                <span class="ml-2 text-gray-600">{{ application.years_of_experience }} experience</span>
              </div>
              
              <div class="flex items-center text-sm">
                <i class="fas fa-clock text-gray-400 w-5"></i>
                <span class="ml-2 text-gray-600">Applied {{ formatTimeAgo(application.applied_at) }}</span>
              </div>
            </div>
            
            <!-- Vehicle Information -->
            <div v-if="application.motorcycle_brand" class="mb-4 p-3 bg-gray-50 rounded-lg">
              <p class="text-sm font-medium text-gray-700">Vehicle</p>
              <p class="text-sm text-gray-600">{{ application.motorcycle_brand }}</p>
            </div>
            
            <!-- Documents Status -->
            <div class="mb-4">
              <p class="text-sm font-medium text-gray-700 mb-2">Documents</p>
              <div class="grid grid-cols-2 gap-2">
                <div class="flex items-center text-xs">
                  <i :class="[
                    'fas mr-1',
                    application.license_url ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500'
                  ]"></i>
                  License
                </div>
                <div class="flex items-center text-xs">
                  <i :class="[
                    'fas mr-1',
                    application.orcr_url ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500'
                  ]"></i>
                  ORCR
                </div>
                <div class="flex items-center text-xs">
                  <i :class="[
                    'fas mr-1',
                    application.selfie_url ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500'
                  ]"></i>
                  Selfie
                </div>
                <div class="flex items-center text-xs">
                  <i :class="[
                    'fas mr-1',
                    application.profile_picture_url ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500'
                  ]"></i>
                  Profile
                </div>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                @click="viewApplicationDetails(application)"
                class="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                View Details
              </button>
              
              <div v-if="application.status === 'pending'" class="flex items-center space-x-2">
                <button
                  @click="rejectApplication(application)"
                  class="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  @click="approveApplication(application)"
                  class="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
              
              <div v-else-if="application.status === 'approved'" class="text-sm text-green-600">
                <i class="fas fa-check-circle mr-1"></i>
                Approved
              </div>
              
              <div v-else-if="application.status === 'rejected'" class="text-sm text-red-600">
                <i class="fas fa-times-circle mr-1"></i>
                Rejected
              </div>
            </div>
          </div>
        </div>
        
        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-8 flex items-center justify-center">
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
                  ? 'z-10 bg-green-50 border-green-500 text-green-600'
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
    
    <!-- Application Details Modal -->
    <Modal
      :is-open="showDetailsModal"
      title="Driver Application Details"
      size="xl"
      :show-actions="false"
      @close="closeDetailsModal"
    >
      <div v-if="selectedApplication" class="space-y-6">
        <!-- Personal Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
            <dl class="space-y-2">
              <div>
                <dt class="text-sm font-medium text-gray-500">Full Name</dt>
                <dd class="text-sm text-gray-900">{{ selectedApplication.first_name }} {{ selectedApplication.last_name }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Email</dt>
                <dd class="text-sm text-gray-900">{{ selectedApplication.email }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Mobile Number</dt>
                <dd class="text-sm text-gray-900">{{ selectedApplication.mobile_number }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Home Address</dt>
                <dd class="text-sm text-gray-900">{{ selectedApplication.home_address }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Date of Birth</dt>
                <dd class="text-sm text-gray-900">{{ formatDate(selectedApplication.date_of_birth) }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Years of Experience</dt>
                <dd class="text-sm text-gray-900">{{ selectedApplication.years_of_experience }}</dd>
              </div>
            </dl>
          </div>
          
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">License & Vehicle Information</h3>
            <dl class="space-y-2">
              <div>
                <dt class="text-sm font-medium text-gray-500">License Number</dt>
                <dd class="text-sm text-gray-900">{{ selectedApplication.license_number }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">License Expiry</dt>
                <dd class="text-sm text-gray-900">{{ formatDate(selectedApplication.license_expiry_date) }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Motorcycle Plate Number</dt>
                <dd class="text-sm text-gray-900">{{ selectedApplication.motorcycle_plate_number }}</dd>
              </div>
              <div v-if="selectedApplication.motorcycle_brand">
                <dt class="text-sm font-medium text-gray-500">Motorcycle Brand/Model</dt>
                <dd class="text-sm text-gray-900">{{ selectedApplication.motorcycle_brand }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Application Date</dt>
                <dd class="text-sm text-gray-900">{{ formatDateTime(selectedApplication.applied_at) }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Status</dt>
                <dd>
                  <span :class="getStatusClass(selectedApplication.status)">
                    {{ formatStatus(selectedApplication.status) }}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
        
        <!-- Availability Schedule -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Availability Schedule</h3>
          <div class="p-4 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-700">{{ selectedApplication.availability_schedule }}</p>
          </div>
        </div>
        
        <!-- Additional Notes -->
        <div v-if="selectedApplication.notes">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Additional Notes</h3>
          <div class="p-4 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-700">{{ selectedApplication.notes }}</p>
          </div>
        </div>
        
        <!-- Documents -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Uploaded Documents</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-if="selectedApplication.license_url">
              <h4 class="font-medium text-gray-900 mb-2">Driver's License</h4>
              <img
                :src="selectedApplication.license_url"
                alt="Driver's License"
                class="w-full h-48 object-cover rounded-lg border border-gray-200 cursor-pointer"
                @click="viewFullImage(selectedApplication.license_url, `Driver's License`)"
              />
            </div>
            
            <div v-if="selectedApplication.orcr_url">
              <h4 class="font-medium text-gray-900 mb-2">ORCR</h4>
              <img
                :src="selectedApplication.orcr_url"
                alt="ORCR"
                class="w-full h-48 object-cover rounded-lg border border-gray-200 cursor-pointer"
                @click="viewFullImage(selectedApplication.orcr_url, 'ORCR')"
              />
            </div>
            
            <div v-if="selectedApplication.selfie_url">
              <h4 class="font-medium text-gray-900 mb-2">Selfie with ID</h4>
              <img
                :src="selectedApplication.selfie_url"
                alt="Selfie with ID"
                class="w-full h-48 object-cover rounded-lg border border-gray-200 cursor-pointer"
                @click="viewFullImage(selectedApplication.selfie_url, 'Selfie with ID')"
              />
            </div>
            
            <div v-if="selectedApplication.profile_picture_url">
              <h4 class="font-medium text-gray-900 mb-2">Profile Picture</h4>
              <img
                :src="selectedApplication.profile_picture_url"
                alt="Profile Picture"
                class="w-full h-48 object-cover rounded-lg border border-gray-200 cursor-pointer"
                @click="viewFullImage(selectedApplication.profile_picture_url, 'Profile Picture')"
              />
            </div>
          </div>
        </div>
        
        <!-- Admin Actions -->
        <div v-if="selectedApplication.status === 'pending'" class="border-t border-gray-200 pt-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Admin Actions</h3>
          <div class="flex flex-wrap gap-2">
            <button
              @click="approveApplication(selectedApplication)"
              class="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
            >
              <i class="fas fa-check mr-2"></i>
              Approve Application
            </button>
            
            <button
              @click="rejectApplication(selectedApplication)"
              class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
            >
              <i class="fas fa-times mr-2"></i>
              Reject Application
            </button>
            
            <button
              @click="requestMoreInfo(selectedApplication)"
              class="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700"
            >
              <i class="fas fa-question-circle mr-2"></i>
              Request More Info
            </button>
          </div>
        </div>
      </div>
    </Modal>
    
    <!-- Full Image Modal -->
    <Modal
      :is-open="showImageModal"
      :title="imageTitle"
      size="lg"
      :show-actions="false"
      @close="closeImageModal"
    >
      <div class="text-center">
        <img
          v-if="selectedImage"
          :src="selectedImage"
          :alt="imageTitle"
          class="max-w-full max-h-96 mx-auto rounded-lg"
        />
      </div>
    </Modal>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { supabase } from '@/composables/useSupabase'
import { useRealtime } from '@/composables/useRealtime'
import Navbar from '@/components/common/Navbar.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import Modal from '@/components/common/Modal.vue'

export default {
  name: 'AdminDriverApplications',
  components: {
    Navbar,
    LoadingSpinner,
    Modal
  },
  setup() {
    const { subscribeToDriverApplications } = useRealtime()
    
    const loading = ref(false)
    const applications = ref([])
    
    const selectedStatus = ref('')
    const searchQuery = ref('')
    const sortBy = ref('applied_at')
    const currentPage = ref(1)
    const itemsPerPage = 12
    
    // Modals
    const showDetailsModal = ref(false)
    const showImageModal = ref(false)
    const selectedApplication = ref(null)
    const selectedImage = ref('')
    const imageTitle = ref('')
    
    const statusFilters = computed(() => {
      const statusCounts = applications.value.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1
        return acc
      }, {})
      
      return [
        { label: 'All', value: '', count: applications.value.length },
        { label: 'Pending', value: 'pending', count: statusCounts.pending || 0 },
        { label: 'Approved', value: 'approved', count: statusCounts.approved || 0 },
        { label: 'Rejected', value: 'rejected', count: statusCounts.rejected || 0 },
        { label: 'Under Review', value: 'under_review', count: statusCounts.under_review || 0 }
      ]
    })
    
    const filteredApplications = computed(() => {
      let filtered = applications.value
      
      if (selectedStatus.value) {
        filtered = filtered.filter(app => app.status === selectedStatus.value)
      }
      
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(app => 
          `${app.first_name} ${app.last_name}`.toLowerCase().includes(query) ||
          app.email.toLowerCase().includes(query) ||
          app.license_number?.toLowerCase().includes(query) ||
          app.motorcycle_plate_number?.toLowerCase().includes(query)
        )
      }
      
      return filtered
    })
    
    const totalPages = computed(() => {
      return Math.ceil(filteredApplications.value.length / itemsPerPage)
    })
    
    const paginatedApplications = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return filteredApplications.value.slice(start, end)
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
    
    const loadApplications = async () => {
      try {
        loading.value = true
        
        const { data, error } = await supabase
          .from('driver_applications')
          .select('*')
          .order('applied_at', { ascending: false })
        
        if (error) throw error
        
        applications.value = data || []
        sortApplications()
      } catch (error) {
        console.error('Error loading driver applications:', error)
      } finally {
        loading.value = false
      }
    }
    
    const sortApplications = () => {
      applications.value.sort((a, b) => {
        if (sortBy.value === 'applied_at') {
          return new Date(b.applied_at) - new Date(a.applied_at)
        } else if (sortBy.value === 'first_name') {
          return a.first_name.localeCompare(b.first_name)
        } else if (sortBy.value === 'experience') {
          return b.years_of_experience.localeCompare(a.years_of_experience)
        }
        return 0
      })
    }
    
    const refreshApplications = async () => {
      await loadApplications()
    }
    
    const viewApplicationDetails = (application) => {
      selectedApplication.value = application
      showDetailsModal.value = true
    }
    
    const closeDetailsModal = () => {
      showDetailsModal.value = false
      selectedApplication.value = null
    }
    
    const viewFullImage = (imageUrl, title) => {
      selectedImage.value = imageUrl
      imageTitle.value = title
      showImageModal.value = true
    }
    
    const closeImageModal = () => {
      showImageModal.value = false
      selectedImage.value = ''
      imageTitle.value = ''
    }
    
    const approveApplication = async (application) => {
      if (!confirm('Are you sure you want to approve this driver application?')) return
      
      try {
        // Update application status
        const { error: updateError } = await supabase
          .from('driver_applications')
          .update({ status: 'approved' })
          .eq('id', application.id)
        
        if (updateError) throw updateError
        
        // Create driver profile
        const driverData = {
          user_id: null, // Will be set when driver creates account
          first_name: application.first_name,
          last_name: application.last_name,
          email: application.email,
          contact_number: application.mobile_number,
          address: application.home_address,
          license_number: application.license_number,
          license_expiry_date: application.license_expiry_date,
          plate_number: application.motorcycle_plate_number,
          vehicle_brand: application.motorcycle_brand,
          vehicle_type: 'motorcycle',
          license_url: application.license_url,
          orcr_url: application.orcr_url,
          selfie_url: application.selfie_url,
          profile_picture_url: application.profile_picture_url,
          is_active: true,
          is_online: false
        }
        
        const { error: profileError } = await supabase
          .from('driver_profiles')
          .insert(driverData)
        
        if (profileError) throw profileError
        
        // Update local state
        const appIndex = applications.value.findIndex(app => app.id === application.id)
        if (appIndex !== -1) {
          applications.value[appIndex].status = 'approved'
        }
        
        if (selectedApplication.value?.id === application.id) {
          selectedApplication.value.status = 'approved'
        }
        
        alert('Driver application approved successfully!')
        
        // TODO: Send approval email to driver
        console.log('Sending approval email to:', application.email)
        
      } catch (error) {
        console.error('Error approving application:', error)
        alert('Error approving application: ' + error.message)
      }
    }
    
    const rejectApplication = async (application) => {
      const reason = prompt('Please provide a reason for rejection (optional):')
      
      if (!confirm('Are you sure you want to reject this driver application?')) return
      
      try {
        const { error } = await supabase
          .from('driver_applications')
          .update({ 
            status: 'rejected',
            rejection_reason: reason 
          })
          .eq('id', application.id)
        
        if (error) throw error
        
        // Update local state
        const appIndex = applications.value.findIndex(app => app.id === application.id)
        if (appIndex !== -1) {
          applications.value[appIndex].status = 'rejected'
        }
        
        if (selectedApplication.value?.id === application.id) {
          selectedApplication.value.status = 'rejected'
        }
        
        alert('Driver application rejected.')
        
        // TODO: Send rejection email to driver
        console.log('Sending rejection email to:', application.email)
        
      } catch (error) {
        console.error('Error rejecting application:', error)
        alert('Error rejecting application: ' + error.message)
      }
    }
    
    const requestMoreInfo = async (application) => {
      const info = prompt('What additional information do you need from the applicant?')
      
      if (!info) return
      
      try {
        const { error } = await supabase
          .from('driver_applications')
          .update({ 
            status: 'under_review',
            admin_notes: info 
          })
          .eq('id', application.id)
        
        if (error) throw error
        
        // Update local state
        const appIndex = applications.value.findIndex(app => app.id === application.id)
        if (appIndex !== -1) {
          applications.value[appIndex].status = 'under_review'
        }
        
        if (selectedApplication.value?.id === application.id) {
          selectedApplication.value.status = 'under_review'
        }
        
        alert('Application marked as under review. The applicant will be contacted.')
        
        // TODO: Send email requesting more information
        console.log('Requesting more info from:', application.email, 'Info needed:', info)
        
      } catch (error) {
        console.error('Error updating application:', error)
        alert('Error updating application: ' + error.message)
      }
    }
    
    const exportApplications = () => {
      const headers = [
        'Name', 'Email', 'Mobile', 'License Number', 'Plate Number', 
        'Experience', 'Status', 'Applied Date'
      ]
      const csvContent = [
        headers.join(','),
        ...filteredApplications.value.map(app => [
          `${app.first_name} ${app.last_name}`,
          app.email,
          app.mobile_number,
          app.license_number,
          app.motorcycle_plate_number,
          app.years_of_experience,
          app.status,
          formatDate(app.applied_at)
        ].join(','))
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `driver_applications_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
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
    
    const formatTimeAgo = (date) => {
      const now = new Date()
      const appDate = new Date(date)
      const diffMs = now - appDate
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) return 'today'
      if (diffDays === 1) return 'yesterday'
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
      return formatDate(date)
    }
    
    const formatStatus = (status) => {
      return status.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    }
    
    const getStatusClass = (status) => {
      const classes = {
        'pending': 'status-badge status-placed',
        'approved': 'status-badge status-delivered',
        'rejected': 'status-badge status-cancelled',
        'under_review': 'status-badge status-assigned'
      }
      return classes[status] || 'status-badge status-placed'
    }
    
    let unsubscribe = null
    
    onMounted(async () => {
      await loadApplications()
      
      // Subscribe to real-time application updates
      unsubscribe = subscribeToDriverApplications((payload) => {
        if (payload.eventType === 'INSERT') {
          applications.value.unshift(payload.new)
        } else if (payload.eventType === 'UPDATE') {
          const appIndex = applications.value.findIndex(app => app.id === payload.new.id)
          if (appIndex !== -1) {
            applications.value[appIndex] = { ...applications.value[appIndex], ...payload.new }
          }
        }
      })
    })
    
    onUnmounted(() => {
      if (unsubscribe) {
        unsubscribe()
      }
    })
    
    return {
      loading,
      applications,
      selectedStatus,
      searchQuery,
      sortBy,
      currentPage,
      statusFilters,
      filteredApplications,
      paginatedApplications,
      totalPages,
      visiblePages,
      showDetailsModal,
      showImageModal,
      selectedApplication,
      selectedImage,
      imageTitle,
      refreshApplications,
      sortApplications,
      viewApplicationDetails,
      closeDetailsModal,
      viewFullImage,
      closeImageModal,
      approveApplication,
      rejectApplication,
      requestMoreInfo,
      exportApplications,
      formatDate,
      formatDateTime,
      formatTimeAgo,
      formatStatus,
      getStatusClass
    }
  }
}
</script>
