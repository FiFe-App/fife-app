import { LinearGradient } from "expo-linear-gradient"

  export default ({style,children}) => 
  {
    return(
    <LinearGradient colors={['#8cfd7555', "#2ac6fd55"]} style={[style,{}]} start={{ x: 1, y: 0.5 }} end={{ x: 1, y: 1 }} >
        {children}
    </LinearGradient>)
  }
