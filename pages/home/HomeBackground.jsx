import { LinearGradient } from "expo-linear-gradient"

  const HomeBackground = ({style,children}) => 
  {
    return(
    <LinearGradient colors={["#FDEEA2",'#ffffd6']} style={[style,{zIndex:0,elevation:0}]} start={{ x: 0, y: .9 }} end={{ x: 0, y: 1 }} >
        {children}
    </LinearGradient>)
  }

  export default HomeBackground;