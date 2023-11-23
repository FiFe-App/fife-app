import { useNavigation } from "@react-navigation/native";
import { Pressable, useWindowDimensions } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons'
import { MyText, NewButton, Row } from "./Components";
import { TouchableRipple } from "react-native-paper";

const GoBack = ({breakPoint=900,text="Vissza",floating,previous,style,color,params,onPress}) => {
    const { width } = useWindowDimensions();
    const nav = useNavigation();
    if (width > breakPoint || (!nav.canGoBack() && !previous)) return null
    return (
        <TouchableRipple
        style={[{alignItems:'center',justifyContent:'center',margin:0,position:floating?'absolute':'relative',zIndex:10,
        left:5,top:10,width:70,height:70,padding:0,borderRadius:100},floating&&{
      shadowColor: '#171717',
      shadowOffset: {width: 2, height: 4},
      shadowOpacity: 0.2,
      shadowRadius: 10,},style]} 
        onPress={()=>{
            if (onPress) onPress()
            else
            previous ? nav.navigate(previous,params) : nav.goBack()
        }} 
        >
            <Row style={{alignItems:'center',justifyContent:'center'}}>
                <Icon name="chevron-back-outline" size={35} color={color}/>
                {text && <MyText size={20}>{text}</MyText>}
            </Row>
        </TouchableRipple>
    )
}

export default GoBack;