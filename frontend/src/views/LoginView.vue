<template>
  <div class="min-h-screen flex items-center justify-center bg-[#000000] p-4 font-sans">
    <div class="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 bg-[#000000] rounded-3xl overflow-hidden shadow-2xl">
      
      <div class="relative hidden md:block p-12 bg-cover bg-center" 
           style="background-image: url('/src/assets/gymapp-login.jpg')">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-[2px]"></div>
        <div class="relative z-10 h-full flex flex-col justify-center text-white">
          <p class="text-sm font-semibold tracking-widest uppercase mb-4 text-red-500">Gabung Gratis</p>
          <h1 class="text-5xl font-bold leading-tight mb-6">
            Latihan Jadi Lebih Mudah <span class="text-red-500 font-black">Bersama GymBuddy</span>
          </h1>
          <p class="text-gray-300 mb-10 max-w-sm">Temukan trainer terbaik dan wujudkan tubuh impianmu dengan sistem yang praktis dan terpercaya.</p>
        </div>
      </div>

      <div class="p-8 md:p-16 flex flex-col justify-center bg-[#000000]">
        <div class="mb-10">
          <h2 class="text-4xl font-bold text-white mb-2">Selamat Datang<span class="text-red-500">.</span></h2>
          <p class="text-gray-400">Silakan masukkan detail Anda untuk masuk.</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div class="relative">
            <label class="block text-xs font-semibold text-gray-500 uppercase mb-2 ml-1">Email</label>
            <input v-model="email" type="email" autocomplete="email" required
                   class="w-full bg-[#1F2937] border border-gray-700 text-white px-5 py-4 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all placeholder-gray-600"
                   placeholder="Masukkan email">
          </div>

          <div class="relative">
            <label class="block text-xs font-semibold text-gray-500 uppercase mb-2 ml-1">Password</label>
            <div class="relative">
              <input 
                v-model="password" 
                :type="showPassword ? 'text' : 'password'" 
                autocomplete="current-password" required
                class="w-full bg-[#1F2937] border border-gray-700 text-white px-5 py-4 pr-12 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all placeholder-gray-600"
                placeholder="••••••••">
              <button 
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500 transition-colors"
                :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
              >
                <EyeIcon v-if="!showPassword" class="w-5 h-5" />
                <EyeOffIcon v-else class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div v-if="errorMsg" class="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-2xl">
            {{ errorMsg }}
          </div>

          <button type="submit" :disabled="loading"
                  class="w-full bg-red-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-red-600 shadow-xl shadow-red-500/20 transition-all active:scale-[0.98] disabled:bg-gray-600">
            {{ loading ? 'Memproses...' : 'Masuk' }}
          </button>

          <div class="text-right">
            <router-link to="/forgot-password" class="text-gray-400 text-sm hover:text-red-500 transition-colors">Lupa Password?</router-link>
          </div>
        </form>

        <p class="mt-8 text-center text-gray-400 text-sm">
          Belum punya akun? 
          <router-link to="/register" class="text-red-500 font-bold hover:underline ml-1">Daftar Gratis</router-link>
        </p>
      </div>
    </div>
  </div>

  <!-- Toast Notification -->
  <Transition name="toast">
    <div v-if="toast.show" 
         :class="toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'"
         class="fixed bottom-6 right-6 px-6 py-4 rounded-2xl text-white font-bold text-sm shadow-2xl z-50">
      {{ toast.message }}
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { EyeIcon, EyeOffIcon } from 'lucide-vue-next'
import api from '../utils/api'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const toast = ref({ show: false, message: '', type: 'success' })

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

const handleLogin = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const response = await api.post('/auth/login', {
      email: email.value.trim().toLowerCase(),
      password: password.value
    })

    const { token, user } = response.data.data
    localStorage.setItem('token', token)
    authStore.setUser(user)
    
    showToast('Login Berhasil!')

    setTimeout(() => {
      if (user.role === 'admin') {
        router.push('/admin/dashboard')
      } else if (user.role === 'trainer') {
        router.push('/trainer-panel/dashboard')
      } else {
        router.push('/dashboard')
      }
    }, 500)

  } catch (error) {
    const errCode = error.response?.data?.error?.code
    const errMsg = error.response?.data?.error?.message || error.response?.data?.message || 'Gagal terhubung ke server'
    errorMsg.value = errMsg
    showToast(errMsg, 'error')
    
    if (errCode === 'EMAIL_NOT_VERIFIED') {
      setTimeout(() => {
        router.push({ path: '/verify-otp', query: { email: email.value.trim().toLowerCase() } })
      }, 1500)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.toast-enter-active, .toast-leave-active {
  transition: all 0.4s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
