import { Stack } from 'expo-router';
import LoginScreen from '../pages/login/Login';

export default function Page() {
  return <><Stack.Screen options={{ headerShown: false, title:'Bejelentkezés' }} />
    <LoginScreen/></>
}