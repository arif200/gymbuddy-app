<template>
  <div class="p-8 text-white">
    <header class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-black uppercase tracking-tighter">Kelola Trainer</h1>
        <p class="text-gray-500 text-sm mt-1">Manajemen data personal trainer</p>
      </div>
      <div class="text-xs text-gray-600 font-bold">{{ trainers.length }} trainer</div>
    </header>

    <div class="bg-[#0f1115] rounded-2xl border border-gray-900 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-black/20">
              <th class="py-4 px-6 text-[10px] font-black text-gray-500 uppercase">Nama</th>
              <th class="py-4 px-6 text-[10px] font-black text-gray-500 uppercase">Email</th>
              <th class="py-4 px-6 text-[10px] font-black text-gray-500 uppercase">Lokasi</th>
              <th class="py-4 px-6 text-[10px] font-black text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in trainers" :key="t.id" class="border-b border-gray-900/50 hover:bg-white/[0.02]">
              <td class="py-4 px-6 text-sm font-medium">{{ t.nama }}</td>
              <td class="py-4 px-6 text-sm text-gray-400">{{ t.email }}</td>
              <td class="py-4 px-6 text-sm text-gray-400">{{ t.kota || '-' }}</td>
              <td class="py-4 px-6">
                <button @click="deleteTrainer(t.id)" class="text-red-400 hover:text-red-300 text-xs font-bold uppercase">Hapus</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../utils/api'

const trainers = ref([])

const fetchData = async () => {
  try {
    const res = await api.get('/users', { params: { role: 'trainer', limit: 100 } })
    trainers.value = res.data?.data || []
  } catch (err) { console.error(err) }
}

const deleteTrainer = async (id) => {
  if (!confirm('Yakin ingin menghapus trainer ini?')) return
  try {
    await api.delete(`/users/${id}`)
    fetchData()
  } catch (err) { alert(err.response?.data?.error?.message || err.response?.data?.message || 'Gagal') }
}

onMounted(fetchData)
</script>
