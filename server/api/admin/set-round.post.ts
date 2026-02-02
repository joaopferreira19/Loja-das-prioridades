import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, message: 'Não autorizado' })
  }

  const body = await readBody(event)

  const { data, error } = await client
    .from('game_state')
    .update({ current_round: body.round })
    .eq('id', 1)

  if (error) throw createError({ statusCode: 500, message: error.message })

  return { success: true, newRound: body.round }
})