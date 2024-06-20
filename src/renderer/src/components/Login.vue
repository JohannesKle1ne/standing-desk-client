<template>
  <div class="flex flex-col justify-center items-center w-full text-white p-4">
    <h1 class="text-[40px] mb-4">Login</h1>
    <div class="flex">
      <div class="mb-4 flex flex-col m-2">
        <span class="text-center m-2">Name</span>
        <span class="text-center m-2">Password</span>
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

    <div><button class="rounded-button" @click="create">Login</button></div>

    <div class="mt-4">
      No account yet? Sign Up
      <strong class="cursor-pointer" @click="emits('setRegisterFlag')">here</strong>
    </div>

    <div v-if="showInvalidCredentials" class="text-red-500 mt-4">
      Invalid credentials. Please try again.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { loginUser } from './api.js'
import { svgs } from './svg'

const name = ref(null)
const password = ref(null)
const showPassword = ref(false)
const showInvalidCredentials = ref(false)

const emits = defineEmits(['login', 'setRegisterFlag'])

const create = async () => {
  showInvalidCredentials.value = false // Reset the invalid credentials message
  console.log(name.value, password.value)
  const newUserInfo = await loginUser(name.value, password.value)
  if (newUserInfo) {
    await window.electronAPI.setUserInfo(newUserInfo)
    emits('login')
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
