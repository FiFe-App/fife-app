import { Pressable, View, useWindowDimensions } from 'react-native';
import { Auto, MyText, Row } from './Components';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { useDispatch } from 'react-redux';
import { setBugData } from '../lib/userReducer';
import { useState } from 'react';

const Footer = ({inner,outer}) => {
    const [height, setHeight] = useState(0);
    const absolute = inner+height<outer;

    const dispatch = useDispatch()
    const {width} = useWindowDimensions();
    const small = width < 900
    return (
        <Auto flex={0}
        onLayout={(e)=>setHeight(e.nativeEvent.layout.height)}
         style={{backgroundColor:'#FDEEA2',padding:40,bottom:0,position:absolute?'absolute':'relative',alignItems:small?'center':'stretch'}}>
            <View style={{flex:small?undefined:1,width:'100%',}}>
                <Image source={require('../app/web_splash.png')}
                 style={{flex:1,minHeight:100,width:'100%',alignSelf:'center'}} contentFit='contain' contentPosition={small?'top center':'left center'}/>
            </View>
            <View style={{flex:small?undefined:1,alignItems:small?'flex-end':'flex-start',minHeight:100,width:'100%'}}>
                <MyText bold>Légy részese</MyText>
                <Link href='mailto:kristofakos1229@gmail.com'><MyText>Írj emailt!</MyText></Link>
                <Pressable onPress={()=>dispatch(setBugData(true))} ><MyText>Hibát találtam!</MyText></Pressable>
                <Link target='_blank' href='https://patreon.com/fifeapp' push><MyText>Itt tudsz adományozni</MyText></Link>

            </View>
            <View style={{flex:1,alignItems:'flex-end',minHeight:100,width:'100%'}}>
                <MyText bold>Hasznos linkek</MyText>
                <Link href='/rolunk'><MyText>Rólunk</MyText></Link>
                <Link href='/felhasznalasi-feltetelek'><MyText>Felhasználási feltételek</MyText></Link>
                <Link href='/adatvedelem'><MyText>Adatvédelem</MyText></Link>
            </View>
        </Auto>
    )
};

export default Footer;