import { Auto, Col, getNameOf, Loading, MyText, NewButton, Popup, ProfileImage, Row } from '../../components/Components';

import { child, get, getDatabase, onValue, push, ref, set } from "firebase/database";

import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, Linking, Platform, Pressable, ScrollView, View } from 'react-native';
import styles from '../../styles/profileDesign';

import { useSelector } from 'react-redux';
import { FirebaseContext } from '../../firebase/firebase';

import axios from 'axios';
import { useWindowDimensions } from 'react-native';
import { config } from '../../firebase/authConfig';
import { SaleListItem } from '../sale/SaleListItem';
import { Map } from './Edit';
import GoBack from '../../components/Goback';
import { useHover } from 'react-native-web-hooks';

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
    <ScrollView style={{paddingRight:25,paddingBottom:25,backgroundColor:bgColor,flex:1}}>
      <Auto style={{flex:'none'}}>
        <GoBack style={{marginLeft:20}}/>
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
            >
              <MyText style={localStyles.text}>Pajtásaim: {followers?.length}</MyText>
            </Popup>
          </Row>
        </View>
        { !myProfile && <Col>
            <NewButton onPress={() => navigation.push('uzenetek',{selected:uid})} 
              title="Üzenetküldés" color='#ffde7e'
               style={[localStyles.containerNoBg, {flex:width <= 900 ? 'none' : 1,alignItems:'center' ,shadowOpacity:0.5}]}
            />
            <NewButton onPress={follow} 
              title={profile.name + (followButtonState ? ' már a pajtásom!' : ' még nem a pajtásom')} color='#ffde7e'
              style={[localStyles.containerNoBg, {flex:width <= 900 ? 'none' : 1,alignItems:'center',shadowOpacity:0.5}]}
            />
        </Col>}
            

        {myProfile && 
          <NewButton onPress={() => navigation.push('profil-szerkesztese')}
          title="Módosítás" textStyle={{fontSize:30}}
          style={[localStyles.containerNoBg, {flex:width <= 900 ? 'none' : 1,alignItems:'center',shadowOpacity:0.5,flex:1,height:'none'}]}
              />
          
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

          <Section title="Bizniszeim" flex={1}>
              <View style={{marginLeft:20}}>
                {profile.profession && profile.profession.map((prof,i) =>
                  <Buziness prof={prof} uid={uid} index={i} />
                )}
              </View>
          </Section>
        </View>
          {!!saleList.length && 
          <Section title="Cserebere" flex={width <= 900 ? 'none' : 2}>
            <ScrollView style={[styles.label,{marginLeft:5}]}>
                {saleList.map(el=>{
                  return <SaleListItem key={el.id} data={el}/>
                })}
            </ScrollView>
          </Section>}
      </Auto>
    </ScrollView>
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

  const Buziness = ({prof,uid,index}) => {
    const Href = useRef(null);
    const db = getDatabase()
    const myuid = useSelector((state) => state.user.uid)
    const rate = prof?.rate ? Object.keys(prof?.rate) : []
    const [iRated, setIRated] = useState(rate.includes(myuid));
    const allRates = (rate.filter(r=>r!=myuid)?.length+iRated ? 1 : 0);

    const isHovered = useHover(ref);
    
    const handlePress=()=>{
      console.log("users/"+uid+"/data/profession/"+index+"/rate");
      set(ref(db,"users/"+uid+"/data/profession/"+index+"/rate/"+myuid),iRated ? null : true).then(res=>{
        console.log(res);
        setIRated(!iRated);
      })
    }
    return (
      <View 
      style={[
        styles.buziness,
        {backgroundColor:`hsl(52, 100%, ${100-(allRates*10)}%)`},
        isHovered && {backgroundColor:'#faffcc'}
      ]} ref={Href}>

        <Popup style={{alignItems:'center',justifyContent:"center",margin:10}} 
          popup={<View style={[styles.popup,{marginTop:0,marginRight:50}]}><MyText>{allRates} ember ajánlja</MyText></View>}>
          <MyText title>{allRates}</MyText>
        </Popup>
        <View style={{flex:1}}>
          <MyText title>{prof.name}</MyText>
          <MyText>{prof.description}</MyText>
        </View>
        {uid != myuid && 
        <NewButton title={iRated ? "Ajánlottam" :"Ajánlom"} style={{padding:10,borderRadius:8}} onPress={handlePress}/>}
    </View>
    )
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
    containerNoBg: {
      marginTop: 25,
      marginLeft: 25,
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