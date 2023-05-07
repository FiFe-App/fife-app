import { useNavigation } from "@react-navigation/native"
import { Pressable } from "react-native"
import { MyText } from "./Components"
import { styles } from '../styles/styles';

const HomeButton = () => {
    const navigation = useNavigation()
    return (
        <Pressable onPress={()=>navigation.push('fooldal')} style={{justifyContent:'center',alignItems:'center'}}>
          <MyText style={[styles.title,{fontFamily:'AmaticSC_700Bold',whiteSpace:'pre'}]}>
          FiFe App
          </MyText>
        </Pressable>
        )
}

export { HomeButton }