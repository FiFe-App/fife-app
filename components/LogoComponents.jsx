import { Pressable } from "react-native"
import { MyText } from "./Components"
import { styles } from '../styles/styles';
import { useRouter } from "expo-router";

const HomeButton = () => {
    const router = useRouter();
    return (
        <Pressable onPress={()=>router.push('/')} style={{justifyContent:'center',alignItems:'center'}}>
          <MyText style={[styles.title,{fontFamily:'AmaticSC_700Bold',userSelect:'none',marginHorizontal:40}]}>
          FiFe app
          </MyText>
        </Pressable>
        )
}

export { HomeButton }