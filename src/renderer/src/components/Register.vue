<template>
  <div class="flex flex-col justify-center items-center w-full text-white p-4">
    <h1 class="text-[40px] mb-4">Registration</h1>
    <div class="flex">
      <div class="mb-4 flex flex-col m-2">
        <span class="text-center m-2">Enter a user name</span>
        <span class="text-center m-2">Choose a password</span>
      </div>
      <div class="mb-4 flex flex-col m-2">
        <input class="text-black w-[200px] m-2" v-model="name" />
        <div class="flex">
          <input
            :type="showPassword ? 'text' : 'password'"
            class="text-black w-[200px] m-2"
            v-model="password"
          />
          <span
            class="ml-2 text-[10px] w-5 h-5 m-2 text-white cursor-pointer"
            @click="togglePasswordVisibility"
            v-html="showPassword ? svgs.show : svgs.hide"
          ></span>
        </div>
      </div>
    </div>

    <div><button class="rounded-button" @click="create">Sign Up</button></div>

    <div class="mt-4">
      Already have an account? Login
      <strong class="cursor-pointer" @click="emits('unsetRegisterFlag')">here</strong>
    </div>

    <div v-if="showInvalidCredentials" class="text-red-500 mt-4">
      Invalid values or user name already exists
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { registerUser } from './api.js'
import { svgs } from './svg'

const name = ref(null)
const password = ref(null)
const showPassword = ref(false)
const showInvalidCredentials = ref(false)

const emits = defineEmits(['registered', 'unsetRegisterFlag'])

const create = async () => {
  showInvalidCredentials.value = false // Reset the invalid credentials message
  console.log(name.value, password.value)
  const newUserInfo = await registerUser(name.value, password.value)
  if (newUserInfo) {
    await window.electronAPI.setUserInfo(newUserInfo)
    emits('registered')
  } else {
    showInvalidCredentials.value = true
  }
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}
</script>

<style>
.text-red-500 {
  color: #f56565;
}
</style>
