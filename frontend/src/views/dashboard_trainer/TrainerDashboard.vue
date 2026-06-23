<template>
  <main class="flex-grow p-8 text-white overflow-y-auto bg-[#0a0b10]">
    <header class="mb-8">
      <h2 class="text-3xl font-black uppercase tracking-tighter italic">Dashboard</h2>
      <p class="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Selamat datang kembali, Trainer!</p>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
      <div class="bg-[#161920] p-6 rounded-[1.5rem] border border-gray-900">
        <div class="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center mb-4 border border-red-500/20">
          <span class="text-red-500 text-xl">📅</span>
        </div>
        <p class="text-2xl font-black italic">{{ stats.totalSessions }}</p>
        <p class="text-[9px] font-black text-gray-600 uppercase tracking-widest">Sesi Aktif</p>
      </div>

      <div class="bg-[#161920] p-6 rounded-[1.5rem] border border-gray-900">
        <div class="w-10 h-10 bg-blue-400/10 rounded-xl flex items-center justify-center mb-4 border border-blue-400/20">
          <span class="text-blue-400 text-xl">👥</span>
        </div>
        <p class="text-2xl font-black italic">{{ stats.totalBookers }}</p>
        <p class="text-[9px] font-black text-gray-600 uppercase tracking-widest">Total Pemesan</p>
      </div>
    </div>

    <div class="bg-[#161920] rounded-[2rem] border border-gray-900 overflow-hidden shadow-2xl">
      <div class="p-8 border-b border-gray-900 flex justify-between items-center">
        <h3 class="text-lg font-black uppercase tracking-tight italic">Jadwal Sesi Anda</h3>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-black/20">
              <th class="py-4 px-8 text-[10px] font-black text-gray-600 uppercase tracking-widest">Sesi</th>
              <th class="py-4 px-8 text-[10px] font-black text-gray-600 uppercase tracking-widest">Waktu</th>
              <th class="py-4 px-8 text-[10px] font-black text-gray-600 uppercase tracking-widest text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="3" class="py-20 text-center">
                <div class="animate-pulse text-red-500 font-black uppercase text-xs tracking-widest">Memuat Data...</div>
              </td>
            </tr>
            <tr v-else-if="sessions.length === 0">
              <td colspan="3" class="py-20 text-center text-gray-600 font-bold text-xs uppercase tracking-widest">
                Belum ada sesi yang dibuat.
              </td>
            </tr>
            <tr v-for="session in sessions" :key="session.id" class="border-b border-gray-900/50 hover:bg-white/[0.02] transition-colors group">
              <td class="py-6 px-8">
                <p class="text-xs font-black uppercase group-hover:text-red-500 transition-colors">{{ session.title }}</p>
                <p class="text-[9px] text-gray-600 font-bold mt-1 uppercase italic">Rp{{ formatRupiah(session.price) }}</p>
              </td>
              <td class="py-6 px-8">
                <div class="flex flex-col gap-1">
                  <p class="text-[10px] text-gray-300 font-black tracking-tight">{{ formatDate(session.start_time) }}</p>
                  <p class="text-[10px] text-gray-500 font-medium">{{ formatTime(session.start_time) }} - {{ formatTime(session.end_time) }}</p>
                </div>
              </td>
              <td class="py-6 px-8 text-center">
                <span :class="statusClass(session.status)"
                      class="text-[10px] px-4 py-1.5 rounded-full border font-black uppercase tracking-widest">
                  {{ session.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../utils/api'

const sessions = ref([])
const stats = ref({ totalSessions: 0, totalBookers: 0 })
const loading = ref(true)
const userData = JSON.parse(localStorage.getItem('user') || '{}')

const fetchTrainerDashboard = async () => {
  loading.value = true
  try {
    const res = await api.get('/sessions')
    const allData = res.data?.data || res.data || []
    const mySessions = Array.isArray(allData) 
      ? allData.filter(s => String(s.trainer_id) === String(userData.id))
      : []
    sessions.value = mySessions
    stats.value.totalSessions = mySessions.length
    stats.value.totalBookers = mySessions.reduce((acc, curr) => acc + (Number(curr.total_bookings) || 0), 0)
  } catch (err) {
    console.error('Error fetching:', err)
  } finally {
    loading.value = false
  }
}

const formatRupiah = (price) => price ? `Rp${Number(price).toLocaleString('id-ID')}` : 'Rp0'
const statusClass = (status) => {
  const map = {
    scheduled: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
    ongoing: 'bg-red-500/10 text-red-500 border-red-500/20',
    completed: 'bg-gray-400/10 text-gray-400 border-gray-400/20',
    cancelled: 'bg-red-400/10 text-red-400 border-red-400/20'
  }
  return map[status] || 'bg-gray-400/10 text-gray-400 border-gray-400/20'
}
const formatTime = (d) => d ? new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'
const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' }) : '--'

onMounted(fetchTrainerDashboard)
</script>
