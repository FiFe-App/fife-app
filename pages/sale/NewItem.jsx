
import * as ImagePicker from 'expo-image-picker';
import { useContext, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import ImageModal from 'react-native-image-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from "react-redux";
import { B, Loading, MyText, NewButton, TextInput } from "../../components/Components";

import { FirebaseContext } from "../../firebase/firebase";

import axios from "axios";
import { getStorage, ref as storageRef, uploadBytes } from "firebase/storage";
import Select from "../../components/Select";
import { config } from "../../firebase/authConfig";


const categories = [
  'Eladó tárgyak',
  'Tárgyakat keresek',
  'Kiadó lakás',
  'Munka',
  'Bármi egyéb'
]


const NewItem = ({route,navigation,data}) => {
    const uid = useSelector((state) => state.user.uid)
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
            await uploadImages('sale',res).then(()=>{
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
        images.forEach(async (image,index) => {
          
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

          uploadBytes(ref, blob).then(async (snapshot) => {
          }).then(res=>{
            uploadImages.push(index)
          }).catch(error=>console.error(error))
        })


        console.log(uploadedImages);
        axios.patch('/sale/'+item,{
          imageDesc: 
          uploadedImages.map((im,ind)=>{
            return imageTexts[im]
          }),
          imageBookable: 
          uploadedImages.map((im,ind)=>{
            return imageTexts[im]
          })
        },config()).then(async (res)=>{
          console.log('updated db',res);
        })
      }
    };

    return (
      <>
      <View style={{flex:1,padding:10}}>
        <MyText style={{marginBottom:10,fontSize:25}}>
        <B>Hirdess!</B> Válassz kategóriát, és töltsd fel a hirdetésedet.
        </MyText>
        <View style={[{flexDirection: "row", backgroundColor: '#fdfdfd'}]}>
          <View style={{margin: 5,flex:1}}>
            <TextInput 
              style={{fontSize:20, borderWidth:2,padding:5,
                      backgroundColor: loading ? 'lightgray' : 'none',
                      cursor: loading ? 'not-allowed' : 'text'
                    }} 
              placeholder="Cím"
              editable={!loading}
              selectTextOnFocus={!loading} 
              value={title}
              onChangeText={setTitle}/>

            <Select
              list={categories}
              style={{fontSize:20, borderWidth:2,padding:5,marginTop:5,
                      backgroundColor: loading ? 'lightgray' : 'none',
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }} 
              placeholder="Válassz kategóriát"
              onSelect={(selectedItem, index) => {
                  console.log(selectedItem, index)
                  setCategory(index)
              }} />
            <TextInput multiline numberOfLines={5} 
              style={{ marginVertical:5, borderWidth:2,padding:5,fontSize:20, 
                        backgroundColor: loading ? 'lightgray' : 'none',
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
      </View>
      </>
    )
}

const ImageAdder = ({setGlobalImages,setGlobalImageTexts,setGlobalImageBookbale}) => {
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
      setSeparate([...separate,false])
    }
  };
  const deleteImage = (index) => {
    setImages(images.filter((image,i) => i !== index))
    setGlobalImages(images.filter((image,i) => i !== index))
    setTexts(texts.filter((text,i) => i !== index))
    setSeparate(separate.filter((text,i) => i !== index))
  }

  const handleSeparate = (index) => {
    console.log(separate.map((s,i) => i == index ? !s : s));
    setSeparate(separate.map((s,i) => i == index ? !s : s))
  }

  const handleTextChange = (text,index) => {
    console.log(text,index,'of'+texts.length);
    let arr = texts;
    console.log(texts.map((e,i)=>i==index ? text : e));
    setTexts(
      texts.map((e,i)=>i==index ? text : e))
    setGlobalImageTexts(arr)
  }
  return(
    <ScrollView  style={{width:'100%',marginHorizontal:5}}>
      {!!images.length && images.map((image,index)=>
      <View key={'image'+index} style={{flex:1}}>
        <View style={{flexDirection:'row',flex:1}}>
          <ImageModal swipeToDismiss={true} modalImageResizeMode="contain" resizeMode="cover" style={styles.square} source={{ uri: image }}/>
          <Pressable style={styles.close} onPress={()=>deleteImage(index)}><Icon name="close" size={20} color="white"/></Pressable>
          <View style={{flex:1}}>
            <TextInput onChangeText={text=>handleTextChange(text,index)} value={texts[index]}
            style={{borderWidth:2,height:150,padding:10}} multiline numberOfLines={3} placeholder={"Mondj valamit erről a képről"}/>
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
        <MyText style={{fontSize:20}}>Új kép</MyText>
      </Pressable>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  square: {
    width:150,
    height:150,
    borderWidth:2,
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