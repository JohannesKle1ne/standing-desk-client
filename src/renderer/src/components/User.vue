<template>
  <div class="flex flex-col justify-center items-start w-full text-[#2f3241] p-4">
    <div class="mb-4 w-full h-[90vh] overflow-auto custom-scrollbar">
      <div class="">User id</div>
      <div class="text-2xl">{{ userId }}</div>
      <div class="mt-4">User name</div>
      <div class="text-2xl">{{ userName }}</div>
      <div class="mt-4">App Version</div>
      <div class="text-2xl">1.0.0</div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  userId: String,
  userName: String
})
</script>

<style></style>
