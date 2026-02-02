<script setup lang="ts">
import type { Database } from '~/types/database.types'

const client = useSupabaseClient<Database>()
const router = useRouter()
const toast = useToast()

const name = ref('')
const loading = ref(false)

onMounted(() => {
  const player_id = localStorage.getItem('player_id')
  if (player_id) {
    client
      .from('players')
      .select('name')
      .eq('id', player_id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          client
            .from('game_state')
            .select('current_round')
            .single()
            .then(({ data: gameState }) => {
              if (gameState && gameState.current_round > 0) {
                router.push('/play')
              } else {
                router.push('/waiting')
              }
            })
        }
      })
  }
})

const enterGame = async () => {
  if (!name.value.trim()) return
  loading.value = true
  
  try {
    const { data: player, error } = await client
      .from('players')
      .insert({ name: name.value })
      .select()
      .single()

    if (error) throw error

    localStorage.setItem('player_id', player.id)
    localStorage.setItem('player_name', player.name)

    const { data: gameState } = await client
      .from('game_state')
      .select('current_round')
      .single()

    if (gameState && gameState.current_round > 0) {
      router.push('/play')
    } else if (gameState && gameState.current_round >= 4) {
      router.push('/end')
    } else {
      router.push('/waiting')
    }

  } catch (error) {
    toast.add({ title: 'Erro ao entrar', description: 'Tenta outro nome ou verifica a tua internet.', color: 'red' })
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UContainer class="landing">
    <div class="game_title">
        LOJA DAS <br/> PRIORIDADES
    </div>

    <div class="name-input">
      <p>Como te chamas?</p>
      <input v-model="name" placeholder="" :disabled="loading" class="input" />
      <button @click="enterGame" :disabled="loading || !name.trim()" class="button">
        <span v-if="loading">A entrar...</span>
        <span v-else>Entrar</span>
      </button>
    </div>

    <div class="instructions">
      <div class="title">
        Como funciona?
      </div>
      <div class="description">
        Cada jogador começa com 500€. Tens uma variedade de prioridades das quais podes escolher e gastar esse dinheiro. O que vais fazer com eles?
      </div>
    </div>

    <Footer />
  </UContainer>
</template>