import { Auto, Col, getNameOf, Loading, MyText, NewButton, Popup, ProfileImage, Row } from '../../components/Components';

import { child, get, onValue, ref, set } from "firebase/database";

import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect } from 'react';
import { Animated, Linking, Platform, Pressable, ScrollView, View } from 'react-native';
import styles from '../../styles/profileDesign';

import { useSelector } from 'react-redux';
import { FirebaseContext } from '../../firebase/firebase';

import axios from 'axios';
import { useWindowDimensions } from 'react-native';
import { config } from '../../firebase/authConfig';
import { SaleListItem } from '../sale/SaleListItem';
import { Map } from './Edit';

const bgColor = '#FDEEA2'//'#ffd581dd'

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
          setFollowers([])
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
    <View style={{paddingRight:25,paddingBottom:25,backgroundColor:bgColor,flex:1}}>
      <Auto style={{height:'none',flex:'none'}}>
        <View style={[localStyles.container,{width:150,paddingLeft:0}]}>
          <ProfileImage uid={uid} size={150} style={[{paddingHorizontal:0,background:'none',borderRadius:8}]}/>
        </View>
        <View style={{flex:width <= 900 ? 'none' : 2,zIndex:10,elevation: 10}}>
          <View style={localStyles.fcontainer}><MyText style={localStyles.text}>{profile.name}</MyText></View>
          <Row style={{flex:width <= 900 ? 'none' : 1}}>
            <View style={localStyles.fcontainer}><MyText style={localStyles.text}>{profile.username}</MyText></View>
            <Popup style={localStyles.fcontainer}
            popup={<ScrollView style={styles.popup} contentContainerStyle={[{backgroundColor:'white'}]}>
              {followers.map((f,i)=><Row key={i} style={{margin:5,alignItems:'center'}}>
                  <ProfileImage uid={f.uid} size={40} style={[{marginRight:5,borderRadius:8}]}/>
                  <MyText style={{fontSize:18}}>{f.name}</MyText>
              </Row>
              )}
            </ScrollView>}
            ><MyText style={localStyles.text}>Pajtásaim: {followers?.length}</MyText></Popup>
          </Row>
        </View>
        { !myProfile && <Col>
            <Pressable onPress={() => navigation.navigate('uzenetek',{selected:uid})}
             style={[localStyles.container, {flex:width <= 900 ? 'none' : 1,alignItems:'center',backgroundColor:'#ffde7e',shadowOpacity:0.5}]}>
                <MyText style={{fontSize:28}}>Üzenetküldés</MyText>
            </Pressable>  
            <Pressable onPress={follow}
             style={[localStyles.container, {flex:width <= 900 ? 'none' : 1,alignItems:'center',backgroundColor:'#ffde7e',shadowOpacity:0.5}]}>
                <MyText style={{fontSize:28}}>{profile.name + (followButtonState ? ' már a pajtásom!' : ' még nem a pajtásom')} </MyText>
            </Pressable> 
        </Col>}
            

          {myProfile && 
            <Pressable onPress={() => navigation.navigate('profil-szerkesztese')}
             style={[localStyles.container, {flex:width <= 900 ? 'none' : 1,alignItems:'center',backgroundColor:'#ffd048',shadowOffset:{width:-2,height:4}}]}>
                <MyText style={{fontSize:28,color:'black'}}>Módosítás</MyText>
            </Pressable>  
            
            }

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
  else return (<View style={{backgroundColor:bgColor,flex:1}}><Loading color={"#f5d142"}/></View>)
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
      marginTop: 25,
      marginLeft: 25,
      backgroundColor:'white',
      fontSize:30,
      paddingHorizontal:20,
      justifyContent:'center', 
      zIndex:'auto', 
      shadowColor: '#171717',
      shadowOffset: {width: 2, height: 4},
      shadowOpacity: 0.1,
      shadowRadius: 10,
      borderRadius:8
    },
    container: {
      marginTop: 25,
      marginLeft: 25,
      backgroundColor:'white',
      paddingHorizontal:20,
      justifyContent:'center',
      zIndex:'auto' ,
      shadowColor: '#171717',
      shadowOffset: {width: 2, height: 4},
      shadowOpacity: 0.1,
      shadowRadius: 10,
      borderRadius:8
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
      fontSize:26,

    },
    map: {
      flex:1
    },
  }

  export default Profile