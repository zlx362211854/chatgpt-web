<script setup lang='ts'>
import type { CSSProperties } from 'vue'
import { computed, watch } from 'vue'
import { NButton, NLayoutSider, NPopselect } from 'naive-ui'
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface'
import List from './List.vue'
import Footer from './Footer.vue'
import { useAppStore, useChatStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'

const appStore = useAppStore()
const chatStore = useChatStore()

const { isMobile } = useBasicLayout()

const typeOptions: SelectMixedOption[] = [{
  label: 'Chat',
  value: 'Chat',
},
{
  label: 'Draw',
  value: 'Draw',
}]

const collapsed = computed(() => appStore.siderCollapsed)

function handleAdd(type: string) {
  chatStore.addHistory({ title: `New ${type}`, uuid: Date.now(), isEdit: false, isDraw: type?.toLowerCase() === 'draw' })
}

function handleUpdateCollapsed() {
  appStore.setSiderCollapsed(!collapsed.value)
}

const getMobileClass = computed<CSSProperties>(() => {
  if (isMobile.value) {
    return {
      position: 'fixed',
      zIndex: 50,
    }
  }
  return {}
})

watch(
  isMobile,
  (val) => {
    appStore.setSiderCollapsed(val)
  },
  {
    immediate: true,
    flush: 'post',
  },
)
</script>

<template>
  <NLayoutSider
    :collapsed="collapsed"
    :collapsed-width="0"
    :width="260"
    :show-trigger="isMobile ? false : 'arrow-circle'"
    collapse-mode="transform"
    position="absolute"
    bordered
    :style="getMobileClass"
    @update-collapsed="handleUpdateCollapsed"
  >
    <div class="flex flex-col h-full">
      <main class="flex flex-col flex-1 min-h-0">
        <div class="p-4">
          <NPopselect
            :options="typeOptions"
            trigger="click"
            @change="(type) => handleAdd(type)"
          >
            <NButton dashed block>
              New
            </NButton>
          </NPopselect>
        </div>
        <div class="flex-1 min-h-0 pb-4 overflow-hidden">
          <List />
        </div>
      </main>
      <Footer />
    </div>
  </NLayoutSider>
  <template v-if="isMobile">
    <div v-show="!collapsed" class="fixed inset-0 z-40 bg-black/40" @click="handleUpdateCollapsed" />
  </template>
</template>
