// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  modules: [
    '@nuxt/ui',
    '@nuxtjs/google-fonts',
    '@nuxtjs/supabase',
  ],
  css: ['~/assets/css/main.css'],
  supabase: {
    redirectOptions: {
      login: '/gj',        
      callback: '/confirm',   
      exclude: ['/', '/waiting', '/play', '/end'], 
    }
  },
  googleFonts: {
    families: {
      Coiny: true,
      Fredoka: [400, 700], 
    },
    display: 'swap',
    download: true, 
  },
  colorMode: { preference: 'dark' },
  devtools: { enabled: true },
  runtimeConfig: {
    adminPassword: process.env.ADMIN_PASSWORD,
  }
})