import { onChildAdded } from "firebase/database"
import { Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { elapsedTime, TextFor } from "../textService/textService"
import { LoadImage, NewButton, Row, Slideshow } from "./Components"
import { styles as gstyles } from "./styles"
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import ImageModal from 'react-native-image-modal';
import Icon from 'react-native-vector-icons/Ionicons'

export const Item = ({route,navigation,data}) => {
    const uid = useSelector((state) => state.user.uid)
    const name = 'name'
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [images, setImages] = useState([]);
    const elapsed = elapsedTime(Date.now())
    const Dpath = 'sale/'+uid+'/'
    const Spath = 'sale/'+uid+"/profile.jpg"

    const save = () => {
      console.log('save');
    }

    const uploadImages = async () => {
      console.log('changed',changed);
      if (changed) {
        const db = getDatabase()
        const storage = getStorage();
        const ref = storageRef(storage, Spath);

        images.forEach(async (image,index) => {
          
          let localUri = image;
          let filename = localUri.split('/').pop();

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
              set(databaseRef(db, Dpath+index), filename);
          }).catch(error=>console.error(error))
        })
      }
    };

    return (
      <View style={{flex:1,padding:10}}>
        <Text style={{marginBottom:20,fontSize:18}}>Új cserebere poszt létrehozása</Text>
        <View style={[{flexDirection: "row", flex:1, backgroundColor: '#fdfdfd'}]}>
            <View style={{margin: 5,flex:1}}>
              <TextInput 
                style={{ fontWeight: 'bold',fontSize:20,flex: 1, borderWidth:2,padding:5}} 
                placeholder="Cím"
                onChangeText={setTitle}/>
              <Row style={{alignItems:'center'}}>
                <LoadImage style={gstyles.listIcon} size={20}uid={uid}/>
                <Text style={{ fontWeight: 'bold' }}>{name}</Text>
                <Text> {elapsed}</Text>
              </Row>
              <TextInput multiline style={{ marginVertical:5,height:150, borderWidth:2,padding:5 }} 
                placeholder="Leírás"  onChangeText={setText}/>
            </View>
        </View>
        <View>
          <ImageAdder setGlobalImages={setImages}/>
        </View>
        <View style={{flex:1}}>
          <NewButton 
            title="Feltöltés"
            onPress={save}/>
        </View>
      </View>
    )
}

const ImageAdder = ({setGlobalImages}) => {
  const [images, setImages] = useState([]);
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled) {
      setImages([...images,result.uri]);
      setGlobalImages([...images,result.uri]);
    }
  };
  const deleteImage = (index) => {
    setImages(images.filter((image,i) => i !== index))
    setGlobalImages(images.filter((image,i) => i !== index))
  }

  useEffect(() => {
    console.log('images',images);
  }, [images]);
  return(
    <ScrollView horizontal style={{}}>
      <Pressable style={styles.square} onPress={pickImage}>
        <Text>Új kép</Text>
      </Pressable>
      {!!images.length && images.map((image,index)=>
      <View key={'image'+index}>
        <ImageModal swipeToDismiss={true} resizeMode="center" style={styles.square} source={{ uri: image }}/>
        <Pressable style={styles.close} onPress={()=>deleteImage(index)}><Icon name="close" size={20} color="white"/></Pressable>
      </View>
        )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  square: {
    width:100,
    height:100,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'#f7f7f7'
  },
  close:{
    position: 'absolute', 
    top: 0, 
    left: 80, 
    right: 0, 
    bottom: 80, 
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