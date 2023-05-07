import { useNavigation } from "@react-navigation/native";
import { Pressable, useWindowDimensions } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons'
import { MyText } from "./Components";

const GoBack = ({breakPoint=900,text="Vissza",previous,style}) => {
    const { width } = useWindowDimensions();
    const nav = useNavigation();
    if (width > breakPoint || (!nav.canGoBack() && !previous)) return null
    return (
        <Pressable onPress={()=>{previous ? nav.push(previous) : nav.goBack()}} style={style}>
            <MyText style={{fontSize:35}}><Icon name="chevron-back-outline" size={35}/>{text}</MyText>
        </Pressable>
    )
}

export default GoBack;