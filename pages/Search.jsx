import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ref as dRef, onValue, query, orderByChild } from "firebase/database";
import { Loading, ProfileImage, MyText } from '../components/Components'
import { FirebaseContext } from '../firebase/firebase';
import { ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { TextFor, AutoPrefix } from '../lib/textService/textService';

const Search = ({ route, style }) => {
    const { database } = useContext(FirebaseContext);
    //const { key } = route.params;
    
    const [array, setArray] = React.useState([]);
    const [progress, setProgress] = useState(0);
    const ready = 1;

    useEffect(() => {
        handleSearch()
    }, [route.params]);

    useFocusEffect(
        useCallback(() => {
            //if (array.length == 0)
            //handleSearch()
          return () => {
            setArray([])
          };
        }, [route.params])
      );

    const handleSearch = () => {
        const key = route.params.key;
        if (database && key) {
            console.log('searching...');
            setArray([])
            const dbRef = query(dRef(database,'/users'), orderByChild('name'));
            onValue(dbRef, (snapshot) => {
                if (snapshot.exists())
                snapshot.forEach((childSnapshot) => {
                    const childKey = childSnapshot.key;
                    const childData = childSnapshot.child('data').val();
                    
                    let found = null
                    let index = null

                    if (key=='all') {
                        found = childData.username
                        console.log(found);
                    }
                    if (childData.name && childData.name.toLowerCase().includes(key.toLowerCase())) found = "profil"
                    if (childData.username && childData.username.toLowerCase().includes(key.toLowerCase())) found = childData.username
                    if (childData.profession && childData.profession.filter((e,i)=>{
                        if (e.name.toLowerCase().includes(key.toLowerCase()) ||
                        e.description.toLowerCase().includes(key.toLowerCase()))
                        {
                            index = i
                            return true
                        }
                        return false
                    }).length) found = childData.profession[index].name

                    if (found)    
                    setArray(oldarray=>[...oldarray,<Item key={childKey} title={childData.name} text={found} uid={childKey} />]);
                });
                console.log('progress+');
                setProgress(progress+1)
            });

            const placesRef = query(dRef(database,'/maps'), orderByChild('name'));
            onValue(placesRef, (snapshot) => {
                if (snapshot.exists())
                snapshot.forEach((childSnapshot) => {
                    const childKey = childSnapshot.key;
                    const childData = childSnapshot.val();

                    if (childData.name.toLowerCase().includes(key.toLowerCase()))
                    setArray(oldarray=>[...oldarray,<Item key={childData.name+childKey} title={childData.name} text={'térkép kategória'} link={'terkep'} params={{selectedMap:childKey}}/>]);

                    console.log(childKey);
                    if (childData.locations) {
                        const keys = Object.keys(childData?.locations);
                        Object.values(childData?.locations)
                        ?.forEach((place,index) => {
                            if (
                                place.name.toLowerCase().includes(key.toLowerCase())
                            )
                            setArray(oldarray=>[...oldarray,<Item key={place.name+index} title={place.name} text={childData.name} link={'terkep'} params={{selected:keys[index],selectedMap:childKey}}/>]);
                        });
                    }
                });
                console.log('progress+');
                setProgress(progress+1)

            });
        }
    }

    if (!route.params.key) return null

    return(
        <View style={{flex:1,backgroundColor:'#FDEEA2'}}>
            <View style={{backgroundColor:'#FDEEA2'}}>
                {progress < ready ?
                    <>
                    <Loading color="#f5d761" />
                    </>:
                    (array.length == 0
                        ?   <View>
                                <TextFor style={styles.noResultText} text="no_result"/>
                                <MyText style={styles.noResultSubText}>{AutoPrefix(route.params.key)} kifejezés nem hozott eredményt.</MyText>
                            </View>
                        :   <ScrollView contentContainerStyle={{alignItems:'center',padding:50}}>{array}</ScrollView>)
                }
            </View>
        </View>
    )
}

function Item({title,text,uid,link,params}) {
    const navigation = useNavigation();
    const onPress = () => {
        if (link)
        navigation.push(link,params || {});
        else
        navigation.push("profil", {uid});
        }
    return (
        <TouchableOpacity onPress={onPress} style={[styles.list, {flexDirection: "row"}]}>
            {uid && <ProfileImage style={styles.listIcon} uid={uid}/>}
            <View style={{marginLeft: 5}}>
              <MyText style={{ fontWeight: 'bold',flex: 1, }}>{title}</MyText>
              <MyText style={{ flex:1, }}>{text}</MyText>
            </View>
        </TouchableOpacity>
    );
    
  }

const styles = StyleSheet.create({

    list: {
        alignItems: "center",
        borderColor: "rgb(240,240,240)",
        backgroundColor: 'white',
        width:'100%',
        borderBottomWidth: 2,
        borderTopWidth: 1,
        padding: 12,
        marginTop: -1,
        maxWidth:500
    },
    noResultText: {
        fontSize: 30,
        margin: 40,
        marginBottom: 10,
    },
    noResultSubText: {
        fontSize: 20,
        margin: 50,
        marginTop:10
    },
    listIcon: {
        borderRadius: 8
    },
    searchList: {
        padding: 16,
        backgroundColor: 1,
        borderBottomWidth: 1,
        borderBottomColor: 0,
        alignItems: "center",
    },
  })

export default Search