import db from '@db'

interface UserData {
  log?: unknown[]
  favorite?: unknown[]
  searchHistory?: unknown[]
  [key: string]: unknown[]
}

let userData: UserData | null = null

export async function loadUserData(): Promise<UserData> {
  if (userData) return userData

  userData = await new Promise<UserData>(resolve => {
    db.browser.getAll('userData/', items =>
      resolve(items as unknown as UserData),
    )
  })

  return userData
}

export function getUserData(): UserData | null {
  return userData
}
