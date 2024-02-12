import { Stack } from 'expo-router';
import First from '../pages/first/First';

export default function Page() {
  return <><Stack.Screen options={{ headerShown: false, title:'Admin felület' }} />
  <First/></>
}