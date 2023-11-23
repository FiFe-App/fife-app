import { View } from "react-native";
import { MyText, NewButton } from "../Components";
import { useNavigation } from "@react-navigation/native";

const Error = ({text}) => {
    const t = (typeof text === 'string' || text instanceof String) ? text : JSON.stringify(text)
    return (<View style={{flex:1,height:'100%',alignItems:'center',justifyContent:'center'}}>
        <View style={{backgroundColor:'#ffffd6',padding:32,borderRadius:8,alignItems:'center',justifyContent:'center'}}>
                <MyText>Aj-aj hiba történt!</MyText>
                {text&&<MyText bold>{getErrorText(t)}</MyText>}
                <NewButton title="Oldal újratöltése" onPress={()=>{
                    window?.location?.reload()
                }} />
        </View>
    </View>)

}

const getErrorText = (code) => {
    switch(code) {
        case 'Token expired':
          return 'Lejárt a munkamenet, kérlek jelentkezz be újra!';
        default:
          return code;
      }
}

export default Error;