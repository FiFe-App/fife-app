import { useNavigation } from "@react-navigation/native";
import { Pressable, useWindowDimensions } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons'
import { MyText, NewButton } from "./Components";

const GoBack = ({breakPoint=900,text="Vissza",previous,style}) => {
    const { width } = useWindowDimensions();
    const nav = useNavigation();
    if (width > breakPoint || (!nav.canGoBack() && !previous)) return null
    return (
        <NewButton 
        title={<><Icon name="chevron-back-outline" size={35}/>{text}</>}
         onPress={()=>{previous ? nav.push(previous) : nav.goBack()}} 
         textStyle={{alignItems:'center',fontSize:35}}
         style={[{alignItems:'flex-start',margin:0}]} />
    )
}

export default GoBack;