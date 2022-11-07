
import { get, ref, set } from "firebase/database";
import { useState, useContext, useEffect } from "react";
import { ActivityIndicator, SafeAreaView, Text, View, Switch, Button, Image, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from "react-redux";
import { FirebaseContext } from "../firebase/firebase";
import { setSettings as setStoreSettings } from "../userReducer";

export const New = ({ navigation, route }) => {
    const {database} = useContext(FirebaseContext);
    const dispatch = useDispatch()
    const uid = useSelector((state) => state.user.uid)
    const [settings, setSettings] = useState(useSelector((state) => state.user.settings));

    useEffect(() => {
        if (uid) {
            if (database && settings) {
                const dbRef = ref(database,'users/' + uid + "/settings");
                set(dbRef,settings)
                dispatch(setStoreSettings(settings))
                
            }
        }
    }, [settings]);

    return (
        <View style={{backgroundColor:'#F2EFE6',alignItems:'center',flex:1}}>
            <View style={{padding:20,maxWidth:500,backgroundColor:'#fff',flex:1,width:'-webkit-fill-available'}}>
                <View style={{flexDirection:'row', alignItems:'center',marginTop:10}}>
                    <Text style={{flex:1}}>Véletlenszerű profil keresése!</Text>
                    <Button title="mehet" color="#fdcd4f" onPress={()=>navigation.navigate('messages',{random:true})}/>
                </View>
                <View style={{flexDirection:'row',marginTop:30}}>
                    <Text style={{flex:1}}>Szövegek dinamikus változtatgatása</Text>
                    <Switch
                        trackColor={{ false: '#767577', true: '#3e3e3e' }}
                        thumbColor={settings?.fancyText ? '#f5dd4b' : '#f4f3f4'}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={(e)=>{setSettings({...settings, fancyText: e})}}
                        value={settings?.fancyText}
                        style={{alignSelf:'flex-end'}}
                    />
                </View>
                <View style={{flexDirection:'row', alignItems:'center',marginTop:30}}>
                    <Text style={{flex:1}}>INSTANT BULI!</Text>
                    <Button title="mehet" color="#fdcd4f" onPress={()=>navigation.navigate('messages',{random:true})}/>
                </View>
            </View>    
        </View>
    )
}

const styles = StyleSheet.create({

})