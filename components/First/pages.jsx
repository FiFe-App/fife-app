
import { Professions, Links } from '../Edit';
import { StyleSheet, View, Text, Button, Platform,ScrollView, Pressable, Image, FlatList, Dimensions,  } from 'react-native';
import { useEffect, useState } from 'react';
import { MoreInfoForm, RegisterForm } from "../login/Login";
import { Auto, Col, TextInput } from '../Components';
import Icon from 'react-native-vector-icons/Ionicons'
import { useRef } from 'react';
import { useWindowSize } from '../../hooks/window';


export const Pages = ({newData,setNewData,pageData, setPageData}) => {
    const width = useWindowSize().width;
    const [more, setMore] = useState(false);
    const textInput = useRef(null);
    const [data, setData] = useState([
      { all: true},
      {
        register:false,
        moreData:false
      },
      { all: true},
      { text: true},
      { all: true},
      { all: true},
      { all: true},
      { all: true}
      
    ]);


    const [moreOpen, setMoreOpen] = useState(false);

    const [text, setText] = useState('');
    const textToType = "Nem leszek rosszindulatú. Tiszteletben tartom mások véleményét."

    useEffect(() => {
      setPageData(data)
    }, [data]);

    useEffect(() => {
      console.log(text);
      setData(data.map((d,i)=>{return (i==3) ? {...d,text:text==textToType} : d}))
    }, [text]);

    
    return [
        <View style={[styles.page,{backgroundColor:'none'}]} key="1">
            <ScrollView >
              <Text style={styles.title}>Szia! Üdvözöllek a Fiatal Felnőttek alkalmazásában!</Text>
              <Auto key="Auto">
                <View style={{flex:2}}>
                  <Text style={styles.text}>Az alkalmazás célja a FiFe szellemiség megvalósítása az online térben,
                  vagyis a korrektséget és segítőkészséget becsomagolni egy biztonságot nyújtó környezetbe.
                  Ez egy olyan nonprofit közösségi háló, ahol a tagok új módokon kereshetnek és nyújthatnak segítséget egymásnak.
                  Nem facebook vagyunk, nem az a célunk, hogy minél több reklámot és tartalmat láss. Ez egy eszköz,
                  ami segít, hogy ne érezd magad elszigetelve a nagyvárosban.
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
        </View>,
        <ScrollView style={[styles.page,{backgroundColor:'#06b075'}]} key="2">
            <Text style={styles.titleW} adjustsFontSizeToFit>Biztonság</Text>
            <Auto>
              <View style={{flex:3}}>
                <Text style={styles.text}>
                    Ahhoz, hogy ez az alkalmazás működhessen, arra van szükség, hogy a tagok
                    ne csupán önnön érdekből és rosszindulatból legyenek itt, hanem egymás segítésére,
                    tájékozódásra, információcserére használják az appot.
                    Éppen ezért minden felhasználónak lesz egy megbízhatósági skálája, ami megmutatja
                    hányan gondolják róla azt, hogy bizalommal lehet hozzá fordulni.
                    Ha viszont valaki szemétkedik, egy kattintással jelentheted számunkra a profilt, 
                    és ha indokolt, kitöröljük a profilját végleg.
                </Text>
                <Text style={styles.text}>Csak az jelölhet megbízhatónak valakit, akit már annak jelölt valaki más.</Text>
              </View>
              <View style={{flex:1}}>
              <Image resizeMode='center' source={require('../../assets/img-main.jpg')} style={{flex:1}}/>
              </View>
            </Auto>
        </ScrollView>,
        <View style={[styles.page,{backgroundColor:'#39c0db'}]} key="2.4">
            <Text style={styles.title}>Irányelveink</Text>
            <Text style={styles.subTitle}>Ha ennek az online közösségnek tagja szeretnél lenni, komolyan kell venned az irányelveinket: </Text>
            <Col style={{alignSelf:'flex-start',marginHorizontal:30}}>
              <FlatList style={styles.list}
                data={[
                  {key: 'Nem leszek rosszindulatú senkivel'},
                  {key: 'Mindenkit'},
                  {key: 'Kedves leszek mindenkivel.'},
                  {key: 'Mások és a saját érdekeimet is figyelembe veszem'},
                  {key: 'Nem használok ki másokat'},
                ]}
                renderItem={({item}) => 
                <Text style={styles.listItem}>
                  <Icon name="remove" size={20}/>{item.key}
                </Text>}
              />
            </Col>
            <View style={{margin:20}}>
              <Text style={styles.text}>Ha be fogod tartani ezeket, gépeld be a következő szöveget:</Text>
              <View style={styles.inputView}>
                <Pressable onPress={()=>textInput.current.focus()}>
                  <Text style={styles.absolute}>{textToType}</Text>
                </Pressable>
                <TextInput ref={textInput} style={styles.input}
                  value={text}
                  onChangeText={(input)=>{if (textToType.slice(0,input.length) == input) setText(input)}}/>
                <Text style={[styles.absolute,{color:'black'}]}>{text}</Text>
              </View>
            </View>
        </View>,
        <ScrollView style={[styles.page,{backgroundColor:'#945adb'}]} key="3">
            <Text style={styles.title}>Mihez értesz? {"\n"}<Text style={{fontWeight:"normal"}}>Ez alapján fognak mások megtalálni</Text></Text>
              <Auto>
                <View style={{flex:'none'}}>
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
                <View style={{margin:5,marginTop:-1,flex:1}}>
                  <Professions data={newData} setData={setNewData}/>
                </View>
              </Auto>
        </ScrollView>,
        <View style={[styles.page,{backgroundColor:'#ffc74f'}]} key="4">
            <Text style={styles.title}>Mihez értesz?</Text>
            <Text style={styles.subTitle}>Elérhetőségeid. instagramod, saját webhelyed, olyan linkeket, ahol mások is elérhetik, hogy ki vagy te</Text>

            <Links data={newData} setData={setNewData}/>
        </View>,
        <ScrollView style={[styles.page,{backgroundColor:'#ff8fc9'}]} key="6">
            <Text style={styles.title}>Regisztráció</Text>
            <Text style={styles.subTitle}>Add meg kérlek az email-címed, néhány adatod a regiszrációhoz</Text>
            <Auto>
              <View>
                <RegisterForm/>
              </View>
              <View>
                <MoreInfoForm setData={(good)=>setData(data.map((d,i)=>{return (i==1) ? {...d,moreData:good} : d}))} />
              </View>
              <View style={{flex:1,margin:10,justifyContent:'flex-start'}}>
                <Image resizeMode="center" source={require('../../assets/profile.jpeg')} style={{flex:1}}/>
              </View>
            </Auto>
        </ScrollView>,
        <View style={[styles.page,{backgroundColor:'#ffba7a'}]} key="7">
          <Text style={styles.title}>Szép munka! </Text>
          { Platform.OS == 'web' && <>
          <iframe src="https://giphy.com/embed/l49JHLpRSLhecYEmI" width="480" height="360" frameBorder="0" className="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/proud-congratulations-so-l49JHLpRSLhecYEmI">via GIPHY</a></p>          </>}
        </View>
]}


const styles = StyleSheet.create({
    viewPager: {
      flex: 1,
    },
    page:{
      flex:1,
      //width:width,
      //padding: width <= 900 ? 0 : 40
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