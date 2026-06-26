<template>
  <main class="p-6 lg:p-10 text-white overflow-y-auto">
    <div class="max-w-4xl mx-auto">

      <header class="mb-10 opacity-0 animate-fade-in">
        <p class="text-red-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{{ today }}</p>
        <h1 class="text-3xl md:text-4xl font-black text-white tracking-tight uppercase">Pengaturan</h1>
        <p class="text-gray-500 text-sm mt-2">
          Kelola data akun dan reset booking untuk keperluan demo presentasi.
        </p>
      </header>

      <!-- Section: Reset Booking Saya -->
      <section
        class="bg-[#0f1115] rounded-[2rem] border border-white/5 p-6 lg:p-8 mb-6 opacity-0 animate-fade-in"
        :style="{ animationDelay: '120ms' }"
      >
        <div class="flex items-start gap-4 mb-6">
          <div class="w-11 h-11 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 flex-shrink-0">
            <Trash2Icon class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-black text-sm uppercase tracking-widest text-white">Reset Booking Saya</h3>
            <p class="text-gray-500 text-xs mt-1 leading-relaxed">
              Hapus semua booking milik akun ini. Setelah dihapus, kamu bisa melakukan booking trainer kembali dari awal.
              <span class="text-red-500/80">Tindakan ini tidak dapat dibatalkan.</span>
            </p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-black/40 border border-white/5">
          <div>
            <p class="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Booking Saat Ini</p>
            <p class="text-2xl font-black text-white">{{ bookingCount }}</p>
          </div>
          <button
            @click="confirmResetMine"
            :disabled="resettingMine || bookingCount === 0"
            class="inline-flex items-center gap-2 bg-red-500 text-black px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-red-400 transition-all shadow-lg shadow-red-500/10 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2Icon class="w-4 h-4" />
            {{ resettingMine ? 'Memproses...' : 'Reset Booking Saya' }}
          </button>
        </div>
      </section>

      <!-- Section: Reset Semua Booking (Admin only) -->
      <section
        v-if="isAdmin"
        class="bg-[#0f1115] rounded-[2rem] border border-white/5 p-6 lg:p-8 mb-6 opacity-0 animate-fade-in"
        :style="{ animationDelay: '200ms' }"
      >
        <div class="flex items-start gap-4 mb-6">
          <div class="w-11 h-11 rounded-2xl bg-orange-400/10 flex items-center justify-center text-orange-400 flex-shrink-0">
            <AlertTriangleIcon class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-black text-sm uppercase tracking-widest text-white">Reset Semua Booking (Admin)</h3>
            <p class="text-gray-500 text-xs mt-1 leading-relaxed">
              Hapus seluruh data booking dari semua user di platform. Digunakan untuk reset total sebelum demo presentasi.
              <span class="text-orange-400/80">Semua user akan bisa booking trainer kembali dari awal.</span>
            </p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-black/40 border border-white/5">
          <div>
            <p class="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Booking Platform</p>
            <p class="text-2xl font-black text-white">{{ totalAllBookings }}</p>
          </div>
          <button
            @click="confirmResetAll"
            :disabled="resettingAll || totalAllBookings === 0"
            class="inline-flex items-center gap-2 bg-orange-500 text-black px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-orange-400 transition-all shadow-lg shadow-orange-500/10 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <AlertTriangleIcon class="w-4 h-4" />
            {{ resettingAll ? 'Memproses...' : 'Reset Semua Booking' }}
          </button>
        </div>
      </section>

      <!-- Section: Info Akun -->
      <section
        class="bg-[#0f1115] rounded-[2rem] border border-white/5 p-6 lg:p-8 opacity-0 animate-fade-in"
        :style="{ animationDelay: '280ms' }"
      >
        <div class="flex items-start gap-4 mb-6">
          <div class="w-11 h-11 rounded-2xl bg-blue-400/10 flex items-center justify-center text-blue-400 flex-shrink-0">
            <UserIcon class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-black text-sm uppercase tracking-widest text-white">Info Akun</h3>
            <p class="text-gray-500 text-xs mt-1">Detail akun yang sedang login.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="p-4 rounded-2xl bg-black/40 border border-white/5">
            <p class="text-[10px] uppercase font-bold text-red-500 tracking-widest mb-1">Nama</p>
            <p class="text-sm font-medium text-white">{{ user.nama || '-' }}</p>
          </div>
          <div class="p-4 rounded-2xl bg-black/40 border border-white/5">
            <p class="text-[10px] uppercase font-bold text-red-500 tracking-widest mb-1">Email</p>
            <p class="text-sm font-medium text-white">{{ user.email || '-' }}</p>
          </div>
          <div class="p-4 rounded-2xl bg-black/40 border border-white/5">
            <p class="text-[10px] uppercase font-bold text-red-500 tracking-widest mb-1">Role</p>
            <p class="text-sm font-medium text-white uppercase">{{ user.role || '-' }}</p>
          </div>
          <div class="p-4 rounded-2xl bg-black/40 border border-white/5">
            <p class="text-[10px] uppercase font-bold text-red-500 tracking-widest mb-1">Kota</p>
            <p class="text-sm font-medium text-white">{{ user.kota || '-' }}</p>
          </div>
        </div>
      </section>

    </div>

    <!-- Modal Konfirmasi -->
    <Transition name="modal">
      <div v-if="showConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="showConfirm = false"></div>
        <div class="relative bg-[#0f1115] rounded-[2rem] border border-white/10 p-8 max-w-md w-full shadow-2xl">
          <div class="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-5">
            <component :is="confirmConfig.icon" class="w-7 h-7" />
          </div>
          <h3 class="text-xl font-black text-white uppercase tracking-tight mb-3">{{ confirmConfig.title }}</h3>
          <p class="text-gray-500 text-sm leading-relaxed mb-8">{{ confirmConfig.message }}</p>
          <div class="flex gap-3">
            <button
              @click="showConfirm = false"
              class="flex-1 py-3 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-all text-xs uppercase tracking-wider"
            >
              Batal
            </button>
            <button
              @click="confirmConfig.action"
              :class="confirmConfig.danger ? 'bg-red-500 hover:bg-red-400 text-black' : 'bg-orange-500 hover:bg-orange-400 text-black'"
              class="flex-1 py-3 font-black rounded-xl transition-all text-xs uppercase tracking-wider active:scale-[0.98]"
            >
              Ya, Hapus
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Toast -->
    <Transition name="toast">
      <div
        v-if="toast.show"
        :class="toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'"
        class="fixed bottom-6 right-6 px-6 py-4 rounded-2xl text-white font-bold text-sm shadow-2xl z-50"
      >
        {{ toast.message }}
      </div>
    </Transition>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Trash2Icon, AlertTriangleIcon, UserIcon } from 'lucide-vue-next'
import api from '../../utils/api'

const user = ref({})
const myBookings = ref([])
const allBookingsCount = ref(0)
const today = ref('')
const showConfirm = ref(false)
const resettingMine = ref(false)
const resettingAll = ref(false)
const toast = ref({ show: false, message: '', type: 'success' })

const confirmConfig = ref({
  title: '',
  message: '',
  icon: Trash2Icon,
  danger: true,
  action: () => {}
})

const isAdmin = computed(() => user.value.role === 'admin')
const bookingCount = computed(() => myBookings.value.length)
const totalAllBookings = computed(() => allBookingsCount.value)

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

const fetchData = async () => {
  try {
    const [meRes, myBookingsRes] = await Promise.all([
      api.get('/auth/me').catch(() => ({ data: { data: {} } })),
      api.get('/bookings/my').catch(() => ({ data: { data: [] } }))
    ])
    user.value = meRes.data?.data || {}
    myBookings.value = myBookingsRes.data?.data || []

    if (user.value.role === 'admin') {
      try {
        const allRes = await api.get('/bookings', { params: { limit: 100 } })
        allBookingsCount.value = allRes.data?.meta?.total ?? allRes.data?.data?.length ?? 0
      } catch { allBookingsCount.value = 0 }
    }
  } catch (err) {
    console.error('Settings fetch error:', err)
  }
}

const confirmResetMine = () => {
  confirmConfig.value = {
    title: 'Reset Booking Saya?',
    message: `Semua ${bookingCount.value} booking milikmu akan dihapus permanen. Kamu bisa booking trainer kembali setelah ini.`,
    icon: Trash2Icon,
    danger: true,
    action: handleResetMine
  }
  showConfirm.value = true
}

const confirmResetAll = () => {
  confirmConfig.value = {
    title: 'Reset Semua Booking?',
    message: `Seluruh ${totalAllBookings.value} booking dari semua user akan dihapus permanen. Semua user bisa booking trainer kembali dari awal.`,
    icon: AlertTriangleIcon,
    danger: false,
    action: handleResetAll
  }
  showConfirm.value = true
}

const handleResetMine = async () => {
  showConfirm.value = false
  resettingMine.value = true
  try {
    const res = await api.delete('/bookings/my')
    const count = res.data?.data?.deletedCount ?? 0
    showToast(`${count} booking berhasil dihapus. Trainer kembali tersedia untuk di-booking.`)
    await fetchData()
  } catch (err) {
    showToast(err.response?.data?.message || 'Gagal menghapus booking', 'error')
  } finally {
    resettingMine.value = false
  }
}

const handleResetAll = async () => {
  showConfirm.value = false
  resettingAll.value = true
  try {
    const res = await api.delete('/bookings/all')
    const count = res.data?.data?.deletedCount ?? 0
    showToast(`${count} booking seluruh platform berhasil dihapus.`)
    await fetchData()
  } catch (err) {
    showToast(err.response?.data?.message || 'Gagal menghapus booking', 'error')
  } finally {
    resettingAll.value = false
  }
}

onMounted(() => {
  const now = new Date()
  today.value = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  fetchData()
})
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
.modal-enter-active, .modal-leave-active { transition: opacity 0.3s ease; }
.modal-enter-active > div:last-child, .modal-leave-active > div:last-child { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from > div:last-child, .modal-leave-to > div:last-child { transform: scale(0.95); opacity: 0; }
.toast-enter-active, .toast-leave-active { transition: all 0.4s ease; }
.toast-enter-from { opacity: 0; transform: translateX(100px); }
.toast-leave-to { opacity: 0; transform: translateY(20px); }
</style>
