<template>
  <main class="p-8 text-white overflow-y-auto">
      <div class="p-8 lg:p-12 max-w-6xl mx-auto space-y-10">
        
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 class="text-5xl font-black  tracking-tighter text-white uppercase">
              PROGRESS LATIHAN
            </h1>
            <p class="text-gray-500 mt-2 font-medium">Catat dan pantau perkembangan latihan harianmu</p>
          </div>
          
          <button
            @click="showAddForm = !showAddForm"
            class="px-6 py-3 bg-red-500 text-black font-black rounded-xl hover:bg-red-400 transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] flex items-center gap-2 group"
          >
            <PlusIcon class="w-5 h-5 group-hover:rotate-90 transition-transform" />
            {{ showAddForm ? 'TUTUP FORM' : 'TAMBAH LATIHAN' }}
          </button>
        </div>

        <div v-if="loading" class="flex justify-center py-10">
          <div class="animate-pulse text-red-500 font-black uppercase tracking-widest text-xs">Memuat data...</div>
        </div>

        <div v-else-if="error" class="text-center py-10 border border-dashed border-gray-800 rounded-2xl">
          <p class="text-red-400 font-bold uppercase tracking-widest text-xs">{{ error }}</p>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="stat in summaryStats" :key="stat.label" 
               class="p-6 rounded-2xl bg-[#111111] border border-gray-900 hover:border-red-500/50 transition-all group">
            <div :class="`text-4xl font-black mb-1 ${stat.textColor} `">
              {{ stat.value }}
            </div>
            <div class="text-gray-500 text-xs uppercase tracking-[0.2em] font-bold group-hover:text-gray-300 transition-colors">
              {{ stat.label }}
            </div>
          </div>
        </div>

        <Transition name="fade-slide">
          <div v-if="showAddForm" class="p-8 rounded-3xl bg-[#111111] border border-gray-800 shadow-2xl">
            <div class="flex items-center gap-3 mb-8">
              <div class="w-2 h-8 bg-red-500 rounded-full"></div>
              <h2 class="text-2xl font-black  text-white">CATAT LATIHAN BARU</h2>
            </div>
            
            <form @submit.prevent="handleAddWorkout" class="space-y-8">
              <div class="grid md:grid-cols-2 gap-8">
                <div class="space-y-2">
                  <label class="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Nama Latihan</label>
                  <input
                    v-model="newWorkout.activity"
                    type="text"
                    placeholder="E.g. Bench Press"
                    class="w-full px-5 py-4 rounded-xl bg-black border border-gray-800 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                    required
                  />
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Durasi (menit)</label>
                  <input v-model.number="newWorkout.duration" type="number" placeholder="60" class="input-field" required />
                </div>
              </div>
              
              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Catatan Tambahan</label>
                <input v-model="newWorkout.note" type="text" placeholder="Grip lebih lebar, terasa ringan..." class="w-full px-5 py-4 rounded-xl bg-black border border-gray-800 text-white" />
              </div>

              <div class="flex gap-4 pt-4">
                <button type="submit" class="flex-1 py-4 bg-red-500 text-black font-black rounded-xl hover:bg-red-400 transition-all uppercase tracking-widest">Simpan Data</button>
                <button type="button" @click="showAddForm = false" class="px-8 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all uppercase tracking-widest text-xs">Batal</button>
              </div>
            </form>
          </div>
        </Transition>

        <div class="space-y-6">
          <div class="flex items-center gap-4">
             <h2 class="text-2xl font-black  text-white uppercase tracking-tighter">Riwayat Latihan</h2>
             <div class="flex-1 h-[1px] bg-gray-900"></div>
          </div>
          
          <TransitionGroup name="list" tag="div" class="grid gap-4">
            <div
              v-for="workout in workouts"
              :key="workout.id"
              class="p-6 rounded-2xl bg-[#111111] border border-gray-900 hover:border-gray-700 transition-all group flex items-center justify-between"
            >
              <div class="flex items-center gap-6">
                <div class="w-14 h-14 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center group-hover:bg-red-500 group-hover:text-black transition-all duration-300">
                  <DumbbellIcon class="w-7 h-7 text-red-500 group-hover:text-black" />
                </div>
                <div>
                  <div class="flex items-center gap-3 mb-1">
                    <h3 class="font-bold text-xl text-white uppercase  tracking-tight">{{ workout.activity }}</h3>
                    <span class="text-[10px] font-bold bg-white/5 border border-white/10 px-2 py-1 rounded text-gray-500 uppercase tracking-widest">{{ formatDate(workout.recorded_at) }}</span>
                  </div>
                  <div class="flex items-center gap-6 text-sm">
                    <div class="flex items-center gap-2">
                      <span class="text-gray-500 uppercase text-[10px] font-black">Durasi:</span>
                      <span class="text-white font-bold">{{ workout.duration }} <span class="text-gray-600">menit</span></span>
                    </div>
                    <p v-if="workout.note" class="text-gray-600 text-xs ml-2 border-l border-gray-800 pl-3">"{{ workout.note }}"</p>
                  </div>
                </div>
              </div>
              <button
                @click="handleDeleteWorkout(workout.id)"
                class="p-3 text-gray-700 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
              >
                <TrashIcon class="w-5 h-5" />
              </button>
            </div>
          </TransitionGroup>
        </div>
      </div>
    </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PlusIcon, TrashIcon, DumbbellIcon } from 'lucide-vue-next'
import api from '../../utils/api'

const showAddForm = ref(false)
const workouts = ref([])
const loading = ref(true)
const error = ref('')

const newWorkout = ref({ activity: "", duration: 30, note: "" })

const summaryStats = computed(() => [
  { label: "Latihan Hari Ini", value: workouts.value.length, textColor: "text-red-500" },
  { label: "Total Durasi", value: workouts.value.reduce((sum, w) => sum + (Number(w.duration) || 0), 0) + ' menit', textColor: "text-white" },
  { label: "Hari Beruntun", value: 1, textColor: "text-white" },
  { label: "Total Latihan", value: workouts.value.length, textColor: "text-white" }
])

const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '--'

const fetchProgress = async () => {
  loading.value = true
  try {
    const res = await api.get('/progress')
    let data = res.data?.data || []
    workouts.value = Array.isArray(data) ? data : []
  } catch (err) {
    error.value = 'Gagal memuat data progress'
    console.error('Progress fetch error:', err)
  } finally {
    loading.value = false
  }
}

const handleAddWorkout = async () => {
  try {
    const payload = {
      activity: newWorkout.value.activity,
      duration: Number(newWorkout.value.duration) || 30,
      note: newWorkout.value.note || ''
    }
    const res = await api.post('/progress', payload)
    await fetchProgress()
    newWorkout.value = { activity: "", duration: 30, note: "" }
    showAddForm.value = false
  } catch (err) {
    alert('Gagal simpan: ' + (err.response?.data?.message || 'Error server'))
  }
}

const handleDeleteWorkout = async (id) => {
  if (!confirm('Yakin ingin menghapus data ini?')) return
  try {
    await api.delete(`/progress/${id}`)
    workouts.value = workouts.value.filter(w => w.id !== id)
  } catch (err) {
    alert('Gagal hapus: ' + (err.response?.data?.message || 'Error server'))
  }
}

onMounted(fetchProgress)
</script>

<style scoped>
.input-field {
  @apply w-full px-4 py-4 rounded-xl bg-black border border-gray-800 text-white focus:outline-none focus:border-red-500 transition-all;
}

.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.fade-slide-enter-from, .fade-slide-leave-to { opacity: 0; transform: translateY(-30px); }

.list-enter-active, .list-leave-active { transition: all 0.4s ease; }
.list-enter-from { opacity: 0; transform: translateX(-30px); }
.list-leave-to { opacity: 0; transform: translateX(30px); }
</style>