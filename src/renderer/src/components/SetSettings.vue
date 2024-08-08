<template>
  <div class="flex flex-col justify-center items-start w-full text-[#2f3241] p-4">
    <div v-if="props.settings" class="mb-4 w-full h-[90vh] overflow-auto custom-scrollbar">
      <span class="" v-for="o in settingsList">
        <div class="text-2xl mt-3 mb-1">{{ o.heading }}</div>
        <div class="flex items-center h-8" v-for="s in o.settings">
          <span class="w-[400px]" v-html="s.description"></span>
          <div
            v-if="s.type === 'toggle'"
            @click="emits('save', { [s.key]: !props.settings[s.key] })"
            class="w-10 text-[#2f3241] cursor-pointer"
            :style="{ opacity: props.settings[s.key] ? 1 : 0.5 }"
            v-html="props.settings[s.key] ? svgs.toggleOn : svgs.toggleOff"
          ></div>
          <input
            v-if="s.type === 'number'"
            class="text-[#2f3241] w-[50px] border-2 focus:outline-none focus:border-[#2f3241]"
            :value="props.settings[s.key]"
            @input="handleNumberInput($event, s.key)"
          />
          <span v-if="s.type === 'number'" class="ml-2">{{ s.timeUnit }}</span>
          <!--  <span v-if="s.key === 'downAfterMinutes' && props.settings[s.key]">
            <input
              class="text-[#2f3241] w-[50px] ml-2 border-2 focus:outline-none focus:border-[#2f3241]"
              :value="props.settings.standingMinutesUntilDown"
              @input="handleNumberInput($event, s.key)"
            />
            <span class="ml-2">min</span>
          </span> -->
          <span v-if="s.key === 'moveEvents'" class="text-[#2f3241]">
            <!--   <select v-model="selectedTime">
              <option v-for="time in timeOptions" :key="time" :value="time">{{ time }}</option>
            </select> -->
            <input
              class="text-[#2f3241] w-[30px] border-2 focus:outline-none focus:border-[#2f3241]"
              v-model="hour"
            />
            :
            <input
              class="text-[#2f3241] w-[30px] border-2 focus:outline-none focus:border-[#2f3241]"
              v-model="minutes"
            />
            <select
              v-model="selectedDirection"
              class="ml-2 border-2 focus:outline-none focus:border-[#2f3241]"
            >
              <option v-for="direction in directionOptions" :key="direction" :value="direction">
                {{ direction }}
              </option>
            </select>
            <button class="border border-[#2f3241] p-1 rounded ml-2" @click="add">Add</button>
          </span>
        </div>
      </span>

      <div class="w-full mt-2">
        <button
          v-for="(m, index) in props.settings.moveEvents"
          class="border border-[#2f3241] rounded p-1 w-32 relative m-1"
          style="cursor: default"
        >
          {{ `${m.time} ${m.direction}` }}
          <div
            @click="remove(index)"
            class="w-4 cursor-pointer absolute right-1 top-1"
            v-html="svgs.removeTab"
          ></div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { svgs } from './svg'
import { ref, onMounted, computed } from 'vue'

const props = defineProps({
  settings: Object
})
const emits = defineEmits(['save'])

const hour = ref()
const minutes = ref()

const settingsList = ref([
  {
    heading: 'General',
    settings: [
      {
        description: 'Disable automatic desk movement',
        key: 'disable',
        type: 'toggle'
      },
      {
        description: 'Key down',
        key: 'presetDown',
        type: 'number'
      },
      {
        description: 'Key up',
        key: 'presetUp',
        type: 'number'
      },
      {
        description: 'Daily standing goal',
        key: 'dailyGoal',
        type: 'number',
        timeUnit: 'min'
      },
      {
        description: 'Absence until desk move',
        key: 'durationAbsence',
        type: 'number',
        timeUnit: 'min'
      }
    ]
  },
  {
    heading: 'Moving up',
    settings: [
      {
        description: 'Move desk up in absence',
        key: 'upInAbsence',
        type: 'toggle'
      },
      {
        description: 'Time sitting before up',
        key: 'sittingBeforeUp',
        type: 'number',
        timeUnit: 'min'
      }
    ]
  },
  {
    heading: 'Moving down',
    settings: [
      {
        description: 'Move desk down in absence',
        key: 'downInAbsence',
        type: 'toggle'
      },
      {
        description: 'Time standing before down',
        key: 'standingBeforeDown',
        type: 'number',
        timeUnit: 'min'
      },
      {
        description: 'Keep desk down when goal is reached',
        key: 'keepDownWhenGoalReached',
        type: 'toggle'
      }
    ]
  },
  {
    heading: 'Custom',
    settings: [
      {
        description: 'Define custom move events:',
        key: 'moveEvents'
      }
    ]
  }
])

const selectedDirection = ref()
const directionOptions = ref(['up', 'down'])

const handleNumberInput = (event, key) => {
  const value = event?.target?.value
  if (value === '' || value == null) {
    emits('save', { [key]: null })
    return
  }
  const number = Number(value)
  if (!isNaN(number)) {
    emits('save', { [key]: number })
  }
}
const add = () => {
  if (hour.value == null || minutes.value == null) return

  // Convert the hour and minutes values to numbers
  let hourNumber = Number(hour.value)
  let minutesNumber = Number(minutes.value)

  // Check if the hour and minutes are within the valid range
  if (
    isNaN(hourNumber) ||
    hourNumber < 0 ||
    hourNumber > 23 ||
    isNaN(minutesNumber) ||
    minutesNumber < 0 ||
    minutesNumber > 59
  ) {
    return
  }

  if (selectedDirection.value == null) return

  // Add leading zeros if necessary
  let formattedHour = hourNumber < 10 ? `0${hourNumber}` : hourNumber
  let formattedMinutes = minutesNumber < 10 ? `0${minutesNumber}` : minutesNumber

  const time = `${formattedHour}:${formattedMinutes}`

  const milliseconds = timeToMilliseconds(time)

  const newMoveEvents = [
    ...(props.settings.moveEvents || []),
    {
      time,
      timeInMilliseconds: milliseconds,
      direction: selectedDirection.value
    }
  ]
  emits('save', { moveEvents: newMoveEvents })
}

const remove = (index) => {
  // Create a copy of the moveEvents array
  const newMoveEvents = [...props.settings.moveEvents]

  // Remove the element at the specified index
  newMoveEvents.splice(index, 1)

  // Emit the updated moveEvents array
  emits('save', { moveEvents: newMoveEvents })
}

const timeToMilliseconds = (time) => {
  console.log(time)
  // Split the input time into hours and minutes
  const [hours, minutes] = time.split(':').map(Number)

  // Calculate the milliseconds from hours and minutes
  const milliseconds = hours * 60 * 60 * 1000 + minutes * 60 * 1000

  return milliseconds
}
</script>

<style></style>
