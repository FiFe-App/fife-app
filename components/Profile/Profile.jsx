import { ProfileImage, Loading, Row, NewButton } from '../Components'

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
  const {database, app, auth} = useContext(FirebaseContext);
  const myuid = useSelector((state) => state.user.uid)
  const uid = route?.params?.uid || myuid 
  
  const [profile, setProfile] = React.useState(null);
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
          setProfile(data);
          console.log(data);
        } else {
          navigation.push('edit-profile')
        }
      }).catch((error) => {
        console.error(error);
      });
    }
  }, [database,uid]);
  if (profile)
  return(
    <View style={{marginRight:-4,backgroundColor:'white',flex:1}}>
      <Row>
        <ProfileImage uid={uid} size={150} style={[localStyles.container,{paddingHorizontal:0}]}/>
        <View style={{flex:2}}>
          <View style={localStyles.fcontainer}><Text style={localStyles.text}>{profile.name}</Text></View>
          <Row style={{flex:1}}>
            <View style={localStyles.fcontainer}><Text style={localStyles.text}>{profile.username}</Text></View>
            <View style={localStyles.fcontainer}><Text style={localStyles.text}>Ajánlók: {followers}</Text></View>
          </Row>
        </View>
        <View style={{flex:1}}>
            { !myProfile && <>
            <NewButton title="Üzenetküldés" onPress={() => navigation.navigate('messages',{selected:uid})}/>
            <NewButton title={followButtonText} onPress={follow}/>
            </>
            }
          {myProfile &&
            <NewButton title={"Módosítás"} onPress={() => navigation.navigate('edit-profile')} />
            }

        </View>
      </Row>
      <Row style={{flex:1}}>
        <View style={{flex:1}}>
          <Section title="Rólam">
            <View>
            <Text style={localStyles.subText}>{profile.bio}</Text>

            </View>
          </Section>
          
          <Section title="Helyzetem" flex={1}>
            {profile.location ? (
            (Platform.OS !== 'web') ? <MapView style={localStyles.map} />
            : <div id='map' style={localStyles.map} />)
            : <View style={{justifyContent:'center',alignItems:'center'}}>
              <Text style={localStyles.subText}>Nincs megadva helyzeted</Text>
            </View>
            }
          </Section>
        </View>
        <Section title="Ehhez értek" style={{flex:2}} flex={2}>
          <View style={[{flex:1}]} >
            {profile.profession && profile.profession.map((prof,index) =>
              <ListItem title={prof.name} key={"prof"+index}>
                <Text>{prof.description}</Text>
              </ListItem>
            )}
          </View>
        </Section>
        <Section title="Elérhetőségeim" flex={1}>
          <View style={[styles.label,{flex:1}]} >
              <Text style={localStyles.subText}>Elérhetőségeim: @{profile.ig_username}</Text>
          </View>
        </Section>
      </Row>
    </View>
  )
  else return (<Loading color={"#f5d142"}/>)
}

  function Section(props){
    return(
      <View style={[props.style,{flex:props?.flex}]}>
        <View style={[localStyles.container,{height:50}]}>
          <Text style={localStyles.sectionText}>{props.title}</Text>
        </View>
          <Animated.View style={[localStyles.container,{ paddingHorizontal:0, flex: props?.flex, height: props.height }]} >
          {props.children}
          </Animated.View>
      </View>
    );
  }

  function ListItem(props){
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
        <Pressable style={[localStyles.fcontainer,{marginRight:-2}]} onPress={onPress}>
          <Text style={localStyles.subText}>{props.title}</Text>
        </Pressable>
        {open &&
          <Animated.View style={[localStyles.fcontainer,{ height: openAnim, marginRight:-2 }]} >
          {props.children}
          </Animated.View>
        }
      </View>
    );
  }

  const localStyles = {
    fcontainer: {
      borderWidth:2,
      flex:1,
      marginTop:-2,
      marginLeft:-2,
      fontSize:30,
      paddingHorizontal:20,
      justifyContent:'center',
    },
    container: {
      borderWidth:2,
      margin:0,
      marginTop:-2,
      marginLeft:-2,
      paddingHorizontal:20,
      justifyContent:'center',
    },
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
      flex:1
    },
  }