import { View } from "react-native";
import { Loading, MyText, NewButton, Row, TextInput } from "../Components";
import Icon from 'react-native-vector-icons/Ionicons';
import { useState } from "react";
import { Checkbox } from "react-native-paper";
import CustomInput from "../custom/CustomInput";
import axios from "axios";
import { config } from "../../firebase/authConfig";

const Posting = () => {
    const [text, setText] = useState('');
    const [options, setOptions] = useState(null);
    const [loading, setLoading] = useState(false);
    const send = () => {
        setLoading(true)
        axios.post('/blog',{...options,text},config()).then(()=>{
            setLoading(false)
            setOptions(null);
            setText('')
        });
        
    }
    return (<View style={{alignItems:'center'}}>
            <View style={{flexDirection:'row',width:'100%',maxWidth:600}}>
                <View style={{width:'100%'}}>
                    <>
                    {loading&&<Loading style={{zIndex:10,left:15,height:60,alignItems:'center',position:'absolute'}} />}
                    <TextInput
                    loading={loading}
                        placeholder={!loading&&'Kérdezz a fiféktől!'}
                        onChangeText={setText}
                        value={text}
                        numberOfLines={1}
                        style={[{backgroundColor:'white',borderRadius:30,flexGrow:1,paddingLeft:20,paddingRight:50,fontSize:20,height:60,zIndex:0},
                            options && {borderBottomLeftRadius:0,borderBottomRightRadius:0,}
                        ]}
                    /></>
                    {options && <View style={{backgroundColor:'white',padding:20,paddingTop:0,borderBottomLeftRadius:30,borderBottomRightRadius:30,}}>
                        <MyText size={20}>Küldés beállításai</MyText>
                        <CustomInput type='text-input' data={options} setData={setOptions} placeholder='Kinek küldöd?' attribute='title' />
                        <Row>
                            <CustomInput type='checkbox' data={options} setData={setOptions} label='Közelemben' attribute='nearby' />
                            <CustomInput type='checkbox' data={options} setData={setOptions} label='Sürgős' attribute='urgent' />
                            {false&&<CustomInput type='image' data={options} setData={setOptions} label='Kép hozzáadása' attribute='image' />}
                        </Row>

                    </View>}
                </View>
                <NewButton
                icon
                onPress={()=>setOptions(options?null:{})}
                title={<Icon name="ellipsis-horizontal" size={30}/>}
                style={{
                    backgroundColor:'transparent',
                    left: -30
                }} />
                <NewButton icon
                title={<Icon name="send" size={25}/>}
                onPress={send}
                style={{
                    left: -30
                }} />
            </View>
    </View>
    )
}

export default Posting;