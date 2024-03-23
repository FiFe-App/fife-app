import { useSelector } from 'react-redux';
import About from '../pages/About';
import HomeScreen from '../pages/home/HomeScreen'
import { Stack } from 'expo-router';

const IndexPage = () => {
  const uid = useSelector((state) => state.user.uid)
  console.log('uid',uid);
  if (uid === undefined) return null;
  return <><Stack.Screen options={{ headerShown: !!uid }} />
    {uid ? <HomeScreen/> : <About/>}</>
} 

export default IndexPage;