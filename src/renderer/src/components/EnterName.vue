<template>
  <div class="flex flex-col justify-center items-center w-full text-white p-4">
    <h3 class="text-center p-4">Please enter your full name</h3>
    <div><input class="text-black" v-model="name" /></div>
    <div><button @click="create">Create User</button></div>
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
