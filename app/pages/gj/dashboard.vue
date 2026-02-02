<script setup lang="ts">
import type { Database } from '~/types/database.types'
const apexchart = defineAsyncComponent(() => 
  import('vue3-apexcharts')
)

const client = useSupabaseClient<Database>()

const players = ref<any[]>([])
const gameState = ref({ current_round: 0 })
const stats = ref<any[]>([])
const items = ref<any[]>([])
const loadingRound = ref(false)

const purchaseCounts = ref<Record<string, number>>({})

onMounted(async () => {
  const { data: gs } = await client.from('game_state').select('*').eq('id', 1).single()
  if (gs) gameState.value = gs

  const { data: p, error } = await client.from('players').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching players:', error);
  }
  players.value = p || []

  const { data: iData } = await client.from('items').select('*')
  if (iData) items.value = iData

  client.channel('admin_room')
    .on('postgres_changes', { 
      event: '*',
      schema: 'public', 
      table: 'players' 
    }, payload => {
      if (payload.eventType === 'INSERT') {
        players.value.unshift(payload.new)
      } else if (payload.eventType === 'UPDATE') {
        const index = players.value.findIndex(p => p.id === payload.new.id)
        if (index !== -1) players.value[index] = payload.new
      } else if (payload.eventType === 'DELETE') {
        players.value = players.value.filter(p => p.id !== payload.old.id)
      }
    })
    .on('postgres_changes', { 
      event: 'UPDATE', 
      schema: 'public', 
      table: 'game_state' 
    }, payload => {
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

  const counts: Record<string, number> = {}
  
  stats.value.forEach(s => {
    const itemName = s.items.name
    counts[itemName] = (counts[itemName] || 0) + 1
  })
  
  purchaseCounts.value = counts
}

const series = computed(() => [{
  name: 'Votos',
  data: Object.entries(purchaseCounts.value)
    .map(([name, count]) => ({
      x: name.toUpperCase(),
      y: count
    }))
    .sort((a, b) => b.y - a.y) 
}])

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    fontFamily: 'Coiny, cursive',
    toolbar: { show: false },
    animations: { enabled: true, easing: 'easeinout', speed: 800 }
  },
  plotOptions: {
    bar: {
      borderRadius: 10,
      horizontal: true,
      barHeight: '80%',
      isFunnel: true, 
    },
  },
  colors: ['#F28C28'],
  dataLabels: {
    enabled: true,
    formatter: (val, opt) => `${opt.w.globals.labels[opt.dataPointIndex]}: ${val}`,
    style: {
      fontSize: '3rem',
      colors: ['#5D4037']
    },
    dropShadow: { enabled: false }
  },
  xaxis: {
    categories: series.value[0].data.map(d => d.x),
    labels: { show: false },
    axisBorder: { show: false }
  },
  grid: { show: false }
}))

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
              v-for="p in players" :key="p.id + '-' + p.budget" 
              class="bg-white/50 border-2 border-loja-brown p-2 rounded-xl flex justify-between items-center transition-all"
            >
              <span class="text-loja-orange font-bold truncate">{{ p.name }}</span>
              <span class="font-black text-loja-orange">{{ p.budget }}€</span>
            </div>
          </div>
        </div>
      </div>

      <div class="right flex-1 bg-loja-input border-4 border-loja-brown rounded-[40px] p-8 shadow-[0_6px_0_0_#5D4037] flex flex-col overflow-hidden">
        <div class="title font-game text-3xl text-loja-brown mb-6 uppercase text-center">
          Impacto das Prioridades
        </div>

          <div class="flex flex-1 gap-6 min-h-0">
            <div class="w-1/4 border-r-4 border-loja-brown/10 pr-4 overflow-y-auto">
              <div class="space-y-2">
                <div v-for="(count, name, index) in purchaseCounts" :key="name" 
                    class="bg-white border-2 border-black p-2 rounded-xl flex justify-between items-center shadow-[0_4px_0_0_#000]">
                  <span class="font-game text-3xl text-loja-brown uppercase truncate mr-2">{{ name }}</span>
                  <span class="bg-loja-orange text-white px-2 py-0.5 rounded-lg font-black text-3xl">{{ count }}</span>
                </div>
              </div>
            </div>

            <div class="flex-1 rounded-[30px] p-4 border-2 border-loja-brown/10 relative bg-[#f9c694]">
              <client-only>
                <apexchart
                  width="100%"
                  height="100%"
                  :options="chartOptions"
                  :series="series"
                ></apexchart>
              </client-only>
            </div>
          </div>
        </div>
    </div>

    <Footer />
  </div>
</template>