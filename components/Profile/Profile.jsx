import { ProfileImage, Loading, Row, NewButton, Auto } from '../Components'

import { ref, child, get, set, onValue } from "firebase/database";

import React, { useEffect, useContext } from 'react';
import { Text, Platform, View, Pressable, Dimensions, Linking } from 'react-native';
import {styles} from '../styles'
import { Animated, Image, Easing } from 'react-native';
import { Link, useNavigation } from '@react-navigation/native';

import { useSelector } from 'react-redux'
import { FirebaseContext } from '../../firebase/firebase';

import { AutoSizeText, ResizeTextMode } from 'react-native-auto-size-text';
import { useWindowSize } from '../../hooks/window';
import { Map } from '../profile/Edit';

const bgColor = '#ffedc9dd'

const Profile = ({ navigation, route }) => {
  const {database, app, auth} = useContext(FirebaseContext);
  const width = useWindowSize().width;
  const myuid = useSelector((state) => state.user.uid)
  const uid = route?.params?.uid || myuid 
  
  const [profile, setProfile] = React.useState(null);
  const [followButtonState, setFollowButtonState] = React.useState(true);
  const [followers, setFollowers] = React.useState([]);
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
    if (followButtonState == true) {
          set(dbRef,{"owner":null});
          setFollowButtonState(false);
      } else {
        set(dbRef, { "owner": auth.currentUser.uid });
          setFollowButtonState(true);
      }
      getRecList();
  }

  useEffect(() => {
    console.log(Object.keys(followers));
  }, [followers]);
  
  function getRecList(){
    const dbRef = ref(database,'users/' + uid + "/likes");
    onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const all = snapshot.val();
        setFollowers(Object.keys(all));
        if (all[auth.currentUser.uid] != undefined) {
          setFollowButtonState(true);
        }
      }
      //else setFollowers([]);
    })
  }
  
  useEffect(() => {
    if (database) {
      setMyProfile(myuid == uid);
      getRecList();
      const dbRef = ref(database);
      get(child(dbRef, `users/${uid}/data`)).then((snapshot) => {
        if (snapshot.exists()) {
          var data = snapshot.val();
          setProfile(data);
          console.log(data);
        } else {
          navigation.push('profil-szerkesztese')
        }
      }).catch((error) => {
        console.error(error);
      });
    }
  }, [database,uid]);
  if (profile)
  return(
    <View style={{marginRight:-4,backgroundColor:bgColor,flex:1}}>
      <Auto style={{height:'none',flex:'none'}}>
        <View style={{alignItems:'center'}}>
          <ProfileImage uid={uid} size={150} style={[localStyles.container,{paddingHorizontal:0}]}/>
        </View>
        <View style={{flex:width <= 900 ? 'none' : 2}}>
          <View style={localStyles.fcontainer}><Text style={localStyles.text}>{profile.name}</Text></View>
          <Row style={{flex:width <= 900 ? 'none' : 1}}>
            <View style={localStyles.fcontainer}><Text style={localStyles.text}>{profile.username}</Text></View>
            <View style={localStyles.fcontainer}><Text style={localStyles.text}>Barátok: {followers?.length}</Text></View>
          </Row>
        </View>
        <View style={[localStyles.container,{flex:width <= 900 ? 'none' : 1}]}>
            { !myProfile && <>
            <NewButton title="Üzenetküldés" onPress={() => navigation.navigate('uzenetek',{selected:uid})}/>
            <NewButton title={followButtonState ? 'Ő a barátom!' : 'Legyünk barátok!'} onPress={follow}/>
            </>
            }
          {myProfile &&
            <NewButton title={"Módosítás"} onPress={() => navigation.navigate('profil-szerkesztese')} />
            }

        </View>
      </Auto>
      <Auto style={{flex:1}}>
        <View style={{flex:width <= 900 ? 'none' : 1}}>
          <Section title="Rólam">
            <Text style={localStyles.subText}>{profile.bio}</Text>
          </Section>
          
          <Section title="Helyzetem" flex={width <= 900 ? 'none' : 1}>
            {profile.location ? (
            (Platform.OS !== 'web') ? <MapView style={localStyles.map} />
            : <Map data={profile}/>)
            : <View style={{justifyContent:'center',alignItems:'center'}}>
              <Text style={localStyles.subText}>Nincs megadva helyzeted</Text>
            </View>
            }
          </Section>
        </View>
        <Section title="Ehhez értek" style={{flex:width <= 900 ? 'none' : 1}} flex={width <= 900 ? 'none' : 2}>
            <View style={{marginLeft:20}}>
              {profile.profession && profile.profession.map((prof,index) =>
                <ListItem title={prof.name} key={"prof"+index}>
                  <Text>{prof.description}</Text>
                </ListItem>
              )}
            </View>
        </Section>
        <Section title="Elérhetőségeim" flex={width <= 900 ? 'none' : 2}>
          <View style={[styles.label]}>
            {profile.links && profile.links.map((prof,index) =>
              <ListItem title={prof.name} key={"prof"+index}>
                <Pressable onPress={()=>Linking.openURL(prof.description)}>
                  <Text style={{color:'blue'}}>{prof.description}</Text>
                </Pressable>
              </ListItem>
            )}
          </View>
        </Section>
      </Auto>
    </View>
  )
  else return (<Loading color={"#f5d142"}/>)
}

  function Section(props){
    return(
      <View style={[props.style,localStyles.container,{flex:props?.flex,padding:20}]}>
        <View style={[{height:50}]}>
          <Text style={localStyles.sectionText}>{props.title}</Text>
        </View>
          <Animated.View style={[{ paddingHorizontal:0, flex: props?.flex, height: props.height }]} >
          {props.children}
          </Animated.View>
      </View>
    );
  }

  function ListItem(props){

    return(
      <View style={{marginTop:10}}>
          <Text style={localStyles.subText}><Text style={{fontWeight:'bold'}}>{props.title+' '}</Text>{props.children}</Text>
          
      </View>
    );
  }

  const localStyles = {
    fcontainer: {
      flex:1,
      marginTop: 5,
      marginLeft: 5,
      backgroundColor:'white',
      fontSize:30,
      paddingHorizontal:20,
      justifyContent:'center',
    },
    container: {
      marginTop: 5,
      marginLeft: 5,
      backgroundColor:'white',
      paddingHorizontal:20,
      justifyContent:'center',
    },
    text:{
      fontWeight: 'bold',
      color: "black",
      fontSize:25,
      paddingVertical: 8,
    },
    subText: {
      fontSize: 20
    },
    verticleLine: {
      width: 1,
      backgroundColor: '#909090',
    },
    horizontalLine: {
      height: 1,
      backgroundColor: '#909090',
    },
    section:{
      height: 50,
      justifyContent: 'center',
      paddingHorizontal:20,
      backgroundColor: 'rgb(245, 209, 66)',
      borderColor: bgColor,
      marginTop: 5,
      marginLeft: 5,
      
    },
    sectionText:{
      fontWeight: 'bold',
      fontSize:22,

    },
    map: {
      flex:1
    },
  }

  export default Profile