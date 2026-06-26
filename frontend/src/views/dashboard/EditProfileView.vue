<template>
  <main class="p-6 lg:p-12 overflow-y-auto">
      <div class="max-w-4xl mx-auto mb-10">
        <div class="flex items-center gap-6">
          <router-link 
            to="/dashboard/profile" 
            class="group w-12 h-12 bg-[#161920] border border-gray-800 rounded-2xl flex items-center justify-center hover:border-red-500/50 transition-all duration-300 shadow-xl"
          >
            <span class="text-gray-400 group-hover:text-red-500 transform group-hover:-translate-x-1 transition-all text-xl">←</span>
          </router-link>
          <div>
            <h1 class="text-3xl font-black uppercase tracking-tight text-white leading-none">Edit Profil</h1>
            <p class="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Informasi Pribadi • GymBuddy</p>
          </div>
        </div>
      </div>

      <div class="max-w-4xl mx-auto">
        <div class="bg-[#161920] rounded-[2.5rem] border border-gray-900 shadow-2xl overflow-hidden relative">
          <div class="h-1.5 w-full bg-gradient-to-r from-red-500 via-red-500 to-blue-500"></div>
          
          <div class="p-8 lg:p-14">
            <!-- Photo Upload Section -->
            <div class="flex flex-col items-center mb-12">
              <div class="relative group cursor-pointer" @click="triggerUpload">
                <div v-if="photoUrl" class="w-28 h-28 rounded-3xl overflow-hidden border-2 border-red-500/50">
                  <img :src="photoUrl" :alt="profile.nama" class="w-full h-full object-cover" />
                </div>
                <div v-else class="w-28 h-28 bg-gradient-to-br from-red-500 to-red-700 rounded-3xl flex items-center justify-center text-white font-black text-3xl uppercase shadow-lg shadow-red-500/20">
                  {{ getInitials(profile.nama) }}
                </div>
                <div class="absolute inset-0 bg-black/50 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div class="text-white text-center">
                    <svg class="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <span class="text-[9px] font-bold uppercase">Ganti Foto</span>
                  </div>
                </div>
                <div v-if="uploading" class="absolute inset-0 bg-black/70 rounded-3xl flex items-center justify-center">
                  <div class="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
              <p class="mt-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Foto Profil</p>
              <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/gif,image/webp" class="hidden" @change="handleFileSelect" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              
              <div class="space-y-3">
                <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Nama Lengkap</label>
                <div class="relative group">
                  <input 
                    v-model="profile.nama"
                    type="text"
                    autocomplete="name"
                    placeholder="Contoh: Budi Santoso"
                    class="w-full bg-black/40 border border-gray-800 text-gray-200 p-4 rounded-2xl outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/5 transition-all duration-300 text-sm"
                  >
                </div>
              </div>

              <div class="space-y-3">
                <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Alamat Email</label>
                <input 
                  v-model="profile.email"
                  type="email"
                  autocomplete="email"
                  placeholder="name@company.com"
                  class="w-full bg-black/40 border border-gray-800 text-gray-200 p-4 rounded-2xl outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/5 transition-all duration-300 text-sm"
                >
              </div>

              <div class="space-y-3">
                <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Kota</label>
                <input 
                  v-model="profile.kota"
                  type="text"
                  autocomplete="address-level2"
                  placeholder="Your city"
                  class="w-full bg-black/40 border border-gray-800 text-gray-200 p-4 rounded-2xl outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/5 transition-all duration-300 text-sm"
                >
              </div>

              <div class="space-y-3">
                <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Provinsi</label>
                <input 
                  v-model="profile.propinsi"
                  type="text"
                  autocomplete="address-level1"
                  placeholder="Your province"
                  class="w-full bg-black/40 border border-gray-800 text-gray-200 p-4 rounded-2xl outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/5 transition-all duration-300 text-sm"
                >
              </div>

            </div>

            <div class="mt-16 pt-10 border-t border-gray-800/50 flex flex-col sm:flex-row items-center justify-between gap-8">
              
              <div class="flex items-center gap-4 w-full sm:w-auto">
                <router-link to="/dashboard/profile" class="flex-1 sm:flex-none text-center text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors px-6">
                  Batal
                </router-link>
                
                <button 
                  @click="handleSave" 
                  :disabled="loading"
                  class="flex-1 sm:flex-none relative overflow-hidden group bg-red-500 disabled:bg-gray-800 text-black px-12 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-red-400 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                >
                  <span v-if="!loading">Simpan Profil</span>
                  <div v-else class="flex items-center gap-2">
                    <div class="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                    <span>Menyimpan...</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

  <Transition name="toast">
    <div v-if="toast.show" 
         :class="toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'"
         class="fixed bottom-6 right-6 px-6 py-4 rounded-2xl text-white font-bold text-sm shadow-2xl z-50">
      {{ toast.message }}
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../utils/api'
import { useAuthStore } from '../../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const profile = ref({ id: null, nama: '', email: '', kota: '', propinsi: '' })
const photoUrl = ref('')
const uploading = ref(false)
const fileInput = ref(null)
const toast = ref({ show: false, message: '', type: 'success' })
const photoBaseUrl = api.defaults.baseURL.replace(/\/api\/v1$/, '')

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.split(' ')
  return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0][0].toUpperCase()
}

const triggerUpload = () => {
  if (!uploading.value) fileInput.value?.click()
}

const handleFileSelect = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
    showToast('Tipe file tidak didukung. Gunakan JPEG, PNG, GIF, atau WebP.', 'error')
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    showToast('File terlalu besar. Maksimal 2MB.', 'error')
    return
  }

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('foto', file)

    const response = await api.post('/upload/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    const fotoPath = response.data?.data?.foto
    if (fotoPath) {
      photoUrl.value = `${photoBaseUrl}/${fotoPath}`
      // Sync ke authStore agar profile page dan view lain pakai foto baru
      if (authStore.user) {
        authStore.setUser({ ...authStore.user, foto: fotoPath })
      }
      showToast('Foto profil berhasil diperbarui!', 'success')
    }
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Gagal upload foto'
    showToast(msg, 'error')
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

const syncProfile = (data) => {
  if (!data) return
  profile.value = {
    id: data.id || data.id_user,
    nama: data.nama || '',
    email: data.email || '',
    kota: data.kota || '',
    propinsi: data.propinsi || ''
  }
  if (data.foto) {
    photoUrl.value = `${photoBaseUrl}/${data.foto}`
  }
}

const fetchUserData = async () => {
  try {
    await authStore.init()
    syncProfile(authStore.user)
  } catch (err) {
    console.error('Fetch error:', err)
  }
}

const handleSave = async () => {
  if (!profile.value.id) return
  loading.value = true
  
  try {
    await api.put('/users/profile', {
      nama: profile.value.nama,
      email: profile.value.email,
      kota: profile.value.kota,
      propinsi: profile.value.propinsi
    })
    
    alert('Profile updated successfully!')
    router.push('/dashboard/profile')
  } catch (err) {
    console.error('Update Error:', err)
    alert('Gagal memperbarui: ' + (err.response?.data?.error?.message || err.response?.data?.message || 'Server error'))
  } finally {
    loading.value = false
  }
}

onMounted(fetchUserData)
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.4s ease; }
.toast-enter-from { opacity: 0; transform: translateX(100px); }
.toast-leave-to { opacity: 0; transform: translateY(20px); }
</style>