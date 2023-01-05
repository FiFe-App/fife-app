
import { Dimensions, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native"
import { elapsedTime, TextFor } from "../../textService/textService"
import { ProfileImage, NewButton, Row, Slideshow, Loading, TextInput, MyText } from "../Components"
import { styles as gstyles } from "../styles"
import * as ImagePicker from 'expo-image-picker';
import { useContext, useEffect, useState } from "react"
import { useSelector } from "react-redux"
import ImageModal from 'react-native-image-modal';
import Icon from 'react-native-vector-icons/Ionicons'

import { FirebaseContext } from "../../firebase/firebase"
import { onChildAdded, push, ref as dbRef, set } from "firebase/database"
import { getStorage, ref as storageRef, uploadBytes } from "firebase/storage"

export const Item = ({route,navigation,data}) => {
    const uid = useSelector((state) => state.user.uid)
    const {database, app, auth} = useContext(FirebaseContext);
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
      const messageListRef = dbRef(database, `sale/`);
      const newMessageRef = push(messageListRef);
      set(newMessageRef,{
        date:Date.now(),
        description:text,
        owner:uid,
        title:title,
      }).then(()=>{
        uploadImages('sale/'+newMessageRef.key).then(()=>{
          setTitle('')
          setText('')
          setImages([])
          setLoading(false)
        });
      })
    }

    const uploadImages = async (dbPath) => {
      //console.log('changed',changed);
      if (images?.length) {
        const storage = getStorage(app);

        images.forEach(async (image,index) => {
          
          let localUri = image;
          let filename = localUri.split('/').pop();
          const ref = storageRef(storage, dbPath+'/'+filename);

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

          uploadBytes(ref, blob).then((snapshot) => {
              console.log('Uploaded a blob or file!');
              console.log(snapshot.metadata.size);
              console.log(index+'. imageDescription',imageTexts[index]);
              set(dbRef(database, dbPath+'/images/'+index), {filename,description:imageTexts[index]});
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
        <MyText style={{marginBottom:20,fontSize:25}}><TextFor text="item_header"/></MyText>
        <View style={[{flexDirection: "row", backgroundColor: '#fdfdfd'}]}>
          <View style={{margin: 5,flex:1}}>
            <TextInput 
              style={{ fontWeight: 'bold',fontSize:20, borderWidth:2,padding:5,
                      backgroundColor: loading ? 'lightgray' : 'none',
                      cursor: loading ? 'not-allowed' : 'text'
                    }} 
              placeholder="Cím"
              editable={!loading}
              selectTextOnFocus={!loading} 
              value={title}
              onChangeText={setTitle}/>
            <Row style={{alignItems:'center'}}>
              <ProfileImage style={gstyles.listIcon} size={20}uid={uid}/>
              <MyText style={{ fontWeight: 'bold' }}>{name}</MyText>
              <MyText> {elapsed}</MyText>
            </Row>
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
    }
  };
  const deleteImage = (index) => {
    setImages(images.filter((image,i) => i !== index))
    setGlobalImages(images.filter((image,i) => i !== index))
    setTexts(texts.filter((text,i) => i !== index))
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
    <ScrollView  style={{width:'100%',paddingTop:2,marginBottom:-2}}>
      {!!images.length && images.map((image,index)=>
      <View key={'image'+index} style={{flex:1,marginTop:-2}}>
        <View style={{flexDirection:'row',flex:1}}>
          <ImageModal swipeToDismiss={true} modalImageResizeMode="contain" resizeMode="cover" style={styles.square} source={{ uri: image }}/>
          <Pressable style={styles.close} onPress={()=>deleteImage(index)}><Icon name="close" size={20} color="white"/></Pressable>
          <View style={{flex:1,marginLeft:-2}}>
            <TextInput onChangeText={text=>handleTextChange(text,index)} value={texts[index]}
            style={{borderWidth:2,height:150}} multiline numberOfLines={3} placeholder={"Mondj valamit erről a képről"}/>
          </View>
        </View>
      </View>
        )}
      <Pressable style={[styles.square,{marginTop:-2}]} onPress={pickImage}>
        <MyText>Új kép</MyText>
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