
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import ImageModal from 'react-native-image-modal';
import Icon from '@expo/vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { B, MyText, NewButton, Row, TextInput, getUri } from '../../components/Components';
import Loading from '../../components/Loading';

import { FirebaseContext } from '../../firebase/firebase';

import axios from 'axios';
import { getStorage, ref as storageRef, uploadBytes } from 'firebase/storage';
import Select from '../../components/Select';
import { config } from '../../firebase/authConfig';
import { categories as cats } from '../../lib/categories';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import GoBack from '../../components/Goback';
import BasePage from '../../components/BasePage';
import LabelInput from '../../components/tools/LabelInput';
import CustomInput from '../../components/custom/CustomInput';


const categories = cats.sale.map(c=>{return c.name});

const NewItem = ({route,data,toEdit}) => {
    const params = useLocalSearchParams();
    const uid = useSelector((state) => state.user.uid)
    const navigation = router;
    const width = useWindowDimensions().width
    const { app } = useContext(FirebaseContext);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [text, setText] = useState('');
    const [images, setImages] = useState([]);
    const [useProfileImage, setUseProfileImage] = useState(false);
    const [imageTexts, setImageTexts] = useState([]);
    const [imageBookable, setImageBookable] = useState([]);

    const save = () => {
      setLoading(true)
      console.log('save');


      // Add a new document with a generated id.
      (async function(){

        if (toEdit) {

          axios.patch('/buziness/'+toEdit,{
            description:text,
            name:name,
            category:category,
            imagesDesc: imageTexts
          },config()).then(async (res)=>{
            navigation.push({pathname:'cserebere',params:{id:toEdit}})
          }).catch(error=>{
            console.log(error);
          })
          return;
        }

        axios.post('/buziness',{
          description:text,
          name:name+' '+category
        },config()).then(async (res)=>{
          if (images?.length) {
            console.log('res',res);
            await upload().then(()=>{
              setImages([])
              setName('')
              setText('')
              setLoading(false)
              navigation.push({pathname:'profil',params:{id:res.data}})
            })
          }
          else {
              setName('')
              setText('')
              setLoading(false)
              navigation.push({pathname:'profil',params:{id:res.data}})
          }
        }).catch(error=>{
          console.log(error);
        })
        /*addPost(firestore,{
        }).then(async (doc)=>{*/
      })()
    }

    useEffect(() => {
      console.log('images',images);
    }, [images]);
    const ref = useRef(null)

    const upload = () => {
        axios.post('/buziness',data,config()).then(res=>{
            ref.current.upload(`buziness/${res.data}`,`buziness/${res.data}`
            ).then(res=>{
                console.log('uploadedImage!!');
            })
        })
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
              reject(new TypeError('Network request failed'));
              };
              xhr.responseType = 'blob';
              xhr.open('GET', localUri, true);
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
            return imageTexts?.[im] || ' '
          }),
          bookables: 
          uploadedImages.map((im)=>{
            return imageBookable?.[im] || false
          })
        };
        console.log('uploadedimgs',uploadedImages);
        console.log('data',data);
        return await axios.patch(
          '/buziness/'+item+'/images',
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
          setName(data.name);
          setCategory(data.category);
          setText(data.description)
          setImageTexts(data.imagesDesc)
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
    const handleTextChange = (text,index) => {
      console.log(text,index,'of'+imageTexts.length);
      let arr = imageTexts;
      console.log(imageTexts.map((e,i)=>i==index ? text : e));
      console.log(arr);
      setImageTexts(
        imageTexts.map((e,i)=>i==index ? text : e))
    }

    return (
      <>
      
      <BasePage style={{width:'100%'}}>
        <MyText>Profil <Icon name="chevron-forward"/> Bizniszeim <Icon name="chevron-forward"/> <B>Új biznisz felvétele</B></MyText>
        <Row>
          <View style={{flex:1,alignItems:'center',justifyContent:'center',marginTop:20}}>
            <MyText style={{marginBottom:10,fontSize:17}}>
              {toEdit ?
              <>Szerkeszd át a bejegyzésed!</>:
              <><B>Mihez értesz?</B></>}
            </MyText>
          </View>
        </Row>
        <View style={[{flexDirection: 'row'}]}>
          <View style={{margin: 5,flex:1}}>
            <TextInput 
              style={{ marginVertical:5, padding:5,fontSize:17, borderRadius:8,
                      backgroundColor: loading ? 'gray' : '#fff',
                        cursor: loading ? 'not-allowed' : 'text'
                    }} 
              placeholder="Biznisz neve" 
              selectTextOnFocus={!loading} 
              editable={!loading} 
              value={name}
              onChangeText={setName}/>
            <LabelInput 
              style={{fontSize:17, borderRadius:8,
                      backgroundColor: loading ? 'gray' : '#fff',
                      cursor: loading ? 'not-allowed' : 'text'
                    }} 
              placeholder="Kulcsszavak, kategóriák"
              editable={!loading}
              selectTextOnFocus={!loading} 
              defaultValue={category}
              onChange={setCategory}/>
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
          <MyText style={{marginBottom:8}}>Feltöltött képek</MyText>
          <CustomInput attribute='profileImage' type="checkbox" label='Profilkép használata képként' setData={setUseProfileImage} data={useProfileImage} />
          {!!images.length && images.map((image,index)=>
            <View key={'image'+index} style={{flex:1}}>
              <View style={{flexDirection:'row',flex:1}}>
                <ImageModal swipeToDismiss={true} resizeMode="cover" style={styles.square} source={{ uri: image }}/>
                {toEdit&&<Pressable style={styles.close} onPress={()=>{/**delete */}}><Icon name="close" size={20} color="white"/></Pressable>}
                <View style={{flex:1}}>
                  <TextInput onChangeText={text=>handleTextChange(text,index)} value={imageTexts[index]}
                  style={{height:150,padding:10,marginRight:10,backgroundColor:'#fff', borderTopRightRadius:8, borderBottomRightRadius:8}} multiline rows={3} 
                  placeholder={'Mondj valamit erről a képről'}/>
                </View>
              </View>
            </View>
        )}
          <CustomInput ref={ref} render={false} type="image" label='+ Tölts fel új képet' setData={(i)=>setImages([...images,i])} data={images?.[images.length-1]} />
        </View>
        <View style={{alignItems:'flex-start'}}>
          <MyText style={{marginVertical:8}}>Helye a viágban</MyText>
          
        </View>
        <View style={{alignItems:'flex-end',margin:8}}>
          <NewButton 
            style={{width:'100%'}}
            name={toEdit ? 'Mentés' : 'Feltöltés'}
            disabled={loading || (!name || category == -1)}
            onPress={save}/>
        </View>
        {loading && <Loading color="#FFC372" height={10}/>}
      </BasePage>
      </>
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