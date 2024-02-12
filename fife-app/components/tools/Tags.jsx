import { useState } from "react";
import { MyText, TextInput } from "../Components";
import { View } from "react-native";

const Tags = () => {
    const [text, setText] = useState('');
    const list = text.split(' ')

    return <View>
    <TextInput
        style={[{fontSize:16,padding:10,backgroundColor:'#ffffff',borderRadius:8,margin:4,flexGrow:1}]}
        returnKeyType="search"
        autoCapitalize='none'
        value={text}
        onChangeText={setText}
        placeholder={'Kategóriák'}
        placeholderTextColor="gray"
        />
    {!!text && <View style={{flexWrap:'wrap',flexDirection:'row',padding:10,margin:0,marginRight:15}}>
                            {list.map((cat,ind)=>
                                    {
                                    if (cat?.length==0) return null
                                    return <View key={"category"+ind} style={{fontSize:16,background:'#555555',padding:5,margin:5,maxWidth:'100%'}}>
                                        <MyText style={{color:'white'}}>{cat}</MyText>
                                    </View>
                                    }
                            )}
                        </View>}
    </View>

}

export default Tags;