import { LoadImage, Loading, Row, NewButton } from '../Components'

import { ref, child, get, set, onValue } from "firebase/database";

import React, { useEffect, useContext } from 'react';
import { Text, Platform, View, Pressable, Dimensions } from 'react-native';
import {styles} from '../styles'
import { Animated, Image, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useSelector } from 'react-redux'
import { FirebaseContext } from '../../firebase/firebase';

import { AutoSizeText, ResizeTextMode } from 'react-native-auto-size-text';

export const Profile = ({ navigation, route }) => {
  const [profile, setProfile] = React.useState(null);
  const width = Dimensions.get('window').width
  
  const {database, app, auth} = useContext(FirebaseContext);
  const uid = route?.params?.uid || useSelector((state) => state.user.uid)

  const [followButtonText, setFollowButtonText] = React.useState("Ajánlom");
  const [followers, setFollowers] = React.useState(null);
  const [myProfile, setMyProfile] = React.useState(true);
  const [mapOptions,setMapOptions] = React.useState({
    center: {
      lat: 10,
      lng: 0
    },
    zoom: 4
  })

  navigation = useNavigation()

  function follow(){
    const dbRef = ref(database, 'users/' + uid + "/likes/" + auth.currentUser.uid);
    if (followButtonText == "Ajánlottam") {
          set(dbRef,{"owner":null});
          setFollowButtonText('Ajánlom');
      } else {
        set(dbRef, { "owner": auth.currentUser.uid });
          setFollowButtonText('Ajánlottam');
      }
      getRecList();
      return (followButtonText == 'Ajánlom');
  }
  
  function getRecList(){
    const dbRef = ref(database,'users/' + uid + "/likes");
    onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        var size = snapshot.size;
        //if ()
        setFollowers(snapshot.size);
        if (snapshot.val()[auth.currentUser.uid] != undefined) {
          setFollowButtonText('Ajánlottam');
        }
          //snapshot.forEach((childSnapshot) => {});
      }
      else setFollowers(0);
    })
  }
  
  useEffect(() => {
    if (database) {
      setMyProfile(!route?.params?.uid);
      getRecList();
      const dbRef = ref(database);
      get(child(dbRef, `users/${uid}/data`)).then((snapshot) => {
        if (snapshot.exists()) {
          var data = snapshot.val();
          setProfile(snapshot.val());
          /*if (data.location)
          setMapOptions({
            center: {
              lat: data.location.vlat,
              lng: data.location.vlng
            },
            zoom: data.location.vzoom
          })*/
        } else {
          navigation.push('edit-profile')
        }
      }).catch((error) => {
        console.error(error);
      });
    }
  }, [database]);
  if (profile)
  return(
    <View>
      <View style={{flexDirection: width >  1120 ? 'row' : 'column'}}>
        <Row style={{justifyContent: "center",alignItems: 'center',margin:10}}>
          <LoadImage uid={uid} size={150}/>
        </Row>
        <Row style={{justifyContent: width >  1120 ? 'space-between' : 'center',flex:1,alignItems: 'center',margin:10}}>
          <AutoSizeText
            fontSize={52}
            numberOfLines={1}
            style={{padding:30}}
            mode={ResizeTextMode.max_lines}>
            {profile.name}
          </AutoSizeText>
          <View style={{alignItems: 'center',alignSelf:'center',paddingHorizontal:30}}>
            <Text style={localStyles.text}>{profile.username}</Text>
            <View style={localStyles.horizontalLine}/>
            <Text style={localStyles.text}>Ajánlók: {followers}</Text>
          </View>
        </Row>
        <View style={{justifyContent: "center",alignItems: width >  1120 ? 'flex-end' : 'center',flex:1}}>
            { !myProfile && <>
            <NewButton title={followButtonText} onPress={follow}/>
            <NewButton title="Üzenetküldés" onPress={() => navigation.navigate('chat',{uid:uid})}/>
            </>
            }
          {myProfile &&
            <NewButton title={"Módosítás"} onPress={() => navigation.navigate('edit-profile')} />
            }
        </View>
      </View>

      {profile.location ? (
      (Platform.OS !== 'web') ? <MapView style={localStyles.map} />
      : <div id='map' style={localStyles.map} />)
      : <Text style={localStyles.subText}>Nincs megadva helyzeted</Text>
      }
      <Text style={localStyles.subText}>Rólam: {profile.bio}</Text>
      <Section title="Elérhetőségeim">
        <View style={[styles.label,{flex:1}]} >
            <Text style={localStyles.subText}>Elérhetőségeim: @{profile.ig_username}</Text>
        </View>
      </Section>
      {profile.profession && <Section title="Ehhez értek">
        <View style={[styles.label,{flex:1}]} >
          {profile.profession.map((prof,index) =>
          <View key={"prof"+index}>
            <Text>{prof.name}, ezen belül: {prof.description}</Text>
          </View>)}
        </View>
      </Section>}

    </View>
  )
  else return (<Loading color={"#f5d142"}/>)
}

  function Section(props){
    const openAnim = React.useRef(new Animated.Value(0)).current  // Initial value for opacity: 0
    const [open, setOpen] = React.useState(false)
    const onPress = () => {
      setOpen(!open);
      Animated.timing(openAnim, {
        toValue: 100,
        easing: Easing.sin,
        duration: 2000,
        useNativeDriver: false
      })
    }


    useEffect(() => {
    }, [openAnim])
    return(
      <View>
        <Pressable style={localStyles.section} onPress={onPress}>
          <Text style={localStyles.sectionText}>{props.title}</Text>
        </Pressable>
        {open &&
          <Animated.View style={[{ height: openAnim }]} >
          {props.children}
          </Animated.View>
        }
      </View>
    );
  }

  const localStyles = {
    text:{
      fontWeight: 'bold',
      color: "black",
      fontSize:18,
      paddingVertical: 8,
    },
    subText: {
      color: "black",
      fontSize:16,
      padding: 16,
    },
    verticleLine: {
      height: '100%',
      width: 1,
      backgroundColor: '#909090',
    },
    horizontalLine: {
      height: 1,
      width: '100%',
      backgroundColor: '#909090',
    },
    section:{
      height: 50,
      justifyContent: 'center',
      paddingHorizontal:20,
      backgroundColor: 'rgb(245, 209, 66)',
      borderColor: 'white',
      borderWidth: 5,
      marginTop: -1,
      
    },
    sectionText:{
      fontWeight: 'bold',
      fontSize:18,

    },
    map: {
      height: 200,
    },
  }