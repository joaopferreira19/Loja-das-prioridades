<script setup lang="ts">
import type { Database } from '~/types/database.types'
import img_pointer from '@/assets/img/cartoon_ui/ScrollBar_Orange_Pointer.png';

const client = useSupabaseClient<Database>()
const router = useRouter()
const player_name = ref('')

onMounted(async () => {
  player_name.value = localStorage.getItem('player_name') || 'Jogador'

  const { data: initialStatus } = await client
    .from('game_state')
    .select('current_round')
    .single()

  const { data: playerData } = await client
    .from('players')
    .select('id')
    .eq('name', player_name.value)
    .single()

  if (!playerData) {
    return router.push('/')
  }

  if (initialStatus && initialStatus.current_round > 0) {
    router.push('/play')
  } else if (initialStatus && initialStatus.current_round >= 4) {
    router.push('/end') 
  }

  const channel = client.channel('public:game_state')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'game_state'
      },
      (payload) => {
        if (payload.new.current_round > 0) {
          router.push('/play')
        } else if (payload.new.current_round >= 4) {
          router.push('/end')
        }
      }
    )
    .subscribe()

  onUnmounted(() => {
    client.removeChannel(channel)
  })
})

</script>

<template>
  <UContainer class="waiting">
    <div class="game_title">
        LOJA DAS <br/> PRIORIDADES
    </div>

    <div class="welcome-text">
        <p class="player-name">Bem-vindo, {{ player_name }}!</p>
        <div class="waiting-for-players">Estamos à espera do resto dos jogadores, entende como funciona o jogo...</div>
        <img :src="img_pointer" alt="Botão de indicação" class="illustration animate-bounce" />
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