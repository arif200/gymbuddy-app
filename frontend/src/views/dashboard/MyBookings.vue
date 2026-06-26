<template>
  <main class="p-10 text-white overflow-y-auto">
      <header class="mb-10">
        <h2 class="text-3xl font-black uppercase tracking-tighter text-white">Booking Saya</h2>
        <p class="text-gray-500 text-sm mt-1">Kelola sesi latihan dan lakukan pembayaran.</p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div class="bg-[#0f172a]/40 border border-blue-500/20 p-6 rounded-[2rem] shadow-xl">
          <p class="text-3xl font-black text-blue-400">{{ upcomingBookings.length }}</p>
          <p class="text-[10px] uppercase font-bold text-gray-500 tracking-widest mt-1">Sesi Mendatang</p>
        </div>
        <div class="bg-[#061a14]/40 border border-green-500/20 p-6 rounded-[2rem] shadow-xl">
          <p class="text-3xl font-black text-green-400">{{ paidBookings.length }}</p>
          <p class="text-[10px] uppercase font-bold text-gray-500 tracking-widest mt-1">Lunas</p>
        </div>
        <div class="bg-[#1a0a0a]/40 border border-red-500/20 p-6 rounded-[2rem] shadow-xl">
          <p class="text-3xl font-black text-red-400">{{ pendingPayment.length }}</p>
          <p class="text-[10px] uppercase font-bold text-gray-500 tracking-widest mt-1">Menunggu Bayar</p>
        </div>
      </div>

      <div v-if="loading" class="text-center py-20 text-red-500 font-black uppercase tracking-widest">
        Memuat data...
      </div>

      <div v-else-if="error" class="text-center py-20 text-red-400 font-black uppercase tracking-widest">
        {{ error }}
      </div>

      <div v-else>
        <section class="mb-12">
          <h3 class="font-black uppercase text-xs tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-3">
            Booking Aktif <div class="h-[1px] flex-grow bg-gray-900"></div>
          </h3>
          
          <div class="space-y-4">
            <div v-for="booking in activeBookings" :key="booking.id" 
                 class="bg-[#0f1115] p-5 rounded-3xl border border-gray-900 hover:border-red-500/20 transition-all group flex items-center justify-between">
              <div class="flex items-center gap-5">
                <div class="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center">
                  <img 
                    v-if="booking.trainer_photo"
                    :src="photoBaseUrl + '/' + booking.trainer_photo"
                    :alt="booking.trainer_name"
                    class="w-full h-full object-cover"
                    @error="$event.target.style.display='none'"
                  />
                  <div v-if="!booking.trainer_photo" class="w-full h-full bg-red-500 flex items-center justify-center text-white font-black text-sm uppercase">
                    {{ (booking.trainer_name || 'T').charAt(0) }}
                  </div>
                </div>
                <div>
                  <h4 class="font-bold text-white group-hover:text-red-500 transition-colors uppercase">
                    {{ booking.trainer_name }}
                  </h4>
                  <div class="flex items-center gap-4 mt-1">
                    <span class="text-[10px] text-gray-500 font-bold uppercase">📅 {{ formatDate(booking.session_start_time) }}</span>
                    <span class="text-[10px] text-gray-500 font-bold uppercase">🕒 {{ formatTime(booking.session_start_time) }}</span>
                    <span class="text-[10px] text-red-500/80 font-bold uppercase">💪 {{ booking.session_title }}</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-right">
                  <p class="text-sm font-black text-white">{{ formatRupiah(booking.payment_amount || booking.session_price) }}</p>
                  <!-- Status Badge -->
                  <span v-if="booking.payment_status === 'settlement'" class="badge-success">✓ LUNAS</span>
                  <span v-else-if="booking.payment_status === 'pending'" class="badge-pending">⏳ MENUNGGU</span>
                  <span v-else-if="booking.payment_status === 'expire'" class="badge-danger">✕ KADALUARSA</span>
                  <span v-else class="badge-info">{{ booking.payment_status || booking.status }}</span>
                </div>
                <!-- Pay Now button -->
                <button 
                  v-if="booking.payment_status === 'pending' || (booking.status === 'pending' && !booking.payment_status)"
                  @click="handlePay(booking.id)"
                  :disabled="payingId === booking.id"
                  class="bg-red-500 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95 disabled:opacity-50">
                  {{ payingId === booking.id ? '...' : 'Bayar' }}
                </button>
                <button 
                  v-else-if="booking.status === 'pending'"
                  @click="handleCancel(booking.id)"
                  :disabled="isCancelling === booking.id"
                  class="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all active:scale-95 disabled:opacity-50">
                  {{ isCancelling === booking.id ? '...' : 'Batalkan' }}
                </button>
              </div>
            </div>

            <div v-if="activeBookings.length === 0" class="text-gray-600 text-xs font-bold uppercase py-10 text-center border border-dashed border-gray-900 rounded-3xl">
              Tidak ada booking aktif.
            </div>
          </div>
        </section>

        <section>
          <h3 class="font-black uppercase text-xs tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-3">
            Riwayat <div class="h-[1px] flex-grow bg-gray-900"></div>
          </h3>
          
          <div class="space-y-4 opacity-70 hover:opacity-100 transition-opacity">
            <div v-for="past in pastBookings" :key="past.id" 
                 class="bg-[#0a0a0a] p-5 rounded-3xl border border-gray-900 flex items-center justify-between grayscale-[0.5] hover:grayscale-0 transition-all">
              <div class="flex items-center gap-5">
                <div class="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 font-black text-sm border border-gray-700 uppercase">
                  {{ (past.trainer_name || 'T').charAt(0) }}
                </div>
                <div>
                  <h4 class="font-bold text-gray-300 uppercase">{{ past.trainer_name }}</h4>
                  <p class="text-[10px] text-gray-600 font-bold uppercase mt-1">
                    {{ past.status }} • {{ formatDate(past.session_start_time) }} • {{ past.session_title }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

<!-- Toast -->
  <Transition name="toast">
    <div v-if="toast.show" 
         :class="toast.type === 'success' ? 'bg-red-500' : 'bg-red-500/80'"
         class="fixed bottom-6 right-6 px-6 py-4 rounded-2xl text-white font-bold text-sm shadow-2xl z-50">
      {{ toast.message }}
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../../utils/api'

// Base URL for photos (strip /api suffix)
const photoBaseUrl = api.defaults.baseURL.replace(/\/api\/v1$/, '')
const bookings = ref([])
const loading = ref(true)
const error = ref('')
const isCancelling = ref(null)
const payingId = ref(null)
const toast = ref({ show: false, message: '', type: 'success' })

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

// Filter bookings
const activeBookings = computed(() => {
  if (!Array.isArray(bookings.value)) return []
  return bookings.value.filter(b => 
    b.status === 'confirmed' || b.status === 'pending'
  )
})

const upcomingBookings = computed(() => {
  return activeBookings.value.filter(b => b.status === 'confirmed')
})

const pendingPayment = computed(() => {
  return activeBookings.value.filter(b => b.payment_status === 'pending' || (b.status === 'pending' && !b.payment_status))
})

const paidBookings = computed(() => {
  return activeBookings.value.filter(b => b.payment_status === 'settlement')
})

const pastBookings = computed(() => {
  if (!Array.isArray(bookings.value)) return []
  return bookings.value.filter(b => b.status === 'cancelled' || b.status === 'completed')
})

const fetchMyBookings = async () => {
  try {
    loading.value = true
    error.value = ''
    const response = await api.get('/bookings/my')
    const rawData = response.data.data || response.data
    bookings.value = Array.isArray(rawData) ? rawData : []
  } catch (err) {
    error.value = 'Gagal memuat data booking'
  } finally {
    loading.value = false
  }
}

const verifyPaymentStatus = async (bookingId, retries = 3) => {
  try {
    await api.get(`/payments/${bookingId}/status`)
  } catch (err) {
    console.error('Gagal verifikasi status pembayaran:', err)
  }
  // Retry untuk menunggu Midtrans update status menjadi settlement
  if (retries > 0) {
    setTimeout(() => verifyPaymentStatus(bookingId, retries - 1), 2000)
  }
}

const handlePay = async (bookingId) => {
  payingId.value = bookingId
  try {
    // 1. Dapatkan Snap token dari backend
    const response = await api.post('/payments/create', { booking_id: bookingId })
    const { token } = response.data.data

    // 2. Dapatkan client key dan load Snap script
    const configRes = await api.get('/payments/config')
    const { clientKey } = configRes.data.data

    // 3. Load Midtrans Snap script jika belum ada
    if (!window.snap) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'
        script.setAttribute('data-client-key', clientKey)
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })
    }

    // 4. Cek apakah snap sudah siap
    if (!window.snap) {
      showToast('Gagal memuat pembayaran. Refresh halaman dan coba lagi.', 'error')
      return
    }

    // 5. Buat callback untuk Snap
    window.snap.pay(token, {
      onSuccess: async () => {
        showToast('Pembayaran berhasil! Memverifikasi status...')
        // Cek status ke Midtrans lewat backend karena notifikasi tidak sampai ke localhost
        await verifyPaymentStatus(bookingId)
        await fetchMyBookings()
      },
      onPending: () => {
        showToast('Pembayaran sedang diproses.')
        verifyPaymentStatus(bookingId)
        fetchMyBookings()
      },
      onError: () => {
        showToast('Pembayaran gagal. Silakan coba lagi.', 'error')
        verifyPaymentStatus(bookingId)
        fetchMyBookings()
      },
      onClose: () => {
        verifyPaymentStatus(bookingId)
        fetchMyBookings()
      }
    })
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Gagal memproses pembayaran'
    showToast(msg, 'error')
  } finally {
    payingId.value = null
  }
}

const handleCancel = async (bookingId) => {
  if (!confirm('Yakin ingin membatalkan booking ini?')) return
  isCancelling.value = bookingId
  try {
    await api.patch(`/bookings/${bookingId}/status`, { status: 'cancelled' })
    showToast('Booking berhasil dibatalkan')
    await fetchMyBookings()
  } catch (err) {
    showToast(err.response?.data?.message || 'Gagal membatalkan', 'error')
  } finally {
    isCancelling.value = null
  }
}

const formatRupiah = (price) => {
  if (!price) return 'Rp0'
  return `Rp${Number(price).toLocaleString('id-ID')}`
}

const formatDate = (date) => date ? new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-'
const formatTime = (date) => date ? new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'

onMounted(fetchMyBookings)
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.4s ease; }
.toast-enter-from { opacity: 0; transform: translateX(100px); }
.toast-leave-to { opacity: 0; transform: translateY(20px); }
</style>
