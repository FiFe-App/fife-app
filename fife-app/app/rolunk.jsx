import { Stack } from 'expo-router';
import About from '../pages/About';

export default function Page() {
  return <><Stack.Screen options={{ headerShown: false, title:'Admin felület' }} />
  <About/></>
}