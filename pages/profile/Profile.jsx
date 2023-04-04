import { Auto, Col, getNameOf, Loading, MyText, NewButton, Popup, ProfileImage, Row } from '../../components/Components';

import { child, get, onValue, ref, set } from "firebase/database";

import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect } from 'react';
import { Animated, Linking, Platform, Pressable, ScrollView, View } from 'react-native';
import { styles } from '../../styles/styles';

import { useSelector } from 'react-redux';
import { FirebaseContext } from '../../firebase/firebase';

import axios from 'axios';
import { useWindowDimensions } from 'react-native';
import { config } from '../../firebase/authConfig';
import { SaleListItem } from '../sale/SaleListItem';
import { Map } from './Edit';

const bgColor = '#fffcf7'//'#ffd581dd'

const Profile = ({ navigation, route }) => {
  const {database, app, auth} = useContext(FirebaseContext);
  const { width } = useWindowDimensions();
  const myuid = useSelector((state) => state.user.uid)
  const uid = route?.params?.uid || myuid 
  
  const [profile, setProfile] = React.useState(null);
  const [saleList, setSaleList] = React.useState([]);
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

  const follow = async () => {
    const dbRef = ref(database, 'users/' + uid + "/likes/" + myuid);
    await set(dbRef,{"owner":followButtonState ? null : myuid});
    setFollowButtonState(!followButtonState);
  }

  const getRecList = () => {
    const dbRef = ref(database,'users/' + uid + "/likes");
    onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const all = snapshot.val();
        console.log('all',Object.keys(all));
        Object.keys(all).map(f=>{
          setFollowers(async old=>[...old,{uid:f,name:await getNameOf(f)}])
        })
        //setFollowers(Object.keys(all) || []);
        setFollowButtonState(Object.keys(all).includes(myuid));
      }
    })
  }
  useEffect(() => {
    console.log('FFFF',followers);
  }, [followers]);
  
  useFocusEffect(
    useCallback(() => {
      console.log('loaded');
      if (database) {
        setMyProfile(myuid == uid);
        //hulyr vagy 
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
        const likeRef = ref(database,'users/' + uid + "/likes");
        onValue(likeRef, (snapshot) => {
          const all = snapshot.val() || [];
          console.log('all',Object.keys(all));
          Object.keys(all).map(async f=>{
            const name = await getNameOf(f);
            setFollowers(old=>[...old,{uid:f,name}])
          })
          setFollowButtonState(Object.keys(all).includes(myuid));
        })
      }
      axios.get('/sale',{...config(),params: {
        author: uid,
        category: -1
      }}).then(res=>{
        setSaleList(res.data)
      }).catch(err=>{console.log('sale',err)})
    }, [uid])
  );
  
  if (profile)
  return(
    <View style={{marginRight:-4,backgroundColor:bgColor,flex:1}}>
      <Auto style={{height:'none',flex:'none'}}>
        <View style={{alignItems:'center'}}>
          <ProfileImage uid={uid} size={150} style={[localStyles.container,{paddingHorizontal:0}]}/>
        </View>
        <View style={{flex:width <= 900 ? 'none' : 2,zIndex:10,elevation: 10}}>
          <View style={localStyles.fcontainer}><MyText style={localStyles.text}>{profile.name}</MyText></View>
          <Row style={{flex:width <= 900 ? 'none' : 1}}>
            <View style={localStyles.fcontainer}><MyText style={localStyles.text}>{profile.username}</MyText></View>
            <Popup style={localStyles.fcontainer}
            popup={<ScrollView style={{marginTop:200,zIndex:100,elevation: 100,maxHeight:200}} contentContainerStyle={[localStyles.fcontainer]}>
              {followers.map((f,i)=><Row key={i}>
                <Col>
                  <MyText>{f.name}</MyText>
                  <ProfileImage uid={f.uid} size={40} style={[localStyles.container,{paddingHorizontal:0}]}/>
                </Col> 
              </Row>
              )}
            </ScrollView>}
            ><MyText style={localStyles.text}>Pajtásaim: {followers?.length}</MyText></Popup>
          </Row>
        </View>
        <View style={[localStyles.container,{flex:width <= 900 ? 'none' : 1,zIndex:'auto',elevation: 'auto'}]}>
            { !myProfile && <>
            <NewButton title="Üzenetküldés" onPress={() => navigation.navigate('uzenetek',{selected:uid})}/>
            <NewButton title={profile.name + (followButtonState ? ' már a pajtásom!' : ' még nem a pajtásom')} onPress={follow}/>
            </>
            }
          {myProfile &&
            <NewButton title={"Módosítás"} onPress={() => navigation.navigate('profil-szerkesztese')} />
            }

        </View>
      </Auto>
      <Auto style={{flex:1,zIndex:-1,elevation: -1}}>
        <View style={{flex:width <= 900 ? 'none' : 1}}>
          <Section title="Rólam">
            <MyText style={localStyles.subText}>{profile.bio}</MyText>
          </Section>
          
          <Section title="Helyzetem" flex={width <= 900 ? 'none' : 1}>
            {profile.location ? (
            (Platform.OS !== 'web') ? <MapView style={localStyles.map} />
            : <Map data={profile}/>)
            : <View style={{justifyContent:'center',alignItems:'center'}}>
              <MyText style={localStyles.subText}>Nincs megadva helyzeted</MyText>
            </View>
            }
          </Section>
        </View>
        <View style={{flex:(width <= 900 ? 'none' : 2)}}>

          <Section title="Bizniszeim" >
              <View style={{marginLeft:20}}>
                {profile.profession && profile.profession.map((prof,index) =>
                  <ListItem title={prof.name} key={"prof"+index}>
                    <MyText>{prof.description}</MyText>
                  </ListItem>
                )}
              </View>
          </Section>
          <Section title="Elérhetőségeim" flex={1}>
            <View style={[styles.label]}>
              {profile.links && profile.links.map((prof,index) =>
                <ListItem title={prof.name} key={"prof"+index}>
                  <Pressable onPress={()=>Linking.openURL(prof.description)}>
                    <MyText style={{color:'blue'}}>{prof.description}</MyText>
                  </Pressable>
                </ListItem>
              )}
            </View>
          </Section>
        </View>
          {!!saleList.length && <Section title="Cserebere" style={{flex:width <= 900 ? 'none' : 1}} flex={width <= 900 ? 'none' : 2}>
            <ScrollView style={[styles.label,{marginLeft:5}]}>
                {saleList.map(el=>{
                  return <SaleListItem key={el.id} data={el}/>
                })}
            </ScrollView>
          </Section>}
      </Auto>
    </View>
  )
  else return (<Loading color={"#f5d142"}/>)
}

  function Section(props){
    return(
      <View style={[props.style,localStyles.container,{flex:props?.flex,padding:20}]}>
        <View style={[{height:50}]}>
          <MyText style={localStyles.sectionText}>{props.title}</MyText>
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
          <MyText style={localStyles.subText}><MyText style={{fontWeight:'bold'}}>{props.title+' '}</MyText>{props.children}</MyText>
          
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
      zIndex:'auto' 
    },
    container: {
      marginTop: 5,
      marginLeft: 5,
      backgroundColor:'white',
      paddingHorizontal:20,
      justifyContent:'center',
      zIndex:'auto' 
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