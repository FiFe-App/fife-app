
import { Animated, Easing, ImageBackground, ScrollView, TouchableOpacity, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import homeDesign from '../../styles/homeDesign';
import { MyText, Row, getUri } from '../Components';


import { useEffect, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { TouchableRipple } from 'react-native-paper';
import { categories } from '../../lib/categories';
import { TextFor } from '../../lib/textService/textService';

function Module(props) {
    const { title, link, list, params, data, id } = props?.data || {};
    const { width } = useWindowDimensions();
    const navigation = useNavigation();
    const onPress = (to) => {
      navigation.push(to, params);
    }

    const [images, setImages] = useState({});

    useEffect(() => {
      let resList
      if (data?.length)
      {
        (async ()=>{
        resList = await Promise.all(data.map( async (el,i)=> {
          let image
          try {
           image = el?.image || await getUri(id+'/'+el._id+'/'+0)
          } catch (error) {
            if (el?.author)
              image = await getUri(`profiles/${el.author}/profile.jpg`)
            else {
              try {
                image = require('../../assets/icons/mapIcons/'+(Number(el.category)+1)+'.png')
              } catch (error) {
                
              }
            }
          }
          return image
        }))
        setImages(resList)
      })()
}
    }, [data]);

    if (!data?.length && title) return null
    return (
        <View style={[homeDesign.moduleContainer,width>900 && {flex:1}]}>
            <Row style={{paddingLeft:20,paddingBottom:10}}>
            { data?.length ?
              <TouchableOpacity onPress={()=>onPress(link)}>
                 <MyText style={{ fontWeight: 'bold', fontSize:width>900?30:20 }}>{title}</MyText>
                 {false && <TextFor style={{ fontWeight: 'bold', fontSize:width>900?30:20 }} fixed text={title}/>}
              </TouchableOpacity>:
              <LoadingModule ind={1} flat />}
            </Row>
          {<ScrollView horizontal style={{height:170}} contentContainerStyle={homeDesign.moduleScrollView}>
            {data?.length ? data?.map((one,ind)=>{
            
              if (one){
                const category = one.category?.length ? {name:one.category} :  categories?.[id]?.[(id=='places'?one.category-1:one.category)]
                return (
                  <TouchableRipple key={ind+'one'} style={homeDesign.module} onPress={()=>{
                    navigation.push(link,{id:one._id})
                  }}>
                      <><ImageBackground imageStyle={{borderTopLeftRadius:8,borderTopRightRadius:8}} 
                      source={{uri:images?.[ind]}} resizeMode="cover" style={{height:100, width:'100%',borderRadius:8}}>
                        <View style={{alignSelf: 'flex-start'}}>
                          <MyText style={{margin:10,backgroundColor:(category?.color||one?.color||'#fff'),padding:5,borderRadius:8}}>{category?.name}</MyText>
                        </View>
                      </ImageBackground>
                      <View style={{}}>
                        <MyText style={[homeDesign.moduleText,{fontWeight:'bold'}]}>{one.title}</MyText>
                        <MyText style={[homeDesign.moduleText,{height:50,overflow:'hidden',flex:1,borderBottomLeftRadius:8,borderBottomRightRadius:8}]}>
                        {one.text}</MyText>
                      </View></>
                  </TouchableRipple>
                )
              }
            }) : 
              (
              [1,1,1]?.map((one,ind)=>{
              return <LoadingModule ind={ind} key={ind+'blank'} />
            }))
            }

          </ScrollView>
            }
        </View>
    );
    
  }

  const LoadingModule = ({ind,flat}) => {

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
        outputRange:["rgb(250, 250, 250)" , "rgb(250, 237, 204)"]
      })
      return (
          <Animated.View key={ind+'one'} style={[homeDesign.module,{backgroundColor:boxInterpolation,opacity:sweepAnim,borderRadius:8},
          flat&&{height:40,flex:'none',width:300}]}>
          </Animated.View>
      )
  }

export default Module