import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View, Pressable, Image } from 'react-native';
import { global } from './global'
import { useNavigation, StackActions } from '@react-navigation/native';
import { getDatabase, ref as dRef, child, onValue, get, query, orderByChild } from "firebase/database";
import { Loading, ProfileImage } from './Components'
import { FirebaseContext } from '../firebase/firebase';
import { SearchBar } from './Components';
import { ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { TextFor, AutoPrefix } from '../textService/textService';

export const Search = ({ navigation, route }) => {
    const {database, app, auth} = useContext(FirebaseContext);
    const { key } = route.params;
    
    const [array, setArray] = React.useState([]);
    const [isMapView, setIsMapView] = useState(false);
    /*const categories = [
        {
            path: 'user',
            keys: ['name','username',{key:profession,subKeys:['name','description']}]
        }
    ]*/

    useEffect(() => {
        console.log(array);
    }, [array]);

    useEffect(() => {
        if (database) {
            //categories.forEach(element => {
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
                        if (childData.name && childData.name.toLowerCase().includes(key.toLowerCase())) found = childData.name
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
                });
            //});
        }
    }, [database])

    return(
        <View>
            <View style={{flexDirection:'row',marginHorizontal:50,marginVertical:10}}>
                <TouchableOpacity style={{flex:1}} onPress={()=>{setIsMapView(false)}}>
                    <Text style={{textAlign:'center',color:(isMapView ? 'black' : 'blue')}}>lista</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{flex:1}} onPress={()=>{setIsMapView(true)}}>
                    <Text style={{flex:1,textAlign:'center',color:(isMapView ? 'blue' : 'black')}}>térkép</Text>
                </TouchableOpacity>
            </View>
            <View>
            {array ? 
                (array.length == 0 
                    ?   <View>
                            <TextFor style={styles.noResultText} text="no_result"/>
                            <Text style={styles.noResultSubText}>{AutoPrefix(key)} kifejezés nem hozott eredményt.</Text>
                        </View>
                    :   <ScrollView style={{height:'100%'}}>{array}</ScrollView>)
                : <Loading color="#f5d142" />}
            </View>
        </View>
    )
}

function Item({title,text,uid}) {
    const navigation = useNavigation();
    const onPress = () => {
        navigation.navigate("profile", {uid});
    }
    return (
        <TouchableOpacity onPress={onPress} style={[styles.list, {flexDirection: "row"}]}>
            <ProfileImage style={styles.listIcon} uid={uid}/>
            <View style={{marginLeft: 5}}>
              <Text style={{ fontWeight: 'bold',flex: 1, }}>{title}</Text>
              <Text style={{ flex:1, }}>{text}</Text>
            </View>
        </TouchableOpacity>
    );
    
  }

const styles = StyleSheet.create({

    list: {
        alignItems: "center",
        borderColor: "rgb(240,240,240)",
        backgroundColor: 'white',
        borderBottomWidth: 2,
        borderTopWidth: 1,
        padding: 12,
        marginTop: -1,
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
    searchList: {
        padding: 16,
        backgroundColor: 1,
        borderBottomWidth: 1,
        borderBottomColor: 0,
        alignItems: "center",
    },
  })