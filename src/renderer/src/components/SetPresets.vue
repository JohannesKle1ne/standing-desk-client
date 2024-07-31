<template>
  <div class="flex flex-col justify-center items-center w-full text-white p-4">
    <h1 class="text-[40px] mb-4">Set presets</h1>
    <div class="flex">
      <div class="mb-4 flex flex-col m-2">
        <span class="text-center m-2">Number for moving down:</span>
        <span class="text-center m-2">Number for moving up:</span>
      </div>
      <div class="mb-4 flex flex-col m-2">
        <input class="text-black w-[50px] m-2" maxlength="1" v-model="down" />
        <div class="flex">
          <input class="text-black w-[50px] m-2" maxlength="1" v-model="up" />
        </div>
      </div>
    </div>

    <div><button class="rounded-button" @click="save">Save</button></div>
    <div class="mt-4 text-[12px]">You can change this later in the settings</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const down = ref(null)
const up = ref(null)

const emits = defineEmits(['setSettings'])

const save = async () => {
  const newDown = Number(down.value)
  const newUp = Number(up.value)
  if (isNaN(newDown) || isNaN(newUp) || newDown === 0 || newUp === 0) return
  emits('savePresets', { presetDown: newDown, presetUp: newUp })
}
</script>

<style>
.text-red-500 {
  color: #f56565;
}
</style>
