<template>
        <!-- ================= HERO ================= -->
    <section class="relative h-[60vh] flex items-center justify-center text-center text-white">

      <div 
        class="absolute inset-0 bg-cover bg-center bg-[position:10%_28%]"
        style="background-image: url('/src/assets/trainer-bg.jpg')"></div>

      <div class="absolute inset-0 bg-black/70"></div>

      <div class="relative z-10">
        <h1 class="text-4xl md:text-5xl font-bold">
          Personal Trainer GymBuddy
        </h1>
        <p class="text-gray-400 mt-2">Fitness Trainer / Personal Trainer</p>
      </div>

    </section>

  <div class="bg-black text-white min-h-screen">

    <section class="py-20">
  <div class="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

    <!-- IMAGE -->
    <div>
      <img 
        src="/src/assets/trainer-conten.jpg"
        class="rounded-lg shadow-lg w-full object-cover h-[500px]"
      />
    </div>

    <!-- TEXT -->
    <div>

      <h2 class="text-3xl font-bold mb-6 leading-tight">
        Nge-gym lebih efektif bareng 
        <span class="text-red-500">Personal Trainer!</span>
      </h2>

      <p class="text-gray-400 mb-4 leading-relaxed">
        Setiap orang memiliki tujuan fitness yang berbeda, tapi tidak semua orang tahu
        cara yang tepat untuk mencapainya. Personal Trainer kami hadir untuk membantu
        mengarahkan setiap langkah latihanmu agar lebih terstruktur dan efektif.
      </p>

      <p class="text-gray-400 mb-4 leading-relaxed">
        Dengan pengalaman dan terpercaya, trainer kami mampu
        menyusun program latihan yang sesuai dengan kebutuhanmu, sekaligus memberikan
        motivasi agar kamu tetap konsisten.
      </p>

      <p class="text-gray-400 mb-4 leading-relaxed">
        Setiap perkembangan latihanmu akan dipantau secara berkala, sehingga kamu bisa
        memahami progres tubuhmu dan membangun kepercayaan diri di setiap sesi latihan.
      </p>

      <p class="text-gray-400 leading-relaxed">
        Bersama GymBuddy, kamu bisa mencapai hasil yang lebih maksimal dalam waktu
        yang lebih efisien.
      </p>

    </div>

  </div>
</section>

    <!-- ===== TITLE ===== -->
    <section class="pt-28 pb-16 text-center">
      <h1 class="text-4xl font-bold">
        Temukan <span class="text-red-500">Personal Trainer</span> terbaik untukmu
      </h1>
      <p class="text-gray-400 mt-2">
        Temukan trainer terbaik sesuai kebutuhanmu
      </p>
    </section>

    <!-- ===== GRID TRAINER ===== -->
    <section class="pb-20">
      <div class="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">

    <!-- CARD 1 -->
    <div class="bg-zinc-900 rounded-xl overflow-hidden 
                group hover:scale-105 transition duration-300 shadow-lg">

      <div class="overflow-hidden">
        <img 
          src="/src/assets/trainer-fadhel.jpeg"
          class="w-full h-64 object-cover group-hover:scale-110 transition duration-500 " style="object-position: 50% 20%;"
        />
      </div>

      <div class="p-5 text-center">
        <h3 class="text-lg font-semibold pb-2">Fadhel Setiawan</h3>
        <p class="text-red-500 text-sm mb-4">Hypertrophy Coach</p>
      </div>
    </div>

    <!-- CARD 2 -->
    <div class="bg-zinc-900 rounded-xl overflow-hidden 
                group hover:scale-105 transition duration-300 shadow-lg">

      <div class="overflow-hidden">
        <img 
          src="/src/assets/trainer-arif.jpeg"
          class="w-full h-64 object-cover group-hover:scale-110 transition duration-500 object-top"
        />
      </div>

      <div class="p-5 text-center">
        <h3 class="text-lg font-semibold pb-2">Arif Rachman</h3>
        <p class="text-red-500 text-sm mb-4">Lose Weight Coach</p>
      </div>
    </div>

    <!-- CARD 3 -->
    <div class="bg-zinc-900 rounded-xl overflow-hidden 
                group hover:scale-105 transition duration-300 shadow-lg">

      <div class="overflow-hidden">
        <img 
          src="/src/assets/trainer-gusti.jpeg"
          class="w-full h-64 object-cover group-hover:scale-110 transition duration-500"
        />
      </div>

      <div class="p-5 text-center">
        <h3 class="text-lg font-semibold pb-2">Gusti Caesar Yuliawan</h3>
        <p class="text-red-500 text-sm mb-4">Strength Coach</p>
      </div>
    </div>

  </div>
</section>

<!-- ===== JOIN NOW ===== -->
<section class="pt-20 pb-16 text-center ">
  <div class="max-w-6xl mx-auto px-6">

    <div class="relative rounded-2xl overflow-hidden h-[220px]">

      <!-- BACKGROUND -->
      <div 
        class="absolute inset-0 bg-cover bg-center transition duration-500 hover:scale-105"
        style="background-image: url('/src/assets/conten-traine-2.jpg')">
      </div>

      <!-- OVERLAY -->
      <div class="absolute inset-0 bg-black/70"></div>

      <!-- CONTENT -->
      <div class="relative z-10 flex flex-col items-center justify-center h-full text-center text-white">

        <p class="text-xs text-gray-300 mb-1 uppercase tracking-widest">
          Join Now
        </p>

        <h2 class="text-xl md:text-2xl font-bold mb-6">
          Mulai perjalanan fitness kamu sekarang
        </h2>

        <RouterLink
            to="/login"
            class="mt-6 inline-block
                  bg-red-500 px-6 py-3 rounded-full
                  font-semibold text-white
                  shadow-[0_0_25px_rgba(239,68,68,0.6)]
                  transition-all duration-300
                  hover:scale-110
                  hover:shadow-[0_0_40px_rgba(239,68,68,0.9)]"
          >
            Gabung Sekarang
          </RouterLink>

      </div>

    </div>

  </div>
</section>

  </div>
</template>