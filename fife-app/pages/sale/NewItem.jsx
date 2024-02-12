
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useContext, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import ImageModal from 'react-native-image-modal';
import Icon from '@expo/vector-icons/Ionicons';
import { useSelector } from "react-redux";
import { B, MyText, NewButton, Row, TextInput, getUri } from "../../components/Components";
import Loading from "../../components/Loading";

import { FirebaseContext } from "../../firebase/firebase";

import axios from "axios";
import { getStorage, ref as storageRef, uploadBytes } from "firebase/storage";
import Select from "../../components/Select";
import { config } from "../../firebase/authConfig";
import { categories as cats } from '../../lib/categories';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import GoBack from '../../components/Goback';
import BasePage from '../../components/BasePage';
import LabelInput from '../../components/tools/LabelInput';


const categories = cats.sale.map(c=>{return c.name});

const NewItem = ({route,data,toEdit}) => {
    const params = useLocalSearchParams();
    const uid = useSelector((state) => state.user.uid)
    const navigation = router;
    const width = useWindowDimensions().width
    const { app } = useContext(FirebaseContext);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState(-1);
    const [text, setText] = useState('');
    const [images, setImages] = useState([]);
    const [imageTexts, setImageTexts] = useState([]);
    const [imageBookable, setImageBookable] = useState([]);

    const save = () => {
      setLoading(true)
      console.log('save');


      // Add a new document with a generated id.
      (async function(){

        if (toEdit) {

          axios.patch('/sale/'+toEdit,{
            description:text,
            author:uid,
            title:title,
            category:category,
            imagesDesc: imageTexts
          },config()).then(async (res)=>{
            navigation.push({pathname:'cserebere',params:{id:toEdit}})
          }).catch(error=>{
            console.log(error);
          })
          return;
        }

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
              navigation.push({pathname:'cserebere',params:{id:res.data}})
            })
          }
          else {
              setTitle('')
              setText('')
              setLoading(false)
              navigation.push({pathname:'cserebere',params:{id:res.data}})
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
            return imageTexts?.[im] || " "
          }),
          bookables: 
          uploadedImages.map((im)=>{
            return imageBookable?.[im] || false
          })
        };
        console.log('uploadedimgs',uploadedImages);
        console.log('data',data);
        return await axios.patch(
          '/sale/'+item+'/images',
          data,
          config()
        ).then(async (res)=>{
          console.log('updated db',res);
          return 'success'
        }).catch(err=>{
          console.log(err);
          return err
        })
      }
    };

    useFocusEffect(
      useCallback(() => {
        if (!toEdit) return;
        axios.get('sale/'+toEdit,config()).then(res=>{
          const data = res.data;
          console.log(data);
          setTitle(data.title);
          setText(data.description)
          setImageTexts(data.imagesDesc)
          setCategory(data.category)
          const loadImgs = async () => {
            console.log(data.imagesDesc);
            if (data.imagesDesc?.length)
            setImages(
              await Promise.all(data.imagesDesc?.map( async (e,i)=>{
                  try {
                      return await getUri('sale/'+toEdit+'/'+i)
                  } catch (error) {
                  }
              }))
            )
          }
          loadImgs()
        })
      }, [])
    );

    return (
      <>
      
      <BasePage style={{}}>
        <Row>
          {(width <= 900 || toEdit) && <Pressable onPress={()=>navigation.push('cserebere')}>
            <GoBack breakPoint={10000} text={null} style={{backgroundColor:'#FFC372',left:0,top:0,margin:10}} color='black'/>
          </Pressable>}
          <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
            <MyText style={{marginBottom:10,fontSize:17}}>
              {toEdit ?
              <>Szerkeszd át a bejegyzésed!</>:
              <><B>Hirdess!</B> Válassz kategóriát, és töltsd fel a hirdetésedet.</>}
            </MyText>
          </View>
        </Row>
        <View style={[{flexDirection: "row"}]}>
          <View style={{margin: 5,flex:1}}>
            <LabelInput 
              style={{fontSize:17, padding:5, borderRadius:8,
                      backgroundColor: loading ? 'gray' : '#fff',
                      cursor: loading ? 'not-allowed' : 'text'
                    }} 
              placeholder="Cím, kulcsszavak"
              editable={!loading}
              selectTextOnFocus={!loading} 
              defaultValue={title}
              onChange={setTitle}/>

            <Select
              list={categories}
              style={{fontSize:17, padding:5,marginTop:5,borderWidth:0, borderRadius:8,
                      backgroundColor: loading ? 'gray' : '#fff',
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }} 
              defaultValue={category}
              placeholder="Válassz kategóriát"
              onSelect={(selectedItem, index) => {
                  console.log(selectedItem, index)
                  setCategory(index)
              }} />
            <TextInput multiline rows={5} 
              style={{ marginVertical:5, padding:5,fontSize:17, borderRadius:8,
                      backgroundColor: loading ? 'gray' : '#fff',
                        cursor: loading ? 'not-allowed' : 'text'
                    }} 
              placeholder="Leírás" 
              selectTextOnFocus={!loading} 
              editable={!loading} 
              value={text}
              onChangeText={setText}/>
          </View>
        </View>
        <View style={{alignItems:'flex-start'}}>
          {!loading && <ImageAdder globalImages={images} editable={!toEdit}
          setGlobalImages={setImages} globalImageTexts={imageTexts}
          setGlobalImageTexts={setImageTexts} setGlobalImageBookbale={setImageBookable}/>}
        </View>
        <View style={{alignItems:'flex-end',margin:8}}>
          <NewButton 
            style={{width:'100%'}}
            title={toEdit ? "Mentés" : "Feltöltés"}
            disabled={loading || (!title || category == -1)}
            onPress={save}/>
        </View>
        {loading && <Loading color="#FFC372" height={10}/>}
      </BasePage>
      </>
    )
}

const ImageAdder = ({editable,globalImages,setGlobalImages,globalImageTexts,setGlobalImageTexts,setGlobalImageBookbale}) => {
  const [images, setImages] = useState([]);
  const [separate, setSeparate] = useState([]);
  const [texts, setTexts] = useState([]);
  
  useEffect(() => {
    setImages(globalImages);
  }, [globalImages]);
  useEffect(() => {
    setTexts(globalImageTexts);
  }, [globalImageTexts]);
  
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
  const deleteImage = (index) => {
    setImages(images.filter((image,i) => i !== index))
    setGlobalImages(images.filter((image,i) => i !== index))
    setTexts(texts.filter((text,i) => i !== index))
    setSeparate(separate.filter((text,i) => i !== index))
    setGlobalImageBookbale(separate.filter((text,i) => i !== index))
  }

  const handleSeparate = (index) => {
    console.log(separate.map((s,i) => i == index ? !s : s));
    setSeparate(separate.map((s,i) => i == index ? !s : s))
    setGlobalImageBookbale(separate.map((s,i) => i == index ? !s : s))
  }

  const handleTextChange = (text,index) => {
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
      {!!images.length && images.map((image,index)=>
      <View key={'image'+index} style={{flex:1}}>
        <View style={{flexDirection:'row',flex:1}}>
          <ImageModal swipeToDismiss={true} modalImageResizeMode="contain" resizeMode="cover" style={styles.square} source={{ uri: image }}/>
          {editable&&<Pressable style={styles.close} onPress={()=>deleteImage(index)}><Icon name="close" size={20} color="white"/></Pressable>}
          <View style={{flex:1}}>
            <TextInput onChangeText={text=>handleTextChange(text,index)} value={texts[index]}
            style={{height:150,padding:10,marginRight:10,backgroundColor:'#fff', borderTopRightRadius:8, borderBottomRightRadius:8}} multiline rows={3} 
            placeholder={"Mondj valamit erről a képről"}/>
          </View>
        </View>
      </View>
        )}
      {editable&&<Pressable style={[styles.square,{borderRadius:8}]} onPress={pickImage}>
        <MyText style={{fontSize:17}}>+ Új kép</MyText>
      </Pressable>}

    </View>
  )
}

const styles = StyleSheet.create({
  square: {
    width:150,
    height:150,
    borderTopLeftRadius:8,
    borderBottomLeftRadius:8,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'#fff'
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