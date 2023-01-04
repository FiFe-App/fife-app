
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { elapsedTime, TextFor } from "../../textService/textService"
import { NewButton, Loading, TextInput } from "../Components"
import * as ImagePicker from 'expo-image-picker';
import { useContext, useEffect, useState } from "react"
import { useSelector } from "react-redux"
import ImageModal from 'react-native-image-modal';
import Icon from 'react-native-vector-icons/Ionicons'

import { FirebaseContext } from "../../firebase/firebase"
import { serverTimestamp, updateDoc, doc, arrayUnion } from "firebase/firestore"; 

import { getStorage, ref as storageRef, uploadBytes } from "firebase/storage"
import { addPost } from "../../textService/triGram";

const NewItem = ({route,navigation,data}) => {
    const uid = useSelector((state) => state.user.uid)
    const {database, app, auth, firestore} = useContext(FirebaseContext);
    const name = 'name'
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [images, setImages] = useState([]);
    const [imageTexts, setImageTexts] = useState([]);
    const elapsed = elapsedTime(Date.now())
    const Dpath = 'sale/'+uid+'/'
    const Spath = 'sale/'+uid+"/profile.jpg"

    const save = () => {
      setLoading(true)
      console.log('save');

      // Add a new document with a generated id.
      (async function(){

        addPost(firestore,{
          date:serverTimestamp(),
          description:text,
          owner:uid,
          title:title,
          booked: false
        }).then(async (doc)=>{
          console.log(doc);
          if (images?.length)
            await uploadImages('sale',doc.id).then(()=>{
              setImages([])
              setTitle('')
              setText('')
              setLoading(false)
            })
          else {
              setTitle('')
              setText('')
              setLoading(false)
          }
        }).catch(error=>{
          console.log(error);
        })
      })()
    }

    const uploadImages = async (collection,item) => {
      //console.log('changed',changed);
      if (images?.length) {
        const storage = getStorage(app);

        images.forEach(async (image,index) => {
          
          let localUri = image;
          let filename = localUri.split('/').pop();
          const ref = storageRef(storage, collection+'/'+item+'/'+filename);

          let match = /\.(\w+)$/.exec(filename);
          let type = match ? `image/${match[1]}` : `image`;

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
              console.log('Uploaded a blob or file!');
              console.log(snapshot.metadata.size);
              console.log(index+'. imageDescription',imageTexts[index]);
              updateDoc(doc(firestore, collection,item), {
                images: arrayUnion({
                  filename,
                  description:imageTexts[index]
                })
              }).then(()=>console.log("images uploaded"))
              .catch(error=>console.log(error))
              //set(dbRef(database, collection+'/'+item,'images'), {filename,description:imageTexts[index]});
          }).catch(error=>console.error(error))
        })
      }
    };

    useEffect(() => {
      console.log(imageTexts);
    }, [imageTexts]);

    return (
      <>
      <View style={{flex:1,padding:10}}>
        <Text style={{marginBottom:10,fontSize:25}}><TextFor text="item_header"/></Text>
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
          {!loading && <ImageAdder setGlobalImages={setImages} globalImageTexts={imageTexts} setGlobalImageTexts={setImageTexts}/>}
        </View>
        <View style={{alignItems:'flex-end'}}>
          <NewButton 
            style={{width:'100%'}}
            title="Feltöltés"
            disabled={loading}
            onPress={save}/>
        </View>
        {loading && <Loading color="#FFC372" height={10}/>}
      </View>
      </>
    )
}

const ImageAdder = ({setGlobalImages,setGlobalImageTexts}) => {
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

  useEffect(() => {
    console.log('texts',texts);
  }, [texts]);
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
          ,backgroundColor:separate[index] ? '#ffe8ae' : '#fff7d7'}}
            onPress={()=>handleSeparate(index)}>
            <Text style={{textAlign:'center'}}>{separate[index] ? "Külön foglalható" : "Nem\nfoglalható külön"}</Text>
            <Icon name={separate[index] ? "cart" : "cart-outline"} size={30}/>
          </Pressable>
        </View>
      </View>
        )}
      <Pressable style={[styles.square,{}]} onPress={pickImage}>
        <Text style={{fontSize:20}}>Új kép</Text>
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