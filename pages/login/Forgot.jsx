import { Pressable, View } from "react-native";
import { MyText, TextInput } from "../../components/Components";
import { useContext, useState } from "react";
import { FirebaseContext } from "../../firebase/firebase";

const Forgot = () => {
    const {api}  = useContext(FirebaseContext);
    const [email, setEmail] = useState('');
    const [response, setResponse] = useState(null);

    const forgot = async () => {
        const msg = await api.forgotPassword(email);
        setResponse(msg);
    }

    return (
        <View style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#fdf8de'}}>
            <View style={{width:'50%',backgroundColor:'#fff',padding:8}}>
                <MyText style={{textAlign:'center'}}>Elfelejtett jelszó</MyText>
                <MyText>Semmi gond, mindenkivel előfordul!</MyText>
                <View style={{flexDirection:'row'}}>
                    <TextInput onChange={setEmail} style={{width:300,flex:1,padding:8,backgroundColor:'#fdf1b9'}} 
                    placeholder="Írd be az email-címed amivel regisztráltál"/>
                    <Pressable onPress={forgot} 
                    style={{backgroundColor:'#e6bffd',marginLeft:16,padding:8,justifyContent:'center'}}
                    ><MyText>Küldés!</MyText>
                    </Pressable>
                </View>
            </View>
            <MyText>{response}</MyText>
        </View>
    )
}

export default Forgot;