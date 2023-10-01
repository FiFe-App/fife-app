import { Auto, Col, getNameOf, Loading, MyText, NewButton, Popup, ProfileImage, Row } from '../../components/Components';

import { child, get, getDatabase, onValue, push, ref, set } from "firebase/database";

import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, Linking, Platform, Pressable, ScrollView, View } from 'react-native';
import styles from '../../styles/profileDesign';
import Icon from 'react-native-vector-icons/Ionicons'

import { useDispatch, useSelector } from 'react-redux';
import { FirebaseContext } from '../../firebase/firebase';

import axios from 'axios';
import { useWindowDimensions } from 'react-native';
import { config } from '../../firebase/authConfig';
import { SaleListItem } from '../sale/SaleListItem';
import { Map } from './EditOld';
import GoBack from '../../components/Goback';
import { useHover } from 'react-native-web-hooks';
import HelpModal from '../../components/help/Modal';
import BasePage from "../../components/BasePage"
import { getAuth } from 'firebase/auth';
import { setTempData } from '../../lib/userReducer';

const bgColor = '#FDEEA2'//'#ffd581dd'

const Profile = ({ navigation, route }) => {
  const {database, api} = useContext(FirebaseContext);
  const dispatch = useDispatch()
  const { width } = useWindowDimensions();
  const small = width <= 900;
  const myuid = useSelector((state) => state.user.uid)
  const tempData = useSelector((state) => state.user.tempData)
  const uid = route?.params?.uid || myuid 
  const myProfile = uid === myuid;
  
  const [profile, setProfile] = React.useState(myProfile ? tempData : null);
  const [saleList, setSaleList] = React.useState([]);
  const [followButtonState, setFollowButtonState] = React.useState(true);
  const [followers, setFollowers] = React.useState([]);
  const [mapOptions,setMapOptions] = React.useState({
    center: {
      lat: 10,
      lng: 0
    },
    zoom: 4
  })
  const [reportOpen, setReportOpen] = useState(false);
  const [reportData, setReportData] = useState({
    uid:uid,
    message:null
  });

  console.log('temp',tempData);

  const report = (data) => {
    console.log(reportData);
    console.log(getAuth())
    push(ref(database,`report/${myuid}`),reportData).then(()=>{
      setReportOpen(false);
      setReportData({
        uid:uid,
        message:''
      })
    })
  }

  const follow = async () => {
    const dbRef = ref(database, 'users/' + uid + "/likes/" + myuid);
    await set(dbRef,{"owner":followButtonState ? null : myuid});
    setFollowButtonState(!followButtonState);
  }

  useFocusEffect(
    useCallback(() => {
      if (database) {
        //hulyr vagy 
        if (!profile)
        axios.get(`users/all/${uid}`,config()).then((res) => {
          console.log('getDAta',res);
          if (res.data) {
            if (myuid == uid)
              dispatch(setTempData(res.data))
            
            var data = res.data;
            navigation.setOptions({ title: 'Profil: '+data.name })

            setProfile(data);
          } else {
            if (myuid == uid)
              navigation.push('profil-szerkesztese')
          }
        }).catch((error) => {
          console.error('getDataError',error);
          if (myuid == uid)
              navigation.push('profil-szerkesztese')
          setProfile({})
        });
        const likeRef = ref(database,'users/' + uid + "/likes");
        onValue(likeRef, (snapshot) => {
          const all = snapshot.val() || [];
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
      }).catch(err=>{
        if (err?.response?.data == 'Token expired') {
          console.log('Token expired');
          api.logout();
          return
        }
      })
    }, [uid])
  );

  if (profile)
  return(
    <>
    <meta name="title" content={profile.username}/>
    <BasePage full >
      <Auto style={{flex:'none'}}>
        <GoBack style={{marginLeft:20}}/>
        <View style={[localStyles.container,{width:150,paddingLeft:0,marginLeft:small?5:25,alignSelf:'center'}]}>
          <ProfileImage modal uid={uid} size={150} style={[{paddingHorizontal:0,background:'none',borderRadius:8}]}/>
        </View>
        <View style={{flex:width <= 900 ? 'none' : 1,zIndex:10,elevation: 10}}>
          <View style={[localStyles.fcontainer,{marginLeft:small?5:25}]}><MyText style={localStyles.text}>{profile.name} <MyText light>{profile?.title}</MyText></MyText></View>
          <Row style={{flex:width <= 900 ? 'none' : 1}}>
            {profile.username && <View style={[localStyles.fcontainer,{marginLeft:small?5:25}]}><MyText style={localStyles.text}>{profile.username}</MyText></View>}
            <Popup style={[localStyles.fcontainer,{marginLeft:small?5:25}]}
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
        { !myProfile && <Auto breakPoint={500}>
        <Col style={{flex:small?3:1}}>
            <NewButton onPress={() => navigation.push('uzenetek',{uid})} 
              title="Üzenetküldés" color='#ffde7e'
               style={[localStyles.containerNoBg, {flex:width <= 900 ? 'none' : 1,alignItems:'center' ,shadowOpacity:0.5,marginLeft:small?5:25}]}
            />
            <NewButton onPress={follow} 
              title={(followButtonState ? 'Már a pajtásom ' : 'Legyen a pajtásom ')+profile.name} color={!followButtonState ? '#ffde7e' : '#fff6dc'}
              style={[localStyles.containerNoBg, {flex:width <= 900 ? 'none' : 1,alignItems:'center',shadowOpacity:0.5,marginLeft:small?5:25}]}
            />
        </Col>
        
        <NewButton onPress={()=>setReportOpen(true)} 
              title={<Icon name='alert-circle-outline' size={50} />} color={'#ffde7e'}
              style={[localStyles.containerNoBg, {flex:width <= 900 ? 'none' : 1,alignItems:'center',shadowOpacity:0.5,flex:1,height:'80%',maxWidth:small?'none':100,marginLeft:small?5:25}]}
            />
        </Auto>}
            

        {myProfile && 
          <NewButton onPress={() => navigation.push('profil-szerkesztese')}
          title="Módosítás" textStyle={{fontSize:30}}
          style={[localStyles.containerNoBg, {flex:width <= 900 ? 'none' : 1,alignItems:'center',shadowOpacity:0.5,flex:1,height:'none',marginLeft:small?5:25}]}
              />
          
          }

      </Auto>
      <Auto style={{flex:1,zIndex:-1,elevation: -1}}>
        <View style={{flex:width <= 900 ? 'none' : 1}}>
          
          <Section title="Helyzetem" flex={1}>
            {profile.page?.location?.length ? (
            (Platform.OS !== 'web') ? <MapView style={{flex:width <= 900 ? 'none' : 1}} />
            : <Map data={profile.page}/>)
            : <View style={{justifyContent:'center',alignItems:'center'}}>
              <MyText style={localStyles.subText}>Nincs megadva helyzeted</MyText>
            </View>
            }
          </Section>
        </View>
        <View style={{flex:(width <= 900 ? 'none' : 2)}}>

          <Section title="Bizniszeim" flex={1}>
              <ScrollView style={{marginLeft:small?5:20}}>
                {profile.page?.buziness && profile.page.buziness.map((prof,i,arr) =>
                  <View key={i+'prof'} >
                    <Buziness prof={prof} uid={uid} index={i} />
                    {arr.length <= i && <View style={{width:'100%',height:2,backgroundColor:'#dddddd'}} />}
                  </View>

                )}
              </ScrollView>
          </Section>
        </View>
          {!!saleList.length && 
          <Section title="Cserebere" flex={width <= 900 ? 'none' : 2}>
            <ScrollView style={[styles.label,{marginLeft:5}]}>
                {saleList.map(el=>{
                  return <SaleListItem key={el._id} data={el}/>
                })}
            </ScrollView>
          </Section>}
      </Auto>
    </BasePage>
      <HelpModal 
        title="Valami nem okés?"
        text={`Ha ${profile.name} nem az irányelveinknek megfelelően viselkedett veled, vagy a profilja kifogásolható, fejtsd ki, hogy mi történt vagy mi nem felel meg a profiljában. Majd a JELENTÉS gombra kattintva elküldheted nekünk a panaszod.`}
        actions={[
          {title:'mégse',onPress:()=>setReportOpen(false)},
          {title:'jelent',onPress:report,color:'#ff462b'}]}
        open={reportOpen}
        setOpen={setReportOpen}
        inputs={[
          {type:'text',attribute:'message',label:null,data:reportData,setData:setReportData,style:{backgroundColor:'#fbf1e0'}}
        ]}
      /></>
  )
  else return (<View style={{backgroundColor:bgColor,flex:1}}><Loading color={"#fff"}/></View>)
}

  function Section(props){
    const { width } = useWindowDimensions();
    const small = width <= 900;
    if (props?.children)
    return(
      <View style={[props.style,localStyles.container,{flex:props?.flex,padding:small?5:20,marginLeft:small?5:25}]}>
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
    const { width } = useWindowDimensions();
    const small = width < 500;
    const Href = useRef(null);
    const db = getDatabase()
    const myuid = useSelector((state) => state.user.uid)
    const rate = prof?.rate ? Object.keys(prof?.rate) : []
    const [iRated, setIRated] = useState(rate.includes(myuid));
    const allRates = (rate.filter(r=>r!=myuid)?.length+iRated ? 1 : 0);

    const isHovered = useHover(ref);
    
    const handlePress=()=>{
      
      set(ref(db,"users/"+uid+"/data/profession/"+index+"/rate/"+myuid),iRated ? null : true).then(res=>{
        setIRated(!iRated);
      })
    }
    if (prof)
    return (
      <Auto 
      breakPoint={500}
      style={[
        styles.buziness,
        {backgroundColor:`hsl(52, 100%, ${100-(allRates*10)}%)`,
        },
        isHovered && {backgroundColor:'#faffcc'}
      ]} ref={Href}>
        <View style={{flex:small?'none':3,order:small?1:0}} key={index+'prof_title'}>
          <MyText title>{prof.name}</MyText>
          <MyText>{prof.description}</MyText>
        </View>
        <Row style={{justifyContent:'center'}} key={index+'prof_number'}
        breakPoint={500}>
          <Popup style={{alignItems:'center',justifyContent:"center",margin:10}} 
            popup={<View style={[styles.popup,{marginTop:0,marginRight:small?5:50}]}><MyText>{allRates} ember ajánlja</MyText></View>}>
            <MyText title>{allRates}</MyText>
          </Popup>
          {uid != myuid && 
          <NewButton title={iRated ? "Ajánlottam" :"Ajánlom"} style={{padding:10,borderRadius:8,alignSelf:'center'}} onPress={handlePress}/>}
        </Row>
      </Auto>
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