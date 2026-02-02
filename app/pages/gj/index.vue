<script setup lang="ts">
const supabase = useSupabaseClient()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true

  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })

  if (error) {
    alert('Erro: ' + error.message)
  } else {
    router.push('/gj/dashboard')
  }
  loading.value = false
}
</script>

<template>
  <UContainer class="gj">
    <h1 class="font-game text-loja-brown text-3xl mb-8 uppercase text-center">Acesso Administrador</h1>
    
    <UCard class="w-full max-w-sm border-4 border-loja-brown bg-loja-input rounded-3xl shadow-[0_6px_0_0_#5D4037]">
      <div class="space-y-4 name-input">
        <input type="email" v-model="email" placeholder="email@email.com" :disabled="loading" class="input" />
        <input type="password" v-model="password" placeholder="*******" :disabled="loading" @keyup.enter="handleLogin" class="input" />

        <button @click="handleLogin" :disabled="loading || !password.trim()" class="button">
            <span v-if="loading">A entrar...</span>
            <span v-else>Entrar</span>
        </button>
        
        <p v-if="error" class="error">Password incorreta!</p>
      </div>
    </UCard>

    <Footer />
  </UContainer>
</template>