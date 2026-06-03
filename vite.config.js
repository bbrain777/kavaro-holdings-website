import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        businesses: resolve(__dirname, 'businesses.html'),
        properties: resolve(__dirname, 'properties.html'),
        technologies: resolve(__dirname, 'technologies.html'),
        trading: resolve(__dirname, 'trading.html'),
        ventures: resolve(__dirname, 'ventures.html'),
        stays: resolve(__dirname, 'stays.html'),
        apartmentDetails: resolve(__dirname, 'apartment-details.html'),
        booking: resolve(__dirname, 'booking.html'),
        payment: resolve(__dirname, 'payment.html'),
        investments: resolve(__dirname, 'investments.html'),
        csr: resolve(__dirname, 'csr.html'),
        founder: resolve(__dirname, 'founder.html'),
        references: resolve(__dirname, 'references.html'),
        contact: resolve(__dirname, 'contact.html'),
      },
    },
  },
});
