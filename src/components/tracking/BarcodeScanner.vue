<template>
  <div class="barcode-scanner">
    <div class="mb-4">
      <div class="flex flex-col sm:flex-row gap-2">
        <div class="flex-1">
          <input
            type="text"
            v-model="manualCode"
            placeholder="Enter barcode manually"
            class="input-field w-full"
            @keyup.enter="verifyManualCode"
          />
        </div>
        <button @click="verifyManualCode" class="btn-primary">Verify</button>
      </div>
    </div>

    <div v-if="showScanner" class="mb-4">
      <div class="relative">
        <video
          ref="videoElement"
          class="w-full h-64 object-cover border border-gray-300 rounded-lg"
        ></video>
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div class="w-64 h-1 bg-red-500 opacity-70"></div>
        </div>
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div class="w-1 h-64 bg-red-500 opacity-70"></div>
        </div>
      </div>
      <div class="mt-2 flex justify-between">
        <button @click="stopScanner" class="btn-secondary text-sm">Stop Scanner</button>
        <button @click="toggleFlash" class="btn-secondary text-sm">
          {{ flashOn ? 'Turn Flash Off' : 'Turn Flash On' }}
        </button>
      </div>
    </div>
    <div v-else class="mb-4">
      <button @click="startScanner" class="btn-primary w-full">
        <i class="fas fa-camera mr-2"></i> Scan Barcode
      </button>
    </div>

    <div v-if="lastScanned" class="p-3 bg-green-50 border border-green-200 rounded-lg">
      <p class="text-sm font-medium text-green-800">Last scanned: {{ lastScanned }}</p>
    </div>

    <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg mt-2">
      <p class="text-sm font-medium text-red-800">{{ error }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "BarcodeScanner",
  emits: ["code-scanned"],
  data() {
    return {
      showScanner: false,
      scanning: false,
      manualCode: "",
      lastScanned: "",
      error: "",
      stream: null,
      flashOn: false,
      videoTrack: null
    };
  },
  methods: {
    async startScanner() {
      this.error = "";
      this.showScanner = true;
      
      try {
        // Request camera access
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        
        // Set video source
        const video = this.$refs.videoElement;
        video.srcObject = this.stream;
        video.setAttribute("playsinline", true); // Required for iOS
        
        // Start video
        await video.play();
        
        // Store video track for flash control
        this.videoTrack = this.stream.getVideoTracks()[0];
        
        // Start scanning
        this.scanning = true;
        this.scanCode();
      } catch (err) {
        console.error("Error starting scanner:", err);
        this.error = "Could not access camera. Please check permissions.";
        this.showScanner = false;
      }
    },
    
    stopScanner() {
      this.scanning = false;
      this.showScanner = false;
      
      // Stop all tracks
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
        this.videoTrack = null;
      }
      
      // Clear video source
      if (this.$refs.videoElement) {
        this.$refs.videoElement.srcObject = null;
      }
    },
    
    async toggleFlash() {
      if (!this.videoTrack) return;
      
      try {
        const capabilities = this.videoTrack.getCapabilities();
        
        // Check if torch is supported
        if (!capabilities.torch) {
          this.error = "Flash not supported on this device";
          return;
        }
        
        this.flashOn = !this.flashOn;
        await this.videoTrack.applyConstraints({
          advanced: [{ torch: this.flashOn }]
        });
      } catch (err) {
        console.error("Error toggling flash:", err);
        this.error = "Could not toggle flash";
        this.flashOn = false;
      }
    },
    
    async scanCode() {
      if (!this.scanning) return;
      
      const video = this.$refs.videoElement;
      if (!video) return;
      
      // Create canvas to analyze video frame
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      
      // Set canvas size to video size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      try {
        // Use BarcodeDetector API if available
        if ('BarcodeDetector' in window) {
          const barcodeDetector = new BarcodeDetector({
            formats: ['code_128', 'code_39', 'ean_13', 'qr_code']
          });
          
          const barcodes = await barcodeDetector.detect(canvas);
          
          if (barcodes.length > 0) {
            const code = barcodes[0].rawValue;
            this.processScannedCode(code);
            return;
          }
        } else {
          // Fallback to manual entry if BarcodeDetector not available
          this.error = "Automatic scanning not supported in this browser. Please enter code manually.";
          this.stopScanner();
          return;
        }
      } catch (err) {
        console.error("Error scanning barcode:", err);
      }
      
      // Continue scanning if no code found
      if (this.scanning) {
        requestAnimationFrame(() => this.scanCode());
      }
    },
    
    processScannedCode(code) {
      if (!code) return;
      
      // Prevent duplicate scans
      if (code === this.lastScanned) {
        // Continue scanning after a short delay
        setTimeout(() => {
          if (this.scanning) {
            this.scanCode();
          }
        }, 500);
        return;
      }
      
      // Update last scanned code
      this.lastScanned = code;
      this.manualCode = code;
      
      // Emit event with scanned code
      this.$emit("code-scanned", code);
      
      // Play success sound
      this.playBeepSound();
      
      // Stop scanner after successful scan
      this.stopScanner();
    },
    
    verifyManualCode() {
      if (!this.manualCode.trim()) {
        this.error = "Please enter a barcode";
        return;
      }
      
      this.lastScanned = this.manualCode;
      this.$emit("code-scanned", this.manualCode);
      this.playBeepSound();
    },
    
    playBeepSound() {
      try {
        const beep = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU" + Array(300).join("A"));
        beep.volume = 0.2;
        beep.play();
      } catch (err) {
        console.error("Could not play sound:", err);
      }
    }
  },
  
  beforeUnmount() {
    // Clean up resources
    this.stopScanner();
  }
};
</script>
