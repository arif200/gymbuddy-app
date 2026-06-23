<template>
  <main class="p-6 lg:p-10 text-white overflow-y-auto">
    <div class="max-w-7xl mx-auto">
      
      <header class="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 opacity-0 animate-fade-in">
        <div>
          <p class="text-red-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{{ today }}</p>
          <h1 class="text-3xl md:text-4xl font-black text-white tracking-tight uppercase">Dashboard</h1>
          <p class="text-gray-500 text-sm mt-2">
            Selamat datang, <span class="text-white font-semibold">{{ userName }}</span>.
            <span class="text-red-500/80 italic ml-1">Terus berlatih.</span>
          </p>
        </div>
        <div class="hidden sm:block">
          <router-link 
            to="/dashboard/find-trainers"
            class="inline-flex items-center gap-2 bg-red-500 text-black px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-red-400 transition-all shadow-lg shadow-red-500/10 active:scale-[0.98]"
          >
            <PlusIcon class="w-4 h-4" />
            Booking Sesi
          </router-link>
        </div>
      </header>

      <div v-if="loading" class="flex justify-center py-20 opacity-0 animate-fade-in">
        <div class="animate-pulse text-red-500 font-black uppercase tracking-widest text-xs">Memuat data...</div>
      </div>

      <template v-else>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div 
            v-for="(stat, index) in statCards" 
            :key="stat.label"
            class="group bg-[#0f1115] rounded-3xl p-6 border border-white/5 hover:border-red-500/20 transition-all duration-300 opacity-0 animate-fade-in"
            :style="{ animationDelay: `${(index + 1) * 80}ms` }"
          >
            <div class="w-11 h-11 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-5 group-hover:scale-110 group-hover:bg-red-500 group-hover:text-black transition-all duration-300">
              <component :is="stat.icon" class="w-5 h-5" />
            </div>
            <p class="text-3xl font-black text-white tracking-tight">{{ stat.value }}</p>
            <p class="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">{{ stat.label }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div 
            class="lg:col-span-7 bg-[#0f1115] rounded-[2rem] border border-white/5 p-6 lg:p-8 opacity-0 animate-fade-in"
            :style="{ animationDelay: '480ms' }"
          >
            <div class="flex justify-between items-center mb-6">
              <div>
                <h3 class="font-black text-sm uppercase tracking-widest text-white">Sesi Mendatang</h3>
                <p class="text-gray-500 text-xs mt-1">{{ upcomingSessions.length }} sesi mendatang</p>
              </div>
              <router-link to="/dashboard/my-bookings" class="text-red-500 text-[10px] font-black uppercase tracking-wider hover:text-red-400 transition-colors">Lihat Semua</router-link>
            </div>

            <div v-if="upcomingSessions.length === 0" class="flex flex-col items-center justify-center py-14 border border-dashed border-white/10 rounded-2xl">
              <div class="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-500 mb-3">
                <CalendarIcon class="w-6 h-6" />
              </div>
              <p class="text-gray-500 text-xs font-bold uppercase tracking-widest">Belum ada sesi mendatang</p>
              <router-link to="/dashboard/find-trainers" class="mt-4 text-red-500 text-[10px] font-black uppercase tracking-wider hover:underline">Cari trainer</router-link>
            </div>

            <div v-else class="space-y-3">
              <div 
                v-for="session in upcomingSessions" 
                :key="session.booking_id || session.id"
                class="group flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-red-500/20 hover:bg-black/60 transition-all duration-300 cursor-pointer"
              >
                <div class="w-12 h-12 rounded-xl overflow-hidden bg-red-500 flex-shrink-0">
                  <img 
                    v-if="session.trainer_photo"
                    :src="photoBaseUrl + '/' + session.trainer_photo"
                    :alt="session.trainer_name"
                    class="w-full h-full object-cover"
                    @error="$event.target.style.display='none'"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-black font-black text-sm uppercase">
                    {{ (session.trainer_name || 'T').charAt(0) }}
                  </div>
                </div>
                
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <h4 class="font-bold text-white text-sm uppercase truncate group-hover:text-red-500 transition-colors">{{ session.session_title || session.title }}</h4>
                    <span v-if="session.status" class="text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider" :class="statusClass(session.status)">
                      {{ session.status }}
                    </span>
                  </div>
                  <p class="text-gray-500 text-xs font-medium">{{ session.trainer_name || 'Trainer' }} • {{ formatDateTime(session.start_time) }}</p>
                </div>

                <div class="text-right flex-shrink-0">
                  <p class="text-sm font-black text-white">{{ formatRupiah(session.payment_amount || session.price) }}</p>
                </div>
              </div>
            </div>
          </div>

          <div 
            class="lg:col-span-5 bg-[#0f1115] rounded-[2rem] border border-white/5 p-6 lg:p-8 opacity-0 animate-fade-in"
            :style="{ animationDelay: '560ms' }"
          >
            <div class="flex justify-between items-center mb-6">
              <div>
                <h3 class="font-black text-sm uppercase tracking-widest text-white">Rekomendasi</h3>
                <p class="text-gray-500 text-xs mt-1">Sesi tersedia untukmu</p>
              </div>
              <router-link to="/dashboard/find-trainers" class="text-red-500 text-[10px] font-black uppercase tracking-wider hover:text-red-400 transition-colors">Lihat Semua</router-link>
            </div>

            <div v-if="recommendedSessions.length === 0" class="flex flex-col items-center justify-center py-14 border border-dashed border-white/10 rounded-2xl">
              <div class="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-500 mb-3">
                <SparklesIcon class="w-6 h-6" />
              </div>
              <p class="text-gray-500 text-xs font-bold uppercase tracking-widest">Belum ada rekomendasi</p>
            </div>

            <div v-else class="space-y-3">
              <div 
                v-for="session in recommendedSessions.slice(0, 4)" 
                :key="session.id"
                class="group p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-red-500/20 hover:bg-black/60 transition-all duration-300"
              >
                <div class="flex justify-between items-start mb-2">
                  <div class="min-w-0">
                    <h4 class="font-bold text-white text-sm uppercase group-hover:text-red-500 transition-colors truncate">{{ session.title }}</h4>
                    <p class="text-gray-500 text-xs mt-0.5">{{ session.trainer_name || 'Trainer' }}</p>
                  </div>
                  <p class="text-sm font-black text-white flex-shrink-0 ml-3">{{ formatRupiah(session.price) }}</p>
                </div>
                <div class="flex items-center justify-between mt-3">
                  <p class="text-[10px] text-gray-500 uppercase font-bold tracking-wider flex items-center gap-1">
                    <ClockIcon class="w-3 h-3" /> {{ formatTime(session.start_time) }}
                  </p>
                  <router-link 
                    to="/dashboard/find-trainers"
                    class="text-[10px] font-black uppercase tracking-wider text-red-500 hover:text-red-400 transition-colors"
                  >
                    Booking →
                  </router-link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </template>

    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  UsersIcon, 
  CalendarIcon, 
  CalendarDaysIcon, 
  DumbbellIcon, 
  ActivityIcon, 
  PlusIcon, 
  ClockIcon, 
  SparklesIcon 
} from 'lucide-vue-next'
import api from '../../utils/api'
import { useAuthStore } from '../../stores/authStore'

const authStore = useAuthStore()
const loading = ref(true)
const sessions = ref([])
const myBookings = ref([])
const user = ref({})
const today = ref('')

const photoBaseUrl = api.defaults.baseURL.replace(/\/api\/v1$/, '')

const userName = computed(() => user.value.nama || 'Member')
const stats = computed(() => {
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 7)

  return {
    activeSessions: myBookings.value.filter(b => b.status?.toLowerCase() === 'confirmed').length,
    thisWeek: myBookings.value.filter(b => {
      const d = new Date(b.start_time)
      return d >= weekStart && d <= weekEnd
    }).length,
    totalBookings: myBookings.value.length,
    completedSessions: myBookings.value.filter(b => b.status?.toLowerCase() === 'completed').length
  }
})

const statCards = computed(() => [
  { label: 'Sesi Aktif', value: stats.value.activeSessions, icon: UsersIcon },
  { label: 'Minggu Ini', value: stats.value.thisWeek, icon: CalendarDaysIcon },
  { label: 'Total Booking', value: stats.value.totalBookings, icon: DumbbellIcon },
  { label: 'Selesai', value: stats.value.completedSessions, icon: ActivityIcon }
])

const upcomingSessions = computed(() => {
  return myBookings.value
    .filter(b => ['confirmed', 'pending'].includes(b.status?.toLowerCase()))
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
})

const bookedSessionIds = computed(() => new Set(myBookings.value.map(b => b.session_id)))

const recommendedSessions = computed(() => {
  return sessions.value
    .filter(s => s.status === 'scheduled' && !bookedSessionIds.value.has(s.id))
    .slice(0, 8)
})

const formatRupiah = (price) => {
  if (!price) return 'Rp0'
  return `Rp${Number(price).toLocaleString('id-ID')}`
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return '--'
  const d = new Date(dateStr)
  return `${d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}, ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
}

const formatTime = (dateStr) => {
  if (!dateStr) return '--:--'
  return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

const statusClass = (status) => {
  const map = {
    confirmed: 'bg-green-500/10 text-green-500 border border-green-500/20',
    pending: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
    completed: 'bg-gray-500/10 text-gray-500 border border-gray-500/20',
    cancelled: 'bg-red-500/10 text-red-500 border border-red-500/20'
  }
  return map[status?.toLowerCase()] || 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
}

const fetchDashboardData = async () => {
  try {
    // Ensure auth store is loaded without duplicate /auth/me calls
    await authStore.init()
    user.value = authStore.user || {}

    const [sessionsRes, bookingsRes] = await Promise.all([
      api.get('/sessions'),
      api.get('/bookings/my').catch(() => ({ data: { data: [] } }))
    ])

    sessions.value = sessionsRes.data?.data || []
    myBookings.value = bookingsRes.data?.data || []
  } catch (err) {
    console.error('Dashboard fetch error:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const now = new Date()
  today.value = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  fetchDashboardData()
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
</style>
