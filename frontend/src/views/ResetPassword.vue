<template>
  <div class="min-h-screen flex items-center justify-center bg-[#000000] p-4 font-sans">
    <div class="max-w-md w-full bg-[#111111] rounded-3xl overflow-hidden shadow-2xl">
      <div class="p-8 md:p-12">
        <div class="mb-8 text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-white mb-2">Reset Password<span class="text-red-500">.</span></h2>
          <p class="text-gray-400 text-sm">Masukkan kode OTP dan password baru untuk akun Anda.</p>
        </div>

        <div v-if="errorMsg" class="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-2xl mb-6">
          {{ errorMsg }}
        </div>

        <div v-if="success" class="bg-green-500/10 border border-green-500/20 text-green-400 text-sm p-4 rounded-2xl mb-6">
          <p class="font-bold mb-1">Password berhasil diubah!</p>
          <p>Silakan login dengan password baru Anda.</p>
        </div>

        <form v-if="!success" @submit.prevent="handleSubmit" class="space-y-6">
          <div class="space-y-2">
            <label class="block text-xs font-semibold text-gray-500 uppercase mb-2 ml-1">Kode OTP (6 Digit)</label>
            <input v-model="otp" type="text" maxlength="6" inputmode="numeric" required
                   :class="['w-full bg-[#1F2937] border border-gray-700 text-white text-center text-2xl tracking-[0.5em] px-5 py-4 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all placeholder-gray-600']"
                   placeholder="000000"
                   @input="otp = otp.replace(/\D/g, '')">
          </div>

          <div class="space-y-2">
            <label class="block text-xs font-semibold text-gray-500 uppercase mb-2 ml-1">Password Baru</label>
            <input v-model="password" type="password" autocomplete="new-password" required
                   class="w-full bg-[#1F2937] border border-gray-700 text-white px-5 py-4 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all placeholder-gray-600"
                   placeholder="Minimal 6 karakter">
          </div>

          <div class="space-y-2">
            <label class="block text-xs font-semibold text-gray-500 uppercase mb-2 ml-1">Konfirmasi Password</label>
            <input v-model="confirmPassword" type="password" autocomplete="new-password" required
                   class="w-full bg-[#1F2937] border border-gray-700 text-white px-5 py-4 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all placeholder-gray-600"
                   placeholder="Ulangi password baru">
          </div>

          <button type="submit" :disabled="loading"
                  class="w-full bg-red-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-red-600 shadow-xl shadow-red-500/20 transition-all active:scale-[0.98] disabled:bg-gray-600">
            {{ loading ? 'Memproses...' : 'Ubah Password' }}
          </button>

          <div class="text-center">
            <button type="button" @click="handleResendOtp" :disabled="resendCooldown > 0 || resending"
                    class="text-gray-400 text-sm hover:text-red-500 transition-colors disabled:opacity-50">
              {{ resendCooldown > 0 ? `Kirim ulang OTP (${resendCooldown}s)` : (resending ? 'Mengirim...' : 'Tidak menerima kode? Kirim ulang OTP') }}
            </button>
          </div>
        </form>

        <div v-if="success" class="mt-6">
          <button @click="router.push('/login')"
                  class="w-full bg-red-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-red-600 shadow-xl shadow-red-500/20 transition-all">
            Login Sekarang
          </button>
        </div>

        <div v-if="!success" class="mt-6 text-center">
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../utils/api'

const router = useRouter()
const route = useRoute()
const email = ref((route.query.email || '').toString().trim().toLowerCase())
const otp = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const resending = ref(false)
const success = ref(false)
const errorMsg = ref('')
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

onMounted(() => {
  if (!email.value) {
    errorMsg.value = 'Email tidak ditemukan. Silakan ulangi proses lupa password.'
  }
})

onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer)
})

const handleResendOtp = async () => {
  if (resendCooldown.value > 0) return
  resending.value = true
  errorMsg.value = ''
  try {
    await api.post('/auth/forgot-password', { email: email.value.trim().toLowerCase() })
    showToast('Kode OTP baru telah dikirim!', 'success')
    startCooldown()
  } catch (err) {
    errorMsg.value = err.response?.data?.error?.message || err.response?.data?.message || 'Gagal mengirim ulang OTP.'
    showToast(errorMsg.value, 'error')
  } finally {
    resending.value = false
  }
}

const handleSubmit = async () => {
  errorMsg.value = ''

  if (!email.value) {
    errorMsg.value = 'Email tidak ditemukan. Silakan ulangi proses lupa password.'
    return
  }

  if (otp.value.length !== 6) {
    errorMsg.value = 'Kode OTP harus 6 digit'
    return
  }

  if (password.value.length < 6) {
    errorMsg.value = 'Password minimal 6 karakter'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'Password tidak cocok'
    return
  }

  loading.value = true
  try {
    await api.post('/auth/reset-password', {
      email: email.value,
      otp: otp.value,
      password: password.value,
    })
    success.value = true
    showToast('Password berhasil diubah!', 'success')
  } catch (err) {
    errorMsg.value = err.response?.data?.error?.message || err.response?.data?.message || 'Gagal mereset password. Kode OTP mungkin salah atau sudah kedaluwarsa.'
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
