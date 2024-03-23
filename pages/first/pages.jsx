
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
                  <MyText style={styles.text}>Ez egy eszköz,
                  ami segít, hogy <B>csereberélj</B>, <B>bizniszelj</B>, <B>barátkozz</B> és ne érezd magad elszigetelve a nagyvárosban.
                  {'\n\n'}Az alkalmazás célja egy biztonságos online közössség létrehozása.
                  Egy netes oázis, ami nem az adataidra pályázik, hanem arra hogy bizalmat építsen az emberek között. 
                  Egy hely, ahol az ember közelebb érezheti magát másokhoz, részese lehet a nagy egésznek.
                  {'\n\n'}Nem facebook vagyunk, nem az a célunk, hogy minél több reklámot és tartalmat láss.
                  {'\n\n'}
                  A <B>Tovább</B> gombra nyomva végigvezetünk a regisztrációhoz szükséges lépéseken!
                  {'\n\n'}
                  Kérlek figyelmesen olvasd végig a lépéseket! Kb 5 percet vesz igénybe.
                  </MyText>
                  <MyText style={[styles.text,{backgroundColor:'rgb(181, 139, 0)',color:'white',fontWeight:'bold',textAlign:'center'}]}>
                  Az alkalmazás még nincs kész, tesztüzemmódban működik az oldal!</MyText>
                </View>
                <View style={{marginLeft:10,marginTop:-5,alignItems:'center'}}>
                  <Image source={require('../../assets/img-main.jpg')} resizeMode="contain" style={{width:300,height:300}}/>
                </View>
              </Auto>
        </ScrollView>,
        <ScrollView key="Iranyelvek" style={[pageStyle,]} contentContainerStyle={{paddingBottom:160}}>
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
        <ScrollView key="Adatok" style={[pageStyle,]} contentContainerStyle={{paddingBottom:160,alignItems:'center'}}>
            <MyText style={titleStyle}>Mindjárt kész is vagy!</MyText>
            <MyText style={[styles.text,{marginBottom:5,width:'100%',maxWidth:1000}]}>Add meg kérlek a szokásos adataidat a regisztrációhoz.</MyText>
            <Auto style={{justifyContent:'center',alignItems:small?'center':null}}>
              <MoreInfoForm style={styles.text} data={data.moreInfo} setData={(newData)=>setData({...data,name:newData.name,username:newData.username})} />
              <RegisterForm style={styles.text} dataToAdd={data}/>
            </Auto>
        </ScrollView>
]}

