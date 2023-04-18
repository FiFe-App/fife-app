
import { Professions, Links } from '../profile/Edit';
import { StyleSheet, View, Button, Platform,ScrollView, Pressable, Image, FlatList, Dimensions,  } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { MoreInfoForm, RegisterForm } from "../login/Login";
import { Auto, B, Col, TextInput, MyText } from '../../components/Components';
import Icon from 'react-native-vector-icons/Ionicons'
import { useRef } from 'react';
import { useWindowDimensions } from 'react-native'
import AmiKell from './AmiKell';


export const Pages = ({newData,setNewData,pageData, setPageData}) => {
    const { width } = useWindowDimensions();
    const [more, setMore] = useState(false);
    const textInput = useRef(null);
    const [data, setData] = useState({
      textToType: '',
      profession: [],
      links: [],
      name: '',
      bio: ''
    });
    const pageStyle = {
      flex:1,
      width:width,
      padding: width <= 900 ? 0 : 40,
    }
    const titleStyle = {
      fontSize: width > 900 ? 50 : 40,
      width:'100%',
      fontWeight:'bold',
      paddingVertical:20,
      paddingHorizontal: width <= 900 ? 5 : 50,
      marginBottom: 20
    }
    const titleStyleW = {
      color:'white',
      fontSize: width > 900 ? 50 : 40,
      width:'100%',
      fontWeight:'bold',
      paddingVertical:20,
      paddingHorizontal:50,
      marginBottom: 20
    }


    const [moreOpen, setMoreOpen] = useState(false);
    const [numberOfLines, setNumberOfLines] = useState(0);
    const [text, setText] = useState('');
    const textToType = "Nem leszek rosszindulatú. Tiszteletben tartom mások véleményét."
    const handleTextInput = (input)=>{
      if (textToType.slice(0,input.length).toLowerCase() == input.toLowerCase()
      //||textToType.slice(0,input.length-1) == input.slice(0,input.length-1) &&
      ) setText(textToType.slice(0,input.length))
    }

    useEffect(() => {
      setPageData(data)
      console.log(data);
    }, [data]);

    useEffect(() => {
      setData({...data,textToType:text})
    }, [text]);

    
    return [
        <ScrollView style={[pageStyle,{backgroundColor:'none'}]} contentContainerStyle={{paddingBottom:160}} key="1">
              <MyText style={titleStyle}>Szia! Üdvözöllek a Fiatal Felnőttek alkalmazásában!</MyText>
              <Auto key="Auto">
                <View style={{flex:2}}>
                  <MyText style={[styles.text,{backgroundColor:'rgb(181, 139, 0)',color:'white',fontWeight:'bold',textAlign:'center'}]}>Az alkalmazás még nincs kész, tesztüzemmódban működik az oldal!</MyText>
                  <MyText style={styles.text}>Ez egy eszköz,
                  ami segít, hogy <B>barátkozz</B>, <B>tájékozódj</B>, <B>bizniszelj</B> és ne érezd magad elszigetelve a nagyvárosban.
                  {'\n\n'}Az alkalmazás célja a FiFe szellemiség megvalósítása az online térben,
                  vagyis a korrektséget és segítőkészséget becsomagolni egy biztonságot nyújtó környezetbe.
                  Egy netes oázis, ahol a könnyen nyújthatsz segítséget másoknak és találhatsz saját magadnak.
                  Ahol az ember közelebb érezheti magát másokhoz, részese lehet a nagy egésznek.
                  {'\n\n'}Nem facebook vagyunk, nem az a célunk, hogy minél több reklámot és tartalmat láss.
                  </MyText>
                </View>
                <View style={{flex:1,margin:20,height:'100%',flexDirection:'row'}}>
                  <Image source={require('../../assets/img-main.jpg')} resizeMode="contain" style={{flex:1,width:'100%'}}/>
                </View>
              </Auto>
        </ScrollView>,
        <ScrollView style={[pageStyle,{backgroundColor:'#B1ECEA'}]} contentContainerStyle={{paddingBottom:160}} key="1.2">
            <MyText style={titleStyle} adjustsFontSizeToFit>Hozzáállás</MyText>
            <Auto>
              <View style={{flex:width<=900?'none':3}}>
                <MyText style={styles.text}>
                Ez a közösség a kölcsönös bizalomról és együttműködésről szól.
                Segítjük egymást, hogy mindenki könyebben tudjon boldogulni ebben a bonyolult világban.
                Csak úgy tudjuk az országunkat jobb hellyé tenni, ha félrerakjuk az ösztönszerű ellentéteinket,
                és barátként tekintünk egymásra, hogy együtt fejlődjünk.
                </MyText>
                <MyText style={styles.text}>
                Itt olyan lehetőségeket igyekszem elétek tárni, amik segitségével könyebben indulunk el ezen az úton.
                Mindenkinek megoszhatja a magában rejlő értékeket
                </MyText>
              </View>
              <View style={{flex:width<=900?'none':1}}>
              <Image resizeMode='center' source={require('../../assets/img-prof.jpg')} style={{flex:1}}/>
              </View>
            </Auto>
        </ScrollView>,
        <ScrollView style={[pageStyle,{backgroundColor:'#06b075'}]} contentContainerStyle={{paddingBottom:160}} key="2">
            <MyText style={titleStyleW} adjustsFontSizeToFit>Biztonság</MyText>
            <Auto>
              <View style={{flex:width<=900?'none':3}}>
                <MyText style={styles.text}>
                    Ahhoz, hogy ez az alkalmazás működhessen, arra van szükség, hogy a tagok egymás segítésére,
                    tájékozódásra, információcserére használják az appot, ne csupán önnön érdekből vagy rosszindulatból legyenek itt. 
                    Éppen ezért bizonyos funkciókat csak akkor használhatsz, ha elegen gondolják rólad azt,
                    hogy bizalommal lehet hozzád fordulni.{'\n\n'}
                    Ha ismersz valakit, aki megbízható, jelöld a <B>pajtásodnak</B>, hogy mindenki tudja, hogy megbízol benne! {'\n\n'}
                    Ha viszont valaki szemétkedik, egy kattintással jelentheted számunkra a profilt, 
                    és ha indokolt, kitöröljük a profilját végleg.
                </MyText>
                <MyText style={styles.text}>Csak az jelölhet pajtásává valakit, akit már annak jelölt valaki más.</MyText>
              </View>
              <View style={{flex:width<=900?'none':1}}>
              <Image resizeMode='center' source={require('../../assets/img-main.jpg')} style={{flex:1}}/>
              </View>
            </Auto>
        </ScrollView>,
        <ScrollView style={[pageStyle,{backgroundColor:'#9084d0'}]} contentContainerStyle={{paddingBottom:160}} key="2.2">
          <AmiKell/>
        </ScrollView>,
        <ScrollView style={[pageStyle,{backgroundColor:'#39c0db'}]} contentContainerStyle={{paddingBottom:160}} key="2.4">
            <MyText style={titleStyle}>Irányelveink</MyText>
            <MyText style={styles.subTitle}>Ha ennek az online közösségnek tagja szeretnél lenni, komolyan kell venned az irányelveinket: </MyText>
            <Col style={{alignSelf:'flex-start',marginHorizontal:30}}>
              <FlatList style={styles.list}
                data={[
                  {key: 'Nem leszek rosszindulatú senkivel'},
                  {key: 'Mindenkihez egyformán bizalommal fordulok'},
                  {key: 'Kedves leszek mindenkivel.'},
                  {key: 'Mások és a saját érdekeimet is figyelembe veszem'},
                  {key: 'Nem használok ki másokat'},
                ]}
                renderItem={({item,index}) => 
                <MyText style={styles.listItem} key={'item'+index}>
                  <Icon name="heart" size={20} style={{marginRight:10}}/>{item.key}
                </MyText>}
              />
            </Col>
            <View style={{margin:20}}>
              <MyText style={styles.text}>Ha be fogod tartani ezeket, gépeld be a következő szöveget:</MyText>
              <View style={styles.inputView}>
                <Pressable onPress={()=>textInput.current.focus()}>
                  <MyText style={styles.absolute} onLayout={(e)=> {console.log('number of lines',setNumberOfLines((e.nativeEvent.layout.height-20)/26))}} >{textToType}</MyText>
                </Pressable>
                <TextInput ref={textInput} style={styles.input}
                  value={text}  
                  multiline
                  numberOfLines={numberOfLines}
                  onChangeText={handleTextInput}/>
                <MyText style={[styles.absolute,{color:'black'}]} >{text}</MyText>
              </View>
            </View>
        </ScrollView>,
        <ScrollView style={[pageStyle,{backgroundColor:'#ffb28f'}]} contentContainerStyle={{paddingBottom:160,alignItems:'center'}} key="6.2">
            <MyText style={titleStyle}>Mindjárt kész is vagy!</MyText>
            <MyText style={styles.subTitle}>Add meg kérlek még az néhány adatod, az email-címed, és a jelszavad a befejezéshez.</MyText>
            <Auto style={{justifyContent:'center'}}>
              <MoreInfoForm data={data.moreInfo} setData={(newData)=>setData({...data,name:newData.name,bio:newData.bio})} />
              <RegisterForm dataToAdd={data}/>
            </Auto>
        </ScrollView>
]}


const styles = StyleSheet.create({
    viewPager: {
      flex: 1,
    },
    text: {
      fontSize:22,
      textAlign:'left',
      padding:20,
      marginBottom: 10,
      backgroundColor:'white',
      opacity: 0.8
    },
    list: {
      fontSize:20,
      flexDirection:'column'
    },
    listItem: {
      fontSize:20,
      margin:5
    },
    link: {
      fontSize:25,
      textAlign:'left',
      marginBottom: 30,
      color:'rgb(181, 139, 0)'
    },
    title: {
      //fontSize: width > 900 ? 50 : 40,
      width:'100%',
      fontWeight:'bold',
      paddingVertical:20,
      //paddingHorizontal: width <= 900 ? 5 : 50,
      marginBottom: 20
    },
    titleW: {
      color:'white',
      //fontSize: width > 900 ? 50 : 40,
      width:'100%',
      fontWeight:'bold',
      paddingVertical:20,
      paddingHorizontal:50,
      marginBottom: 20
    },
    subTitle: {
      fontSize: 22,
      paddingBottom:20,
      paddingHorizontal:10,
      marginBottom: 20
    },
    button: {
      margin:10
    },
    progressBar: {
      height: 12,
      borderRadius: 5
    },
    inputView:{
      backgroundColor:'white',
      padding:10,
      borderWidth:2,
    },
    input:{
      backgroundColor:'white',
      padding:10,
      fontSize:22,
      letterSpacing:-1,
      color:'black'
    },
    absolute:{
      padding:10,
      fontSize:22,
      position:'absolute',
      userSelect: "none",
      backgroundColor:'transparent',
      color:'gray',
      cursor:'text'
    }
  });