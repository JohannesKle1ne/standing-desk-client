<template>
  <div class="flex justify-center items-center w-full">
    <h3>Please enter your full name</h3>
    <input v-model="name" />
    <button @click="create">Create User</button>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { createUser } from './api.js'

const name = ref(null)

const emits = defineEmits(['created'])

const create = async () => {
  const newUserInfo = await createUser(name.value)
  await window.electronAPI.setUserInfo(newUserInfo)
  emits('created')
}
</script>

<style></style>
