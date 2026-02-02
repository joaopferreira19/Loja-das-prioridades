import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, message: 'Não autorizado' })
  }

  const body = await readBody<{ round: number }>(event)

  if (body.round === 0) {
    const { error: purchasesError } = await client.from('purchases').delete().neq('item_id', "c333333f-89c5-4554-a664-c70342ee63c6");
    if (purchasesError) {
      console.error('Error deleting purchases:', purchasesError);
      throw createError({ statusCode: 500, message: purchasesError.message });
    }
    
    const { error: playersError } = await client.from('players').delete().neq('id', "c333333f-89c5-4554-a664-c70342ee63c5");
    if (playersError) {
      console.error('Error deleting players:', playersError);
      throw createError({ statusCode: 500, message: playersError.message });
    }
  }

  const { data, error } = await client
    .from('game_state')
    .update({ current_round: body.round })
    .eq('id', 1)

  if (error) throw createError({ statusCode: 500, message: error.message })

  return { success: true, newRound: body.round }
})