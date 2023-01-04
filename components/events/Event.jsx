import { ProfileImage, Loading, Row, Col } from '../Components'

import { ref, child, get, set, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";

import React, { useEffect } from 'react';
import { Text, Platform, View, Button, Pressable } from 'react-native';
import {styles} from '../styles'
import { global } from '../global'
import { Animated, Image, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons'
//import MapView from 'react-native-maps';
import { Dimensions } from 'react-native';


const Event = ({ navigation, route }) => {
  const [profile, setProfile] = React.useState(null);
  const [followButtonText, setFollowButtonText] = React.useState("Ajánlom");
  const [followers, setFollowers] = React.useState(null);
  const [myProfile, setMyProfile] = React.useState(true);

  navigation = useNavigation()

  const auth = getAuth();
  console.log(auth);
  var finalUid = auth.currentUser.uid;
  if (route.params != undefined) finalUid = route.params.uid;
  function follow(){
    const dbRef = ref(global.database, 'users/' + finalUid + "/likes/" + auth.currentUser.uid);
    console.log(auth.currentUser.uid)
      if (followButtonText == "Ajánlottam") {
          set(dbRef,{"owner":null});
          setFollowButtonText('Ajánlom');
      } else {
        set(dbRef, { "owner": auth.currentUser.uid });
          setFollowButtonText('Ajánlottam');
      }
      //getRecList();
      return (followButtonText == 'Ajánlom');
  }
  
  function getRecList(){
    const dbRef = ref(global.database,'users/' + finalUid + "/likes");
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
    //setMyProfile(auth.currentUser.uid == finalUid);
    //getRecList();
    /*const dbRef = ref(global.database);
    get(child(dbRef, `users/${finalUid}`)).then((snapshot) => {
      if (snapshot.exists()) {
        var data = snapshot.val();
        var allProfAb = [];
        var prof = data.profession.split('$$');
        prof.forEach(element => {
            var newprof = element.split('$');
            if (newprof[0].trim() != ''){
                allProfAb.push({title:newprof[0],description:newprof[1]});
            }
        });
        console.log(allProfAb)
        data.profession = allProfAb;
        setProfile(data);
      } else {
      }
    }).catch((error) => {
      console.error(error);
    });*/
  }, [route]);
  if (profile)
  return(
    <View>
      <Row style={{alignItems: 'center',justifyContent: "center"}}>
        <Row style={{flex:1,justifyContent: "center",alignItems: 'center'}}>
          <ProfileImage  uid={finalUid} size={50}/>
          <Text style={[styles.subTitle]}>{'profile.name'}</Text>
        </Row>
      </Row>
      <Row style={{flex:1,justifyContent: 'center'}}>
        <Text style={localStyles.text}>{'profile.username'}</Text>
        <View style={localStyles.verticleLine}/>
        <Text style={localStyles.text}>Ajánlók: {'followers'}</Text>
      </Row>
      <View style={{justifyContent: "center"}}>
          <NewButton title="Üzenetküldés"/>
      </View>

      <Section title="Elérhetőségeim">
        <Text style={[styles.label,{flex:1}]} >
            <li>Rólam: {'profile.bio'}</li>
            <li>Elérhetőségeim: @{'profile.ig_username'}</li>
        </Text>
      </Section>
      <Section title="Ehhez értek">
        <Text style={[styles.label,{flex:1}]} >
        </Text>
      </Section>

    </View>
  )
  else return (<Loading color={"#f5d142"}/>)
}

  function NewButton(props) {
    const [color, setColor] = React.useState("rgb(245, 209, 66)");
    return (
      <Pressable style={[localStyles.newButton, { background: color }]} onPress={props.onPress}>
            <Text style={{ fontWeight: 'bold', color: "black", fontSize:18 }}>{props.title}</Text>
        </Pressable>
    );
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
      paddingHorizontal: 16,
    },
    newButton:{
      borderRadius: 20,
      flex:1,
      margin:10,
      marginHorizontal: 20,
      paddingVertical:10,
      alignItems: 'center',
      justifyContent: "center",
      maxWidth: 500
    },
    verticleLine: {
      height: '100%',
      width: 1,
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
  export default Event