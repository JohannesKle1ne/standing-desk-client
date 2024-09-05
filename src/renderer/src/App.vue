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
  /*  { userName: 'jo', id: '86e945c0-e395-4cf6-a8ec-892e904e6940' },
,
  { userName: 'Teodora Mitrevska', id: '99aca265-fa71-4fa5-9f96-9e93084dd5ea' },
  { userName: 'Frank', id: 'e085e834-5970-4c44-a34b-84ccc73f354b' }, */
  { userName: 'Luke Haliburton', id: 'b7244bbe-1d28-4417-91a2-522964a6554f' },
  { userName: 'Yannick (Yannick)', id: '0cc3946b-6f53-4feb-9048-1b3a1dd6db59' },
  { userName: 'Francesco (Francesco)', id: 'bb678323-1be4-40ea-b95b-748e54649c34' },
  { userName: 'xuedong (Xuedong)', id: '6dd5af42-29b0-48f3-bbb1-3bfcfee1ae10' },
  { userName: 'anbeju (Julian Rasch)', id: '7a339782-c376-4bf2-ae48-a66516105a58' },
  { userName: 'Benton (Clara)', id: '6a9de85f-cb9e-435d-a7ef-6c7e945a98b2' },
  { userName: 'xteeven (Steeven)', id: '061be718-a91f-4414-9812-b71a3f56c55c' },
  { userName: 'maxi (Maxi)', id: 'e3b0061e-7b96-4d15-9814-d8837a508798' },
  { userName: 'ramin (Rifat Mehreen Amin)', id: 'b3bc2277-4084-4181-9376-47d6787d8cc6' },
  { userName: 'JL29 (Jan)', id: '645e523e-08a7-4f61-9431-2a7c8e563f32' },
  { userName: 'weingahe (Henrike)', id: '6038192e-9065-4425-ac18-14718595dc6e' },
  { userName: 'catherinekago (Kathrin)', id: 'bb5effa7-3ebe-431a-9605-22327f558550' },
  { userName: 'bettina (Bettina)', id: 'e6bbd01c-ead1-42d7-aa45-f9597712caf1' },
  { userName: 'Sophia (Sophia)', id: '76c7678b-aeed-425d-936d-792e2623faa1' }
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
