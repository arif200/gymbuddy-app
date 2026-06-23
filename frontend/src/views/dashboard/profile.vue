<template>
  <main class="p-8 text-white">
      <div class="bg-[#161920] rounded-[2rem] p-8 border border-gray-900 mb-8 relative overflow-hidden">
        <div class="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <!-- Photo Avatar with Upload -->
          <div class="relative group cursor-pointer" @click="triggerUpload">
            <div v-if="photoUrl" class="w-24 h-24 rounded-2xl overflow-hidden border-2 border-red-500/50">
              <img :src="photoUrl" :alt="user.nama" class="w-full h-full object-cover" />
            </div>
            <div v-else class="w-24 h-24 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center text-white font-black text-3xl uppercase shadow-lg shadow-red-500/20">
              {{ getInitials(user.nama) }}
            </div>
            <!-- Camera overlay -->
            <div class="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div class="text-white text-center">
                <svg class="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span class="text-[9px] font-bold uppercase">Ganti Foto</span>
              </div>
            </div>
            <!-- Loading spinner -->
            <div v-if="uploading" class="absolute inset-0 bg-black/70 rounded-2xl flex items-center justify-center">
              <div class="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          <!-- Hidden file input -->
          <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/gif,image/webp" class="hidden" @change="handleFileSelect" />

          <div class="flex-grow text-center md:text-left">
            <h2 class="text-2xl font-black uppercase tracking-tight mb-1">{{ user.nama || 'Loading...' }}</h2>
            <div class="text-gray-500 text-sm mb-4">
              <p>📧 {{ user.email }}</p>
              <p class="uppercase">📍 {{ user.kota || 'Kota belum diatur' }}</p>
            </div>
            
            <router-link :to="`/dashboard/profile/edit/${user.id}`" class="inline-block bg-red-500 text-black px-5 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider hover:bg-red-400">
              Edit Profil
            </router-link>
          </div>
        </div>
      </div>
      
      <div class="bg-[#161920] p-8 rounded-[2rem] border border-gray-900">
        <h3 class="font-black uppercase text-[10px] tracking-[0.2em] text-gray-500 mb-6">Informasi Detail</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="(val, label) in infoFields" :key="label">
            <p class="text-[9px] uppercase font-bold text-red-500 tracking-widest mb-1">{{ label }}</p>
            <p class="text-sm font-medium text-white uppercase">{{ val || '-' }}</p>
          </div>
        </div>
      </div>
    </main>

  <!-- Toast -->
  <Transition name="toast">
    <div v-if="toast.show" 
         :class="toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'"
         class="fixed bottom-6 right-6 px-6 py-4 rounded-2xl text-white font-bold text-sm shadow-2xl z-50">
      {{ toast.message }}
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../../utils/api'
import { useAuthStore } from '../../stores/authStore'

const authStore = useAuthStore()
const user = ref({ id: '', nama: '', email: '', role: '', kota: '', propinsi: '', foto: '' })
const photoUrl = ref('')
const uploading = ref(false)
const fileInput = ref(null)
const toast = ref({ show: false, message: '', type: 'success' })

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

const infoFields = computed(() => ({
  "Nama Lengkap": user.value.nama,
  "Alamat Email": user.value.email,
  "Kota Saat Ini": user.value.kota,
  "Provinsi": user.value.propinsi,
  "Role Akun": user.value.role
}))

const photoBaseUrl = api.defaults.baseURL.replace(/\/api\/v1$/, '')

const syncUser = (data) => {
  user.value = data
  if (data.foto) {
    photoUrl.value = `${photoBaseUrl}/${data.foto}`
  }
}

const fetchUserProfile = async () => {
  try {
    await authStore.init()
    if (authStore.user) {
      syncUser(authStore.user)
    }
  } catch (error) {
    console.error("Gagal ambil data:", error)
  }
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

  // Validasi tipe
  if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
    showToast('Tipe file tidak didukung. Gunakan JPEG, PNG, GIF, atau WebP.', 'error')
    return
  }
  // Validasi ukuran (max 2MB)
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
      user.value.foto = fotoPath
      // Sync ke authStore agar semua view (termasuk profile page) pakai foto baru
      if (authStore.user) {
        authStore.setUser({ ...authStore.user, foto: fotoPath })
      }
      showToast('Foto profil berhasil diperbarui!', 'success')
    }
  } catch (err) {
    const msg = err.response?.data?.message || 'Gagal upload foto'
    showToast(msg, 'error')
  } finally {
    uploading.value = false
    // Reset input
    if (fileInput.value) fileInput.value.value = ''
  }
}

onMounted(fetchUserProfile)
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.4s ease; }
.toast-enter-from { opacity: 0; transform: translateX(100px); }
.toast-leave-to { opacity: 0; transform: translateY(20px); }
</style>
