<script setup lang="ts">
import type { Database } from '~/types/database.types'
import img_pointer from '@/assets/img/cartoon_ui/ScrollBar_Orange_Pointer.png';

const client = useSupabaseClient<Database>()
const router = useRouter()
const player_name = ref('')

onMounted(() => {
  player_name.value = localStorage.getItem('player_name') || 'Jogador'
})

</script>

<template>
  <UContainer class="waiting">
    <div class="game-title">
        LOJA DAS <br/> PRIORIDADES
    </div>

    <div class="welcome-text">
        <p class="player-name">Bem-vindo, {{ player_name }}!</p>
        <div class="waiting-for-players">Estamos à espera do resto dos jogadores, entende como funciona o jogo...</div>
        <img :src="img_pointer" alt="Botão de indicação" class="illustration" />
    </div>

    <div class="instructions">
      <div class="title">
        Como funciona?
      </div>
      <div class="description">
        Cada jogador começa com 500€. Tens uma variedade de prioridades das quais podes escolher e gastar esse dinheiro. O que vais fazer com eles?
      </div>
    </div>

    <div class="footer">
      <div class="title">Jogo desenvolvido para o <br/> Grupo de Jovens de S. Miguel-O-Anjo</div>
      <div class="version">versão x.x.x</div>
    </div>
  </UContainer>
</template>