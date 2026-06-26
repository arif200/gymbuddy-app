<script setup>
import Navbar from './components/navbar.vue'
import Footer from './components/footer.vue'
import TrainerSidebar from './components/TrainerSidebar.vue'
import DashboardSidebar from './components/DashboardSidebar.vue'
import AdminSidebar from './components/AdminSidebar.vue'
import { useRoute } from 'vue-router'
import { computed, onMounted } from 'vue'
import { useAuthStore } from './stores/authStore'

const route = useRoute()
const authStore = useAuthStore()

onMounted(() => {
  authStore.init()
})

const isDashboardArea = computed(() => {
  return route.path.startsWith('/dashboard') || route.path.startsWith('/trainer-panel') || route.path.startsWith('/admin')
})

const isTrainerPanel = computed(() => route.path.startsWith('/trainer-panel'))
const isMemberPanel = computed(() => route.path.startsWith('/dashboard'))
const isAdminPanel = computed(() => route.path.startsWith('/admin'))
</script>

<template>
  <Navbar v-if="!isDashboardArea" />

  <div :class="{ 'flex h-screen overflow-hidden bg-[#0a0b10]': isDashboardArea }">
    <AdminSidebar v-if="isAdminPanel" />
    <TrainerSidebar v-else-if="isTrainerPanel" />
    <DashboardSidebar v-else-if="isMemberPanel" />

    <div :class="{ 'flex-grow h-full overflow-y-auto w-full': isDashboardArea }">
      <router-view />
    </div>
  </div>

  <Footer v-if="!isDashboardArea" />
</template>
