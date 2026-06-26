<template>
  <footer class="bg-[#0a0a0a] border-t border-white/5 pt-16 pb-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Top Grid -->
      <div class="grid md:grid-cols-4 gap-10 mb-12">
        
        <!-- Brand -->
        <div class="md:col-span-1">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center font-black text-white text-sm">
              GB
            </div>
            <h2 class="text-white font-bold text-lg">GymBuddy</h2>
          </div>
          <p class="text-gray-500 text-sm leading-relaxed">
            Platform fitness nomor satu di Purwokerto. Temukan trainer terbaik dan capai body goals kamu.
          </p>
        </div>

        <!-- Menu -->
        <div>
          <h3 class="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Menu</h3>
          <ul class="space-y-3">
            <li><router-link to="/" class="text-gray-500 text-sm hover:text-red-500 transition-colors">Beranda</router-link></li>
            <li><router-link to="/about" class="text-gray-500 text-sm hover:text-red-500 transition-colors">Tentang</router-link></li>
            <li><router-link to="/trainer" class="text-gray-500 text-sm hover:text-red-500 transition-colors">Personal Trainer</router-link></li>
          </ul>
        </div>

        <!-- Layanan -->
        <div>
          <h3 class="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Layanan</h3>
          <ul class="space-y-3 text-gray-500 text-sm">
            <li>Cari Personal Trainer</li>
            <li>Booking Sesi Latihan</li>
            <li>Progress Tracker</li>
          </ul>
        </div>

        <!-- Kontak -->
        <div>
          <h3 class="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Kontak</h3>
          <ul class="space-y-3 text-gray-500 text-sm">
            <li class="flex items-center gap-2">
              <span class="text-red-500">📧</span> gymbuddy@email.com
            </li>
            <li class="flex items-center gap-2">
              <span class="text-red-500">📱</span> +62 895 6064 9520
            </li>
            <li class="flex items-center gap-2">
              <span class="text-red-500">📍</span> Purwokerto, Jawa Tengah
            </li>
          </ul>
        </div>

      </div>

      <!-- Bottom -->
      <div class="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p class="text-gray-600 text-sm">
          © 2026 GymBuddy. Hak cipta dilindungi.
        </p>
        <div class="flex items-center gap-4">
          <span class="text-gray-600 text-xs">Follow kami:</span>
          <a href="#" class="text-gray-500 hover:text-red-500 transition-colors text-sm">Instagram</a>
          <a href="#" class="text-gray-500 hover:text-red-500 transition-colors text-sm">WhatsApp</a>
        </div>
      </div>

    </div>
  </footer>
</template>
