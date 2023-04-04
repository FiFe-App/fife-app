import { LinearGradient } from "expo-linear-gradient"

  const HomeBackground = ({style,children}) => 
  {
    return(
    <LinearGradient colors={["#2ac6fd",'#fdf1b9']} style={[style,{}]} start={{ x: 0.8, y: 0.0 }} end={{ x: 1, y: 0.4 }} >
        {children}
    </LinearGradient>)
  }

  export default HomeBackground;