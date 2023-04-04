import { useContext, useRef, useState } from 'react';

import { Pressable, SafeAreaView, TouchableOpacity, View } from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { MyText, Row } from './Components';
import { styles } from '../styles/styles';

import { useSelector } from 'react-redux';
import { FirebaseContext } from '../firebase/firebase';

import { useHover } from 'react-native-web-hooks';
import { useWindowDimensions } from 'react-native';
import { TextFor } from '../lib/textService/textService';
import { LinearGradient } from 'expo-linear-gradient';
import { OpenNav, SearchBar } from './Components';
import { Helmet } from 'react-helmet';

export function LogoTitle() {
    const {api} = useContext(FirebaseContext);
    const navigation = useNavigation();
    const route = useRoute();

    const { width } = useWindowDimensions();
    const unreadMessage = useSelector((state) => state.user.unreadMessage)
    const [open, setOpen] = useState(false);

    const logout = () => {
      console.log('logout');
      api.logout()
    }

    return (
      <LinearGradient style={{zIndex:100,elevation: 100}} colors={['#FDEEA2', "#FDEEA2"]} start={{ x: 0, y: 0 }} end={{ x: 0.5, y: 1 }} >
        <Helmet>
          <meta name="theme-color" content="#FDEEA2"/>
        </Helmet>
        <SafeAreaView>
          <OpenNav open={open} style={{width:'100%',zIndex: -10,elevation: -10}}>
            <MenuLink setOpen={setOpen} title="Főoldal" text="" color="#509955" link={"fooldal"} icon="person-outline" />
            <MenuLink setOpen={setOpen} title="profile" text="" color="#509955" link={"profil"} icon="person-outline" />
            <MenuLink setOpen={setOpen} title="messages" color="#0052ff" icon="mail-outline" link={"uzenetek"} number={unreadMessage?.length}/>
            <MenuLink setOpen={setOpen} title="sale" color="#f4e6d4" icon="shirt-outline" link={"cserebere"}/>
            <MenuLink setOpen={setOpen} title="places" color="#f4e6d4" icon="map" link={"terkep"}/>
            <MenuLink setOpen={setOpen} title="logout" text="" color="black" onPress={()=>logout()} icon="exit-outline" />
          </OpenNav>
          <View style={{flexDirection:'row',justifyContent:'space-evenly'}}>
          {navigation.canGoBack()}
            { width < 900 &&
              <Pressable onPress={()=>navigation.navigate('fooldal')} style={{justifyContent:'center',alignItems:'center',flex:1}}>
                {route.name != 'home' && <Icon name='home-outline' size={30} color="#000"/>}
              </Pressable>
            }
            <Pressable onPress={()=>navigation.navigate('fooldal')}>
              { width >  1230 && <MyText style={[styles.title,{fontFamily:'AmaticSC_700Bold'}]}>
                FiFe. <TextFor style={[styles.title,{fontFamily:'AmaticSC_700Bold'}]} text="web_title"/>
                </MyText>}
              { width <=  1230 && width > 470 && <MyText style={[styles.title,{fontFamily:'AmaticSC_700Bold'}]}>FiFe App</MyText>}
            </Pressable>
            { width >  1120 ?
            <View style={{flexDirection:'row',marginRight:20,marginBottom:5,flex:8}}>
              <SearchBar/>
              <MenuLink setOpen={setOpen} title="Főoldal" text="" color="#509955" link={"fooldal"} icon="person-outline" />
              <MenuLink setOpen={setOpen} title="profile" text="" color="#509955" link={"profil"} icon="person-outline" />
              <MenuLink setOpen={setOpen} title="messages" color="#0052ff" icon="mail-outline" link={"uzenetek"} number={unreadMessage?.length}/>
              <MenuLink setOpen={setOpen} title="sale" color="#f4e6d4" icon="shirt-outline" link={"cserebere"}/>
              <MenuLink setOpen={setOpen} title="places" color="#f4e6d4" icon="map" link={"terkep"}/>
              <MenuLink setOpen={setOpen} title="logout" text="" color="black" onPress={()=>logout()} icon="exit-outline" />
            </View>
            :
            <Row style={{flex:8}}>
              <SearchBar/>
              <TouchableOpacity onPress={()=>setOpen(!open)} style={{justifyContent:'center',width:70}}>
                {open ? <MyText style={{justifyContent:'center',textAlign:'center'}}><Icon name='caret-up-outline' size={30}/></MyText>
                      : <MyText style={{justifyContent:'center',textAlign:'center'}}><Icon name='menu-outline' size={30}/></MyText>}
              </TouchableOpacity>
            </Row>}
          </View>
        </SafeAreaView>
      </LinearGradient>)
  }



  const MenuLink = ({title,link,number,setOpen,onPress}) => {
    const ref = useRef(null);
    const { width } = useWindowDimensions();

    const isHovered = useHover(ref);
    const navigation = useNavigation()
    const route = useRoute()
    return (
      <Pressable ref={ref}
        style={(!isHovered && route.name != link ? menuLink(width).default : 
          [menuLink(width).default,menuLink(width).hover])}
        onPress={()=>{
          if (onPress)
            onPress()
          else
            navigation.navigate(link)

          if (setOpen)
            setOpen(false)
        }}>

          <TextFor style={{fontWeight:'bold',letterSpacing:0}} fixed text={title}/>
          {!!number && <MyText style={[styles.number,{right:50,top:60}]}>{number}</MyText>}
      </Pressable>
    )
  }

  const menuLink =  function(width) {
    if (width >  1120)
    return {
      default:{
        justifyContent:'center',
        padding:10,
        paddingRight:15,
        marginBottom:10,
        marginLeft:15,
        marginBottom:-7,
      },
      hover: {
        backgroundColor:'white',
        borderWidth: 2,
        borderTopWidth:0,
        borderRadius: 0,
        marginLeft:11,
        marginBottom:-7,
      }
    }
    else
    return {
      default:{
        elevation: 10,
        justifyContent:'center',
        backgroundColor: '#FDE6A2',
        padding:15,
        paddingRight:15,
        borderTopWidth:2,
        borderBottomWidth:2,
        margin:0,
        marginTop:-2,
      },
      hover: {
        backgroundColor:'white',
        borderRadius: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        marginTop:-2,
      }
    }
  }