<template>
  <div class="p-8 text-white">
    <header class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-black uppercase tracking-tighter">Kelola Promo</h1>
        <p class="text-gray-500 text-sm mt-1">Voucher, diskon, dan kode promo</p>
      </div>
      <button @click="openForm(null)" class="bg-red-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-red-600">+ Promo Baru</button>
    </header>

    <div class="bg-[#0f1115] rounded-2xl border border-gray-900 overflow-hidden">
      <table class="w-full text-left">
        <thead><tr class="bg-black/20">
          <th class="py-4 px-6 text-[10px] font-black text-gray-500 uppercase">Kode</th>
          <th class="py-4 px-6 text-[10px] font-black text-gray-500 uppercase">Judul</th>
          <th class="py-4 px-6 text-[10px] font-black text-gray-500 uppercase">Nilai</th>
          <th class="py-4 px-6 text-[10px] font-black text-gray-500 uppercase">Status</th>
          <th class="py-4 px-6 text-[10px] font-black text-gray-500 uppercase">Aksi</th>
        </tr></thead>
        <tbody>
          <tr v-for="p in promos" :key="p.id" class="border-b border-gray-900/50 hover:bg-white/[0.02]">
            <td class="py-4 px-6 font-mono font-bold text-sm">{{ p.kode }}</td>
            <td class="py-4 px-6 text-sm">{{ p.judul }}</td>
            <td class="py-4 px-6 text-sm">{{ p.tipe === 'persen' ? `${p.nilai}%` : formatRupiah(p.nilai) }}</td>
            <td class="py-4 px-6"><span :class="p.is_active ? 'text-green-400' : 'text-red-400'" class="text-xs font-bold">{{ p.is_active ? 'Aktif' : 'Nonaktif' }}</span></td>
            <td class="py-4 px-6 flex gap-2">
              <button @click="openForm(p)" class="text-blue-400 text-xs font-bold uppercase">Edit</button>
              <button @click="deletePromo(p.id)" class="text-red-400 text-xs font-bold uppercase">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showForm" class="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div class="bg-[#161920] border border-gray-900 w-full max-w-lg rounded-2xl p-8">
        <h2 class="text-xl font-black mb-6">{{ editing ? 'Edit Promo' : 'Buat Promo' }}</h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div><label class="text-[9px] font-black uppercase text-gray-600 block mb-2">Kode</label>
              <input v-model="form.kode" type="text" autocomplete="off" class="w-full bg-black/40 border border-gray-900 rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none" required></div>
            <div><label class="text-[9px] font-black uppercase text-gray-600 block mb-2">Tipe</label>
              <select v-model="form.tipe" class="w-full bg-black/40 border border-gray-900 rounded-xl px-4 py-3 text-sm outline-none">
                <option value="persen">Persen (%)</option>
                <option value="nominal">Nominal (Rp)</option>
              </select></div>
          </div>
          <div><label class="text-[9px] font-black uppercase text-gray-600 block mb-2">Judul</label>
            <input v-model="form.judul" type="text" autocomplete="off" class="w-full bg-black/40 border border-gray-900 rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none" required></div>
          <div class="grid grid-cols-2 gap-4">
            <div><label class="text-[9px] font-black uppercase text-gray-600 block mb-2">Nilai</label>
              <input v-model.number="form.nilai" type="number" autocomplete="off" class="w-full bg-black/40 border border-gray-900 rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none" required></div>
            <div><label class="text-[9px] font-black uppercase text-gray-600 block mb-2">Min. Booking</label>
              <input v-model.number="form.min_booking" type="number" autocomplete="off" class="w-full bg-black/40 border border-gray-900 rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none"></div>
          </div>
          <div class="flex gap-3 pt-4">
            <button type="button" @click="showForm = false" class="flex-1 py-4 bg-white/5 rounded-xl text-xs font-black uppercase border border-gray-800">Batal</button>
            <button type="submit" class="flex-1 py-4 bg-red-500 text-white rounded-xl text-xs font-black uppercase hover:bg-red-600">{{ editing ? 'Simpan' : 'Buat' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../utils/api'

const promos = ref([])
const showForm = ref(false)
const editing = ref(false)
const form = ref({ kode: '', judul: '', tipe: 'nominal', nilai: 0, min_booking: 1 })

const fetchData = async () => {
  try { const res = await api.get('/promos'); promos.value = res.data?.data || [] }
  catch (err) { console.error(err) }
}

const openForm = (promo) => {
  if (promo) { form.value = { ...promo }; editing.value = true }
  else { form.value = { kode: '', judul: '', tipe: 'nominal', nilai: 0, min_booking: 1 }; editing.value = false }
  showForm.value = true
}

const handleSubmit = async () => {
  try {
    if (editing.value) await api.put(`/promos/${form.value.id}`, form.value)
    else await api.post('/promos', form.value)
    showForm.value = false; fetchData()
  } catch (err) { alert(err.response?.data?.error?.message || err.response?.data?.message || 'Gagal') }
}

const deletePromo = async (id) => {
  if (!confirm('Yakin?')) return
  try { await api.delete(`/promos/${id}`); fetchData() }
  catch (err) { alert(err.response?.data?.error?.message || err.response?.data?.message || 'Gagal') }
}

const formatRupiah = (p) => `Rp${Number(p).toLocaleString('id-ID')}`
onMounted(fetchData)
</script>
