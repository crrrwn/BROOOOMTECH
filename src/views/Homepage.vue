<template>
  <div>
    <!-- Navigation -->
    <nav class="bg-white shadow-lg border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <i class="fas fa-truck text-white text-sm"></i>
              </div>
              <span class="text-xl font-bold text-gray-800">DeliveryHub</span>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            <router-link to="/login" class="btn-outline">Login</router-link>
            <router-link to="/register" class="btn-primary">Get Started</router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-green-50 to-green-100 py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Fast & Reliable
              <span class="text-green-600">Delivery Service</span>
            </h1>
            <p class="text-xl text-gray-600 mb-8">
              Get anything delivered to your doorstep in minutes. From food to groceries, 
              bills payment to surprise deliveries - we've got you covered!
            </p>
            <div class="flex flex-col sm:flex-row gap-4">
              <router-link to="/register" class="btn-primary text-lg px-8 py-4">
                <i class="fas fa-rocket mr-2"></i>
                Start Ordering
              </router-link>
              <router-link to="/driver/apply" class="btn-outline text-lg px-8 py-4">
                <i class="fas fa-motorcycle mr-2"></i>
                Become a Driver
              </router-link>
            </div>
          </div>
          
          <div class="relative">
            <div class="bg-white rounded-2xl shadow-2xl p-8">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-gray-900">Track Your Order</h3>
                <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  In Transit
                </span>
              </div>
              
              <div class="space-y-4">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <i class="fas fa-check text-white text-sm"></i>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">Order Placed</p>
                    <p class="text-sm text-gray-500">2:30 PM</p>
                  </div>
                </div>
                
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <i class="fas fa-check text-white text-sm"></i>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">Driver Assigned</p>
                    <p class="text-sm text-gray-500">2:35 PM</p>
                  </div>
                </div>
                
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <i class="fas fa-motorcycle text-white text-sm"></i>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">On the Way</p>
                    <p class="text-sm text-gray-500">ETA: 15 mins</p>
                  </div>
                </div>
                
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <i class="fas fa-home text-gray-400 text-sm"></i>
                  </div>
                  <div>
                    <p class="font-medium text-gray-400">Delivered</p>
                    <p class="text-sm text-gray-400">Pending</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Whatever you need, whenever you need it. Our comprehensive delivery services 
            are designed to make your life easier.
          </p>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div
            v-for="service in services"
            :key="service.name"
            class="bg-gray-50 hover:bg-green-50 rounded-xl p-6 text-center transition-all duration-300 hover:shadow-lg cursor-pointer group"
          >
            <div class="w-16 h-16 bg-green-100 group-hover:bg-green-200 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
              <i :class="`${service.icon} text-green-600 text-2xl`"></i>
            </div>
            <h3 class="font-semibold text-gray-900 mb-2">{{ service.name }}</h3>
            <p class="text-sm text-gray-600">{{ service.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p class="text-xl text-gray-600">
            Getting your items delivered is as easy as 1-2-3
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="text-2xl font-bold text-white">1</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-4">Place Your Order</h3>
            <p class="text-gray-600">
              Choose your service, add details, and specify pickup and delivery locations. 
              It takes less than 2 minutes!
            </p>
          </div>
          
          <div class="text-center">
            <div class="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="text-2xl font-bold text-white">2</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-4">Driver Assignment</h3>
            <p class="text-gray-600">
              Our system automatically assigns the nearest available driver to your order. 
              You'll get real-time updates.
            </p>
          </div>
          
          <div class="text-center">
            <div class="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="text-2xl font-bold text-white">3</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-4">Fast Delivery</h3>
            <p class="text-gray-600">
              Track your order in real-time and receive your items quickly and safely. 
              Rate your experience when done!
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-20 bg-green-600">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div class="text-4xl md:text-5xl font-bold text-white mb-2">10K+</div>
            <div class="text-green-100">Happy Customers</div>
          </div>
          <div>
            <div class="text-4xl md:text-5xl font-bold text-white mb-2">500+</div>
            <div class="text-green-100">Active Drivers</div>
          </div>
          <div>
            <div class="text-4xl md:text-5xl font-bold text-white mb-2">50K+</div>
            <div class="text-green-100">Deliveries Made</div>
          </div>
          <div>
            <div class="text-4xl md:text-5xl font-bold text-white mb-2">15min</div>
            <div class="text-green-100">Average Delivery</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Driver CTA Section -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 md:p-12 text-center">
          <div class="max-w-3xl mx-auto">
            <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
              Want to Earn Money as a Driver?
            </h2>
            <p class="text-xl text-green-100 mb-8">
              Join our team of professional drivers and start earning money on your own schedule. 
              Flexible hours, competitive rates, and weekly payouts.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <router-link to="/driver/apply" class="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold transition-colors">
                <i class="fas fa-motorcycle mr-2"></i>
                Apply Now
              </router-link>
              <a href="#" class="border-2 border-white text-white hover:bg-white hover:text-green-600 px-8 py-4 rounded-lg font-semibold transition-colors">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div class="flex items-center space-x-2 mb-4">
              <div class="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <i class="fas fa-truck text-white text-sm"></i>
              </div>
              <span class="text-xl font-bold">DeliveryHub</span>
            </div>
            <p class="text-gray-400 mb-4">
              Fast, reliable delivery service for all your needs. Available 24/7 across the city.
            </p>
            <div class="flex space-x-4">
              <a href="#" class="text-gray-400 hover:text-white">
                <i class="fab fa-facebook text-xl"></i>
              </a>
              <a href="#" class="text-gray-400 hover:text-white">
                <i class="fab fa-twitter text-xl"></i>
              </a>
              <a href="#" class="text-gray-400 hover:text-white">
                <i class="fab fa-instagram text-xl"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h3 class="font-semibold mb-4">Services</h3>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white">Food Delivery</a></li>
              <li><a href="#" class="hover:text-white">Pay Bills</a></li>
              <li><a href="#" class="hover:text-white">Pick-up Service</a></li>
              <li><a href="#" class="hover:text-white">Grocery Delivery</a></li>
            </ul>
          </div>
          
          <div>
            <h3 class="font-semibold mb-4">Company</h3>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white">About Us</a></li>
              <li><a href="#" class="hover:text-white">Contact</a></li>
              <li><a href="#" class="hover:text-white">Careers</a></li>
              <li><a href="#" class="hover:text-white">Help Center</a></li>
            </ul>
          </div>
          
          <div>
            <h3 class="font-semibold mb-4">Contact Info</h3>
            <ul class="space-y-2 text-gray-400">
              <li class="flex items-center">
                <i class="fas fa-phone mr-2"></i>
                +63 123 456 7890
              </li>
              <li class="flex items-center">
                <i class="fas fa-envelope mr-2"></i>
                support@deliveryhub.com
              </li>
              <li class="flex items-center">
                <i class="fas fa-map-marker-alt mr-2"></i>
                Metro Manila, Philippines
              </li>
            </ul>
          </div>
        </div>
        
        <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 DeliveryHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'Homepage',
  setup() {
    const services = [
      {
        name: 'Food Delivery',
        icon: 'fas fa-utensils',
        description: 'Order from your favorite restaurants'
      },
      {
        name: 'Pay Bills',
        icon: 'fas fa-file-invoice-dollar',
        description: 'Pay utility bills and services'
      },
      {
        name: 'Pick-up',
        icon: 'fas fa-hand-paper',
        description: 'Pick up items from any location'
      },
      {
        name: 'Surprise Delivery',
        icon: 'fas fa-gift',
        description: 'Send surprises to loved ones'
      },
      {
        name: 'Medicines',
        icon: 'fas fa-pills',
        description: 'Deliver medicines and prescriptions'
      },
      {
        name: 'Grocery',
        icon: 'fas fa-shopping-cart',
        description: 'Grocery shopping and delivery'
      },
      {
        name: 'Pabili',
        icon: 'fas fa-shopping-bag',
        description: 'Buy items from stores'
      },
      {
        name: 'Documents',
        icon: 'fas fa-file-alt',
        description: 'Important document delivery'
      }
    ]
    
    return {
      services
    }
  }
}
</script>
