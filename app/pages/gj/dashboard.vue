<script setup lang="ts">
import type { Database } from '~/types/database.types'

const client = useSupabaseClient<Database>()

const players = ref<any[]>([])
const gameState = ref({ current_round: 0 })
const stats = ref<any[]>([])
const items = ref<any[]>([])
const loadingRound = ref(false)

onMounted(async () => {
  const { data: gs } = await client.from('game_state').select('*').eq('id', 1).single()
  if (gs) gameState.value = gs

  const { data: p } = await client.from('players').select('*').order('created_at', { ascending: false })
  players.value = p || []

  const { data: iData } = await client.from('items').select('*')
  if (iData) items.value = iData

  client.channel('admin_room')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'players' }, payload => {
      players.value.unshift(payload.new)
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'game_state' }, payload => {
      gameState.value = payload.new
    })
    .subscribe()
    
  await fetchStats()
  
  client.channel('purchases_updates')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'purchases' }, () => {
      fetchStats() 
    }).subscribe()
})

const fetchStats = async () => {
  const { data } = await client.from('purchases').select('item_id, items(name)')
  if (data) stats.value = data

  console.log('Fetched stats:', stats.value)
}

const updateRound = async (round: number) => {
  loadingRound.value = true
  try {
    await $fetch('/api/admin/set-round', {
      method: 'POST',
      body: { round }
    })
    gameState.value.current_round = round
  } finally {
    loadingRound.value = false
  }
}
</script>

<template>
  <div class="gj-dashboard bg-loja-bg min-h-screen font-sans p-8">
    <div class="main-layout flex gap-6 h-[80vh]">
      
      <div class="left flex flex-col gap-6 w-1/4">
        
        <div class="card flex-1 bg-loja-input border-4 border-loja-brown rounded-[40px] p-6 shadow-[0_6px_0_0_#5D4037]">
          <div class="title font-game text-loja-brown text-xl mb-4 uppercase">Controlo de rondas</div>
          <div class="grid grid-cols-1 gap-3">
            <button 
              v-for="r in [0, 1, 2, 3]" 
              :key="r"
              @click="updateRound(r)"
              :disabled="loadingRound"
              class="p-3 rounded-2xl border-4 border-loja-brown font-black transition-all disabled:opacity-60"
              :class="gameState.current_round === r ? 'bg-loja-orange text-white' : 'bg-loja-bg text-loja-brown'"
            >
              <span v-if="loadingRound" class="inline-block animate-spin mr-2">⏳</span>
              {{ r === 0 ? 'ESPERA' : 'RONDA ' + r }}
            </button>
            <button @click="updateRound(99)" :disabled="loadingRound" class="p-3 bg-red-500 text-white rounded-2xl border-4 border-black font-black uppercase disabled:opacity-60">
              TERMINAR
            </button>
          </div>
        </div>

        <div class="card flex-[1.5] bg-loja-input border-4 border-loja-brown rounded-[40px] p-6 shadow-[0_6px_0_0_#5D4037] overflow-hidden flex flex-col">
          <div class="title font-game text-loja-brown text-xl mb-4 uppercase flex justify-between">
            Jogadores 
            <span class="text-sm bg-loja-brown text-white flex items-center justify-center px-3 rounded-full">{{ players.length }}</span>
          </div>
          <div class="player-list overflow-y-auto space-y-2 pr-2">
            <div 
              v-for="p in players" :key="p.id" 
              class="bg-white/50 border-2 border-loja-brown p-2 rounded-xl flex justify-between items-center"
            >
              <span class="font-bold truncate">{{ p.name }}</span>
              <span class="text-xs font-black">{{ p.budget }}€</span>
            </div>
          </div>
        </div>
      </div>

      <div class="right flex-1 bg-loja-input border-4 border-loja-brown rounded-[40px] p-8 shadow-[0_6px_0_0_#5D4037] flex flex-col overflow-hidden">
        <div class="title font-game text-3xl text-loja-brown mb-6 uppercase text-center">
          Impacto das Prioridades
        </div>
      </div>
</div>

    <Footer />
  </div>
</template>