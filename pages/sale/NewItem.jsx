
import * as ImagePicker from 'expo-image-picker';
import { useContext, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import ImageModal from 'react-native-image-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from "react-redux";
import { B, Loading, MyText, NewButton, Row, TextInput } from "../../components/Components";

import { FirebaseContext } from "../../firebase/firebase";

import axios from "axios";
import { getStorage, ref as storageRef, uploadBytes } from "firebase/storage";
import Select from "../../components/Select";
import { config } from "../../firebase/authConfig";
import { saleCategories } from '../../lib/categories';
import { useNavigation } from '@react-navigation/native';


const categories = saleCategories.map(c=>{return c.name});


const NewItem = ({route,data}) => {
    const uid = useSelector((state) => state.user.uid)
    const navigation = useNavigation();
    const width = useWindowDimensions().width
    const { app } = useContext(FirebaseContext);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState(-1);
    const [text, setText] = useState('');
    const [images, setImages] = useState([]);
    const [imageTexts, setImageTexts] = useState([]);
    const [imageBookable, setImageBookable] = useState([]);

    const save = () => {
      setLoading(true)
      console.log('save');

      // Add a new document with a generated id.
      (async function(){

        axios.post('/sale',{
          description:text,
          author:uid,
          title:title,
          category:category
        },config()).then(async (res)=>{
          if (images?.length) {
            console.log('res',res);
            await uploadImages('sale',res.data).then(()=>{
              setImages([])
              setTitle('')
              setText('')
              setLoading(false)
            })
          }
          else {
              setTitle('')
              setText('')
              setLoading(false)
          }
        }).catch(error=>{
          console.log(error);
        })
        /*addPost(firestore,{
        }).then(async (doc)=>{*/
      })()
    }

    const uploadImages = async (collection,item) => {
      //console.log('changed',changed);
      if (images?.length) {
        const storage = getStorage(app);

        let uploadedImages = [];
        let index = 0
        for (const image of images) {
          
          let localUri = image;
          let filename = localUri.split('/').pop();
          const ref = storageRef(storage, collection+'/'+item+'/'+index);

          const blob = await new Promise((resolve, reject) => {
              const xhr = new XMLHttpRequest();
              xhr.onload = function () {
                resolve(xhr.response);
              };
              xhr.onerror = function (e) {
                console.log(e);
              reject(new TypeError("Network request failed"));
              };
              xhr.responseType = "blob";
              xhr.open("GET", localUri, true);
              xhr.send(null);
          });

          await uploadBytes(ref, blob).then(async (snapshot) => {
            uploadedImages.push(index)
            console.log('pushed',index);
          }).catch(error=>console.error(error))
          index++;
        }

        const data = {
          descriptions: 
          uploadedImages.map((im)=>{
            return imageTexts[im]
          }),
          bookables: 
          uploadedImages.map((im)=>{
            return imageBookable[im]
          })
        };
        console.log('uploadedimgs',uploadedImages);
        console.log('data',data);
        axios.patch(
          '/sale/'+item+'/images',
          data,
          config()
        ).then(async (res)=>{
          console.log('updated db',res);
        }).catch(err=>{
          console.log(err);
        })
      }
    };

    return (
      <>
      {width <= 900 && <Pressable onPress={()=>navigation.push('cserebere')} style={{backgroundColor:'#FDEEA2'}}>
        <Row style={{padding:10,alignItems:'center'}}>
          <Icon name="chevron-back" size={32}/>
          <MyText style={{fontSize:32}}>Vissza</MyText>
        </Row>
      </Pressable>}
      <ScrollView style={{flex:1,padding:10,backgroundColor:'#FDEEA2'}}>
        <MyText style={{marginBottom:10,fontSize:25}}>
        <B>Hirdess!</B> Válassz kategóriát, és töltsd fel a hirdetésedet.
        </MyText>
        <View style={[{flexDirection: "row"}]}>
          <View style={{margin: 5,flex:1}}>
            <TextInput 
              style={{fontSize:20, padding:5,
                      backgroundColor: loading ? 'gray' : '#fbf7f0',
                      cursor: loading ? 'not-allowed' : 'text'
                    }} 
              placeholder="Cím"
              editable={!loading}
              selectTextOnFocus={!loading} 
              value={title}
              onChangeText={setTitle}/>

            <Select
              list={categories}
              style={{fontSize:20, padding:5,marginTop:5,borderWidth:0,
                      backgroundColor: loading ? 'gray' : '#fbf7f0',
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }} 
              placeholder="Válassz kategóriát"
              onSelect={(selectedItem, index) => {
                  console.log(selectedItem, index)
                  setCategory(index)
              }} />
            <TextInput multiline numberOfLines={5} 
              style={{ marginVertical:5, padding:5,fontSize:20, 
                      backgroundColor: loading ? 'gray' : '#fbf7f0',
                        cursor: loading ? 'not-allowed' : 'text'
                    }} 
              placeholder="Leírás" 
              selectTextOnFocus={!loading} 
              editable={!loading} 
              value={text}
              onChangeText={setText}/>
          </View>
        </View>
        <View style={{alignItems:'flex-start',flex:1}}>
          {!loading && <ImageAdder 
          setGlobalImages={setImages} globalImageTexts={imageTexts}
          setGlobalImageTexts={setImageTexts} setGlobalImageBookbale={setImageBookable}/>}
        </View>
        <View style={{alignItems:'flex-end'}}>
          <NewButton 
            style={{width:'100%'}}
            title="Feltöltés"
            disabled={loading || (!title || category == -1)}
            onPress={save}/>
        </View>
        {loading && <Loading color="#FFC372" height={10}/>}
      </ScrollView>
      </>
    )
}

const ImageAdder = ({setGlobalImages,setGlobalImageTexts,globalImageBookale,setGlobalImageBookbale}) => {
  const [images, setImages] = useState([]);
  const [separate, setSeparate] = useState([]);
  const [texts, setTexts] = useState([]);
  const pickImage = async () => {
    if (images?.length > 4) return
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled) {
      setImages([...images,result.uri]);
      setGlobalImages([...images,result.uri]);
      setTexts([...texts,''])
      setGlobalImageBookbale([...separate,false])
      setSeparate([...separate,false])
    }
  };
  const deleteImage = (index) => {
    setImages(images.filter((image,i) => i !== index))
    setGlobalImages(images.filter((image,i) => i !== index))
    setTexts(texts.filter((text,i) => i !== index))
    setSeparate(separate.filter((text,i) => i !== index))
    setGlobalImageBookbale(separate.filter((text,i) => i !== index))
  }

  const handleSeparate = (index) => {
    console.log(separate.map((s,i) => i == index ? !s : s));
    setSeparate(separate.map((s,i) => i == index ? !s : s))
    setGlobalImageBookbale(separate.map((s,i) => i == index ? !s : s))
  }

  const handleTextChange = (text,index) => {
    console.log(text,index,'of'+texts.length);
    let arr = texts;
    console.log(texts.map((e,i)=>i==index ? text : e));
    console.log(arr);
    setTexts(
      texts.map((e,i)=>i==index ? text : e))
    setGlobalImageTexts(texts.map((e,i)=>i==index ? text : e))
  }
  return(
    <View  style={{width:'100%',marginHorizontal:5}}>
      <MyText>Termékenként csak egy képet jelölj ,,Külön foglalható''-nak, hiába tartozik hozzá több kép.</MyText>
      {!!images.length && images.map((image,index)=>
      <View key={'image'+index} style={{flex:1}}>
        <View style={{flexDirection:'row',flex:1}}>
          <ImageModal swipeToDismiss={true} modalImageResizeMode="contain" resizeMode="cover" style={styles.square} source={{ uri: image }}/>
          <Pressable style={styles.close} onPress={()=>deleteImage(index)}><Icon name="close" size={20} color="white"/></Pressable>
          <View style={{flex:1}}>
            <TextInput onChangeText={text=>handleTextChange(text,index)} value={texts[index]}
            style={{height:150,padding:10,backgroundColor:'#fff'}} multiline numberOfLines={3} placeholder={"Mondj valamit erről a képről"}/>
          </View>
          <Pressable style={{justifyContent:'center',alignItems:'center',padding:10
          ,backgroundColor:separate[index] ? '#ffe8ae' : '#fbf7f0d7'}}
            onPress={()=>handleSeparate(index)}>
            <MyText style={{textAlign:'center'}}>{separate[index] ? "Külön foglalható" : "Nem\nfoglalható külön"}</MyText>
            <Icon name={separate[index] ? "cart" : "cart-outline"} size={30}/>
          </Pressable>
        </View>
      </View>
        )}
      <Pressable style={[styles.square,{}]} onPress={pickImage}>
        <MyText style={{fontSize:20}}>+ Új kép</MyText>
      </Pressable>

    </View>
  )
}

const styles = StyleSheet.create({
  square: {
    width:150,
    height:150,
    
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'#f7f7f7'
  },
  close:{
    position: 'absolute', 
    top: 0, 
    left: 130, 
    right: 0, 
    bottom: 130, 
    width:20,
    height:20,
    justifyContent: 'center', 
    alignItems: 'center',
    zIndex:10,
    elevation:10,
    borderRadius:50,
    backgroundColor:'black'
  }
})


export default NewItem