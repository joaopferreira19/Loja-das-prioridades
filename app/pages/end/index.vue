<script setup lang="ts">
import type { Database } from '~/types/database.types'

const client = useSupabaseClient<Database>()
const router = useRouter()
const toast = useToast()

const name = ref('')
const loading = ref(false)

</script>

<template>
  <UContainer class="end">
    <div class="game_title">
        LOJA DAS <br/> PRIORIDADES
    </div>

    <div class="end_title">FIM!</div>

    <div class="end_text">Obrigado por jogares. <br/> Discute os resultados com os outros jogadores e vamos perceber o porquê dessas escolhas!</div>

    <div class="laydown_phone_text">
        Podes agora pousar o telemóvel.
    </div>

    <Footer />
  </UContainer>
</template>