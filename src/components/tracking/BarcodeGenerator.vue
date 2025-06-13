<template>
  <div class="barcode-container flex flex-col items-center">
    <canvas ref="barcodeCanvas" width="300" height="100" class="mb-2"></canvas>
    <p class="text-sm text-gray-600">{{ barcodeValue }}</p>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import JsBarcode from 'jsbarcode';

export default {
  name: 'BarcodeGenerator',
  props: {
    orderId: {
      type: [Number, String],
      required: true
    },
    barcodeValue: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const barcodeCanvas = ref(null);

    const generateBarcode = () => {
      if (!barcodeCanvas.value || !props.barcodeValue) return;
      
      try {
        JsBarcode(barcodeCanvas.value, props.barcodeValue, {
          format: "CODE128",
          lineColor: "#000",
          width: 2,
          height: 80,
          displayValue: false,
          fontSize: 16,
          margin: 10,
          background: "#ffffff"
        });
        console.log("Barcode generated successfully for:", props.barcodeValue);
      } catch (error) {
        console.error("Error generating barcode:", error);
      }
    };

    onMounted(() => {
      generateBarcode();
    });

    // Re-generate barcode if value changes
    watch(() => props.barcodeValue, () => {
      generateBarcode();
    });

    return {
      barcodeCanvas
    };
  }
};
</script>

<style scoped>
.barcode-container {
  padding: 1rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  max-width: 100%;
  overflow: hidden;
}
</style>
