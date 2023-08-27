import { useNavigation } from "@react-navigation/native";
import { Pressable, useWindowDimensions } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons'
import { MyText, NewButton } from "./Components";
import { TouchableRipple } from "react-native-paper";

const GoBack = ({breakPoint=900,text="Vissza",floating,previous,style,color}) => {
    const { width } = useWindowDimensions();
    const nav = useNavigation();
    if (width > breakPoint || (!nav.canGoBack() && !previous)) return null
    return (
        <TouchableRipple
        style={[{alignItems:'center',justifyContent:'center',margin:0,position:floating?'absolute':'relative',zIndex:10,
        left:5,top:10,width:70,height:70,padding:0,borderRadius:100},style]} 
        onPress={()=>{previous ? nav.push(previous) : nav.goBack()}} 
        >
            <Icon name="chevron-back-outline" size={35} color={color}/>
        </TouchableRipple>
    )
}

export default GoBack;