import { View, useWindowDimensions } from "react-native"
import { Checkbox, TouchableRipple } from "react-native-paper";
import { MyText, NewButton, ProfileImage, Row, TextInput, getNameOf } from "../Components";
import { useNavigation } from "@react-navigation/native";
import UserElement from "../tools/UserElement";

const CustomInput = ({type,attribute,label,data,setData,submit,lines=1,style}) => {
    const navigation = useNavigation()
    const { width } = useWindowDimensions();
    const defStyle = {
        padding:10,
        fontSize:20,
        margin:width <= 900 ? 5 : 10,
        marginHorizontal:width <= 900 ? 0 : 10,
        borderRadius: 8,
        backgroundColor: '#fbf7f0',
        //textAlignVertical: "center",
    }
    const LabelElement = <MyText style={{marginLeft:32,fontSize:20}}>{label}</MyText>
    if (type == 'text')
    return LabelElement
    if (type == 'text-input')
    return (<>{LabelElement}<TextInput style={[defStyle,style]} multiline numberOfLines={lines} onChangeText={v=>setData({...data,[attribute]:v})} /></>)
    if (type == 'checkbox')
    return (<Checkbox.Item label={label} 
        color="#000" style={[defStyle,style]} 
        labelStyle={{fontFamily:'SpaceMono_400Regular', letterSpacing:-1}}
        status={data[attribute]?'checked':'unchecked'} onPress={v=>setData({...data,[attribute]:!data[attribute]})} />)
    if (type == 'button')
    return (<NewButton style={[defStyle,style]} onPress={submit} title={label} />)
    if (type == 'user')
    {
        return <UserElement uid={attribute} text={label} setData={setData} style={style}/>
    }
    if (type=='rich-text')
    return (<RichEditor
        initialContentHTML={'Hello <b>World</b> <p>this is a new paragraph</p> <p>this is another new paragraph</p>'}
        editorInitializedCallback={() => this.onEditorInitialized()}
      />)
    return (<MyText>{LabelElement} Nincs ilyen típus {type}</MyText>)
}



export default CustomInput;