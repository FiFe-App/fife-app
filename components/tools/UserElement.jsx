import Icon from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from "react";
import { View } from "react-native";
import { TouchableRipple } from "react-native-paper";
import { MyText, NewButton, ProfileImage, Row, getNameOf } from "../Components";
import { router } from 'expo-router';

const UserElement = ({uid,text,setData,style,image,size,onlyText,extra}) => {
    const [name, setName] = useState(null);
    const navigation = router;
    useEffect(() => {
        (async ()=>{
            setName(await getNameOf(uid))
        })()
    }, []);
    if (onlyText) return <MyText style={style}>{name}</MyText>
    return (<Row style={{alignItems:"center"}}>
        <TouchableRipple onPress={()=>{
                navigation.push({pathname:'profil',params:{uid}})
                setData(null)
            }}
            style={[{margin:5,alignItems:'center',justifyContent:'center',flexGrow:1},style]}>
                <Row style={{width:'100%'}}>
                    {image&&<ProfileImage uid={uid} size={size} style={[{marginRight:5,borderRadius:8}]}/>}
                    <View style={{flex:1}}>
                        <MyText bold style={{fontSize:size}}>{name}</MyText>
                        {text && <MyText style={{fontSize:18}}>{text}</MyText>}
                    </View>
                </Row>
            </TouchableRipple>
            {extra=='message' && <NewButton icon onPress={()=>{
                navigation.push({pathname:'uzenetek',params:{uid}})
                setData(null)
            }} title={<Icon name='chatbox-outline' size={20}/>} />}
    </Row>)

}

export default UserElement;