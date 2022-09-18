import { useState, useContext, useEffect } from "react";
import {View, Text, TouchableOpacity, ScrollView, Platform} from 'react-native'
import { useSelector } from 'react-redux'
import { FirebaseContext } from '../firebase/firebase';
import { ref, child, get, set, onValue, onChildAdded } from "firebase/database";
import { LoadImage } from './Components'
import { useNavigation } from '@react-navigation/native';
import { styles } from "./styles";
import { Chat } from "./Chat";
import { widthPercentageToDP,  heightPercentageToDP} from 'react-native-responsive-screen';

export const Messages = ({route,navigation}) => {
    const [list, setList] = useState([]);
    const {database, app, auth} = useContext(FirebaseContext);
    const uid = useSelector((state) => state.user.uid)

    const getRandom = () => {
        const dbRef = ref(database,`users`);

        onValue(dbRef, (snapshot) => {
            if (snapshot.exists()) {
                const random = Math.floor(Math.random() * (snapshot.size - 2) + 1);
                console.log(random);

                let index = 0
                snapshot.forEach((childSnapshot) => {
                    index++;
                    if (index == random) {

                        if (childSnapshot.key == uid) {
                            console.log(childSnapshot.key,' SAME ',uid);
                            getRandom()
                            return;
                        } else 
                        navigation.navigate('chat',{uid:childSnapshot.key});
                    }
                })
            }
        })
    }
    
    useEffect(() => {
        if (database) {
            if (route?.params?.random) getRandom()

            console.log('uid',uid);

            const dbRef = ref(database,`users/${uid}/messages`);
            const userRef = ref(database,`users`);


            onChildAdded(dbRef, (childSnapshot) => {
                const childKey = childSnapshot.key;
                console.log(childKey);
                onValue(userRef, (snapshot) => {
                    const name = snapshot.child(childKey+'/data/name').val()
                    setList(old=>[...old,{uid:childKey,name:name}])
                  });
            });

        }
      }, [database]);
    return (
    <View style={{flex:1, flexDirection:'row'}}>
        <ScrollView style={{width: '30%', height: '100%'}}>
            {!!list.length && list.map((e,i)=>{
                return (
                    <Item title={e?.name} text={e?.last} uid={e?.uid} key={i}/>
                )
            })}
        </ScrollView>
    {Platform.OS == 'webc' && 
        <View style={{width: '70%', height: '100%'}}>
            <Chat uid={null}/>
        </View>}
    </View>
    )
}

function Item({title,text,uid}) {
    const navigation = useNavigation();
    const onPress = () => {
        navigation.navigate("chat", {uid:uid});
    }

    return (
        <TouchableOpacity onPress={onPress} style={[styles.list, {flexDirection: "row", backgroundColor: 'white'}]}>
            <LoadImage style={styles.listIcon} uid={uid}/>
            <View style={{marginLeft: 5}}>
              <Text style={{ fontWeight: 'bold',flex: 1, }}>{title}</Text>
              <Text style={{ flex:2, }}>{text}</Text>
            </View>
        </TouchableOpacity>
    );
    
  }