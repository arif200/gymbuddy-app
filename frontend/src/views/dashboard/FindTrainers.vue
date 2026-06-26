<template>
  <main class="p-10 text-white overflow-y-auto">
      <header class="mb-10">
        <div class="flex justify-between items-end">
          <div>
            <h2 class="text-3xl font-black uppercase tracking-tighter text-white">Cari Trainer</h2>
            <p class="text-gray-500 text-sm mt-1 font-medium">Temukan sesi latihan terbaik dari database kami.</p>
          </div>
        </div>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <input v-model="searchQuery" type="search" id="search-trainer" name="search-trainer" aria-label="Cari trainer atau sesi" placeholder="Cari trainer atau judul sesi..." 
               class="w-full bg-[#0f1115] border border-gray-800 p-4 rounded-2xl text-sm focus:ring-2 focus:ring-red-500 outline-none text-white">
      </div>

      <div v-if="loading" class="flex flex-col items-center justify-center py-32">
        <div class="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-red-500 font-black uppercase tracking-widest text-xs">Memuat data...</p>
      </div>

      <div v-else-if="error" class="text-center py-20 border border-dashed border-gray-800 rounded-[2rem]">
        <p class="text-red-400 font-bold uppercase tracking-widest text-xs">{{ error }}</p>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div v-for="session in filteredSessions" :key="session.id" 
             class="bg-[#0f1115] p-8 rounded-[2.5rem] border border-gray-900 hover:border-red-500 transition-all duration-500 group relative overflow-hidden shadow-2xl">
          
          <div class="flex justify-between items-start mb-6">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden">
                <img 
                  v-if="session.trainer_photo"
                  :src="photoBaseUrl + '/' + session.trainer_photo" 
                  :alt="session.trainer_name"
                  class="w-full h-full object-cover"
                  @error="$event.target.style.display='none'"
                />
                <div v-if="!session.trainer_photo" class="w-full h-full bg-red-500 flex items-center justify-center text-black font-black text-xl">
                  {{ (session.trainer_name || 'T').charAt(0) }}
                </div>
              </div>
              <div>
                <h4 class="font-black text-lg uppercase group-hover:text-red-500 transition-colors">{{ session.trainer_name }}</h4>
                <p class="text-xs text-red-500 font-bold italic">{{ session.title }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-[10px] text-gray-600 font-black uppercase">Harga</p>
              <p class="text-sm font-bold text-white">{{ formatRupiah(session.price) }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-8 py-4 border-y border-white/5">
            <div>
              <p class="text-[9px] text-gray-600 font-black uppercase">Tanggal</p>
              <p class="text-xs font-bold text-gray-300">📅 {{ formatDate(session.start_time) }}</p>
            </div>
            <div>
              <p class="text-[9px] text-gray-600 font-black uppercase">Waktu</p>
              <p class="text-xs font-bold text-gray-300">🕒 {{ formatTime(session.start_time) }}</p>
            </div>
            <div>
              <p class="text-[9px] text-gray-600 font-black uppercase">Trainer</p>
              <p class="text-xs font-bold text-gray-300">💪 {{ session.trainer_name }}</p>
            </div>
            <div>
              <p class="text-[9px] text-gray-600 font-black uppercase">Status</p>
              <span class="text-[9px] px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded">{{ session.status }}</span>
            </div>
          </div>

          <button @click="handleBooking(session.id)"
                  :disabled="loadingBooking || isBooked(session.id)"
                  :class="isBooked(session.id)
                    ? 'bg-green-500/20 text-green-500 border border-green-500/30 cursor-default'
                    : 'bg-red-500 text-black hover:bg-red-400 shadow-lg shadow-red-500/20'"
                  class="w-full py-4 font-black uppercase text-xs tracking-widest rounded-2xl transition-all">
            <span v-if="loadingBooking">Memproses...</span>
            <span v-else-if="isBooked(session.id)">Sudah Dibooking ✓</span>
            <span v-else>Ambil Sesi →</span>
          </button>
        </div>

        <div v-if="filteredSessions.length === 0" class="col-span-full text-center py-20 border border-dashed border-gray-800 rounded-[2rem]">
          <p class="text-gray-600 font-bold uppercase tracking-widest text-xs">Tidak ada sesi ditemukan.</p>
        </div>
      </div>
    </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../../utils/api'

const photoBaseUrl = api.defaults.baseURL.replace(/\/api\/v1$/, '')

const sessions = ref([])
const loading = ref(true)
const error = ref('')
const loadingBooking = ref(false)
const searchQuery = ref('')
const myBookings = ref([])
const loadingBookings = ref(false)

const fetchData = async () => {
  loading.value = true
  error.value = ''
  try {
    const [sessionsRes, bookingsRes] = await Promise.all([
      api.get('/sessions'),
      api.get('/bookings/my')
    ])
    const data = sessionsRes.data?.data || []
    sessions.value = Array.isArray(data) ? data : []
    const bookingsData = bookingsRes.data?.data || bookingsRes.data || []
    myBookings.value = Array.isArray(bookingsData) ? bookingsData : []
  } catch (err) {
    error.value = 'Gagal memuat data sesi'
    console.error('Fetch error:', err)
  } finally {
    loading.value = false
  }
}

const bookedSessionIds = computed(() => {
  return new Set(myBookings.value.map(b => b.session_id).filter(Boolean))
})

const isBooked = (sessionId) => bookedSessionIds.value.has(sessionId)

const filteredSessions = computed(() => {
  if (!sessions.value.length) return []

  // Hanya tampilkan sesi dari tanggal 27 Juni 2026 ke depan
  const minDate = new Date('2026-06-27T00:00:00')

  // Hanya 1 sesi per trainer (yang paling awal)
  const seenTrainers = new Set()

  return sessions.value
    .filter(s => {
      const start = new Date(s.start_time)
      return start >= minDate
    })
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
    .filter(s => {
      const name = (s.trainer_nama || s.trainer_name || '').toLowerCase()
      const title = (s.title || '').toLowerCase()
      const query = searchQuery.value.toLowerCase()
      const match = name.includes(query) || title.includes(query)
      if (!match) return false
      if (seenTrainers.has(s.trainer_id)) return false
      seenTrainers.add(s.trainer_id)
      return true
    })
})

const formatRupiah = (price) => {
  if (!price) return 'Rp0'
  return `Rp${Number(price).toLocaleString('id-ID')}`
}

const formatDate = (dateStr) => {
  if (!dateStr) return '--'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatTime = (dateStr) => {
  if (!dateStr) return '--:--'
  return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

const handleBooking = async (sessionId) => {
  if (loadingBooking.value || isBooked(sessionId)) return
  loadingBooking.value = true
  try {
    await api.post('/bookings', { session_id: sessionId })
    alert('Booking berhasil!')
    await fetchData()
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Gagal melakukan booking'
    alert(msg)
  } finally {
    loadingBooking.value = false
  }
}

onMounted(fetchData)
</script>
