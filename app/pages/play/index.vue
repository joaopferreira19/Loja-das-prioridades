<script setup lang="ts">
import type { Database } from '~/types/database.types'

import img_coin from '@/assets/img/cartoon_ui/Icon_Small_CoinEuro.png';
import background_icon from '@/assets/img/cartoon_ui/ButtonText_Orange_OnOffButton.png';
import lock_icon from '@/assets/img/cartoon_ui/Icon_Small_Lock.png';
import price_background from '@/assets/img/cartoon_ui/Banner_Orange.png';

const client = useSupabaseClient<Database>()
const round = ref(1);

onMounted(async () => {
  const { data: gameState } = await client
    .from('game_state')
    .select('current_round')
    .single()

  if (gameState) {
    round.value = gameState.current_round
  }
})

</script>

<template>
  <UContainer class="play">
    <div class="topbar"><p>RONDA {{ round }}</p></div>
    <div class="balance">
      <img :src="img_coin" class="coin_icon" />
      <div class="balance_text">
        500
      </div>
    </div>
    <div class="warning">
      <div class="icon">
        <img :src="background_icon" class="background_icon" />
        <img :src="lock_icon" class="lock_icon" />
      </div>
      <div class="message">Nesta ronda, apenas podes escolher 1 prioridade!</div>
    </div>
    <div class="shop">
      <div class="item">
        <div class="price">
          <img :src="price_background" class="price_background"/>
          <div class="text">500 €</div>
        </div>
        <div class="icon">💍</div>
        <div class="title">Casamento Feliz</div>
        <div class="buy_button">COMPRAR</div>
      </div>
      <div class="item">
        <div class="price">
          <img :src="price_background" class="price_background"/>
          <div class="text">500 €</div>
        </div>
        <div class="icon">💍</div>
        <div class="title">Casamento Feliz</div>
        <div class="buy_button">COMPRAR</div>
      </div>
      <div class="item">
        <div class="price">
          <img :src="price_background" class="price_background"/>
          <div class="text">500 €</div>
        </div>
        <div class="icon">💍</div>
        <div class="title">Casamento Feliz</div>
        <div class="buy_button">COMPRAR</div>
      </div>
    </div>
    <div class="footer">
      <div class="title">Jogo desenvolvido para o <br/> Grupo de Jovens de S. Miguel-O-Anjo</div>
      <div class="version">versão x.x.x</div>
    </div>
  </UContainer>
</template>