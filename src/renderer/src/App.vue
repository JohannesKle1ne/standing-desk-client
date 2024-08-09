<template>
  <Base
    @setUser="setUser"
    @currentPage="setCurrentPage"
    :key="key"
    :user="user"
    :users="users"
    :currentPage="currentPage"
  />
</template>

<script setup>
import Base from './components/Base.vue'
import { ref, onMounted, computed } from 'vue'
const users = ref([
  { userName: 'jo', id: '86e945c0-e395-4cf6-a8ec-892e904e6940' },
  { userName: 'Luke Haliburton', id: 'b7244bbe-1d28-4417-91a2-522964a6554f' },
  { userName: 'Teodora Mitrevska', id: '99aca265-fa71-4fa5-9f96-9e93084dd5ea' }
])

const key = ref(1)
const currentUserId = ref(users.value[0].id)
const user = computed(() => users.value.find((u) => u.id === currentUserId.value))

const setUser = (newUserId) => {
  currentUserId.value = newUserId
  key.value = key.value + 1
}

const currentPage = ref(1)
const setCurrentPage = (newPage) => {
  currentPage.value = newPage
}
</script>

<style lang="less">
@import './assets/css/styles.less';
</style>
