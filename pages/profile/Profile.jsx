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
import { listToMatrix } from '../../lib/functions';
import MapElement from '../maps/MapElementNew';
import BuzinessModal from '../../components/BuzinessModal';
import { MapContainer } from 'react-leaflet';

const bgColor = '#FDEEA2'//'#ffd581dd'

const Profile = ({ navigation, route }) => {
  const {database, api} = useContext(FirebaseContext);
  const dispatch = useDispatch()
  const { width } = useWindowDimensions();
  const small = width <= 900;
  const myuid = useSelector((state) => state.user.uid)
  const myName = useSelector((state) => state.user.name)
  const tempData = useSelector((state) => state.user.tempData)
  const uid = route?.params?.uid ||route?.params?.id || myuid 
  const myProfile = uid === myuid;
  
  const [profile, setProfile] = React.useState(myProfile ? tempData : null);
  const [saleList, setSaleList] = React.useState([]);
  const maxSaleWidth = width > 1200 ? 2 : (width < 700 ?2:4)
  const [followButtonState, setFollowButtonState] = React.useState(false);
  const [followers, setFollowers] = React.useState([]);
  const [rates, setRates] = useState([]);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportData, setReportData] = useState({
    uid:uid,
    message:null
  });


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
    if (!followButtonState) {
      const res = await axios.post('users/friend/'+uid,undefined,config())
      if (!res.data?.error)
      setFollowButtonState(!followButtonState);

    } else {
      const res = await axios.delete('users/friend/'+uid,config())
      if (!res.data?.error)
      setFollowButtonState(!followButtonState);

    }
  }

  useFocusEffect(
    useCallback(() => {
      if (database) {
        //hulyr vagy 
       // if (!profile)
        axios.get(`users/all/${uid}`,config()).then((res) => {
          console.log('getDAta',res);
          if (res.data) {
            if (myuid == uid)
              dispatch(setTempData(res.data))

              getFollowers(res.data?.friendship)
            
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

  const getFollowers = async (friends) => {



      const flls = await Promise.all(friends.map(async (e)=>{
        if (e.uid == myuid || e.uid2 == myuid) setFollowButtonState(true)

        const u = e.uid == uid ?
        e.uid2 : e.uid
        const name = await getNameOf(u)
        
        return {uid:u,name}
      }))
      console.log('flls',flls);

    setFollowers(
      flls
      )
  }

  if (profile)
  return(
    <>
    <meta name="title" content={profile.username}/>
    <GoBack breakPoint={10000} text={null} style={{backgroundColor:'#FFC372',left:0,top:0,margin:20,position:"absolute"}} color='black'/>
    <BasePage full >
      <Auto style={{flex:'none'}}>
        <View style={[localStyles.container,{width:150,paddingLeft:0,marginLeft:small?5:25,alignSelf:'center'}]}>
          <ProfileImage modal uid={uid} size={150} style={[{paddingHorizontal:0,background:'none',borderRadius:8}]}/>
        </View>
        <View style={{flex:width <= 900 ? 'none' : 1,zIndex:10,elevation: 10}}>
          <View style={[localStyles.fcontainer,{marginLeft:small?5:25}]}>
            <MyText style={localStyles.text}>{profile.name} <MyText light>{profile?.title}</MyText></MyText>
          </View>
          <Row style={{flex:width <= 900 ? 'none' : 1}}>
            {profile.username && <View style={[localStyles.fcontainer,{marginLeft:small?5:25}]}><MyText style={localStyles.text}>{profile.username}</MyText></View>}
            <Popup style={[localStyles.fcontainer,{marginLeft:small?5:25}]}
                popup={!!followers.length && <ScrollView style={styles.popup} contentContainerStyle={[{backgroundColor:'white'}]}>
                  {followers.map((f,i)=>
                    <Pressable key={i} 
                    onPress={()=>navigation.push('profil',{uid:f.uid})}
                    style={{margin:5,alignItems:'center',flexDirection:'row'}}>
                      <ProfileImage uid={f.uid} size={35} style={[{marginRight:5,borderRadius:8}]}/>
                      <MyText style={{fontSize:18}}>{f.name}</MyText>
                    </Pressable>
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
              title={(followButtonState ? 'Már a pajtásom ' : 'Legyen a pajtásom ')+profile.name} 
              color={!followButtonState ? '#ffde7e' : '#fff6dc'}
              style={[localStyles.containerNoBg, {flex:width <= 900 ? 'none' : 1,alignItems:'center',shadowOpacity:0.5,marginLeft:small?5:25}]}
            />
        </Col>
        
        <View>
          <NewButton onPress={()=>setReportOpen(true)} 
                title={<Icon name='alert-circle-outline' size={50} style={{}}/>} color={'#ffde7e'}
                style={[localStyles.containerNoBg, {flex:width <= 900 ? 'none' : 1,alignItems:'center',shadowOpacity:0.5,flex:1,height:'80%',maxWidth:small?'none':100,marginLeft:0}]}
              />

        </View>
        </Auto>}
            

        {myProfile && 
          <NewButton onPress={() => navigation.push('profil-szerkesztese')}
          title="Módosítás" textStyle={{fontSize:30}}
          style={[localStyles.containerNoBg, {flex:width <= 900 ? 'none' : 1,alignItems:'center',shadowOpacity:0.5,flex:1,height:'none',marginLeft:small?5:25}]}
              />
          
          }

      </Auto>
      <Auto style={{flex:1,zIndex:-1,elevation: -1}} breakPoint={900}>
        
        <View style={{flex:width <= 900 ? 'none' : 1}}>
          
          <Section title="Helyzetem" flex={width <= 900 ? 'none' : 2}>
            
            {profile.page?.location?.length ? (
            <MapElement style={{flex: width <= 900 ? 'none' : 1,height:300}} data={profile.page} index='1'/>)
            : <View style={{justifyContent:'center',alignItems:'center'}}>
              <MyText style={localStyles.subText}>Nincs megadva helyzeted</MyText>
            </View>
            }
          </Section>
        </View>
        <View style={{flex:(width <= 1200 ? 'none' : 2)}}>

          <Section title="Bizniszeim" flex={1}>
              <ScrollView style={{marginLeft:small?5:20}}>
                {profile.page?.buziness && profile.page.buziness.map((prof,i,arr) =>
                  <View key={i+'prof'} >
                    <Buziness prof={prof} uid={uid} index={i} arr={arr} />
                    {arr.length <= i && <View style={{width:'100%',height:2,backgroundColor:'#dddddd'}} />}
                  </View>

                )}
              </ScrollView>
          </Section>
        </View>
          {!!saleList.length && 
          <Section title="Cserebere" flex={width <= 1200 ? 'none' : 2}>
            <ScrollView style={[styles.label,{marginLeft:5}]}>
                {listToMatrix(saleList,maxSaleWidth).map((row,i)=>{
                            return (
                                <Row>
                                {row.map((el,ind,rowL)=>
                                  <SaleListItem key={el._id} data={el}/>
                                )}
                                <View style={{flex:maxSaleWidth-row.length}}/>
                                </Row>
                            )
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
          {title:'jelent',onPress:report,color:'#ff462b'}
        ]}
        open={reportOpen}
        setOpen={setReportOpen}
        inputs={[
          {type:'text-input',attribute:'message',label:null,data:reportData,setData:setReportData,style:{backgroundColor:'#fbf1e0'}}
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

  const Buziness = ({prof,uid,index,arr}) => {
    const { width } = useWindowDimensions();
    const small = width < 500;
    const Href = useRef(null);
    const db = getDatabase()
    const myuid = useSelector((state) => state.user.uid)
    const [rate,setRate] = useState([]);
    const iRated = rate?.find(e=>e==myuid);
    const allRates = (rate?.filter(r=>r!=myuid)?.length+iRated ? 1 : 0);

    const isHovered = useHover(ref);

    useEffect(() => {
      get(ref(db,"users/"+uid+"/data/profession/"+index+"/rate")).then(res=>{
        setRate(res.exists() ? Object.keys(res.val()): [])
      })
      
    }, []);
    
    const handlePress=()=>{
      
      set(ref(db,"users/"+uid+"/data/profession/"+index+"/rate/"+myuid),
        iRated ? null : true)
      .then(res=>{
        iRated ?
        setRate(rate?.filter(r=>r!=myuid))
        : setRate([...rate,myuid]) 
      })
    }

    const [buzinessModal, setBuzinessModal] = useState(null);
    const getDownToBuziness = () => {
      setBuzinessModal({
        index
      });
    }
    
    if (prof)
    return (<>
      <Auto 
      breakPoint={500}
      style={[
        styles.buziness,
        {//backgroundColor:`hsl(52, 100%, ${100-(allRates*10)}%)`,
        backgroundColor:'#ffffff'
        },
        isHovered && {backgroundColor:'#faffcc'}
      ]} ref={Href}>
        <View style={{flex:small?'none':3,order:small?1:0,flexGrow:1}} key={index+'prof_title'}>
          <MyText title>{prof.name}</MyText>
          <MyText>{prof.description}</MyText>
          <MyText>{allRates} ember ajánlja</MyText>
        </View>
        <Row style={{justifyContent:'center',alignItems:'center'}} key={index+'prof_number'}
        breakPoint={500}>
          {uid != myuid && <View> 
          <NewButton title={iRated ? "Ajánlottam" :"Ajánlom"} color={iRated?"#fff6dc":undefined} style={{padding:10,borderRadius:8,alignSelf:'center'}} onPress={handlePress}/>
          <NewButton title={"Bizniszelnék"} color="#ffffff" style={{padding:10,borderRadius:8,alignSelf:'center'}} onPress={()=>getDownToBuziness()}/>
          </View>}
        </Row>
      </Auto>
      <BuzinessModal open={buzinessModal} setOpen={setBuzinessModal} user1={myuid} user2={uid} b2={arr} />
      </>
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
      paddingHorizontal:10,
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