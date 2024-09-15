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
  /*   { userName: 'jo', id: '86e945c0-e395-4cf6-a8ec-892e904e6940' },
  { userName: 'Luke Haliburton', id: 'b7244bbe-1d28-4417-91a2-522964a6554f' },
  { userName: 'Yannick (Yannick)', id: '0cc3946b-6f53-4feb-9048-1b3a1dd6db59' }, */
  { userName: 'Francesco (Francesco)', id: 'bb678323-1be4-40ea-b95b-748e54649c34' },
  { userName: 'xuedong (Xuedong)', id: '6dd5af42-29b0-48f3-bbb1-3bfcfee1ae10' },
  { userName: 'anbeju (Julian Rasch) L', id: '7a339782-c376-4bf2-ae48-a66516105a58' },
  { userName: 'Benton (Clara)', id: '6a9de85f-cb9e-435d-a7ef-6c7e945a98b2' },
  { userName: 'xteeven (Steeven)', id: '061be718-a91f-4414-9812-b71a3f56c55c' },
  { userName: 'maxi (Maxi) R', id: 'e3b0061e-7b96-4d15-9814-d8837a508798' },
  { userName: 'ramin (Rifat Mehreen Amin) R', id: 'b3bc2277-4084-4181-9376-47d6787d8cc6' },
  { userName: 'JL29 (Jan) L', id: '645e523e-08a7-4f61-9431-2a7c8e563f32' },
  { userName: 'weingahe (Henrike) R', id: '6038192e-9065-4425-ac18-14718595dc6e' },
  { userName: 'catherinekago (Kathrin)', id: 'bb5effa7-3ebe-431a-9605-22327f558550' },
  { userName: 'bettina (Bettina)', id: 'e6bbd01c-ead1-42d7-aa45-f9597712caf1' },
  { userName: 'Sophia (Sophia) R', id: '76c7678b-aeed-425d-936d-792e2623faa1' },
  { userName: 'jesse (Jesse) L', id: '521441ef-1c6d-4691-ab1b-b5cfcbddf4ca' },
  { userName: 'user1', id: 'c2aecd3d-8d91-432e-9a54-052d1afe9ef9' },
  { userName: 'user2', id: '54040d83-d68f-485a-8fd3-21a39083a3e1' },
  { userName: 'user3', id: '7b66c714-e8fc-4c80-96d3-c87be189b97d' },
  { userName: 'user4', id: 'fef3d18d-f745-42e8-aac8-05148fc0c23f' },
  { userName: 'user5', id: '24377e66-32a1-4d7c-a6eb-bd85c4812e8d' },
  { userName: 'user6', id: '4f2ac9f6-bd50-43c6-a524-c3a56d5045c5' }
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
