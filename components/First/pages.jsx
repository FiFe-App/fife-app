
import { Professions, Links } from '../Edit';
import { StyleSheet, View, Text, Button, Platform,ScrollView, Pressable, Image, FlatList, Dimensions,  } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { MoreInfoForm, RegisterForm } from "../login/Login";
import { Auto, Col, TextInput } from '../Components';
import Icon from 'react-native-vector-icons/Ionicons'
import { useRef } from 'react';
import { useWindowSize } from '../../hooks/window';


export const Pages = ({newData,setNewData,pageData, setPageData}) => {
    const width = useWindowSize().width;
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
      if (textToType.slice(0,input.length) == input 
      //||textToType.slice(0,input.length-1) == input.slice(0,input.length-1) &&
      ) setText(input)
    }

    useEffect(() => {
      setPageData(data)
    }, [data]);

    useEffect(() => {
      setData({...data,textToType:text})
    }, [text]);

    
    return [
        <ScrollView style={[pageStyle,{backgroundColor:'none'}]} contentContainerStyle={{paddingBottom:160}} key="1">
            <ScrollView >
              <Text style={titleStyle}>Szia! Üdvözöllek a Fiatal Felnőttek alkalmazásában!</Text>
              <Auto key="Auto">
                <View style={{flex:2}}>
                  <Text style={styles.text}>Az alkalmazás célja a FiFe szellemiség megvalósítása az online térben,
                  vagyis a korrektséget és segítőkészséget becsomagolni egy biztonságot nyújtó környezetbe.
                  Ez egy olyan nonprofit közösségi háló, ahol a tagok új módokon kereshetnek és nyújthatnak segítséget egymásnak.
                  Nem facebook vagyunk, nem az a célunk, hogy minél több reklámot és tartalmat láss.{'\n\n'}Ez egy eszköz,
                  ami segít, hogy <B>barátkozz</B>, <B>tájékozódj</B>, <B>csereberélj</B> és hogy ne érezd magad elszigetelve a nagyvárosban.
                  </Text>
                  <Pressable style={{margin :20}} onPress={()=>setMoreOpen(true)}>
                    <Text style={styles.link}>Olvasd tovább a rendkívül naiv és optimista képzelgéseimet 
                    <Icon name="arrow-forward-outline" size={20}/></Text>
                  </Pressable>
                  {moreOpen && 
                    <Text style={styles.text} >
                      Szóval
                    </Text>}
                </View>
                <View style={{flex:1,justifyContent:'flex-start',alignItems:'flex-start'}}>
                  <Image source={require('../../assets/img-main.jpg')} resizeMode="contain" style={{flex:1,width:'100%'}}/>
                </View>
              </Auto>
            </ScrollView>
        </ScrollView>,
        <ScrollView style={[pageStyle,{backgroundColor:'#06b075'}]} contentContainerStyle={{paddingBottom:160}} key="2">
            <Text style={titleStyleW} adjustsFontSizeToFit>Biztonság</Text>
            <Auto>
              <View style={{flex:width<=900?'none':3}}>
                <Text style={styles.text}>
                    Ahhoz, hogy ez az alkalmazás működhessen, arra van szükség, hogy a tagok egymás segítésére,
                    tájékozódásra, információcserére használják az appot, ne csupán önnön érdekből és rosszindulatból legyenek itt. 
                    Éppen ezért minden felhasználónak lesz egy megbízhatósági skálája, ami megmutatja
                    hányan gondolják róla azt, hogy bizalommal lehet hozzá fordulni.{'\n\n'}
                    Ha viszont valaki szemétkedik, egy kattintással jelentheted számunkra a profilt, 
                    és ha indokolt, kitöröljük a profilját végleg.
                </Text>
                <Text style={styles.text}>Csak az jelölhet megbízhatónak valakit, akit már annak jelölt valaki más.</Text>
              </View>
              <View style={{flex:width<=900?'none':1}}>
              <Image resizeMode='center' source={require('../../assets/img-main.jpg')} style={{flex:1}}/>
              </View>
            </Auto>
        </ScrollView>,
        <ScrollView style={[pageStyle,{backgroundColor:'#39c0db'}]} contentContainerStyle={{paddingBottom:160}} key="2.4">
            <Text style={titleStyle}>Irányelveink</Text>
            <Text style={styles.subTitle}>Ha ennek az online közösségnek tagja szeretnél lenni, komolyan kell venned az irányelveinket: </Text>
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
                <Text style={styles.listItem} key={'item'+index}>
                  <Icon name="heart" size={20} style={{marginRight:10}}/>{item.key}
                </Text>}
              />
            </Col>
            <View style={{margin:20}}>
              <Text style={styles.text}>Ha be fogod tartani ezeket, gépeld be a következő szöveget:</Text>
              <View style={styles.inputView}>
                <Pressable onPress={()=>textInput.current.focus()}>
                  <Text style={styles.absolute} onLayout={(e)=> {console.log('number of lines',setNumberOfLines((e.nativeEvent.layout.height-20)/26))}} >{textToType}</Text>
                </Pressable>
                <TextInput ref={textInput} style={styles.input}
                  value={text}
                  multiline
                  numberOfLines={numberOfLines}
                  onChangeText={handleTextInput}/>
                <Text style={[styles.absolute,{color:'black'}]} >{text}</Text>
              </View>
            </View>
        </ScrollView>,
        <ScrollView style={[pageStyle,{backgroundColor:'#945adb'}]} contentContainerStyle={{paddingBottom:160}} key="3">
            <Text style={titleStyle}>Mihez értesz? {"\n"}<Text style={{fontWeight:"normal"}}>Ez alapján fognak mások megtalálni</Text></Text>
              <Auto>
                <View style={{flex:width<=900?'none':1}}>
                  <Text style={[styles.text]}>
                  • Szoktál sapkákat kötni? Ha beírod, és valaki rákeres a 'sapka', vagy 'kötés' szóra megtalálhat téged!{"\n"}
                  • Programozói állásod van, de szívesen segítenél másoknak, írd ide, és megtalálnak téged!{"\n"}
                  • Bármilyen hobbid, munkád van, ha szerinted hasznos lehet ha megtalálják mások, vedd bele
                  </Text>
                  <Text style={[styles.text]}>
                    Amiket beírhatsz:{"\n"}
                      Kategória: 
                      Írd a leírásba, a kategórián belül pontosan mihez értesz, miben tudsz segíteni másoknak, hol tanultad.
                      És képeket is hozzáfúzhetsz.
                  </Text>
                </View>
                <View style={{margin:5,marginTop:-1,flex:width<=900?'none':1}}>
                  <Professions data={data} setData={setData}/>
                </View>
              </Auto>
        </ScrollView>,
        <ScrollView style={[pageStyle,{backgroundColor:'#ffc74f'}]} contentContainerStyle={{paddingBottom:160}} key="4">
            <Text style={titleStyle}>Mihez értesz?</Text>
            <Text style={styles.subTitle}>Elérhetőségeid. instagramod, saját webhelyed, olyan linkeket, ahol mások is elérhetik, hogy ki vagy te</Text>

            <Links data={data} setData={setData}/>
        </ScrollView>,
        <ScrollView style={[pageStyle,{backgroundColor:'#ff8fc9'}]} contentContainerStyle={{paddingBottom:160}} key="6">
            <Text style={titleStyle}>Rólad</Text>
            <Text style={styles.subTitle}>Add meg, a neved, és ha van kedved írj magadról valamit.</Text>
            <Auto>
              <MoreInfoForm data={data.moreInfo} setData={(newData)=>setData({...data,name:newData.name,bio:newData.bio})} />
              
              <View style={{flex:1,margin:10,justifyContent:'flex-start'}}>
                <Image resizeMode="center" source={require('../../assets/profile.jpeg')} style={{flex:1}}/>
              </View>
            </Auto>
        </ScrollView>,
        <ScrollView style={[pageStyle,{backgroundColor:'#ff8fc9'}]} contentContainerStyle={{paddingBottom:160}} key="6.2">
            <Text style={titleStyle}>Regisztráció</Text>
            <Text style={styles.subTitle}>Add meg kérlek az email-címed, néhány adatod a regiszrációhoz</Text>
            <Auto>
              <View>
                <RegisterForm dataToAdd={data}/>
              </View>
              <View style={{flex:1,margin:10,justifyContent:'flex-start'}}>
                <Image resizeMode="center" source={require('../../assets/profile.jpeg')} style={{flex:1}}/>
              </View>
            </Auto>
        </ScrollView>,
        <ScrollView style={[pageStyle,{backgroundColor:'#ffba7a'}]} contentContainerStyle={{paddingBottom:160}} key="7">
          <Text style={titleStyle}>Szép munka! </Text>
          { Platform.OS == 'web' && <>
          <iframe src="https://giphy.com/embed/l49JHLpRSLhecYEmI" width="480" height="360" frameBorder="0" className="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/proud-congratulations-so-l49JHLpRSLhecYEmI">via GIPHY</a></p>          </>}
        </ScrollView>
]}

const B = ({children}) => {
  return <Text style={{fontWeight:'bold'}}>{children}</Text>
}

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