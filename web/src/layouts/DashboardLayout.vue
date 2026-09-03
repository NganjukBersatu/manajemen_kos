<script setup>
import { ref } from 'vue'
import Sidebar from '../components/Sidebar.vue'
import Header from '../components/Header.vue'

const sidebarCollapsed = ref(false)

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<template>
  <div class="min-h-screen flex bg-cream">
    <Sidebar :collapsed="sidebarCollapsed" @toggle="toggleSidebar" />

    <div
      class="flex-1 min-w-0 flex flex-col transition-all duration-200"
      :class="sidebarCollapsed ? 'ml-20' : 'ml-64'"
    >
      <Header />
      <main class="flex-1 px-4 py-5 lg:px-8 lg:py-7">
        <router-view />
      </main>
    </div>
  </div>
</template>