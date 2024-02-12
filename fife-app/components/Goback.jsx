import Icon from '@expo/vector-icons/Ionicons';
import { useWindowDimensions } from "react-native";
import { TouchableRipple } from "react-native-paper";
import { MyText, Row } from "./Components";
import { router } from 'expo-router';

const GoBack = ({breakPoint=900,text="Vissza",floating,previous,style,color,params,onPress}) => {
    const { width } = useWindowDimensions();
    const nav = router;
    if (width > breakPoint || (!nav.canGoBack() && !previous)) return null
    return (
        <TouchableRipple
        style={[{alignItems:'center',justifyContent:'center',margin:0,position:floating?'absolute':'relative',zIndex:10,
        left:10,top:floating?10:10,width:70,height:70,padding:0,borderRadius:100},floating&&{
      shadowColor: '#171717',
      shadowOffset: {width: 2, height: 4},
      shadowOpacity: 0.2,
      shadowRadius: 10,},style]} 
        onPress={()=>{
            if (onPress) onPress()
            else
            previous ? nav.navigate(previous,params) : nav.back()
        }} 
        >
            <Row style={{alignItems:'center',justifyContent:'center'}}>
                <Icon name="chevron-back" size={35} color={color}/>
                {text && <MyText size={20}>{text}</MyText>}
            </Row>
        </TouchableRipple>
    )
}

export default GoBack;