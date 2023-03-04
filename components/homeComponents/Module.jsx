
import { ImageBackground, ScrollView, TouchableOpacity, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { MyText, ProfileImage, Row } from '../../components/Components';
import homeDesign from '../../styles/homeDesign';

import { useSelector } from 'react-redux';

import { useWindowDimensions } from 'react-native'
import { TextFor } from '../../lib/textService/textService';

function Module(props) {
    const { data } = props;
    const { width } = useWindowDimensions();
    const number = useSelector((state) => state.user)[props?.number]?.length || 0
    const navigation = useNavigation();
    const onPress = (to) => {
      navigation.navigate(to, props.with);
    }
    return (
        <View style={[homeDesign.moduleContainer,width>900 && {flex:1}]}>
            <Row style={{paddingLeft:20,paddingBottom:10}}>
              <TouchableOpacity onPress={()=>onPress(props.link)}>
                  <TextFor style={{ fontWeight: 'bold', fontSize:30 }} fixed text={props.title}/>
              </TouchableOpacity>
            </Row>
          <ScrollView horizontal style={{height:170}} contentContainerStyle={homeDesign.moduleScrollView}>
            {data?.map((one,ind)=>{
              const date = new Date(one.date)
              return (
                  <TouchableOpacity key={ind+'one'} style={homeDesign.module} onPress={()=>navigation.push(props.link,{id:one.id})}>
                      <ImageBackground source={{uri:one.image}} resizeMode="cover" style={{height:100}}>
                        <View style={{alignSelf: 'flex-start'}}>
                          <MyText style={{margin:10,backgroundColor:'#cfc',padding:5}}>{one.category}</MyText>
                        </View>
                      </ImageBackground>
                      <MyText style={[homeDesign.moduleText,{fontWeight:'bold'}]}>{one.title}</MyText>
                      <MyText style={homeDesign.moduleText}>{one.place}</MyText>
                      {one.date && <MyText style={homeDesign.moduleText}>{date.getFullYear()+' / '+(date.getMonth()+1)+' / '+date.getDate()}</MyText>}
                  </TouchableOpacity>
              )
            })}

          </ScrollView>
        </View>
    );
    
  }


export default Module