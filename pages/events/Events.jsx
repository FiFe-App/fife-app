import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, Text, View, Pressable, Button, Image, Modal } from 'react-native';
import { global } from '../../lib/global'
import { styles } from '../../styles/styles'
import { useNavigation, StackActions } from '@react-navigation/native';
import { LinearGradient } from "expo-linear-gradient";
import { getDatabase, ref as dRef, child, onValue, get } from "firebase/database";
import { Loading, ProfileImage, FAB, Row } from '../../components/Components'
import { ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'

const Events = ({ navigation, route }) => {
    const [filter,setFilter] = useState("today")
    const [list,setList] = useState([]);
    const [date,setDate] = useState(Date.now());

    const setFilterTo = (query) => {

    }

    
    React.useLayoutEffect(() => {
        navigation.setOptions({
        headerRight: () => (
            <Row>
                <Pressable style={{paddingRight: 22}} onPress={() => setFilter('search')} >
                    <Icon name="search-outline" size={24}/>
                </Pressable>
                <Pressable style={{paddingRight: 22}} onPress={() => setFilter('date')} >
                    <Icon name="calendar" size={24}/>
                </Pressable>
            </Row>
        ),
        });
    }, [navigation]);

    useEffect(() => {
        setList([])
        for (let i = 0; i < 20; i++) {
            setList(old => [...old, <Event title={"event "+i} text={filter} key={i}/>])
        }
    }, [filter])
    

    return (
        <SafeAreaView style={localStyles.container}>
            <View style={localStyles.container}>
                <View style={localStyles.navbar}>
                    <Pressable style={localStyles.barButton} onPress={() => setFilter("today")} ><Text>Mai program</Text></Pressable>
                    <Pressable style={localStyles.barButton} onPress={() => setFilter("new")} ><Text>Valami új</Text></Pressable>
                    <Pressable style={localStyles.barButton} onPress={() => setFilter("frien")} ><Text>Pajtásaid programjai</Text></Pressable>
                </View>
                <LinearGradient colors={["#f7316a", "rgba(255,175,0,0.7)"]} start={{ x: 0, y: 0 }} end={{ x: 0.2, y: 1 }}>
                    <Text style={localStyles.header}>{filter}</Text>
                </LinearGradient>
                <ScrollView>
                    {list.length ? list : <Loading color='crimson' /> }
                </ScrollView>
                <FAB color="#f7316a" color2="rgba(255,175,0,0.7)" icon='add' size={60} onPress={()=>{navigation.push('uj-esemeny')}}/>
                
            </View>
        </SafeAreaView>
    )
}

function getData(key, setArray) {
    const newArray = [];
    const dbRef = dRef(global.database, '/users');
    onValue(dbRef, (snapshot) => {
        if (snapshot.exists())
            snapshot.forEach((childSnapshot) => {
                const childKey = childSnapshot.key;
                const childData = childSnapshot.val();

                if (childData.name && childData.name.toLowerCase().includes(key.toLowerCase()) ||
                    childData.username && childData.username.toLowerCase().includes(key.toLowerCase())) {
                    newArray.push(<Item key={childKey} title={childData.name} text={childData.username} uid={childKey} />);

                }
            });
        setArray(newArray)
    });
    //return newArray
}

function Event({ title, text }) {
    const navigation = useNavigation();
    const onPress = () => {
        navigation.push('esemeny')
    }

    return (
        <Pressable onPress={onPress} style={[styles.list, { flexDirection: "row" }]}>
            <View style={{ marginLeft: 5 }}>
                <Text style={{ fontWeight: 'bold', flex: 1, }}>{title}</Text>
                <Text style={{ flex: 2, }}>{text}</Text>
            </View>

        </Pressable>
    );

}

const localStyles = {
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    navbar: {
        flexDirection:"row",
        borderColor: 'gray',
        borderBottomWidth: 0
    },
    barButton: {
        flex: 1,
        alignItems: 'center',
        padding: 10,
        fontSize: 21,
        borderLeftWidth: 0,
        borderColor: 'gray'
    },
    header: {
        fontSize: 22,
        padding: 20,
        paddingBottom: 10,
        borderColor: 'gray',
        color: 'white',
        borderBottomWidth: 0
    },
  }

export default Events