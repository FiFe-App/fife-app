import { useState, useContext, useEffect } from "react";
import {View, Text, TouchableOpacity, ScrollView, Platform, Dimensions} from 'react-native'
import { useSelector } from 'react-redux'
import { FirebaseContext } from '../firebase/firebase';
import { ref, child, get, set, onValue, onChildAdded, off } from "firebase/database";
import { LoadImage } from './Components'
import { useNavigation } from '@react-navigation/native';
import { styles } from "./styles";
import { Chat } from "./Chat";
import { widthPercentageToDP,  heightPercentageToDP} from 'react-native-responsive-screen';

export const Messages = ({route,navigation}) => {
    const [list, setList] = useState([]);
    const {database, app, auth} = useContext(FirebaseContext);
    const uid = useSelector((state) => state.user.uid)
    const width = Dimensions.get('window').width
    const [selected, setSelected] = useState(route?.params?.selected);

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
                console.log('chat',childKey);
                get(child(userRef,childKey+'/data/name')).then((snapshot) => {
                    const name = snapshot.val()
                    console.log('messager added',name);
                    setList(old=>[...old,{uid:childKey,name:name}])
                  });
            });

        }
      }, [database]);

      useEffect(() => {
        if (selected && width <= 900)
            navigation.navigate("chat", {uid:selected});
      }, [selected]);
    return (
    <View style={{flex:1, flexDirection:'row'}}>
        <ScrollView style={{flex:1}}>
            {!!list.length && list.map((e,i)=>{
                return (
                    <Item title={e?.name} selected={selected == e?.uid} text={e?.last} uid={e?.uid} key={i} setSelected={setSelected}/>
                )
            })}
        </ScrollView>
        {(width > 900) &&
            <View style={{flex:2}}>
                <Chat propUid={selected}/>
            </View>
        }
    </View>
    )
}

function Item({title,text,uid,selected,setSelected}) {
    const navigation = useNavigation();
    const width = Dimensions.get('window').width
    
    const onPress = () => {
        if (width > 900)
            setSelected(uid)
        else 
            navigation.navigate("chat", {uid:uid});
    }

    return (
        <TouchableOpacity onPress={onPress} style={[styles.list, {flexDirection: "row", backgroundColor: selected ? '#fdfdfd' : '#f6f6f6'}]}>
            <LoadImage style={styles.listIcon} uid={uid}/>
            <View style={{marginLeft: 5}}>
              <Text style={{ fontWeight: 'bold',flex: 1, }}>{title}</Text>
              <Text style={{ flex:2, }}>{text}</Text>
            </View>
        </TouchableOpacity>
    );
    
  }