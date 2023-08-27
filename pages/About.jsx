  import Image from 'expo-fast-image';
  import { Linking, View, useWindowDimensions, Share } from "react-native"
import { Auto, MyText, NewButton, Row, TextInput } from "../components/Components"
import { useNavigation } from "@react-navigation/native"
import styles from "../styles/aboutDesign"
import BasePage from "../components/BasePage"
import Comments from "../components/tools/Comments"
import { Smiley } from "./home/HomeScreenOld"
import { useState } from 'react';
import { getDatabase, push, ref, set } from 'firebase/database';
import AuthoredImage from '../components/tools/AuthoredImage';

const About = ({navigation}) => {
    const small = useWindowDimensions().width <= 900;
    const db = getDatabase()
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const handleSend = async () => {
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
    return (
    <BasePage style={styles.container} full>
        <Auto style={{flex:'none'}}>
            <View style={{flex:1}}/>
            <MyText size={50} style={{margin:20,textAlign:'center',flex:1}}>FiFe App <Smiley style={{marginLeft:0}}/></MyText>

            <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
                {true&&<NewButton title="Tovább az alkalmazásba" color="#fdcf99" style={{padding:10}} onPress={()=>navigation.push('bejelentkezes')}/>}
            </View>
        </Auto>
        <View style={{marginHorizontal:small?0:100,flex:1}}>
            <MyText contained>
                    A mai elszigetelt világban szükség van egy olyan rendszerre, amely összehozza a jóérzésű embereket egy biztonságos közösségbe.
                {'\n'}Ez a gondolat ihlette a Fiatal Felnőttek applikációt, amely sokrétű online felületet nyújt a nagyvárosban élőknek.
            </MyText>
            <Auto style={{flex:'none'}}>
                <AuthoredImage authorName="Vitányi Regina"
                 source={require('../assets/img-prof.jpg')} resizeMode="contain" style={{height:200,width:200,margin:20,borderRadius:16,alignSelf:'center'}}/>
                <MyText contained stlye={{flexGrow:1}}>
                    <MyText title>Cserebere</MyText>{'\n'}
                    Egy egyszerű adok-veszek oldal, ahol keresgélhetsz illetve hirdethetsz eladó tárgyak, munkák, kiadó lakások közt. Ezeket a cikkeket le tudod foglalni, és chatelni a hirdetővel.

                </MyText>
            </Auto>

            <Auto style={{flex:'none'}}>
                <MyText contained style={small&&{order:3}}>
                <MyText title>Térkép</MyText>{'\n'}
                Ezen az oldalon olyan hasznos helyeket fedezhetsz fel, mint turkálók, adományboltok, vásárok, kiskocsmák, csomagolásmentes boltok, vagy akár ingyenvécék.
                Feltöltheted azokat a helyeket, amelyek a szívedhez nőttek, hogy mások is megismerhessék!</MyText>
                <AuthoredImage authorName="Vitányi Regina" authorUid="26jl5FE5ZkRqP0Xysp89UBn0MHG3"
                 source={require('../assets/img-map.jpg')} resizeMode="contain" style={{height:200,width:200,margin:20,borderRadius:16,alignSelf:'center'}}/>
           </Auto>

           <Auto style={{flex:'none'}}>
                <AuthoredImage authorName="Vitányi Regina"
                 source={require('../assets/img-main.jpg')} resizeMode="contain" style={{height:200,width:200,margin:20,borderRadius:16,alignSelf:'center'}}/>
                <MyText contained>
                <MyText title>Biznisz</MyText>{'\n'}
                Kereshetsz a szakemberek, művészek és alkotók közt. Illetve megoszthatod másokkal, 
                hogy miben vagy tehetséges. Akár kézműves termékeket készítesz, korrepetálsz, vagy tanácsot adsz, itt hirdetheted magad.
                </MyText>
            </Auto>
            <Auto style={{flex:'none'}}>
                
                <MyText contained style={small&&{order:3}}>
                <MyText title>Pajtások</MyText>{'\n'}Az oldal biztonságát az úgynevezett pajtásrendszerrel biztosítjuk. 
                Pajtásodnak akkor jelölhetsz valakit, ha megbízol az illetőben.
                Bizonyos funkciókat pedig csak akkor használhatsz, 
                ha megfelelő mennyiségű ember már megbízhatónak jelölt téged.</MyText>
                <Image source={require('../assets/logo.png')} resizeMode="contain" style={{height:200,width:200,margin:20,borderRadius:16,flexOrder:0,alignSelf:'center'}}/>
            </Auto>

            <Auto style={{flex:'none'}}>
                <Image source={require('../assets/en.jpeg')} resizeMode="cover" style={{height:200,width:200,margin:20,borderRadius:16,alignSelf:'center'}}/>
                <MyText contained>
                <MyText title>Rólam</MyText>{'\n'}
                Kristóf Ákos vagyok, én találtam ki és fejlesztem egyedül a FiFe Appot. Ez egy olyan projekt, 
                amibe szívemet-lelkemet bele tudom rakni, értetek, és egy jobb világért dolgozom rajta. 
                Az oldal fenntartásához, fejlesztéséhez sok idő és pénz is kell, éppen ezért kérem a támogatásotokat. 
                Ha neked is fontos a projekt célja, és szívesen használnád az appot, kérlek 
                egy pár száz forinttal segítsd az elindulásunkat:)</MyText>
            </Auto>
            <NewButton onPress={()=>{ Linking.openURL('https://patreon.com/fifeapp') }} color="#4d9bff"
            title="Itt tudsz adományozni!" style={{alignSelf:small?'center':'flex-end',paddingHorizontal:10}} textStyle={{fontSize:30}}/> 
            <View style={{}}>
                <MyText title>Küldjek emailt, ha elkészült az app?</MyText>
                <Row>
                    <TextInput style={{margin:5,padding:10,backgroundColor:'white',flexGrow:1}} 
                    value={!sent ? email : 'Köszi, megkaptam az email-címed!'} onChangeText={setEmail} disabled={sent} placeholder="Email-címed"/>
                    <NewButton title="Küldés" onPress={handleSend} disabled={!email || sent} style={{margin:5,minWidth:100}}/>
                </Row>
            </View>
            <View style={{}}>
                <MyText title>Kérlek mondd el a véleményed! <Image source={require('../assets/logo.png')} resizeMode="contain" style={{height:30,width:30}}/></MyText>    
                <Comments style={{marginLeft:small?0:50}} path="aboutComments"/>
            </View>
        </View>
    </BasePage>)
}

export default About