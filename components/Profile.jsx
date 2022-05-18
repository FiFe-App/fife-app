import {LoadImage, Loading} from './Effects'
import { ref, child, get, set, onValue } from "firebase/database";
import React, { useEffect } from 'react';
import { Text, View, Button, Pressable} from 'react-native';
import {styles} from './styles'
import {MapView} from 'react-native-maps';
import global from './global'
import Icon from 'react-native-vector-icons'

export const Profile = ({ navigation, route} ) => {
  const [profile, setProfile] = React.useState(null);
  const [followButtonText, setFollowButtonText] = React.useState("Ajánlom");
  const [followers, setFollowers] = React.useState(null);
  const [myProfile, setMyProfile] = React.useState(true);

  
    var finalUid = global.user.uid;
    if (route.params != undefined) finalUid = route.params.uid;

    

    //if (finalUid == global.user.uid)
    function follow(){
      const dbRef = ref(global.database,'users/' + finalUid + "/likes/" + global.user.uid);
        console.log(global.user.uid)
        if (followButtonText == "Ajánlottam") {
            set(dbRef,{"owner":null});
            setFollowButtonText('Ajánlom');
        } else {
            set(dbRef,{"owner":global.user.uid});
            setFollowButtonText('Ajánlottam');
        }
        getRecList();
        return (followButtonText == 'Ajánlom');
    }
    
    function getRecList(){
      const dbRef = ref(global.database,'users/' + finalUid + "/likes");
      onValue(dbRef, (snapshot) => {
        if (snapshot.exists()) {
          var size = snapshot.size;
          //if ()
          setFollowers(snapshot.size);
          if (snapshot.val()[global.user.uid] != undefined) {
            setFollowButtonText('Ajánlottam');
          }
            //snapshot.forEach((childSnapshot) => {});
        }
        else setFollowers(0);
      })
    }
    
    useEffect(() => {
      setMyProfile(global.user.uid == finalUid);
      getRecList();
      const dbRef = ref(global.database);
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
      });
    }, [route]);
    if (profile)
    return(
      <View>
        <Row style={{alignItems: 'center',justifyContent: "center"}}>
          <Row style={{flex:1,justifyContent: "center",alignItems: 'center'}}>
            <LoadImage  uid={finalUid} size={50}/>
            <Text style={[styles.subTitle]}>{profile.name}</Text>
          </Row>
        </Row>
        <Row style={{flex:1,justifyContent: 'center'}}>
          <Text style={localStyles.text}>{profile.username}</Text>
          <View style={localStyles.verticleLine}/>
          <Text style={localStyles.text}>Ajánlók: {followers}</Text>
        </Row>
        <View style={{justifyContent: "center"}}>
            { !myProfile &&
            <NewButton title={followButtonText} onPress={follow}/>
            }
            { myProfile == true &&
            <NewButton title={"Módosítás"}/>
            }
            <NewButton title="Üzenetküldés"/>
        </View>

        <Section title="Elérhetőségeim">
          <Text style={[styles.label,{flex:1}]} >
              <li>Rólam: {profile.bio}</li>
              <li>Elérhetőségeim: @{profile.ig_username}</li>
          </Text>
        </Section>
        <Section title="Ehhez értek">
          <Text style={[styles.label,{flex:1}]} >
            {profile.profession.map((prof) =><li key={prof.title}>{prof.title}, ezen belül: {prof.description}</li>)}
          </Text>
        </Section>
      </View>
    )
    else return (<Loading color={"#f5d142"}/>)
  }

  function NewButton(props) {
    const [color,setColor] = React.useState("#ffc400") ;
    const onPress = () => {
      if (props.onPress())
        setColor("#ffab00");
      else
        setColor("#ffc400");
    }
    return (
        <Pressable style={[localStyles.newButton,{background:color}]} onPress={onPress}>
            <Text style={{ fontWeight: 'bold', color: "black", fontSize:18 }}>{props.title}</Text>
        </Pressable>
    );
  }

  function Section(props){
    const [open,setOpen] = React.useState(false);
    const [icon,setIcon] = React.useState('+');
    const onPress = () => {
      setOpen(!open);
      if (icon == '+')
        setIcon('-');
      else
        setIcon('+');
    }
    return(
      <View>
        <Pressable style={localStyles.section} onPress={onPress}>
          <Text style={localStyles.sectionText}>{icon} {props.title}</Text>
        </Pressable>
        {open &&
        <View>
          {props.children}
        </View>
        }
      </View>
    );
  }

  function Row(props) {
    return (
        <View style={[props.style,{flexDirection:"row"}]}>
          {props.children}
        </View>
    );
  }

  function Col(props) {
    return (
        <View style={[props.style,{flexDirection:"column"}]}>
          {props.children}
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
      borderColor: 'black',
      borderTopWidth: 1,
      borderBottomWidth: 1,
      marginTop: -1,
      
    },
    sectionText:{
      fontWeight: 'bold',
      fontSize:18,

    }
  }