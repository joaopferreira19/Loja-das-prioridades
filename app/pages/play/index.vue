<script setup lang="ts">
import type { Database } from '~/types/database.types'

import img_coin from '@/assets/img/cartoon_ui/Icon_Small_CoinEuro.png';
import background_icon from '@/assets/img/cartoon_ui/ButtonText_Orange_OnOffButton.png';
import lock_icon from '@/assets/img/cartoon_ui/Icon_Small_Lock.png';
import price_background from '@/assets/img/cartoon_ui/Banner_Orange.png';

const client = useSupabaseClient<Database>()
const router = useRouter();
const round = ref(1);

const player = ref({ id: '', name: '', budget: 500 })
const myPurchases = ref<string[]>([])

const items = ref<any[]>([])
const gameState = ref({ current_round: 0 })

onMounted(async () => {
  const playerId = localStorage.getItem('player_id')
  if (!playerId) return router.push('/')

  const { data: gameState } = await client
    .from('game_state')
    .select('current_round')
    .single()

  if (gameState) {
    round.value = gameState.current_round
    if(gameState.current_round === 0) router.push('/waiting')
    else if(gameState.current_round >= 4) router.push('/end')
    else if(gameState.current_round === 99) router.push('/end')
  }

  const { data: pData } = await client.from('players').select('*').eq('id', playerId).single()
  if (pData) player.value = pData

  const { data: iData } = await client.from('items').select('*')
  if (iData) items.value = iData

  client.channel('game_state_loja')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'game_state' }, payload => {
      console.log('Received update:', payload)
      gameState.value = payload.new
      round.value = payload.new.current_round
      if (payload.new.current_round === 0) router.push('/waiting')
      else if (payload.new.current_round >= 4) router.push('/end')
    })
    .subscribe((status, err) => {
      console.log('Subscription status:', status, err)
    })

  fetchPurchases(playerId)
})

async function fetchPurchases(id: string) {
  const { data } = await client.from('purchases').select('item_id').eq('player_id', id)
  if (data) myPurchases.value = data.map(p => p.item_id)
}

async function buyItem(item: any) {
  if (player.value.budget < item.price) return alert('Sem dinheiro!')
  if (myPurchases.value.includes(item.id)) return alert('Já tens este valor!')

  if (round.value === 1 && myPurchases.value.length >= 1) {
    return alert('Na Ronda 1 só podes escolher 1 valor!')
  }

  if (round.value === 2 && myPurchases.value.length >= 2) {
    return alert('Na Ronda 2 só podes escolher 2 valores!')
  }

  const { error } = await client.from('purchases').insert({
    player_id: player.value.id,
    item_id: item.id
  })

  if (!error) {
    const newBudget = player.value.budget - item.price
    await client.from('players').update({ budget: newBudget }).eq('id', player.value.id)
    
    player.value.budget = newBudget
    myPurchases.value.push(item.id)
  }
}
</script>

<template>
  <UContainer class="play">
    <div class="topbar"><p>RONDA {{ round }}</p></div>
    <div class="balance">
      <img :src="img_coin" class="coin_icon" />
      <div class="balance_text">
        {{ player.budget }} €
      </div>
    </div>
    <div class="warning" v-if="round === 1 && myPurchases.length >= 1">
      <div class="icon">
        <img :src="background_icon" class="background_icon" />
        <img :src="lock_icon" class="lock_icon" />
      </div>
      <div class="message">Nesta ronda, apenas podes escolher 1 valor!</div>
    </div>
    <div class="warning" v-if="round === 2 && myPurchases.length >= 2">
      <div class="icon">
        <img :src="background_icon" class="background_icon" />
        <img :src="lock_icon" class="lock_icon" />
      </div>
      <div class="message">Nesta ronda, apenas podes escolher 2 valores!</div>
    </div>
    <div class="shop">
      <div class="item" v-for="item in items" :key="item.id">
        <div class="icon">{{ item.icon }}</div>
        <div class="title">{{ item.name }}</div>
        <div v-if="myPurchases.includes(item.id)" class="bought">
          <span class="text">COMPRADO</span>
        </div>
        <div class="price">
          <img :src="price_background" class="price_background"/>
          <div class="text">{{ item.price }} €</div>
        </div>
        <button class="buy_button" @click="buyItem(item)" :disabled="myPurchases.includes(item.id)">COMPRAR</button>
      </div>
    </div>
    <Footer />
  </UContainer>
</template>