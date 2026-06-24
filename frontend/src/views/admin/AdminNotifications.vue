<template>
  <div class="p-8 text-white">
    <header class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-black uppercase tracking-tighter">Notifikasi</h1>
        <p class="text-gray-500 text-sm mt-1">Kirim & kelola notifikasi ke pengguna</p>
      </div>
      <button @click="openSendForm()" class="bg-red-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-red-600">+ Kirim Notifikasi</button>
    </header>

    <div v-if="loading" class="text-center py-20 text-red-500 font-black uppercase tracking-widest text-xs">Memuat data...</div>

    <div v-else>
      <!-- Filters -->
      <div class="flex gap-3 mb-6">
        <button
          @click="filter = 'all'"
          class="px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all"
          :class="filter === 'all' ? 'bg-red-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'"
        >Semua</button>
        <button
          @click="filter = 'unread'"
          class="px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all"
          :class="filter === 'unread' ? 'bg-red-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'"
        >Belum Dibaca</button>
        <button
          @click="filter = 'read'"
          class="px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all"
          :class="filter === 'read' ? 'bg-red-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'"
        >Sudah Dibaca</button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-4 mb-8">
        <div class="bg-[#0f1115] p-4 rounded-2xl border border-gray-900">
          <p class="text-2xl font-black text-white">{{ notifications.length }}</p>
          <p class="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Total</p>
        </div>
        <div class="bg-[#0f1115] p-4 rounded-2xl border border-gray-900">
          <p class="text-2xl font-black text-red-400">{{ unreadCount }}</p>
          <p class="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Belum Dibaca</p>
        </div>
        <div class="bg-[#0f1115] p-4 rounded-2xl border border-gray-900">
          <p class="text-2xl font-black text-green-400">{{ readCount }}</p>
          <p class="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Sudah Dibaca</p>
        </div>
      </div>

      <!-- List -->
      <div class="space-y-3">
        <div v-for="n in filteredNotifications" :key="n.id"
             class="bg-[#0f1115] p-5 rounded-2xl border transition-all"
             :class="n.is_read ? 'border-gray-900 opacity-60' : 'border-red-500/20'">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center gap-3">
                <span v-if="!n.is_read" class="w-2 h-2 bg-red-500 rounded-full"></span>
                <h3 class="font-bold text-sm" :class="n.is_read ? 'text-gray-400' : 'text-white'">{{ n.title }}</h3>
                <span class="text-[9px] text-gray-600 font-bold uppercase px-2 py-0.5 bg-white/5 rounded">{{ n.type || 'system' }}</span>
              </div>
              <p class="text-sm text-gray-500 mt-2">{{ n.message }}</p>
              <div class="flex items-center gap-4 mt-3">
                <span class="text-[10px] text-gray-600 font-bold">{{ formatDate(n.created_at) }}</span>
                <span class="text-[10px] text-gray-600 font-bold">
                  User ID: {{ n.user_id }}
                </span>
              </div>
            </div>
            <div class="flex gap-2 ml-4">
              <button @click="deleteNotification(n.id)" class="text-red-400 text-[10px] font-bold uppercase hover:text-red-300">Hapus</button>
            </div>
          </div>
        </div>
        <div v-if="filteredNotifications.length === 0" class="text-center py-20 text-gray-600 font-bold uppercase tracking-widest text-xs border border-dashed border-gray-900 rounded-2xl">
          Tidak ada notifikasi.
        </div>
      </div>
    </div>

    <!-- Send Modal -->
    <div v-if="showSendForm" class="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div class="bg-[#161920] border border-gray-900 w-full max-w-lg rounded-2xl p-8">
        <h2 class="text-xl font-black mb-6">Kirim Notifikasi</h2>
        <form @submit.prevent="handleSend" class="space-y-4">
          <div>
            <label class="text-[9px] font-black uppercase text-gray-600 block mb-2">User ID *</label>
            <input v-model.number="sendForm.user_id" type="number" autocomplete="off" class="w-full bg-black/40 border border-gray-900 rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none" required placeholder="ID pengguna tujuan">
          </div>
          <div>
            <label class="text-[9px] font-black uppercase text-gray-600 block mb-2">Judul *</label>
            <input v-model="sendForm.title" type="text" autocomplete="off" class="w-full bg-black/40 border border-gray-900 rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none" required placeholder="Contoh: Promo Spesial">
          </div>
          <div>
            <label class="text-[9px] font-black uppercase text-gray-600 block mb-2">Pesan *</label>
            <textarea v-model="sendForm.message" autocomplete="off" class="w-full bg-black/40 border border-gray-900 rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none h-24" required placeholder="Isi pesan notifikasi..."></textarea>
          </div>
          <div>
            <label class="text-[9px] font-black uppercase text-gray-600 block mb-2">Tipe</label>
            <select v-model="sendForm.type" class="w-full bg-black/40 border border-gray-900 rounded-xl px-4 py-3 text-sm outline-none">
              <option value="system">System</option>
              <option value="promo">Promo</option>
              <option value="payment">Payment</option>
              <option value="booking">Booking</option>
            </select>
          </div>
          <div class="flex gap-3 pt-4">
            <button type="button" @click="showSendForm = false" class="flex-1 py-4 bg-white/5 rounded-xl text-xs font-black uppercase border border-gray-800 hover:bg-white/10 transition-all">Batal</button>
            <button type="submit" class="flex-1 py-4 bg-red-500 text-white rounded-xl text-xs font-black uppercase hover:bg-red-600 transition-all" :disabled="sending">
              {{ sending ? 'Mengirim...' : 'Kirim' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../utils/api'

const notifications = ref([])
const loading = ref(true)
const filter = ref('all')
const showSendForm = ref(false)
const sending = ref(false)
const sendForm = ref({ user_id: null, title: '', message: '', type: 'system' })

const unreadCount = computed(() => notifications.value.filter(n => !n.is_read).length)
const readCount = computed(() => notifications.value.filter(n => n.is_read).length)

const filteredNotifications = computed(() => {
  if (filter.value === 'all') return notifications.value
  if (filter.value === 'unread') return notifications.value.filter(n => !n.is_read)
  if (filter.value === 'read') return notifications.value.filter(n => n.is_read)
  return notifications.value
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await api.get('/notifications')
    notifications.value = res.data?.data || []
  } catch (err) { console.error(err) }
  finally { loading.value = false }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  let str = dateStr.toString().replace(' ', 'T')
  if (!str.endsWith('Z') && !str.includes('+') && !str.match(/-\d{2}:\d{2}$/)) {
    str += 'Z'
  }
  const d = new Date(str)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta'
  })
}

const markAsRead = async (id) => {
  try {
    await api.patch(`/notifications/${id}/read`)
    fetchData()
  } catch (err) {
    alert(err.response?.data?.error?.message || 'Gagal menandai notifikasi')
  }
}

const markAllAsRead = async () => {
  try {
    await api.patch('/notifications/read-all')
    fetchData()
  } catch (err) {
    alert(err.response?.data?.error?.message || 'Gagal')
  }
}

const deleteNotification = async (id) => {
  if (!confirm('Yakin ingin menghapus notifikasi ini?')) return
  try {
    await api.delete(`/notifications/${id}`)
    notifications.value = notifications.value.filter(n => n.id !== id)
  } catch (err) {
    alert(err.response?.data?.error?.message || 'Gagal menghapus')
  }
}

onMounted(fetchData)
</script>
