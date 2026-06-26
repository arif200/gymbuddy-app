<template>
  <div class="p-8 text-white">
    <header class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-black uppercase tracking-tighter">Kelola Artikel</h1>
        <p class="text-gray-500 text-sm mt-1">Manajemen artikel dan konten</p>
      </div>
      <button @click="openForm(null)" class="bg-red-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-red-600 transition-all">+ Artikel Baru</button>
    </header>

    <!-- Table -->
    <div class="bg-[#0f1115] rounded-2xl border border-gray-900 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-black/20">
              <th class="py-4 px-6 text-[10px] font-black text-gray-500 uppercase">Judul</th>
              <th class="py-4 px-6 text-[10px] font-black text-gray-500 uppercase">Kategori</th>
              <th class="py-4 px-6 text-[10px] font-black text-gray-500 uppercase">Status</th>
              <th class="py-4 px-6 text-[10px] font-black text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in articles" :key="a.id" class="border-b border-gray-900/50 hover:bg-white/[0.02]">
              <td class="py-4 px-6 text-sm font-medium">{{ a.title }}</td>
              <td class="py-4 px-6"><span class="badge-info">{{ a.kategori }}</span></td>
              <td class="py-4 px-6">
                <span v-if="a.is_published" class="text-green-400 text-xs font-bold">Published</span>
                <span v-else class="text-gray-500 text-xs font-bold">Draft</span>
              </td>
              <td class="py-4 px-6 flex gap-2">
                <button @click="openForm(a)" class="text-blue-400 text-xs font-bold uppercase">Edit</button>
                <button @click="deleteArticle(a.id)" class="text-red-400 text-xs font-bold uppercase">Hapus</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="showForm" class="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div class="bg-[#161920] border border-gray-900 w-full max-w-2xl rounded-2xl p-8 max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-black mb-6">{{ editing ? 'Edit Artikel' : 'Buat Artikel' }}</h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="text-[9px] font-black uppercase text-gray-600 mb-2 block">Judul</label>
            <input v-model="form.title" type="text" autocomplete="off" class="w-full bg-black/40 border border-gray-900 rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none" required>
          </div>
          <div>
            <label class="text-[9px] font-black uppercase text-gray-600 mb-2 block">Slug (URL)</label>
            <input v-model="form.slug" type="text" autocomplete="off" class="w-full bg-black/40 border border-gray-900 rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none" required>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-[9px] font-black uppercase text-gray-600 mb-2 block">Kategori</label>
              <select v-model="form.kategori" class="w-full bg-black/40 border border-gray-900 rounded-xl px-4 py-3 text-sm outline-none">
                <option value="Diet">Diet</option>
                <option value="Bulking">Bulking</option>
                <option value="Cutting">Cutting</option>
                <option value="Workout">Workout</option>
                <option value="Motivasi">Motivasi</option>
              </select>
            </div>
            <div>
              <label class="text-[9px] font-black uppercase text-gray-600 mb-2 block">Status</label>
              <label class="flex items-center gap-2 pt-3">
                <input v-model="form.is_published" type="checkbox" class="accent-red-500">
                <span class="text-sm">Published</span>
              </label>
            </div>
          </div>
          <div>
            <label class="text-[9px] font-black uppercase text-gray-600 mb-2 block">Ringkasan</label>
            <textarea v-model="form.excerpt" autocomplete="off" class="w-full bg-black/40 border border-gray-900 rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none h-20"></textarea>
          </div>
          <div>
            <label class="text-[9px] font-black uppercase text-gray-600 mb-2 block">Konten</label>
            <textarea v-model="form.content" autocomplete="off" class="w-full bg-black/40 border border-gray-900 rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none h-40" required></textarea>
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

const articles = ref([])
const showForm = ref(false)
const editing = ref(false)
const form = ref({ title: '', slug: '', content: '', excerpt: '', kategori: 'Workout', is_published: false })

const fetchData = async () => {
  try {
    const res = await api.get('/articles')
    articles.value = res.data?.data || []
  } catch (err) { console.error(err) }
}

const openForm = (article) => {
  if (article) {
    form.value = { ...article, is_published: !!article.is_published }
    editing.value = true
  } else {
    form.value = { title: '', slug: '', content: '', excerpt: '', kategori: 'Workout', is_published: false }
    editing.value = false
  }
  showForm.value = true
}

const handleSubmit = async () => {
  try {
    if (editing.value) {
      await api.put(`/articles/${form.value.id}`, form.value)
    } else {
      await api.post('/articles', form.value)
    }
    showForm.value = false
    fetchData()
  } catch (err) { alert(err.response?.data?.error?.message || err.response?.data?.message || 'Gagal') }
}

const deleteArticle = async (id) => {
  if (!confirm('Yakin?')) return
  try { await api.delete(`/articles/${id}`); fetchData() }
  catch (err) { alert(err.response?.data?.error?.message || err.response?.data?.message || 'Gagal') }
}

onMounted(fetchData)
</script>
