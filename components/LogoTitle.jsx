import { useContext, useEffect, useRef, useState } from 'react';

import { Pressable, SafeAreaView, TouchableOpacity, View } from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { MyText, Row } from './Components';
import { styles } from '../styles/styles';

import { useDispatch, useSelector } from 'react-redux';
import { FirebaseContext } from '../firebase/firebase';

import { useHover } from 'react-native-web-hooks';
import { useWindowDimensions } from 'react-native';
import { TextFor } from '../lib/textService/textService';
import { LinearGradient } from 'expo-linear-gradient';
import { OpenNav, SearchBar } from './Components';
import { Helmet } from 'react-helmet';
import { HomeButton } from './LogoComponents';
import { setBugData } from '../lib/userReducer';
import BugModal from './BugModal';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export function LogoTitle() {
    const {api,app,auth} = useContext(FirebaseContext);
    const navigation = useNavigation();
    const dispatch = useDispatch()
    
    const [height, setHeight] = useState(null);
    const { width } = useWindowDimensions();
    const unreadMessage = useSelector((state) => state.user.unreadMessage)
    const [open, setOpen] = useState(false);


    const logout = () => {
      console.log('logout');
      navigation.navigate('bejelentkezes');
     api.logout()
    }

    const bug = <MenuLink title={<Icon name='bug' size={30} />} onPress={()=>dispatch(setBugData(true))} style={{width:55,borderRadius:50,alignItems:'center',padding:10}}/>
    const search = <MenuLink title={<Icon name='search' size={25} />} link={"kereses"} style={{width:55,borderRadius:50,alignItems:'center',padding:10}}/>
    const alert = <MenuLink title={<Icon name='alert' size={25} />} style={{width:55,borderRadius:50,alignItems:'center',padding:10}}/>

    return (
      <LinearGradient onLayout={(event) => {
        setHeight(event.nativeEvent.layout.height);
      }}
      colors={['#FDEEA2', "#FDEEA2"]} start={{ x: 0, y: 0 }} end={{ x: 0.5, y: 1 }} >
        <Helmet>
          <meta name="theme-color" content="#FDEEA2"/>
        </Helmet>
        <SafeAreaView>
          <OpenNav height={height} open={open} style={{width:'100%',zIndex: 13000,elevation: 10030}}>
            <MenuLink setOpen={setOpen} title="Főoldal" text="" color="#509955" link={"fooldal"} icon="person-outline" />
            <MenuLink setOpen={setOpen} title="profile" text="" color="#509955" link={"profil"} icon="person-outline" />
            <MenuLink setOpen={setOpen} title="messages" color="#0052ff" icon="mail-outline" link={"uzenetek"} number={unreadMessage?.length}/>
            <MenuLink setOpen={setOpen} title="sale" color="#f4e6d4" icon="shirt-outline" link={"cserebere"}/>
            <MenuLink setOpen={setOpen} title="places" color="#f4e6d4" icon="map" link={"terkep"}/>
            <MenuLink setOpen={setOpen} title="logout" text="" color="black" onPress={()=>logout()} icon="exit-outline" />
          </OpenNav>
          <View style={[{flexDirection:'row',justifyContent:width <= 900 ? 'center' :'space-between',paddingLeft:width > 900 ?25:0,
          zIndex: 9,elevation: 9,backgroundColor:'#FDEEA2'},width > 900 && {shadowOffset: {width: 0, height: 3 },shadowOpacity: 0.4,shadowRadius: 2}
          ]}
  shadowOffset={{height: 4,width:1}}
  shadowOpacity={0.4} shadowRadius={3}>
            { width <= 900 && <>{search}{bug}</>}
            <HomeButton />
            {width > 1340 && <SearchBar/>}
            { width >  900 ?
            <View style={{flexDirection:'row',justifyContent:'center',marginRight:20,marginBottom:5}}>
              <Row>
              {width <= 1340 && width >  900 && search}

                <MenuLink title={<Icon name='bug' size={30} />} onPress={()=>dispatch(setBugData(true))} style={{width:55,borderRadius:50,alignItems:'center',padding:10}}/>
                <MenuLink setOpen={setOpen} title="Főoldal" text="" color="#509955" link={"fooldal"} icon="person-outline" />
                <MenuLink setOpen={setOpen} title="sale" color="#f4e6d4" icon="shirt-outline" link={"cserebere"}/>
                <MenuLink setOpen={setOpen} title="places" color="#f4e6d4" icon="map" link={"terkep"}/>
                <MenuLink setOpen={setOpen} title="messages" color="#0052ff" icon="mail-outline" link={"uzenetek"} number={unreadMessage?.length}/>
                <MenuLink setOpen={setOpen} title="profile" text="" color="#509955" link={"profil"} icon="person-outline" />
                <MenuLink setOpen={setOpen} title="logout" text="" color="black" onPress={()=>logout()} icon="exit-outline" />
              </Row>
            </View>
            :
              <TouchableOpacity onPress={()=>setOpen(!open)} style={{justifyContent:'center',width:70}}>
                <MyText style={{justifyContent:'center',textAlign:'center'}}>
                  <Icon name={open ? 'caret-up-outline':'menu-outline'} size={30}/>
                </MyText>
              </TouchableOpacity>}
          </View>
        </SafeAreaView>
      </LinearGradient>)
  }



  const MenuLink = ({title,link,number,setOpen,onPress,style}) => {
    const ref = useRef(null);
    const { width } = useWindowDimensions();

    const isHovered = useHover(ref);
    const navigation = useNavigation()
    const route = useRoute()
    return (
      <Pressable ref={ref}
        style={[(!isHovered && route.name != link ? menuLink(width).default : 
          [menuLink(width).default,menuLink(width).hover]),style]}
        onPress={()=>{
          if (onPress)
            onPress()
          else
            navigation.push(link)

          if (setOpen)
            setOpen(false)
        }}>

          <TextFor style={{fontWeight:'bold',letterSpacing:0}} fixed text={title}>
          {!!number && <MyText style={[styles.number,{top:0,right:width<900?'unset':-10}]}>{number}</MyText>}

          </TextFor>
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