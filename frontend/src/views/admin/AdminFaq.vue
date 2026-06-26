<template>
  <div class="p-8 text-white">
    <header class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-black uppercase tracking-tighter">Kelola FAQ</h1>
        <p class="text-gray-500 text-sm mt-1">Pertanyaan umum</p>
      </div>
      <button @click="openForm(null)" class="bg-red-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-red-600">+ FAQ Baru</button>
    </header>

    <div class="space-y-4">
      <div v-for="f in faqs" :key="f.id" class="bg-[#0f1115] p-6 rounded-2xl border border-gray-900">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <p class="font-bold text-sm mb-2">{{ f.pertanyaan }}</p>
            <p class="text-gray-400 text-sm">{{ f.jawaban }}</p>
            <span class="text-[9px] text-gray-600 font-bold uppercase mt-2 inline-block">Kategori: {{ f.kategori }}</span>
          </div>
          <div class="flex gap-2 ml-4">
            <button @click="openForm(f)" class="text-blue-400 text-xs font-bold uppercase">Edit</button>
            <button @click="deleteFaq(f.id)" class="text-red-400 text-xs font-bold uppercase">Hapus</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showForm" class="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div class="bg-[#161920] border border-gray-900 w-full max-w-lg rounded-2xl p-8">
        <h2 class="text-xl font-black mb-6">{{ editing ? 'Edit FAQ' : 'Buat FAQ' }}</h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div><label class="text-[9px] font-black uppercase text-gray-600 block mb-2">Pertanyaan</label>
            <input v-model="form.pertanyaan" type="text" autocomplete="off" class="w-full bg-black/40 border border-gray-900 rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none" required></div>
          <div><label class="text-[9px] font-black uppercase text-gray-600 block mb-2">Jawaban</label>
            <textarea v-model="form.jawaban" autocomplete="off" class="w-full bg-black/40 border border-gray-900 rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none h-24" required></textarea></div>
          <div class="grid grid-cols-2 gap-4">
            <div><label class="text-[9px] font-black uppercase text-gray-600 block mb-2">Kategori</label>
              <input v-model="form.kategori" type="text" autocomplete="off" class="w-full bg-black/40 border border-gray-900 rounded-xl px-4 py-3 text-sm outline-none"></div>
            <div><label class="text-[9px] font-black uppercase text-gray-600 block mb-2">Urutan</label>
              <input v-model.number="form.urutan" type="number" autocomplete="off" class="w-full bg-black/40 border border-gray-900 rounded-xl px-4 py-3 text-sm outline-none"></div>
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

const faqs = ref([])
const showForm = ref(false)
const editing = ref(false)
const form = ref({ pertanyaan: '', jawaban: '', kategori: 'umum', urutan: 0 })

const fetchData = async () => {
  try { const res = await api.get('/faqs'); faqs.value = res.data?.data || [] }
  catch (err) { console.error(err) }
}

const openForm = (faq) => {
  if (faq) { form.value = { ...faq }; editing.value = true }
  else { form.value = { pertanyaan: '', jawaban: '', kategori: 'umum', urutan: 0 }; editing.value = false }
  showForm.value = true
}

const handleSubmit = async () => {
  try {
    if (editing.value) await api.put(`/faqs/${form.value.id}`, form.value)
    else await api.post('/faqs', form.value)
    showForm.value = false; fetchData()
  } catch (err) { alert(err.response?.data?.error?.message || err.response?.data?.message || 'Gagal') }
}

const deleteFaq = async (id) => {
  if (!confirm('Yakin?')) return
  try { await api.delete(`/faqs/${id}`); fetchData() }
  catch (err) { alert(err.response?.data?.error?.message || err.response?.data?.message || 'Gagal') }
}

onMounted(fetchData)
</script>
