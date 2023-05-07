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
import { HomeButton } from './LogoComponents';

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
      <LinearGradient style={{zIndex:100,elevation: 100,}} colors={['#FDEEA2', "#FDEEA2"]} start={{ x: 0, y: 0 }} end={{ x: 0.5, y: 1 }} >
        <Helmet>
          <meta name="theme-color" content="#FDEEA2"/>
        </Helmet>
        <SafeAreaView>
          <OpenNav open={open && width < 900} style={{width:'100%',zIndex: -10,elevation: -10}}>
            <MenuLink setOpen={setOpen} title="Főoldal" text="" color="#509955" link={"fooldal"} icon="person-outline" />
            <MenuLink setOpen={setOpen} title="profile" text="" color="#509955" link={"profil"} icon="person-outline" />
            <MenuLink setOpen={setOpen} title="messages" color="#0052ff" icon="mail-outline" link={"uzenetek"} number={unreadMessage?.length}/>
            <MenuLink setOpen={setOpen} title="sale" color="#f4e6d4" icon="shirt-outline" link={"cserebere"}/>
            <MenuLink setOpen={setOpen} title="places" color="#f4e6d4" icon="map" link={"terkep"}/>
            <MenuLink setOpen={setOpen} title="logout" text="" color="black" onPress={()=>logout()} icon="exit-outline" />
          </OpenNav>
          <View style={{flexDirection:'row',justifyContent:width <= 900 ? 'center' :'space-between'}}>
            <HomeButton />
            {width > 1340 && <SearchBar/>}
            { width >  900 ?
            <View style={{flexDirection:'row',justifyContent:'center',marginRight:20,marginBottom:5}}>
              <Row>
                <MenuLink setOpen={setOpen} title="Főoldal" text="" color="#509955" link={"fooldal"} icon="person-outline" />
                <MenuLink setOpen={setOpen} title="sale" color="#f4e6d4" icon="shirt-outline" link={"cserebere"}/>
                <MenuLink setOpen={setOpen} title="places" color="#f4e6d4" icon="map" link={"terkep"}/>
                <MenuLink setOpen={setOpen} title="messages" color="#0052ff" icon="mail-outline" link={"uzenetek"} number={unreadMessage?.length}/>
                <MenuLink setOpen={setOpen} title="profile" text="" color="#509955" link={"profil"} icon="person-outline" />
                <MenuLink setOpen={setOpen} title="logout" text="" color="black" onPress={()=>logout()} icon="exit-outline" />
              </Row>
            </View>
            :
            <Row style={{}}>
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
            navigation.push(link)

          if (setOpen)
            setOpen(false)
        }}>

          <TextFor style={{fontWeight:'bold',letterSpacing:0}} fixed text={title}/>
          {!!number && <MyText style={[styles.number,{right:50,top:60}]}>{number}</MyText>}
      </Pressable>
    )
  }

  const menuLink =  function(width) {
    if (width >  900)
    return {
      default:{
        justifyContent:'center',
        padding:10,
        paddingRight:15,
        borderRadius: 8,
        marginVertical:17,
        marginHorizontal:5,
      },
      hover: {
        backgroundColor:'white',
        borderTopWidth:0,
        borderRadius: 8,
        marginVertical:17,
        marginHorizontal:5,
      }
    }
    else
    return {
      default:{
        elevation: 10,
        justifyContent:'center',
        backgroundColor: '#FDEEA2',
        padding:15,
        paddingRight:15,
        margin:0,
      },
      hover: {
        backgroundColor:'white',
        borderRadius: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
      }
    }
  }