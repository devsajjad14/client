'use server'
import { cookies } from 'next/headers'

export const setTaxonomyCookie = async (data: string) => {
  const cookieStore = await cookies()

  cookieStore.set('tx-data', data)
}
