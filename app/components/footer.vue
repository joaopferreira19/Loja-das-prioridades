<script setup lang="ts">

import { ref, onMounted } from 'vue'
const version = ref('x.x.x')

onMounted(async () => {
  try {
    const response = await fetch('https://api.github.com/repos/joaopferreira19/loja-das-prioridades/commits')
    const data = await response.json()
    if (data) {
      version.value = data[0].sha.substring(0, 7)
    }
  } catch (error) {
    console.error('Error fetching version:', error)
  }
})

</script>

<template>
    <div class="footer">
      <div class="title">Jogo desenvolvido para o <br/> Grupo de Jovens de S. Miguel-O-Anjo</div>
      <div class="version">versão <a href="https://github.com/joaopferreira19/loja-das-prioridades" rel="nofollow noreferrer noopener" target="_blank">{{ version }}</a></div>
    </div>
</template>