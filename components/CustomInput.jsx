import { useWindowDimensions } from "react-native"

const { TextInput, MyText, NewButton } = require("./Components")

const CustomInput = ({type,key,label,data,setData,submit,lines,style}) => {
    const { width } = useWindowDimensions();
    const defStyle = {
        padding:10,
        fontSize:20,
        margin:width <= 900 ? 0 : 10,
        marginTop:5,
        borderRadius: 8,
        backgroundColor: '#ffffff88',
        textAlignVertical: "top"
    }
    const LabelElement = <MyText style={{marginLeft:32,fontSize:20}}>{label}</MyText>
    if (type == 'text')
    return (<>{LabelElement}<TextInput style={[defStyle,style]} multiline numberOfLines={2} onChangeText={v=>setData({...data,[key]:v})} /></>)
    if (type == 'button')
    return (<NewButton style={[defStyle,style]} onPress={submit} title={label} />)
}



export default CustomInput;