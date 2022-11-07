
import { Professions, Links } from '../Edit';
import { StyleSheet, View, Text, Button, Platform,ScrollView, Pressable, TextInput, Image } from 'react-native';
import { useEffect, useState } from 'react';
import { MoreInfoForm, RegisterForm } from "../Login/Login";
import { Auto, Col } from '../Components';

export const Pages = ({newData,setNewData,pageData, setPageData}) => {
    const [more, setMore] = useState(false);
    const [textInput, setTextInput] = useState(null);
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
        <View style={styles.page} key="1">
            <ScrollView style={{flex:1}}>
              <Text style={styles.title}>Szia! Üdvözöllek a Fiatal Felnőttek hivatalos alkalmazásában!</Text>
              <Auto style={{flex:1}}>
                <View style={{flex:1}}>
                  <Text style={styles.text}>Az alkalmazás célja a FiFe szellemiség megvalósítása az online térben,
                  vagyis a korrektséget és segítőkészséget becsomagolni egy biztonságot nyújtó környezetbe.
                  Ez egy olyan nonprofit közösségi háló, ahol a tagok új módokon kereshetnek és nyújthatnak segítséget egymásnak.
                  Nem facebook vagyunk, nem az a célunk, hogy minél több reklámot és tartalmat láss. Ez egy eszköz,
                  ami segít, hogy ne érezd magad elszigetelve a nagyvárosban.
                  </Text>
                  <Pressable><Text style={styles.link}>Olvasd tovább a rendkívül naiv és optimista képzelgéseimet</Text></Pressable>
                  <Text>Vagy haladj tovább a regisztrációra</Text>
                </View>
                  <Image source={require('../../assets/img-main.jpg')} resizeMode="contain" style={{flex:1}}/>
                

              </Auto>
            </ScrollView>
        </View>,
        <View style={styles.page} key="2">
            <Text style={styles.title}>Regisztráció</Text>
            <Text style={styles.subTitle}>Add meg kérlek az email-címed, néhány adatod a regiszrációhoz</Text>
            <Auto>
              <View>
                <RegisterForm/>
              </View>
              <View>
                <MoreInfoForm setData={(good)=>setData(data.map((d,i)=>{return (i==1) ? {...d,moreData:good} : d}))} />
              </View>
              <Auto>
                <View style={{flex:1}}/>
                <Image resizeMode="contain" source={require('../../assets/profile.jpeg')} style={{flex:1,justifyContent:'flex-start'}}/>
              </Auto>
            </Auto>
        </View>,
        <View style={styles.page} key="3">
            <Text style={styles.title}>Biztonság</Text>
            <Auto>
              <View style={{flex:3}}>
                <Text style={styles.text}>
                    Ahhoz, hogy ez az alkalmazás működhessen, arra van szükség, hogy a tagok
                    ne csupán önnön érdekből és rosszindulatból legyenek itt, hanem egymás segítésére,
                    tájékozódásra, információcserére használják az appot.
                    Éppen ezért minden felhasználónak lesz egy megbízhatósági skálája, ami megmutatja
                    hányan gondolják róla azt, hogy bizalommal lehet hozzá fordulni.
                    Ha viszont valaki szemétkedik, egy kattintással jelentheted számunkra a profilt, 
                    és ha indokolt kitöröljük a profilját végleg.
                </Text>
                <Text style={styles.text}>Csak az jelölhet megbízhatónak valakit, akit már annak jelölt valaki más.</Text>
              </View>
              <View style={{flex:1}}>
              <Image resizeMode='center' source={require('../../assets/profile.jpeg')} style={{flex:1}}/>
              </View>
            </Auto>
        </View>,
        <View style={styles.page} key="3.4">
            <Text style={styles.title}>Irányelveink</Text>
            <Text style={styles.subTitle}>Ha ennek az online közösségnek tagja szeretnél lenni, komolyan kell venned az irányelveinket: </Text>
            <Col style={{alignSelf:'flex-start',marginHorizontal:30}}>
              <Text style={styles.list}>
                <Text>Nem leszek rosszindulatú senkivel</Text>
                <Text>Mindenkit  </Text>
                <Text>Kedves leszek mindenkivel.</Text>
                <Text>Mások és a saját érdekeimet is figyelembe veszem</Text>
                <Text>Nem használok ki másokat</Text>
              </Text>
            </Col>
            <View style={{margin:20}}>
              <Text style={styles.text}>Ha be fogod tartani ezeket, gépeld be a következő szöveget:</Text>
              <View style={styles.inputView}>
                <Pressable onPress={()=>textInput.focus()}>
                  <Text style={styles.absolute}>{textToType}</Text>
                </Pressable>
                <TextInput ref={(ti)=>setTextInput(ti)} style={styles.input}
                  value={text}
                  onChangeText={(input)=>{if (textToType.slice(0,input.length) == input) setText(input)}}/>
                <Text style={[styles.absolute,{color:'black'}]}>{text}</Text>
              </View>
            </View>
        </View>,
        <View style={styles.page} key="4">
            <Text style={styles.title}>A Profilod {"\n"}<Text style={{fontWeight:"normal"}}>Ez alapján fognak mások megtalálni</Text></Text>
            <Text style={styles.text}>Mihez értesz?</Text>
            <Auto>
              <View style={{flex:1}}>
                <Text style={[styles.text,{backgroundColor:'white'}]}>
                • Szoktál sapkákat kötni? Ha beírod, és valaki rákeres a 'sapka', vagy 'kötés' szóra megtalálhat téged!{"\n"}
                • Programozói állásod van, de szívesen segítenél másoknak, írd ide, és megtalálnak téged!{"\n"}
                • Bármilyen hobbid, munkád van, ha szerinted hasznos lehet ha megtalálják mások, vedd bele
                </Text>
                <Text style={styles.text}>
                  Amiket beírhatsz:
                    Kategória: 
                    Írd a leírásba, a kategórián belül pontosan mihez értesz, miben tudsz segíteni másoknak, hol tanultad.
                    És képeket is hozzáfúzhetsz.
                </Text>
              </View>
              <View style={{margin:20,flex:1}}>
              <Professions data={newData} setData={setNewData} centered/>
              </View>
            </Auto>
        </View>,
        <View style={styles.page} key="5">
            <Text style={styles.title}>Mihez értesz?</Text>
            <Text style={styles.text}>- Elérhetőségeid. instagramod, saját webhelyed, olyan linkeket, ahol mások is elérhetik, hogy mivel foglalkozol</Text>

        </View>,
        <View style={styles.page} key="6">
            <Text style={styles.title}>Profil</Text>
            <Text>Adj meg olyan adatokat, amik</Text>
            <Links data={newData} setData={setNewData} centered/>
        </View>,
        <View style={styles.page} key="7">
          <Text style={styles.title}>Szép munka! </Text>
          { Platform.OS == 'web' && <>
          <iframe src="https://giphy.com/embed/l49JHLpRSLhecYEmI" width="480" height="360" frameBorder="0" className="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/proud-congratulations-so-l49JHLpRSLhecYEmI">via GIPHY</a></p>          </>}
        </View>
]}


const styles = StyleSheet.create({
    viewPager: {
      flex: 1,
    },
    page: {
      flex:1,
      //alignItems: 'center',
      width:'100%'
    },
    text: {
      fontSize:20,
      textAlign:'left',
      padding:20,
      marginBottom: 10,
      backgroundColor:'white'
    },
    list: {
      
    },
    link: {
      fontSize:25,
      textAlign:'left',
      marginBottom: 30,
      color:'blue'
    },
    title: {
      fontSize: 30,
      width:'100%',
      fontWeight:'bold',
      borderBottomWidth:2,
      paddingBottom:20,
      paddingHorizontal:50,
      marginBottom: 20
    },
    subTitle: {
      fontSize: 25,
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
      width:500,
      backgroundColor:'white'
    },
    input:{
      backgroundColor:'white',
      padding:10,
      color:'black'
    },
    absolute:{
      padding:10,
      position:'absolute',
      userSelect: "none",
      backgroundColor:'transparent',
      color:'gray',
      cursor:'text'
    }
  });