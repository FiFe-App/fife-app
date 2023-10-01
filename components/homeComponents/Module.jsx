
import { Animated, Easing, ImageBackground, ScrollView, TouchableOpacity, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import homeDesign from '../../styles/homeDesign';
import { MyText, ProfileBackground, ProfileImage, Row, getUri } from '../Components';


import { useWindowDimensions } from 'react-native';
import { TextFor } from '../../lib/textService/textService';
import { useContext, useEffect, useRef, useState } from 'react';
import { TouchableRipple } from 'react-native-paper';
import axios from 'axios';
import { FirebaseContext } from '../../firebase/firebase';
import { getDatabase, limitToFirst, onChildAdded, query, ref } from 'firebase/database';
import { config } from '../../firebase/authConfig';
import { categories } from '../../lib/categories';
import { getAuth } from 'firebase/auth';

function Module(props) {
    const { firebasePath, serverPath } = props;
    const { width } = useWindowDimensions();
    const { api } = useContext(FirebaseContext);
    const database = getDatabase()
    const navigation = useNavigation();
    const onPress = (to) => {
      navigation.push(to, props.params);
    }
    const [data, setData] = useState([]);
    const fn = async () => {
      let resList
      let collection = serverPath.split('/')[1]
      try {
        resList = (await axios.get(serverPath,config()))
          
      } catch (error) {
        if (error?.response?.data == 'Token expired') {
          console.log('Token expired');
          api.logout();
          return
        }
        console.log('server not reachable',error);
      }

      try {
        if (resList?.data)
        resList = await Promise.all(resList.data.map( async (el,i)=> {
          let image
          try {
           image = el?.image || await getUri(collection+'/'+el._id+'/'+0)
          } catch (error) {
            if (el?.author)
              image = await getUri(`profiles/${el.author}/profile.jpg`)
          }
          return {
            id:       el._id,
            title:    el.title,
            date:     el.date,
            image:    image,
            text:     el.description,
            category: categories?.[collection]?.[el.category]?.name || el.category,
            color:    categories?.[collection]?.[el.category]?.color || el.color
          }
        }))
        setData(resList)
      } catch (error) {

        console.log('error',error);
        setData([]) 
      }
    }
    const fn2 = async () => {
          
      try {
        console.log('fn2');
        const docsQuery = query(ref(database,firebasePath),limitToFirst(3))
        onChildAdded(docsQuery,async (childSnapshot) => {
          console.log('child',childSnapshot.val());
          setData(old=>[...old,{id:childSnapshot.key, ...childSnapshot.val()}])
        })
          
      } catch (error) {
        setData([])
        console.error(error);
      }

    }
    useEffect(() => {
      console.log('LOAD',props.link);
      if (firebasePath) 
        fn2()
      else 
        fn()
      return ()=> {
        setData([])
      }
    }, []);
    return (
        <View style={[homeDesign.moduleContainer,width>900 && {flex:1}]}>
            <Row style={{paddingLeft:20,paddingBottom:10}}>
              <TouchableOpacity onPress={()=>onPress(props.link)}>
                  <TextFor style={{ fontWeight: 'bold', fontSize:width>900?30:20 }} fixed text={props.title}/>
              </TouchableOpacity>
            </Row>
          <ScrollView horizontal style={{height:170}} contentContainerStyle={homeDesign.moduleScrollView}>
            {data?.length ? data?.map((one,ind)=>{
            
              if (one)
              return (
                  <TouchableRipple key={ind+'one'} style={homeDesign.module} onPress={()=>{
                    //console.log(props.link)
                    navigation.push(props.link,{id:one.id})
                  }}>
                      <><ImageBackground imageStyle={{borderTopLeftRadius:8,borderTopRightRadius:8}} 
                      source={{uri:one?.image}} resizeMode="cover" style={{height:100, width:'100%',borderRadius:8}}>
                        <View style={{alignSelf: 'flex-start'}}>
                          <MyText style={{margin:10,backgroundColor:(one?.color||'#fff'),padding:5,borderRadius:8}}>{one.category}</MyText>
                        </View>
                      </ImageBackground>
                      <View style={{}}>
                        <MyText style={[homeDesign.moduleText,{fontWeight:'bold'}]}>{one.title}</MyText>
                        <MyText style={[homeDesign.moduleText,{height:50,overflow:'hidden',flex:1,borderBottomLeftRadius:8,borderBottomRightRadius:8}]}>
                        {one.text}</MyText>
                      </View></>
                  </TouchableRipple>
              )
            }) : [1,1,1]?.map((one,ind)=>{
              const date = new Date(one.date)
              return <LoadingModule ind={ind} key={ind+'blank'} />
            })
            }

          </ScrollView>
        </View>
    );
    
  }

  const LoadingModule = ({ind}) => {

      const sweepAnim = useRef(new Animated.Value(0.5)).current  // Initial value for opacity: 0

      useEffect(() => {
        Animated.loop(
          Animated.sequence([
          Animated.timing(sweepAnim, {
            toValue: 1,
            easing: Easing.sin,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(sweepAnim, {
            toValue: 0.5,
            easing: Easing.sin,
            duration: 1000,
            useNativeDriver: false,
          })
        ])).start();
      }, [sweepAnim])
      const boxInterpolation =  sweepAnim.interpolate({
        inputRange: [0.5, 1],
        outputRange:["rgb(250, 250, 250)" , "rgb(241, 250, 162)"]
      })
      return (
          <Animated.View key={ind+'one'} style={[homeDesign.module,{backgroundColor:boxInterpolation,opacity:sweepAnim,borderRadius:8}]}>
          </Animated.View>
      )
  }

export default Module