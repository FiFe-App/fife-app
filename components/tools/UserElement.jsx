import { TouchableRipple } from "react-native-paper";
import { MyText, ProfileImage, Row, getNameOf } from "../Components";
import { View } from "react-native";
import { useEffect, useState } from "react";

const UserElement = ({uid,text,setData,style}) => {
    const [name, setName] = useState(null);
    useEffect(() => {
        (async ()=>{
            setName(await getNameOf(uid))
        })()
    }, []);
    return (<TouchableRipple onPress={()=>{
            navigation.push('profil',{uid})
            setData(null)
        }}
        style={[{margin:5,alignItems:'center'},style]}>
            <Row>
                <ProfileImage uid={uid} size={80} style={[{marginRight:5,borderRadius:8}]}/>
                <View style={{flex:1}}>
                    <MyText bold style={{fontSize:20}}>{name}</MyText>
                    {text && <MyText style={{fontSize:18}}>{text}</MyText>}
                </View>
            </Row>
        </TouchableRipple>)

}

export default UserElement;