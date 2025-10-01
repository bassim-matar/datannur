import db from '@db'

interface UserData {
  log?: unknown[]
  favorite?: unknown[]
  search_history?: unknown[]
  [key: string]: unknown[]
}

let userData: UserData | null = null

export async function loadUserData(): Promise<UserData> {
  if (userData) return userData

  userData = await new Promise<UserData>(resolve => {
    db.browser.getAll('user_data/', items =>
      resolve(items as unknown as UserData),
    )
  })

  return userData
}

export function getUserData(): UserData | null {
  return userData
}
