
import Icon from '@expo/vector-icons/Ionicons';
import { useEffect, useRef, useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { Auto, B, Col, MyText, TextInput } from '../../components/Components';
import styles from '../../styles/pagesDesign';
import { MoreInfoForm, RegisterForm } from '../login/Login';
import Buziness from '../profileModules/Buziness';
import AmiKell from './AmiKell';


export const Pages = ({newData,setNewData,pageData, setPageData}) => {
    const { width } = useWindowDimensions();
    const small = useWindowDimensions().width<900;
    const textInput = useRef();

    const [data, setData] = useState({
      textToType: '',
      username: '',
      name: '',
      interest: [],
      buziness: [{name: '', description: ''}]
    });
    const pageStyle = {
      flex:1,
      width:width,
      padding: width <= 900 ? 4 : 40,
    }
    const titleStyle = {
      fontSize: width > 900 ? 30 : 20,
      width:'100%',
      fontWeight:'bold',
      paddingVertical:20,
      paddingHorizontal: width <= 900 ? 5 : 50,
      marginBottom: 20
    }
    const titleStyleW = {
      color:'white',
      fontSize: width > 900 ? 30 : 20,
      width:'100%',
      fontWeight:'bold',
      paddingVertical:20,
      paddingHorizontal:50,
      marginBottom: 20
    }

    const [numberOfLines, setNumberOfLines] = useState(0);
    const [text, setText] = useState('');
    const textToType = 'Nem leszek rosszindulatú. Tiszteletben tartom mások véleményét.'
    const handleTextInput = (input)=>{
      if (textToType.slice(0,input.length).toLowerCase().replaceAll(' ','')
       == (input.toLowerCase()).replaceAll(' ',''))
       setText(textToType.slice(0,input.length))
       else
       if (textToType.slice(0,input.length+1).toLowerCase().replaceAll(' ','')
       == (input.toLowerCase()).replaceAll(' ','')
      ) setText(textToType.slice(0,input.length+1))
    }

    useEffect(() => {
      setPageData(data)
      console.log(data);
    }, [data]);

    useEffect(() => {
      setData({...data,textToType:text})
    }, [text]);
    
    return [
        <ScrollView key="Udvozlet" style={[pageStyle,{backgroundColor:'none'}]} contentContainerStyle={{paddingBottom:160}} >
              <MyText style={titleStyle}>Szia! Üdvözöllek a Fiatal Felnőttek alkalmazásában!</MyText>
              <Auto key="Auto">
                <View style={{flex:small?undefined:2}}>
                  <MyText style={[styles.text,{backgroundColor:'rgb(181, 139, 0)',color:'white',fontWeight:'bold',textAlign:'center'}]}>
                  Az alkalmazás még nincs kész, tesztüzemmódban működik az oldal!</MyText>
                  <MyText style={styles.text}>Ez egy eszköz,
                  ami segít, hogy <B>barátkozz</B>, <B>tájékozódj</B>, <B>bizniszelj</B> és ne érezd magad elszigetelve a nagyvárosban.
                  {'\n\n'}Az alkalmazás célja a fife szellemiség megvalósítása az online térben,
                  vagyis a korrektséget és segítőkészséget becsomagolni egy biztonságot nyújtó környezetbe.
                  Egy netes oázis, ahol a könnyen nyújthatsz segítséget másoknak és találhatsz saját magadnak.
                  Ahol az ember közelebb érezheti magát másokhoz, részese lehet a nagy egésznek.
                  {'\n\n'}Nem facebook vagyunk, nem az a célunk, hogy minél több reklámot és tartalmat láss.
                  {'\n\n'}
                  A <B>Tovább</B> gombra nyomva végigvezetünk a regisztrációhoz szükséges lépéseken!
                  {'\n\n'}
                  Kérlek figyelmesen olvasd végig a lépéseket! Kb 5 percet vesz igénybe.
                  </MyText>
                </View>
                <View style={{marginLeft:10,marginTop:-5,alignItems:'center'}}>
                  <Image source={require('../../assets/img-main.jpg')} resizeMode="contain" style={{width:300,height:300}}/>
                </View>
              </Auto>
        </ScrollView>,
        <ScrollView key="Hozzaallas" style={[pageStyle,{backgroundColor:'#fdf6d1'}]} contentContainerStyle={{paddingBottom:160}}>
            <MyText style={titleStyle} adjustsFontSizeToFit>Hozzáállás</MyText>
            <Auto>
                <View style={{flex:small?undefined:1,margin:20,marginTop:-5,alignItems:'flex-start'}}>
                  <Image source={require('../../assets/logo.png')} resizeMode="contain" style={{height:small?60:300,aspectRatio:1/1,width:'100%'}}/>
                </View>
              <View style={{flex:width<=900?undefined:4}}>
                <MyText style={styles.text}>
                Ez a közösség a kölcsönös bizalomról és együttműködésről szól.
                Segítjük egymást, hogy mindenki könyebben tudjon boldogulni ebben a bonyolult világban.
                Csak úgy tudjuk az országunkat jobb hellyé tenni, ha félrerakjuk az ösztönszerű ellentéteinket,
                és barátként tekintünk egymásra, hogy együtt fejlődjünk.
                Itt olyan lehetőségeket igyekszem elétek tárni, amik segitségével könyebben indulunk el ezen az úton.
                </MyText>
              </View>
            </Auto>
        </ScrollView>,
        <ScrollView key="Pajtasok" style={[pageStyle,{backgroundColor:'#06b075'}]} contentContainerStyle={{paddingBottom:160}}>
            <MyText style={titleStyleW} adjustsFontSizeToFit>Pajtások</MyText>
            <Auto>
              <View style={{flex:width<=900?undefined:3}}>
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
                <View style={{marginLeft:10,marginTop:-5,alignItems:'center'}}>
                  <Image source={require('../../assets/img-main.jpg')} resizeMode="contain" style={{width:300,height:300}}/>
                </View>
            </Auto>
        </ScrollView>,
        <ScrollView key="Mierdekel" style={[pageStyle,{backgroundColor:'#06b075'}]} contentContainerStyle={{paddingBottom:160}}>
          <AmiKell data={data.interest} setData={(d)=>setData({...data,interest:d})}/>
        </ScrollView>,
        <ScrollView key="Biznisz" style={[pageStyle,{backgroundColor:'#9feeeb'}]} contentContainerStyle={{paddingBottom:160}}>
            <Auto>
              <View style={{flex:width<=900?undefined:3}}>
                <MyText style={titleStyle}>Bizniszek</MyText>
                <MyText style={styles.text}>A te Bizniszeid azon hobbijaid, képességeid, vagy szakmáid listája, amelyeket meg szeretnél osztani másokkal is.
                Ha te mondjuk úgy gyártod a sütiket, mint egy gép, és ezt felveszed a bizniszeid közé, az appban megtalálható leszel, a süti kulcsszóval.</MyText>
                <MyText style={styles.text}>Fontos, hogy kizárólag a megadott <B>kulcsszavak</B> alapján tudnak majd megtalálni
                {'\n'}Nem muszáj megadnod bizniszt, ha nem szeretnél!</MyText>
                <Buziness data={data} setData={setData}/>
              </View>
                <View style={{marginLeft:10,marginTop:-5,alignItems:'center'}}>
                  <Image source={require('../../assets/img-prof.jpg')} resizeMode="contain" style={{width:300,height:300}}/>
                </View>
            </Auto>
            
        </ScrollView>,
        <ScrollView key="Iranyelvek" style={[pageStyle,{backgroundColor:'#9feeeb'}]} contentContainerStyle={{paddingBottom:160}}>
            <MyText style={titleStyle}>Irányelveink</MyText>
            <MyText style={styles.text}>Ha ennek az online közösségnek tagja szeretnél lenni, komolyan kell venned az irányelveinket: </MyText>
            <Col style={{alignSelf:'flex-start',marginTop:20,width:'100%'}}>
              <FlatList style={[styles.text,{}]}
                data={[
                  {key: 'Nem leszek rosszindulatú senkivel!'},
                  {key: 'Mindenkihez egyformán bizalommal fordulok!'},
                  {key: 'Kedves leszek mindenkivel és nem használok ki másokat!'},
                  {key: 'Saját és mások érdekeit is figyelembe veszem!'},
                  {key: 'Ha valaki valaki bántóan viselkedik velem, jelentem!'},
                ]}
                renderItem={({item,index}) => 
                <MyText style={styles.listItem} key={'item'+index}>
                  <Icon name="heart" size={20} style={{marginRight:20}}/>{item.key}
                </MyText>}
              />
            </Col>
            <View style={{marginVertical:20}}>
              <MyText style={styles.text}>Ha be fogod tartani ezeket, gépeld be a következő szöveget:</MyText>
              <Pressable style={styles.inputView} onPress={()=>textInput.current.focus()}>
                <MyText style={styles.absolute} onLayout={(e)=> {console.log('number of lines',setNumberOfLines((e.nativeEvent.layout.height-20)/26))}} >{textToType}</MyText>
                <TextInput ref={textInput} style={styles.input}
                  value={text}
                  multiline
                  rows={numberOfLines}
                  onChangeText={handleTextInput}/>
                <MyText style={[styles.absolute,{color:'black'}]} >{text}</MyText>
              </Pressable>
            </View>
        </ScrollView>,
        <ScrollView key="Adatok" style={[pageStyle,{backgroundColor:'#fdf6d1'}]} contentContainerStyle={{paddingBottom:160,alignItems:'center'}}>
            <MyText style={titleStyle}>Mindjárt kész is vagy!</MyText>
            <MyText style={[styles.text,{marginBottom:5,width:'100%',maxWidth:1000}]}>Adj meg kérlek még néhány adatot, az email-címed, és a jelszavad a befejezéshez.</MyText>
            <Auto style={{justifyContent:'center',alignItems:small?'center':null}}>
              <MoreInfoForm style={styles.text} data={data.moreInfo} setData={(newData)=>setData({...data,name:newData.name,username:newData.username})} />
              <RegisterForm style={styles.text} dataToAdd={data}/>
            </Auto>
        </ScrollView>
]}

