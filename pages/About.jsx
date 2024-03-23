
  import { AmaticSC_700Bold, useFonts } from '@expo-google-fonts/amatic-sc';
import { Raleway_800ExtraBold } from '@expo-google-fonts/raleway';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { getDatabase, push, ref, set } from 'firebase/database';
import { useState } from 'react';
import { Linking, View, useWindowDimensions } from 'react-native';
import BasePage from '../components/BasePage';
import { Auto, B, MyText, NewButton, Row, TextInput } from '../components/Components';
import AuthoredImage from '../components/tools/AuthoredImage';
import Comments from '../components/tools/Comments';
import styles from '../styles/aboutDesign';
import { Smiley } from './home/HomeScreen';
import { router } from 'expo-router';
import { LogoTitle } from '../components/LogoTitle';

const About = () => {
    const small = useWindowDimensions().width <= 900;
    const db = getDatabase()
    const navigation = router;
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);

    let [fontsLoaded] = useFonts({
        AmaticSC_700Bold, Raleway_800ExtraBold
      });
    const handleSend = async () => {
        if (email) {
            const newPostRef = push(ref(db,'about/emails'))
            set(newPostRef ,{
                email
            })
            .then(res=>{
                console.log(res);
                setEmail('')
                setSent(true);
            }).catch(err=>{
                console.log(err);
            })
        }
    }

    const next = () => {
        console.log('next');
        navigation.push('/');
        AsyncStorage.setItem('login',true)
    }

    return (
    <>
    <BasePage style={{padding:0,paddingHorizontal:0}} full>
        <LogoTitle style={{position:'relative',zIndex:10,backgroundColor:'#fcf9ef'}} noLogo={true}/>
        <View style={{marginHorizontal:small?0:100}}>
            <View style={[styles.container,{backgroundColor:'#fcf9ef'}]}>
                    <Row style={{alignItems:'center',textAlign:'center'}}>
                        <Smiley imageStyle={{width:90,height:90}} style={{margin:32}}/>
                        <View style={{flex:1}}>
                            <MyText size={50}>FiFe App</MyText>
                            <MyText size={30} style={{marginTop:-8}}>A biztonságos online tér</MyText>
                        </View>
                    </Row>
                    <MyText style={{textAlign:'left',fontSize:17}}>{'\n'}
                        A mai elszigetelt világban szükség van egy olyan rendszerre, amely összehozza a jóérzésű embereket egy biztonságos közösségbe.
                                        {'\n'}Ez a gondolat ihlette a <B>Fiatal Felnőttek applikációt</B>, amely sokrétű online felületet nyújt a nagyvárosban élőknek.
                    </MyText>
            </View>
            <Auto style={{flex:undefined,alignItems:'center',justifyItems:'center'}}>
                <MyText contained style={[{flexGrow:1,marginBottom:20},small&&{order:3}]}>
                    <MyText title>Cserebere</MyText>{'\n'}
                    Egy egyszerű adok-veszek oldal, ahol keresgélhetsz illetve hirdethetsz eladó tárgyak, munkák, kiadó lakások közt. Ezeket a cikkeket le tudod foglalni, és chatelni a hirdetővel.
                    {'\n'}
                    <View style={{width:'100%',alignItems:'center'}}>
                        <NewButton  title='Megyek csereberélni!' color='#fdcf99' />
                    </View>
                </MyText>
                <AuthoredImage authorName="Vitányi Regina"
                 source={require('../assets/img-prof.jpg')} resizeMode="contain" style={{height:200,width:200,margin:20,borderRadius:16,alignSelf:'center'}}/>
            </Auto>
                <View style={[styles.container,{alignItems:'center'}]}>
                    <MyText title>Bizniszelj!</MyText>
                    <Auto style={[{flex:undefined,marginTop:10}]}>
                        <View style={[{margin:4,padding:12,backgroundColor:'#fcf9ef',flex:small?undefined:1}]}>
                            <MyText size={17} bold>1. Mihez értesz?</MyText>
                            <MyText size={17}>Oszd meg másokkal, hogy miben vagy tehetséges! Akár kézműves termékeket készítesz, korrepetálsz vagy tanácsot adsz, itt hirdetheted magad.</MyText>
                        </View>
                        <View style={[{margin:4,padding:12,backgroundColor:'#fcf9ef',flex:small?undefined:1}]}>
                            <MyText size={17} bold>2. Lépj kapcsolatba!</MyText>
                            <MyText size={17}>Keress a szakemberek, művészek, alkotók közt! Fedezd fel a többiek bizniszeit!</MyText>
                        </View>
                        <View style={[{margin:4,padding:12,backgroundColor:'#fcf9ef',flex:small?undefined:1}]}>
                            <MyText size={17} bold>3. Köss biznisz kapcsolatot!</MyText>
                            <MyText size={17}>Keressétek meg egymásban a kereslet és kínálatot</MyText>
                        </View>
                        <View style={[{margin:4,padding:12,backgroundColor:'#fcf9ef',flex:small?undefined:1}]}>
                            <MyText size={17} bold>4. Ajánlj be másokat!</MyText>
                            <MyText size={17}>Jelezz vissza, kik azok akik valódi segitséget tudnak nyújtani.</MyText>
                        </View>
                    </Auto>
                    <NewButton title="Irány Bizniszelni!"/>
                </View>
            <Auto style={{flex:undefined}}>
                <Image source={require('../assets/logo.png')} resizeMode="contain" style={{height:200,width:200,margin:20,borderRadius:16,flexOrder:0,alignSelf:'center'}}/>

                <MyText contained style={small&&{order:3}}>
                <MyText title>Pajtások</MyText>{'\n'}Az oldal biztonságát az úgynevezett pajtásrendszerrel biztosítjuk. 
                Pajtásodnak akkor jelölhetsz valakit, ha megbízol az illetőben.
                Bizonyos funkciókat pedig csak akkor használhatsz, 
                ha megfelelő mennyiségű ember már megbízhatónak jelölt téged.</MyText>
            </Auto>

            <View style={{}}>
                <MyText contained style={{textAlign:'center'}}>
                <MyText title>Csatlakozz a FiFék közösségéhez!</MyText>{'\n'}
                    <MyText>Fifék így nyilatkoztak...</MyText>
                    <Comments style={{marginLeft:small?0:50}} path="aboutComments" limit={9} justComments commentStyle={{backgroundColor:'#fcf9ef',padding:10,textAlign:'left',fontSize:13,borderRadius:8}}/>
                </MyText>    
            </View>
            <Auto style={{flex:'none'}}>
                <MyText contained>
                <MyText title>Rólam</MyText>{'\n'}
                Kristóf Ákos vagyok, én találtam ki és fejlesztem egyedül a fife appot. Ez egy olyan projekt, 
                amibe szívemet-lelkemet bele tudom rakni, értetek, és egy jobb világért dolgozom rajta. 
                Az oldal fenntartásához, fejlesztéséhez sok idő és pénz is kell, éppen ezért kérem a támogatásotokat. 
                Ha neked is fontos a projekt célja, és szívesen használnád az appot, kérlek 
                egy pár száz forinttal segítsd az elindulásunkat:){'\n'}
                <NewButton onPress={()=>{ Linking.openURL('https://patreon.com/fifeapp') }} color="#fdcf99"
            title="Itt tudsz adományozni!" style={{alignSelf:small?'center':'flex-end'}}/> 

                </MyText>
                <Image source={require('../assets/en.jpeg')} resizeMode="cover" style={{height:200,width:200,margin:20,borderRadius:16,alignSelf:'center'}}/>


            </Auto>
            <MyText style={{fontSize:28,textAlign:'center',marginTop:30}}>Csatlakozz a fifékhez!</MyText>
            <Row style={{alignItems:'center',justifyContent:'center',padding:12}}>
                <NewButton title="Bejelentkezés" onPress={()=>router.push('/bejelentkezes')}/>
                <NewButton title="Regisztrálj!" color="#FDEEA2" onPress={()=>router.push('/regisztracio')}/>
            </Row>
        </View>
    </BasePage></>)
}

export default About