import { useContext, useRef, useState } from 'react';

import { Pressable, SafeAreaView, TouchableOpacity, View } from 'react-native';

import Icon from '@expo/vector-icons/Ionicons';
import { styles } from '../styles/styles';
import { MyText, Row } from './Components';

import { useDispatch, useSelector } from 'react-redux';
import { FirebaseContext } from '../firebase/firebase';

import { LinearGradient } from 'expo-linear-gradient';
import { router, usePathname } from 'expo-router';
import { Helmet } from 'react-helmet';
import { useWindowDimensions } from 'react-native';
import { useHover } from 'react-native-web-hooks';
import { TextFor } from '../lib/textService/textService';
import { setBugData } from '../lib/userReducer';
import { OpenNav, SearchBar } from './Components';
import { HomeButton } from './LogoComponents';

export function LogoTitle({style,noLogo=false}) {
    const {api} = useContext(FirebaseContext);
    const uid = useSelector((state) => state.user.uid)
    
    const [height, setHeight] = useState(null);
    const { width } = useWindowDimensions();
    const unreadMessage = useSelector((state) => state.user.unreadMessage)
    const [open, setOpen] = useState(false);

    const logout = () => {
      console.log('logout');
      router.replace('bejelentkezes');
     api.logout()
    }

    const search = <MenuLink title={<Icon name='search' size={25} />} link={'kereses'} style={{width:55,borderRadius:50,alignItems:'center',padding:10}}/>
    const alert = <MenuLink title={<Icon name='alert' size={25} />} style={{width:55,borderRadius:50,alignItems:'center',padding:10}}/>

    return (
      <View onLayout={(event) => {
        setHeight(event.nativeEvent.layout.height);
      }} style={style}
     >
        <Helmet>
          <meta name="theme-color" content="#FDEEA2"/>
        </Helmet>
          <OpenNav height={height} open={open} style={{width:'100%',zIndex: 13000,elevation: 10030}}>
            <MenuLink setOpen={setOpen} title="sale" icon="shirt-outline" link={'cserebere'}/>
            <MenuLink setOpen={setOpen} title="buziness" icon="shirt-outline" link={'biznisz'}/>
            <MenuLink setOpen={setOpen} forUsers title="docs" text="" link={'cikkek'} icon="person-outline" />
            <MenuLink setOpen={setOpen} forUsers title="messages" icon="mail-outline" link={'uzenetek'} number={unreadMessage?.length}/>
            <MenuLink setOpen={setOpen} forUsers title="profile" text="" link={'profil'} icon="person-outline" />
            <MenuLink setOpen={setOpen} forUsers title="logout" text="" color="black" onPress={()=>logout()} icon="exit-outline" />
            <MenuLink setOpen={setOpen} forNoUsers title="Bejelentkezés" text="" color="black" onPress={()=>router.push('/bejelentkezes')} icon="exit-outline" />
            <MenuLink setOpen={setOpen} forNoUsers title="Regisztráció" text="" color="black" onPress={()=>router.push('/regisztracio')} icon="exit-outline" />
          </OpenNav>
          <View style={[{flexDirection:'row',justifyContent:width <= 900 ? 'center' :'space-between',paddingLeft:width > 900 ?25:0,
            zIndex: 9,elevation: 9,backgroundColor:!noLogo?'#FCF3D4':'#FCF3D4',
            shadowColor: '#000'}
    ]}
          >
            { width <= 900 && !!uid && <>{search}</>}
            {!noLogo?<HomeButton />:<View style={{flex:1}}/>}
            {width > 900 && !!uid && <SearchBar/>}
            { width >  900 ?
            <View style={{flexDirection:'row',justifyContent:'center',marginRight:20}}>
              <Row>
              {width <= 900 && !!uid && search}
                <MenuLink setOpen={setOpen} title="sale" icon="shirt-outline" link={'cserebere'}/>
                <MenuLink setOpen={setOpen} title="buziness" icon="shirt-outline" link={'biznisz'}/>
                <MenuLink setOpen={setOpen} title="docs" icon="shirt-outline" link={'cikkek'}/>
                <MenuLink setOpen={setOpen} forUsers title="messages" icon="mail-outline" link={'uzenetek'} number={unreadMessage?.length}/>
                <MenuLink setOpen={setOpen} forUsers title="profile" text="" link={'profil'} icon="person-outline" />
                <MenuLink setOpen={setOpen} forUsers title="logout" text="" color="black" onPress={()=>logout()} icon="exit-outline" />
                <MenuLink setOpen={setOpen} forNoUsers title="Bejelentkezés" style={{backgroundColor:'#fdcf99'}} text="" color="black" onPress={()=>router.push('/bejelentkezes')} icon="exit-outline" />
                <MenuLink setOpen={setOpen} forNoUsers title="Regisztráció" style={{backgroundColor:'transparent'}} text="" color="black" onPress={()=>router.push('/regisztracio')} icon="exit-outline" />
              </Row>
            </View>
            :
              <TouchableOpacity onPress={()=>setOpen(!open)} style={{justifyContent:'center',width:70}}>
                <MyText style={{justifyContent:'center',textAlign:'center'}}>
                  <Icon name={open ? 'caret-up-outline':'menu-outline'} size={30}/>
                </MyText>
              </TouchableOpacity>}
          </View>
      </View>)
  }

  const MenuLink = ({title,link,number,setOpen,onPress,style,forUsers,forNoUsers}) => {

    const uid = useSelector((state) => state.user.uid)

    const ref = useRef(null);
    const { width } = useWindowDimensions();
    const route = usePathname();

    const isHovered = useHover(ref);

    if (uid && forNoUsers) return null; 
    if (!uid && forUsers) return null; 
    return (
      <Pressable ref={ref}
        style={[(!isHovered && route != '/'+link ? menuLink(width).default : 
          [menuLink(width).default,menuLink(width).hover]),style]}
        onPress={()=>{
          if (onPress)
            onPress()
          else
            router.push(link)

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
    if (width >  900)
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