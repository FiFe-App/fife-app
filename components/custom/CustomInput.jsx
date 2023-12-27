import { View, useWindowDimensions } from "react-native"
import { Checkbox, TouchableRipple } from "react-native-paper";
import { Col, MyText, NewButton, ProfileImage, Row, TextInput, getNameOf } from "../Components";
import { useNavigation } from "@react-navigation/native";
import UserElement from "../tools/UserElement";
import { MyImagePicker } from '../../components/tools/MyImagePicker';

const CustomInput = ({type,attribute,label,data,setData,submit,lines=1,style,placeholder,render,text,extra,extraAction}) => {
    const navigation = useNavigation()
    const { width } = useWindowDimensions();
    const defStyle = {
        padding:10,
        fontSize:17,
        margin:width <= 900 ? 5 : 10,
        marginHorizontal:width <= 900 ? 0 : 10,
        borderRadius: 8,
        backgroundColor: '#fbf7f0',
        //textAlignVertical: "center",
    }
    if (render && !data[render]) return null;
    const LabelElement = <MyText style={[{marginLeft:0,fontSize:17}]}>{label}</MyText>
    if (type == 'text')
    return LabelElement
    if (type == 'text-input')
    return (<>{LabelElement}<TextInput style={[defStyle,style]} multiline
        placeholder={placeholder}
     numberOfLines={lines} onChangeText={v=>setData({...data,[attribute]:v})} /></>)
    if (type == 'checkbox')
    return (<Checkbox.Item label={label} 
        color="#000" style={[defStyle,style]} 
        labelStyle={{fontFamily:'SpaceMono_400Regular', letterSpacing:-1}}
        status={data[attribute]?'checked':'unchecked'} onPress={v=>setData({...data,[attribute]:!data[attribute]})} />)
    if (type == 'button')
    return (<NewButton style={[defStyle,style]} onPress={submit} title={label} />)
    if (type == 'user')
    {
        return <UserElement uid={attribute} text={label} setData={setData} style={style} extra={extra}/>
    }
    if (type == 'item') {
        return <TouchableRipple 
        style={{padding:8,borderRadius:8,}}
        onPress={()=>{
            setData()
            navigation.push('profil',{uid:attribute})
        }}>
            <Row style={{width:'100%'}}>
                <ProfileImage uid={attribute} size={50}/>
                <Col style={{justifyContent:'center'}}>
                    <MyText style={{marginLeft:16}}>{text}</MyText>
                    <MyText bold style={{marginLeft:16}}>{label}</MyText>
                </Col>
            </Row>
        </TouchableRipple>
    }
    if (type=='rich-text')
    return (<RichEditor
        initialContentHTML={'Hello <b>World</b> <p>this is a new paragraph</p> <p>this is another new paragraph</p>'}
        editorInitializedCallback={() => this.onEditorInitialized()}
      />)
    if (type=='image') return <MyImagePicker />
    if (type=='null') return  null;
    return (<MyText>{LabelElement} Nincs ilyen típus {type}</MyText>)
}



export default CustomInput;