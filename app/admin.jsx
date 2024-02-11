import { Stack } from 'expo-router';
import Admin from '../pages/admin/Admin';

export default function Page() {
  return <><Stack.Screen options={{ headerShown: false, title:'Admin felület' }} />
  <Admin/></>
}