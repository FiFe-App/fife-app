
import { ImageBackground, ScrollView, TouchableOpacity, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import homeDesign from '../../styles/homeDesign';
import { MyText, Row } from '../Components';


import { useWindowDimensions } from 'react-native';
import { TextFor } from '../../lib/textService/textService';

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
              const date = new Date(one.date)
              return (
                  <TouchableOpacity key={ind+'one'} style={homeDesign.module} onPress={()=>navigation.push(props.link,{id:one.id})}>
                      <ImageBackground source={{uri:one.image}} resizeMode="cover" style={{height:100, width:'100%',}}>
                        <View style={{alignSelf: 'flex-start'}}>
                          <MyText style={{margin:10,backgroundColor:(one?.color||'#cfc'),padding:5}}>{one.category}</MyText>
                        </View>
                      </ImageBackground>
                      <View style={{justifyContent:'flex-start',height:'50%'}}>
                        <MyText style={[homeDesign.moduleText,{fontWeight:'bold'}]}>{one.title}</MyText>
                        <MyText style={[homeDesign.moduleText,{overflow:'hidden',flex:1}]}>{one.place}</MyText>
                      </View>
                  </TouchableOpacity>
              )
            }) : [1,1,1]?.map((one,ind)=>{
              const date = new Date(one.date)
              return (
                  <TouchableOpacity key={ind+'one'} style={[homeDesign.module,{backgroundColor:'#ffffff33'}]}>
                  </TouchableOpacity>
              )
            })
            }

          </ScrollView>
        </View>
    );
    
  }


export default Module