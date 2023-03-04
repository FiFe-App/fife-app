import { store } from "../lib/store"

export const config = () => {
    const data = store.getState()
    return ({
      baseURL: 'http://localhost:5050',
      headers: {
        'authtoken': data.user.userData.authtoken
      }
    })
}