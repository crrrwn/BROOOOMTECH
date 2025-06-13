<template>
  <div class="bg-white p-4 rounded-lg shadow">
    <h3 class="text-lg font-medium mb-4">Order Timeline</h3>
    
    <div class="space-y-6">
      <div 
        v-for="(step, index) in timelineSteps" 
        :key="index"
        class="relative"
      >
        <!-- Connector line -->
        <div 
          v-if="index < timelineSteps.length - 1" 
          class="absolute top-6 left-3 w-0.5 h-full bg-gray-200"
          :class="{ 'bg-green-500': step.completed }"
        ></div>
        
        <div class="flex items-start">
          <!-- Status indicator -->
          <div 
            class="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-1"
            :class="[
              step.completed ? 'bg-green-500' : 'bg-gray-200',
              step.current ? 'ring-2 ring-green-300' : ''
            ]"
          >
            <i 
              v-if="step.completed" 
              class="fas fa-check text-xs text-white"
            ></i>
          </div>
          
          <!-- Status content -->
          <div class="ml-4 flex-grow">
            <div class="flex items-center justify-between">
              <h4 class="text-base font-medium" :class="{ 'text-green-600': step.current }">
                {{ step.title }}
              </h4>
              <span 
                v-if="step.timestamp" 
                class="text-xs text-gray-500"
              >
                {{ formatDate(step.timestamp) }}
              </span>
            </div>
            
            <p class="text-sm text-gray-500 mt-1">{{ step.description }}</p>
            
            <!-- Proof links -->
            <div v-if="step.proofUrl" class="mt-2">
              <a 
                :href="step.proofUrl" 
                target="_blank" 
                class="text-sm text-blue-600 hover:underline flex items-center"
              >
                <i class="fas fa-image mr-1"></i>
                View {{ step.proofType === 'pickup' ? 'Pickup' : 'Delivery' }} Photo
              </a>
            </div>
            
            <!-- Verification status -->
            <div v-if="step.verification" class="mt-2 flex items-center">
              <span 
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                :class="{
                  'bg-green-100 text-green-800': step.verification.verified,
                  'bg-yellow-100 text-yellow-800': !step.verification.verified
                }"
              >
                <i 
                  :class="[
                    step.verification.verified ? 'fas fa-check-circle text-green-500' : 'fas fa-clock text-yellow-500',
                    'mr-1'
                  ]"
                ></i>
                {{ step.verification.verified ? 'Verified' : 'Pending Verification' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'OrderStatusTimeline',
  props: {
    order: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const timelineSteps = computed(() => {
      const steps = [
        {
          title: 'Order Placed',
          description: 'Your order has been received and is being processed.',
          timestamp: props.order.created_at,
          completed: true,
          current: props.order.status === 'placed'
        },
        {
          title: 'Driver Assigned',
          description: props.order.driver_id 
            ? `A driver has been assigned to your order.` 
            : 'Waiting for a driver to be assigned.',
          timestamp: props.order.assigned_at,
          completed: !!props.order.assigned_at,
          current: props.order.status === 'assigned'
        },
        {
          title: 'Pickup',
          description: 'Driver has picked up your order.',
          timestamp: props.order.picked_up_at,
          completed: !!props.order.picked_up_at,
          current: props.order.status === 'picked_up',
          proofUrl: props.order.pickup_proof_url,
          proofType: 'pickup',
          verification: {
            verified: !!props.order.barcode_verified_at,
            timestamp: props.order.barcode_verified_at
          }
        },
        {
          title: 'In Transit',
          description: 'Your order is on the way to the destination.',
          timestamp: props.order.in_transit_at,
          completed: !!props.order.in_transit_at,
          current: props.order.status === 'in_transit'
        },
        {
          title: 'Delivered',
          description: 'Your order has been delivered successfully.',
          timestamp: props.order.delivered_at,
          completed: !!props.order.delivered_at,
          current: props.order.status === 'delivered',
          proofUrl: props.order.delivery_proof_url,
          proofType: 'delivery'
        }
      ]
      
      // Add cancelled step if order is cancelled
      if (props.order.status === 'cancelled') {
        steps.push({
          title: 'Cancelled',
          description: 'This order has been cancelled.',
          timestamp: props.order.cancelled_at,
          completed: true,
          current: true
        })
      }
      
      return steps
    })
    
    const formatDate = (dateString) => {
      if (!dateString) return ''
      
      const date = new Date(dateString)
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      })
    }
    
    return {
      timelineSteps,
      formatDate
    }
  }
}
</script>
