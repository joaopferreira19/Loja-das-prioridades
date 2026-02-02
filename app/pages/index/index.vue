<script setup lang="ts">
import type { Database } from '~/types/database.types'

const client = useSupabaseClient<Database>()
const router = useRouter()
const toast = useToast()

const name = ref('')
const loading = ref(false)

const enterGame = async () => {
  if (!name.value.trim()) return

  loading.value = true
  
  try {
    // 1. Criar o jogador na Base de Dados
    const { data: player, error } = await client
      .from('players')
      .insert({ name: name.value })
      .select()
      .single()

    if (error) throw error

    // 2. Guardar o ID no telemóvel do aluno
    localStorage.setItem('player_id', player.id)

    // 3. Verificar estado do jogo para saber para onde redirecionar
    const { data: gameState } = await client
      .from('game_state')
      .select('current_round')
      .single()

    // Lógica de Redirecionamento
    if (gameState && gameState.current_round > 0) {
      router.push('/loja') // Jogo já começou -> Loja
    } else {
      router.push('/espera') // Jogo parado -> Sala de Espera
    }

  } catch (error) {
    toast.add({ title: 'Erro ao entrar', description: 'Tenta outro nome ou verifica a net.', color: 'red' })
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UContainer class="min-h-screen flex flex-col items-center justify-start my-6">
    <div class="game-title">
        LOJA DAS <br/> PRIORIDADES
    </div>
  </UContainer>
</template>

<style scoped>
@reference "tailwindcss";

.game-title {
    @apply text-3xl text-loja-brown font-bold mb-12 text-center;
}
</style>