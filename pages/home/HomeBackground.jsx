import { LinearGradient } from "expo-linear-gradient"

  const HomeBackground = ({style,children}) => 
  {
    return(
    <LinearGradient colors={["#FDEEA2",'#c4df98']} style={[style,{zIndex:10}]} start={{ x: 0, y: 0.099 }} end={{ x: 0, y: 1 }} >
        {children}
    </LinearGradient>)
  }

  export default HomeBackground;