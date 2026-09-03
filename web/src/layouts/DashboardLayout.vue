<script setup>
import { ref } from 'vue'
import Sidebar from '../components/Sidebar.vue'
import Header from '../components/Header.vue'

const sidebarOpen = ref(false)
</script>

<template>
  <div class="min-h-screen flex bg-cream">
    <Sidebar :open="sidebarOpen" @close="sidebarOpen = false" />

    <div class="flex-1 min-w-0 flex flex-col">
      <Header @toggle-sidebar="sidebarOpen = true" />
      <main class="flex-1 px-4 py-5 lg:px-8 lg:py-7">
        <router-view />
      </main>
    </div>
  </div>
</template>
