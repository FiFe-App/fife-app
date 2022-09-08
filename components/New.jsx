
import { get, ref, set } from "firebase/database";
import { useState, useContext, useEffect } from "react";
import { ActivityIndicator, SafeAreaView, Text, View, Switch, Button, Image, StyleSheet } from 'react-native';
import { useSelector } from "react-redux";
import { FirebaseContext } from "../firebase/firebase";

export const New = ({ navigation, route }) => {
    const {database,api} = useContext(FirebaseContext);
    const uid = useSelector((state) => state.user.uid)
    const [isEnabled, toggleSwitch] = useState(false);
    const [settings, setSettings] = useState(null);

    useEffect(() => {

        if (uid) {
            if (database && settings) {
                const dbRef = ref(database,'users/' + uid + "/settings");
                set(dbRef,settings)
            }
        } //else navigation.navigate('login')
    }, [settings]);

    useEffect(() => {
        if (database && uid) {
            const dbRef = ref(database,'users/' + uid + "/settings");
            get(dbRef).then((snapshot) => {
            if (snapshot.exists()) {
                setSettings(snapshot.val())   
            } else setSettings({
                randomTalk: false
            })    
            
            })
        }
    }, [database]);
    return (
        <View style={{margin:20}}>
            <View style={{flexDirection:'row', alignItems:'center'}}>
                <Text style={{flex:1,}}>Rámírhat valaki véletlenszerűen</Text>
                <Switch
                    trackColor={{ false: '#767577', true: '#3e3e3e' }}
                    thumbColor={isEnabled ? '#white' : 'white'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={(e)=>{setSettings({...settings, randomTalk: e})}}
                    value={settings?.randomTalk}
                    style={{alignSelf:'flex-end'}}
                />
            </View>
            <View style={{flexDirection:'row', alignItems:'center',marginTop:10}}>
                <Text style={{flex:1}}>Beszélgess valakivel találomra!</Text>
                <Button title="mehet" onPress={()=>navigation.navigate('messages',{random:true})}/>
            </View>

        </View>
    )
}

const styles = StyleSheet.create({

})