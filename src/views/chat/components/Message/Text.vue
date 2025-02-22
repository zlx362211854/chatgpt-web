<script lang="ts" setup>
import { computed } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { encodeHTML } from '@/utils/format'

interface Props {
  inversion?: boolean
  error?: boolean
  text?: string
  url?: string
  loading?: boolean
}

const props = defineProps<Props>()

const { isMobile } = useBasicLayout()

const renderer = new marked.Renderer()

renderer.html = (html) => {
  return `<p>${encodeHTML(html)}</p>`
}

renderer.code = (code, language) => {
  const validLang = !!(language && hljs.getLanguage(language))
  if (validLang)
    return `<pre><code class="hljs ${language}">${hljs.highlight(language, code).value}</code></pre>`
  return `<pre style="background: none">${hljs.highlightAuto(code).value}</pre>`
}

marked.setOptions({
  renderer,
  highlight(code) {
    return hljs.highlightAuto(code).value
  },
})

const wrapClass = computed(() => {
  return [
    'text-wrap',
    'min-w-[20px]',
    'rounded-md',
    isMobile.value ? 'p-2' : 'p-3',
    props.inversion ? 'bg-[#d2f9d1]' : 'bg-[#f4f6f8]',
    props.inversion ? 'dark:bg-[#a1dc95]' : 'dark:bg-[#1e1e20]',
    { 'text-red-500': props.error },
  ]
})

const text = computed(() => {
  const value = props.text ?? ''
  if (!props.inversion)
    return marked(value)
  return value
})
// eslint-disable-next-line no-console
console.log(props.loading, 'loading')
</script>

<template>
  <div class="text-black" :class="wrapClass">
    <template v-if="loading">
      <span class="dark:text-white w-[4px] h-[20px] block animate-blink" />
    </template>
    <template v-else>
      <div class="leading-relaxed break-all">
        <div v-if="url">
          <img :src="url" alt="" srcset="">
        </div>
        <div v-else>
          <div v-if="!inversion" class="markdown-body" v-html="text" />
          <div v-else class="whitespace-pre-wrap" v-text="text" />
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="less">
@import url(./style.less);
</style>
