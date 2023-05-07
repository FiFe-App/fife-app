
import { Animated, Easing, ImageBackground, ScrollView, TouchableOpacity, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import homeDesign from '../../styles/homeDesign';
import { MyText, Row } from '../Components';


import { useWindowDimensions } from 'react-native';
import { TextFor } from '../../lib/textService/textService';
import { useEffect, useRef } from 'react';

function Module(props) {
    const { data } = props;
    const { width } = useWindowDimensions();
    const navigation = useNavigation();
    const onPress = (to) => {
      navigation.push(to, props.with);
    }
    return (
        <View style={[homeDesign.moduleContainer,width>900 && {flex:1}]}>
            <Row style={{paddingLeft:20,paddingBottom:10}}>
              <TouchableOpacity onPress={()=>onPress(props.link)}>
                  <TextFor style={{ fontWeight: 'bold', fontSize:30 }} fixed text={props.title}/>
              </TouchableOpacity>
            </Row>
          <ScrollView horizontal style={{height:170}} contentContainerStyle={homeDesign.moduleScrollView}>
            {data?.length ? data?.map((one,ind)=>{
              if (one)
              return (
                  <TouchableOpacity key={ind+'one'} style={homeDesign.module} onPress={()=>navigation.push(props.link,{id:one.id,data:one})}>
                      <ImageBackground imageStyle={{borderTopLeftRadius:8,borderTopRightRadius:8}} 
                      source={{uri:one.image}} resizeMode="cover" style={{height:100, width:'100%',borderRadius:8}}>
                        <View style={{alignSelf: 'flex-start'}}>
                          <MyText style={{margin:10,backgroundColor:(one?.color||'#cfc'),padding:5}}>{one.category}</MyText>
                        </View>
                      </ImageBackground>
                      <View style={{justifyContent:'flex-start',height:'50%'}}>
                        <MyText style={[homeDesign.moduleText,{fontWeight:'bold'}]}>{one.title}</MyText>
                        <MyText style={[homeDesign.moduleText,{overflow:'hidden',flex:1,borderBottomLeftRadius:8,borderBottomRightRadius:8}]}>
                        {one.text}</MyText>
                      </View>
                  </TouchableOpacity>
              )
            }) : [1,1,1]?.map((one,ind)=>{
              const date = new Date(one.date)
              return <LoadingModule ind={ind} />
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
            duration: 1000
          }),
          Animated.timing(sweepAnim, {
            toValue: 0.5,
            easing: Easing.sin,
            duration: 1000
          })
        ])).start();
      }, [sweepAnim])
      const boxInterpolation =  sweepAnim.interpolate({
        inputRange: [0.5, 1],
        outputRange:["rgb(225, 255, 213)" , "rgb(229, 250, 221)"]
      })
      return (
          <Animated.View key={ind+'one'} style={[homeDesign.module,{backgroundColor:boxInterpolation,opacity:sweepAnim,borderRadius:8}]}>
          </Animated.View>
      )
  }

export default Module