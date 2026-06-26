<template>
  <div class="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-6 font-sans">
    <div class="max-w-md w-full mx-auto">
      <div class="bg-[#111111] rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div class="p-10 md:p-14 bg-[#000000]">
          <div class="mb-10 text-center">
            <div class="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 class="text-3xl font-bold text-white mb-2">Verifikasi Email<span class="text-red-500">.</span></h2>
            <p class="text-gray-400 text-sm">
              Kode OTP telah dikirim ke<br>
              <span class="text-white font-semibold">{{ email }}</span>
            </p>
          </div>

          <form @submit.prevent="handleVerify" class="space-y-6">
            <div class="space-y-2">
              <label class="text-xs font-semibold text-gray-500 uppercase ml-1">Kode OTP (6 Digit)</label>
              <input
                v-model="otp"
                type="text"
                maxlength="6"
                inputmode="numeric"
                placeholder="000000"
                :disabled="loading"
                :class="['w-full bg-[#1A1A1A] border-none text-white text-center text-3xl tracking-[0.5em] px-6 py-4 rounded-full focus:ring-2 outline-none transition-all placeholder-gray-700', error ? 'ring-2 ring-red-500' : 'focus:ring-red-500']"
                @input="otp = otp.replace(/\D/g, '')"
              >
              <p v-if="error" class="text-red-400 text-xs font-bold ml-2 mt-1">{{ error }}</p>
            </div>

            <button type="submit" :disabled="loading || otp.length !== 6"
                    class="w-full bg-red-500 text-white py-4 rounded-full font-bold text-lg hover:bg-red-600 shadow-xl shadow-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {{ loading ? 'Memverifikasi...' : 'Verifikasi Sekarang' }}
            </button>
          </form>

          <div class="mt-8 text-center space-y-3">
            <p class="text-gray-400 text-sm">
              Tidak menerima kode?
              <button @click="handleResend" :disabled="resendCooldown > 0 || resending"
                      class="text-red-500 font-bold hover:underline disabled:opacity-50 disabled:no-underline">
                {{ resendCooldown > 0 ? `Kirim ulang (${resendCooldown}s)` : (resending ? 'Mengirim...' : 'Kirim ulang OTP') }}
              </button>
            </p>
            <router-link to="/login" class="text-gray-500 text-sm hover:text-gray-300 inline-block">
              &larr; Kembali ke Login
            </router-link>
          </div>
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../utils/api'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const resending = ref(false)
const otp = ref('')
const error = ref('')
const email = ref((route.query.email || '').toString().trim().toLowerCase())
const toast = ref({ show: false, message: '', type: 'success' })
const resendCooldown = ref(0)
let cooldownTimer = null

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

const startCooldown = () => {
  resendCooldown.value = 60
  cooldownTimer = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      clearInterval(cooldownTimer)
    }
  }, 1000)
}

const handleVerify = async () => {
  if (otp.value.length !== 6) {
    error.value = 'Kode OTP harus 6 digit'
    return
  }

  loading.value = true
  error.value = ''
  try {
    await api.post('/auth/verify-otp', {
      email: email.value,
      otp: otp.value
    })
    showToast('Email berhasil diverifikasi! Silakan login.', 'success')
    setTimeout(() => router.push('/login'), 1500)
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Gagal verifikasi. Coba lagi.'
    error.value = msg
  } finally {
    loading.value = false
  }
}

const handleResend = async () => {
  if (resendCooldown.value > 0) return
  resending.value = true
  error.value = ''
  try {
    await api.post('/auth/resend-otp', { email: email.value })
    showToast('Kode OTP baru telah dikirim ke email Anda.', 'success')
    startCooldown()
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Gagal mengirim ulang OTP.'
    error.value = msg
  } finally {
    resending.value = false
  }
}

onMounted(() => {
  if (!email.value) {
    router.push('/register')
  }
})

onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer)
})
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
