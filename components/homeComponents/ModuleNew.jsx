
import { Animated, Easing, ScrollView, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image'

import { router } from 'expo-router';
import homeDesign from '../../styles/homeDesign';
import { MyText, Row, getUri } from '../Components';


import Icon from '@expo/vector-icons/Ionicons';
import { useEffect, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { TouchableRipple } from 'react-native-paper';
import { categories } from '../../lib/categories';
import { TextFor } from '../../lib/textService/textService';
//import ImageBlurLoading from 'react-native-image-blur-loading'


function Module(props) {
    const { title, link, list, params, data, id, newLink } = props?.data || {};
    const { width } = useWindowDimensions();
    const navigation = router;
    const onPress = (to) => {
      navigation.push({pathname:to,params})
    }

    const [images, setImages] = useState({});

    useEffect(() => {
    }, [images]);

    useEffect(() => {
      let resList
      if (data?.length)
      {
        (async ()=>{
        resList = await Promise.all(data.map( async (el,i)=> {
          let image
          console.log('module',title);
          try {
           image = el?.image || await getUri(id+'/'+el._id+'/'+0)
          } catch (error) {
            console.log(title,error);
            if (el?.author)
              try{image = await getUri(`profiles/${el.author}/profile.jpg`)} catch {
                image = 'def'
            }
          }
          
          console.log('module',i,title,image);
          return image
        }))
        setImages(resList)
      })()
}
    }, [data]);

    if (!data?.length && title) return null
    return (
        <View style={[homeDesign.moduleContainer, {flex:1}]}>
            <Row style={{paddingLeft:20,paddingBottom:10}}>
            { data?.length ?
              <TouchableOpacity onPress={()=>onPress(link)}>
                 <MyText style={{ fontWeight: 'bold', fontSize:width>900?20:17 }}>{title}</MyText>
                 {false && <TextFor style={{ fontWeight: 'bold', fontSize:width>900?30:20 }} fixed text={title}/>}
              </TouchableOpacity>:
              <LoadingModule ind={1} flat />}
            </Row>
          {<ScrollView horizontal style={{}} contentContainerStyle={homeDesign.moduleScrollView}>
            {data?.length ? data?.map((one,ind)=>{
            
              if (one){
                const category = one.category?.length ? {name:one.category} :  categories?.[id]?.[(id=='places'?one.category-1:one.category)]
                return (
                  <TouchableRipple key={ind+'one'} style={homeDesign.module} onPress={()=>{
                    
                    navigation.push({ pathname: `/${link}`, params: {id:one._id} })
                  }}>
                      <>
                      <Image
                    
                      source={images?.[ind]!='def'?{uri:images?.[ind]}:require('../../assets/profile.jpeg')} resizeMode="cover" style={{height:100, width:'100%',borderTopLeftRadius:8,borderTopRightRadius:8,justifyContent: 'flex-end'}} />
                        <View style={{position:'absolute',alignSelf: 'flex-end'}}>
                          <MyText style={{margin:5,backgroundColor:(one?.color||'rgba(204, 255, 204,200)'),padding:5,borderRadius:8,fontSize:12}}>{category?.name}</MyText>
                        </View>
                      <View style={{}}>
                        <MyText 
                        numberOfLines={1} ellipsizeMode='tail' 
                        style={[homeDesign.moduleText,{fontWeight:'bold'}]}>{one.title}</MyText>
                      </View>
                      </>
                  </TouchableRipple>
                )
              }
            }) : 
              (
              [1,1,1]?.map((one,ind)=>{
              return <LoadingModule ind={ind} key={ind+'blank'} />
            }))
            } 
              {false&&<TouchableRipple key={'one'} style={[homeDesign.module,{backgroundColor:'#ffffff00',flexGrow:0,flex:undefined,width:100}]} onPress={()=>{
                    navigation.push(newLink)
                  }}>
                      <><View style={{height:100,borderRadius:8,justifyContent: 'center',alignItems:'center',backgroundColor:'#ffffff00'}}>
                          <Icon name="add-outline" color="#535353" size={70} />
                      </View>
                      <View style={{}}>
                        <MyText style={[homeDesign.moduleText,{color:'#535353',fontWeight:'bold',backgroundColor:'#ffffff00',textAlign:'center'}]}>Feltöltés</MyText>
                      </View></>
              </TouchableRipple>}

          </ScrollView>
            }
        </View>
    );
    
  }

  const LoadingModule = ({ind,flat}) => {

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
          <Animated.View key={ind+'one'} style={[homeDesign.module,{backgroundColor:boxInterpolation,opacity:sweepAnim,borderRadius:8,height:120},
          flat&&{height:20,flex:undefined,width:300}]}>
          </Animated.View>
      )
  }

export default Module