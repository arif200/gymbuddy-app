<template>
  <div class="min-h-screen flex items-center justify-center bg-[#000000] p-4 font-sans">
    <div class="max-w-md w-full bg-[#111111] rounded-3xl overflow-hidden shadow-2xl">
      <div class="p-8 md:p-12">
        <div class="mb-8 text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a4 4 0 11-8 0 4 4 0 018 0zM12 15v2m-4 0h8m-4-6v.01" />
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-white mb-2">Lupa Password<span class="text-red-500">.</span></h2>
          <p class="text-gray-400 text-sm">Masukkan email akun Anda untuk membuat password baru.</p>
        </div>

        <div v-if="errorMsg" class="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-2xl mb-6">
          {{ errorMsg }}
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="space-y-2">
            <label class="block text-xs font-semibold text-gray-500 uppercase mb-2 ml-1">Email</label>
            <input v-model="email" type="email" autocomplete="email" required
                   class="w-full bg-[#1F2937] border border-gray-700 text-white px-5 py-4 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all placeholder-gray-600"
                   placeholder="Masukkan email terdaftar">
          </div>

          <button type="submit" :disabled="loading"
                  class="w-full bg-red-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-red-600 shadow-xl shadow-red-500/20 transition-all active:scale-[0.98] disabled:bg-gray-600">
            {{ loading ? 'Memproses...' : 'Lanjut Reset Password' }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <router-link to="/login" class="text-gray-400 text-sm hover:text-red-500 transition-colors">
            &larr; Kembali ke Login
          </router-link>
        </div>
      </div>
    </div>
  </div>

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
import api from '../utils/api'

const router = useRouter()
const email = ref('')
const loading = ref(false)
const errorMsg = ref('')
const toast = ref({ show: false, message: '', type: 'success' })

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

const handleSubmit = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await api.post('/auth/forgot-password', { email: email.value })
    const token = res.data?.data?.token || res.data?.token
    if (token) {
      showToast('Silakan buat password baru', 'success')
      router.push({ path: '/reset-password', query: { token } })
    } else {
      errorMsg.value = 'Terjadi kesalahan. Coba lagi.'
    }
  } catch (err) {
    errorMsg.value = err.response?.data?.error?.message || err.response?.data?.message || 'Gagal. Coba lagi.'
    showToast(errorMsg.value, 'error')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.4s ease; }
.toast-enter-from { opacity: 0; transform: translateX(100px); }
.toast-leave-to { opacity: 0; transform: translateY(20px); }
</style>
