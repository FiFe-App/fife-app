import { Stack } from 'expo-router'
import EmailVerification from '../pages/EmailVerification.jsx'

export default function Page() {
  return <><Stack.Screen options={{ headerShown: false, title:'Email visszaigazolás' }} />
  <EmailVerification/></>
}