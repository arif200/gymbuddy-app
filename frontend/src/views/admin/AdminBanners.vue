<template>
  <div class="p-8 text-white">
    <header class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-black uppercase tracking-tighter">Kelola Banner</h1>
        <p class="text-gray-500 text-sm mt-1">Banner promosi landing page</p>
      </div>
      <button @click="openForm(null)" class="bg-red-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-red-600">+ Banner Baru</button>
    </header>

    <div v-if="loading" class="text-center py-20 text-red-500 font-black uppercase tracking-widest text-xs">Memuat data...</div>

    <div v-else class="grid gap-4">
      <div v-for="b in banners" :key="b.id" class="bg-[#0f1115] p-6 rounded-2xl border border-gray-900 hover:border-red-500/20 transition-all">
        <div class="flex gap-6">
          <div v-if="b.gambar" class="w-48 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-gray-900">
            <img :src="b.gambar" :alt="b.judul" class="w-full h-full object-cover" @error="$event.target.style.display='none'" />
          </div>
          <div class="flex-1">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-bold text-lg">{{ b.judul || 'Banner' }}</h3>
                <p class="text-gray-400 text-sm mt-1">{{ b.deskripsi || 'Tidak ada deskripsi' }}</p>
                <div class="flex items-center gap-3 mt-3">
                  <span v-if="b.link" class="text-[10px] text-blue-400 font-bold">🔗 {{ b.link }}</span>
                  <span class="text-[10px] text-gray-600 font-bold">Urutan: {{ b.urutan || 0 }}</span>
                  <span :class="b.is_active ? 'text-green-400' : 'text-gray-600'" class="text-[10px] font-bold">
                    {{ b.is_active ? '✓ Aktif' : '✕ Nonaktif' }}
                  </span>
                </div>
              </div>
              <div class="flex gap-2 ml-4">
                <button @click="openForm(b)" class="text-blue-400 text-xs font-bold uppercase hover:text-blue-300">Edit</button>
                <button @click="deleteBanner(b.id)" class="text-red-400 text-xs font-bold uppercase hover:text-red-300">Hapus</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="banners.length === 0" class="text-center py-20 text-gray-600 font-bold uppercase tracking-widest text-xs border border-dashed border-gray-900 rounded-2xl">
        Belum ada banner. Klik "+ Banner Baru" untuk membuat.
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showForm" class="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div class="bg-[#161920] border border-gray-900 w-full max-w-lg rounded-2xl p-8">
        <h2 class="text-xl font-black mb-6">{{ editing ? 'Edit Banner' : 'Buat Banner' }}</h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="text-[9px] font-black uppercase text-gray-600 block mb-2">Judul</label>
            <input v-model="form.judul" type="text" autocomplete="off" class="w-full bg-black/40 border border-gray-900 rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none">
          </div>
          <div>
            <label class="text-[9px] font-black uppercase text-gray-600 block mb-2">Deskripsi</label>
            <textarea v-model="form.deskripsi" autocomplete="off" class="w-full bg-black/40 border border-gray-900 rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none h-24"></textarea>
          </div>
          <div>
            <label class="text-[9px] font-black uppercase text-gray-600 block mb-2">URL Gambar *</label>
            <input v-model="form.gambar" type="url" autocomplete="url" class="w-full bg-black/40 border border-gray-900 rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none" required placeholder="https://example.com/gambar.jpg">
          </div>
          <div>
            <label class="text-[9px] font-black uppercase text-gray-600 block mb-2">Link Tujuan (opsional)</label>
            <input v-model="form.link" type="url" autocomplete="url" class="w-full bg-black/40 border border-gray-900 rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none" placeholder="https://example.com/...">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-[9px] font-black uppercase text-gray-600 block mb-2">Urutan</label>
              <input v-model.number="form.urutan" type="number" autocomplete="off" class="w-full bg-black/40 border border-gray-900 rounded-xl px-4 py-3 text-sm outline-none">
            </div>
            <div>
              <label class="text-[9px] font-black uppercase text-gray-600 block mb-2">Status</label>
              <select v-model="form.is_active" class="w-full bg-black/40 border border-gray-900 rounded-xl px-4 py-3 text-sm outline-none">
                <option :value="1">Aktif</option>
                <option :value="0">Nonaktif</option>
              </select>
            </div>
          </div>
          <div class="flex gap-3 pt-4">
            <button type="button" @click="showForm = false" class="flex-1 py-4 bg-white/5 rounded-xl text-xs font-black uppercase border border-gray-800 hover:bg-white/10 transition-all">Batal</button>
            <button type="submit" class="flex-1 py-4 bg-red-500 text-white rounded-xl text-xs font-black uppercase hover:bg-red-600 transition-all">{{ editing ? 'Simpan' : 'Buat' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../utils/api'

const banners = ref([])
const loading = ref(true)
const showForm = ref(false)
const editing = ref(false)
const form = ref({ judul: '', deskripsi: '', gambar: '', link: '', urutan: 0, is_active: true })

const fetchData = async () => {
  loading.value = true
  try {
    const res = await api.get('/banners')
    banners.value = res.data?.data || []
  } catch (err) { console.error(err) }
  finally { loading.value = false }
}

const openForm = (banner) => {
  if (banner) {
    form.value = { ...banner }
    editing.value = true
  } else {
    form.value = { judul: '', deskripsi: '', gambar: '', link: '', urutan: 0, is_active: true }
    editing.value = false
  }
  showForm.value = true
}

const handleSubmit = async () => {
  try {
    if (editing.value) await api.put(`/banners/${form.value.id}`, form.value)
    else await api.post('/banners', form.value)
    showForm.value = false
    fetchData()
  } catch (err) {
    alert(err.response?.data?.error?.message || err.response?.data?.message || 'Gagal menyimpan banner')
  }
}

const deleteBanner = async (id) => {
  if (!confirm('Yakin ingin menghapus banner ini?')) return
  try {
    await api.delete(`/banners/${id}`)
    fetchData()
  } catch (err) {
    alert(err.response?.data?.error?.message || err.response?.data?.message || 'Gagal menghapus')
  }
}

onMounted(fetchData)
</script>
