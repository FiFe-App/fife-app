import { Stack } from 'expo-router';
import First from '../pages/first/First';
import BasePage from '../components/BasePage';

export default function Page() {
  return <><Stack.Screen options={{ headerShown: true, title:'Admin felület' }} />
  <BasePage full style={{paddingHorizontal:0}}><First/></BasePage></>
}