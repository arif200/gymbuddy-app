<template>
  <div class="bg-black text-white">
    
    <!-- ===== HERO SECTION ===== -->
    <section class="relative min-h-screen flex items-center">
      <div class="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=1920&q=80"
          class="w-full h-full object-cover"
          loading="lazy"
          alt="Gym background"
        />
        <div class="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
      </div>

      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div class="max-w-2xl pt-24">
          <div class="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-6">
            <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <span class="text-red-500 text-xs font-semibold uppercase tracking-wider">Platform Fitness Purwokerto</span>
          </div>

          <h1 class="text-5xl md:text-7xl font-black leading-tight mb-6">
            Latihan Bareng
            <span class="text-red-500">Personal Trainer</span>
          </h1>

          <p class="text-gray-400 text-lg mb-8 max-w-xl leading-relaxed">
            Temukan trainer terbaik di Purwokerto. Atur jadwal, lacak progress, dan capai body goals kamu dengan bantuan profesional.
          </p>

          <div class="flex flex-col sm:flex-row gap-4">
            <router-link
              to="/register"
              class="inline-flex items-center justify-center gap-2 bg-red-500 text-white px-8 py-4 rounded-xl font-bold text-sm hover:bg-red-600 transition-all duration-200 shadow-xl shadow-red-500/20 active:scale-[0.98]"
            >
              Mulai Sekarang
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
              </svg>
            </router-link>
            <router-link
              to="/about"
              class="inline-flex items-center justify-center gap-2 border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-sm hover:bg-white/5 transition-all duration-200"
            >
              Pelajari Lebih Lanjut
            </router-link>
          </div>

          <!-- Stats -->
          <div v-if="statsLoaded" class="grid grid-cols-3 gap-8 mt-16 pt-12 border-t border-white/5">
            <div>
              <p class="text-3xl font-black text-white">{{ trainerCount }}+</p>
              <p class="text-gray-500 text-sm mt-1">Trainer Profesional</p>
            </div>
            <div>
              <p class="text-3xl font-black text-white">{{ sessionCount }}+</p>
              <p class="text-gray-500 text-sm mt-1">Sesi Latihan</p>
            </div>
            <div>
              <p class="text-3xl font-black text-white">{{ satisfactionRate }}%</p>
              <p class="text-gray-500 text-sm mt-1">Kepuasan Member</p>
            </div>
          </div>
          <div v-else class="grid grid-cols-3 gap-8 mt-16 pt-12 border-t border-white/5">
            <div v-for="i in 3" :key="i" class="animate-pulse">
              <div class="h-9 w-16 bg-white/10 rounded-lg mb-2"></div>
              <div class="h-4 w-24 bg-white/5 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== TENTANG ===== -->
    <section class="py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span class="text-red-500 text-sm font-semibold uppercase tracking-wider">Tentang Kami</span>
            <h2 class="text-4xl font-black mt-3 mb-6 leading-tight">
              Kenapa <span class="text-red-500">GymBuddy</span>?
            </h2>
            <p class="text-gray-400 leading-relaxed mb-6">
              GymBuddy adalah platform fitness digital yang menghubungkan Anda dengan personal trainer profesional di Purwokerto. Kami membantu Anda tetap konsisten berolahraga dengan pendampingan yang tepat.
            </p>
            <div class="space-y-4">
              <div v-for="(item, i) in benefits" :key="i" class="flex items-start gap-4">
                <div class="w-6 h-6 bg-red-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span class="text-red-500 text-xs">✓</span>
                </div>
                <div>
                  <p class="font-semibold text-white">{{ item.title }}</p>
                  <p class="text-gray-500 text-sm">{{ item.desc }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="relative">
            <img 
              src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80"
              class="rounded-2xl w-full"
              loading="lazy"
              alt="GymBuddy"
            />
            <div class="absolute -bottom-4 -left-4 w-full h-full border-2 border-red-500/20 rounded-2xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== PROGRAM ===== -->
    <section class="py-24 bg-[#0a0a0a]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <span class="text-red-500 text-sm font-semibold uppercase tracking-wider">Program Kami</span>
          <h2 class="text-4xl font-black mt-3 mb-4">Pilih Program Sesuai Tujuanmu</h2>
          <p class="text-gray-500 max-w-xl mx-auto">Dari pembentukan otot hingga penurunan berat badan, kami punya program yang tepat.</p>
        </div>

        <div class="grid md:grid-cols-3 gap-6">
          <div v-for="(prog, i) in programs" :key="i" class="group relative overflow-hidden rounded-2xl">
            <img :src="prog.image" :alt="prog.title" class="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
            <div class="absolute bottom-0 left-0 right-0 p-6">
              <h3 class="text-xl font-bold text-white">{{ prog.title }}</h3>
              <p class="text-gray-400 text-sm mt-1">{{ prog.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== CTA ===== -->
    <section class="py-24">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-4xl font-black mb-4">
          Siap Mulai Perjalanan Fitness-mu?
        </h2>
        <p class="text-gray-500 mb-8 max-w-lg mx-auto">
          Daftar sekarang dan dapatkan akses ke personal trainer profesional di Purwokerto.
        </p>
        <router-link
          to="/register"
          class="inline-flex items-center gap-2 bg-red-500 text-white px-10 py-4 rounded-xl font-bold hover:bg-red-600 transition-all duration-200 shadow-xl shadow-red-500/20"
        >
          Daftar Gratis
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
          </svg>
        </router-link>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../utils/api'

const trainerCount = ref(0)
const sessionCount = ref(0)
const satisfactionRate = ref(98)
const statsLoaded = ref(false)

const fetchStats = async () => {
  try {
    const [trainerRes, sessionRes] = await Promise.all([
      api.get('/trainers'),
      api.get('/sessions')
    ])
    const t = trainerRes.data?.meta?.total ?? trainerRes.data?.data?.length
    const s = sessionRes.data?.meta?.total ?? sessionRes.data?.data?.length
    if (t) trainerCount.value = t
    if (s) sessionCount.value = s
    statsLoaded.value = true
  } catch (e) {
    console.warn('Gagal fetch stats homepage:', e.message)
    trainerCount.value = 4
    sessionCount.value = 8
    statsLoaded.value = true
  }
}

onMounted(fetchStats)

const benefits = [
  { title: 'Trainer Profesional', desc: 'Terhubung dengan personal trainer berpengalaman di Purwokerto.' },
  { title: 'Booking Mudah', desc: 'Atur jadwal latihan sesuai waktu luang kamu dengan sistem booking online.' },
  { title: 'Pantau Progress', desc: 'Lacak perkembangan latihan kamu dengan grafik dan statistik lengkap.' }
]

const programs = [
  { title: 'Strength Training', desc: 'Bangun massa otot dengan program latihan beban terstruktur.', image: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=600&q=80' },
  { title: 'Personal Trainer', desc: 'Sesi one-on-one dengan trainer profesional.', image: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=600&q=80' },
  { title: 'Cardio & Fitness', desc: 'Tingkatkan daya tahan tubuh dengan program kardio.', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80' }
]
</script>
