import { Auto, Loading, MyText, NewButton, Popup, ProfileImage, Row, TextInput } from '../../components/Components';

import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, Image, Platform, Pressable, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from '../../styles/profileDesign';

import { useDispatch, useSelector } from 'react-redux';
import { FirebaseContext } from '../../firebase/firebase';

import { useWindowDimensions } from 'react-native';
import { useHover } from 'react-native-web-hooks';
import GoBack from '../../components/Goback';
import { Map } from './EditOld';
import BasePage from "../../components/BasePage"


import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { ref as databaseRef, equalTo, get, getDatabase, query, set } from 'firebase/database';
import { getDownloadURL, getStorage, ref as storageRef, uploadBytes } from 'firebase/storage';
import { config } from '../../firebase/authConfig';
import Select from '../../components/Select';
import { saleCategories } from '../../lib/categories';
import Section from './Section';
import Buziness from '../profileModules/Buziness';
import SaleModule from '../profileModules/SaleModule';
import { setTempData } from '../../lib/userReducer';

const bgColor = '#FDEEA2'//'#ffd581dd'
const themeColor = '#000';//#ba9007
const categories = saleCategories.map(c=>{return c.name});

const Profile = ({ navigation, route }) => {
  
  const uid = useSelector((state) => state.user.uid)
  const tempData = useSelector((state) => state.user.tempData)
  const { width } = useWindowDimensions();
  const small = width <= 900;
  const dispatch = useDispatch()
  const [profile, setProfile] = React.useState(null);
  const Dpath = 'users/'+uid+'/pro_file'
  const Spath = 'profiles/'+uid+"/profile.jpg"
  const [image, setImage] = useState(null);
  const [dbImage, setDbImage] = useState(null);
  const [changed, setChanged] = useState(false);
  const [loading, setLoading] = useState(true);
  const {database, api} = useContext(FirebaseContext);
  const [data, setData] = React.useState(tempData?.data);
  const [newData, setNewData] = React.useState(tempData?.data);
  const [page, setPage] = useState(tempData?.page || null);
  const [usernameValid, setUsernameValid] = React.useState(true);

  const [saleCategory, setSaleCategory] = useState(null);

  //#region imagePicker
  const init = async () => {
    const storage = getStorage();
    getDownloadURL(storageRef(storage, Spath+''))
    .then((url) => {
        setImage({uri: url})
        setDbImage({uri: url})
    }).catch(error => {
        setImage(require("../../assets/profile.jpeg"))
    })
  }

  useEffect(() => {
    if (image != 'oldimage')
    console.log('changed');
  }, [image]);

  const pickImage = async () => {
      // No permissions request is necessary for launching the image library
      let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      });

      if (!result.cancelled) {
          setImage(result.uri)
          setChanged(true)
      }
  }

  const deleteImage = () => {
    setImage(require('../../assets/profile.jpeg'))
  }

  const uploadImage = async () => {
      console.log('changed',changed);
      if (changed) {
        const db = getDatabase()
        const storage = getStorage();
        const ref = storageRef(storage, Spath);

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
            set(databaseRef(db, Dpath), filename);
        }).catch(error=>console.error(error))
      }

      return true
  }
  //#endregion

  useEffect(() => {
    if (database && newData) {
      const username = newData.username
      if (username && username.length > 3 && username.length < 20 && username.match(/^([a-z0-9_])*$/)) {
        const usernameRef = query(databaseRef(database, 'usernames'), equalTo(null,username.toLowerCase()))
        get(usernameRef).then(snapshot=>{
          if (snapshot.exists() && !snapshot.val()[data.username]) {
            setUsernameValid(false)
          } else setUsernameValid(true)
        })
      } else setUsernameValid(false)
    } 
  }, [newData?.username]);

  useEffect(() => {
    if (navigation && newData) {
      //if (deepEqual(newData,data))
      //console.log('newData',newData);
      //setLoading(false)
    } 
  }, [newData]);

  async function save() {
    if (changed)
      uploadImage().then(e=>console.log('uploadSuccess'))
      .catch(err=>console.error('uploadError',err))
    if (database)
    if (uid) {
        if (newData.username != data.username) {
          console.log(uid);
          //await set(databaseRef(database, 'usernames/' + newData.username), {owner:uid})
        }
        console.log("data to upload:", {
          data:newData,
          buziness: page.buziness.map(bu=>{
            return {
              ...bu,
              pageId: undefined
            }
          }),
          page:page
        });
        axios.patch('users',{
          data:newData,
          page:{
              ...page,
              buziness: page.buziness.map(bu=>{
                return {
                  ...bu,
                  pageId: undefined
                }
              })
          }
        },config())
        .then((e) => {
          console.log('success',e);
          setNewData(data)
          dispatch(setTempData({
            ...newData,
            page:{
                ...page,
                buziness: page.buziness.map(bu=>{
                return {
                  ...bu,
                  pageId: undefined
                }
              })
            }
          }))
          navigation.push('profil')
        }).catch(error => {
          console.log(error);
          console.log(newData);
          if (error?.response?.data == 'Token expired') {
            console.log('Token expired');
            api.logout();
            return
          }
        })
    }
  }

  useFocusEffect(
    useCallback(() => {
      console.log(data);
      if (database) {
        //hulyr vagy 
        if (data == null)
        axios.get(`users/all/${uid}`,config()).then((res) => {
          console.log('getDAta',res);
            setData(res.data)
            setPage(res.data.page)
            setNewData(res.data)
        }).catch((error) => {
          console.error('getDataError',error);
          if (error?.response?.data == 'Token expired') {
            api.logout();
            return
          }

          const object = {
            name: '',
            username: ''
          }
          setData(object)
          setNewData(object)
        }).finally(()=>{
          init()
          setLoading(false)
        });
        else {
          init()
          setLoading(false)
        }
      }
    }, [uid])
  );

  useEffect(() => {
    console.log('page',page);
  }, [page]);

  if (!loading)
  return(
    <>
    <BasePage style={{paddingRight:small?5:25,paddingBottom:25,backgroundColor:bgColor,flex:1}}>
      <Auto style={{flex:'none'}}>
        <GoBack style={{marginLeft:20}}/>
        <Row style={{}}>
            <View style={[localStyles.container,{width:150,paddingLeft:0,marginLeft:small?5:25,alignSelf:'center'}]}>
              <Pressable onPress={pickImage}>
                <Image source={image} style={[{paddingHorizontal:0,background:'none',borderRadius:8,height:150,width:150}]}/>
              </Pressable>
            </View>
            <View >
              <NewButton onPress={pickImage}
              title={<Icon name='cloud-upload-outline' size={25} />} 
              style={[localStyles.containerNoBg, {flex:width <= 900 ? 'none' : 1,alignItems:'center',shadowOpacity:0.5,flex:1,height:'none',marginBottom:0}]}/>

              <NewButton onPress={deleteImage}
              title={<Icon name='close-outline' size={40} />} 
              style={[localStyles.containerNoBg, {flex:width <= 900 ? 'none' : 1,alignItems:'center',shadowOpacity:0.5,flex:1,height:'none',marginBottom:0}]}/>

            </View>
        </Row>
        <View style={{flex:width <= 900 ? 'none' : 1,zIndex:10,elevation: 10}}>
          <TextInput style={[localStyles.fcontainer,{marginLeft:small?5:25,padding:5,fontSize:30}]} 
            onChangeText={(e)=>setNewData({...newData, name: e})}
            editable
            placeholder="Név"
            defaultValue={data.name}/>
          <TextInput style={[localStyles.fcontainer,{marginLeft:small?5:25,padding:5,fontSize:30,flex:0}]} 
            onChangeText={(e)=>setNewData({...newData, title: e})}
            editable
            placeholder="Titulus"
            defaultValue={data.title}/>
          <Row style={{flex:width <= 900 ? 'none' : 1}}>
          <Icon style={{position:"absolute",alignSelf:'center',top:3,left:7}} name={usernameValid ? "checkmark-circle" : "close-circle"} size={30} color={usernameValid ? "green" : "red"}/>
            <TextInput
              style={[localStyles.fcontainer,{marginLeft:small?5:25,padding:5,fontSize:20,borderColor: data.username == newData.username ? 'green' : 'orange'}]}
              onChangeText={(e)=>{setNewData({...newData, username: e})}}
              editable
              placeholder="Add meg a felhasználóneved"
              defaultValue={data.username}
            />
          </Row>
        </View>
        

        
          <NewButton onPress={save}
          title="Mentés" textStyle={{fontSize:30}}
          style={[localStyles.containerNoBg, {flex:width <= 900 ? 'none' : 1,alignItems:'center',shadowOpacity:0.5,flex:1,height:'none',marginLeft:small?5:25}]}
              />
          

      </Auto>
      <Auto style={{flex:1,zIndex:-1,elevation: -1}}>
        <View style={{flex:width <= 900 ? 'none' : 1}}>
          
          <Section title="Helyzetem" flex={width <= 900 ? 'none' : 1} style={{}}>
            {
            (Platform.OS !== 'web') ? 
            <MapView style={localStyles.map} />
            : <Map data={profile} editable setData={setData}/>
            }
          </Section>
        </View>
        <View style={{flex:(width <= 900 ? 'none' : 2)}}>
            <Buziness data={page} setData={setPage}/>
          
        </View>
        <View style={{flex:(width <= 900 ? 'none' : 2)}}>
            <SaleModule />
          
        </View>
      </Auto>
    </BasePage>
    </>
  )
  else return (<View style={{backgroundColor:bgColor,flex:1}}><Loading color={"#fff"}/></View>)
}

  const localStyles = {
    image: {
      aspectRatio: 1,
      flex:1,
      width:150,
      height:150,
      backgroundColor:bgColor
    },
    imageContainer: {
      backgroundColor: bgColor,
      flexDirection: 'row',
      marginBottom:5
    },
    imagePadding: {
      flex:1,
      backgroundColor: themeColor
    },
    input: {
      paddingVertical: 10,
      borderRadius: 0,
      marginBottom:5,
      color:themeColor,
      backgroundColor:'#fff7',
      fontWeight: "600",
      padding: 10,
      paddingVertical:10
    },
    adder: {
      backgroundColor: 'white',
      //marginTop: 10,
      marginBottom:5,
      alignItems: 'center'
    },
    plusContainer: {
      backgroundColor: 'white',
      justifyContent: "center",
      textAlign: 'center',
      alignItems:'center',
      width: 43,
      height: 43,
    },
    textContainer: {
      alignItems:'center',
      flexDirection:'row',
      paddingRight:10,
      flex:1
    },
    text: {
      color: 'black',
      margin: 10,
    },
    profession: {
      paddingLeft: 0,
      marginTop:5
    },
    divider: {
      height:2,
      backgroundColor:'gray'
    },
    label: {
      marginLeft: 20,
      marginVertical: 10,
      fontSize: 16,
      textAlign:'center'
    },
    smallButton: {
      paddingHorizontal:20,
      alignItems: 'center',
      justifyContent: "center",
      flex:1,
      width:150/2,
      backgroundColor:'white'
  
    },
  
    fcontainer: {
      flex:1,
      marginTop: 25,
      marginLeft: 25,
      backgroundColor:'white',
      paddingHorizontal:20,
      justifyContent:'center', 
      zIndex:'auto', 
      shadowColor: '#171717',
      shadowOffset: {width: 2, height: 4},
      shadowOpacity: 0.1,
      shadowRadius: 10,
      borderRadius:8
    },
    container: {
      marginTop: 25,
      marginLeft: 25,
      backgroundColor:'white',
      paddingHorizontal:20,
      justifyContent:'center',
      zIndex:'auto' ,
      shadowColor: '#171717',
      shadowOffset: {width: 2, height: 4},
      shadowOpacity: 0.1,
      shadowRadius: 10,
      borderRadius:8
    },
    containerNoBg: {
      marginTop: 25,
      marginLeft: 25,
      paddingHorizontal:20,
      justifyContent:'center',
      zIndex:'auto' ,
      shadowColor: '#171717',
      shadowOffset: {width: 2, height: 4},
      shadowOpacity: 0.1,
      shadowRadius: 10,
      borderRadius:8
    },
    text:{
      fontWeight: 'bold',
      color: "black",
      fontSize:25,
      paddingVertical: 8,
    },
    subText: {
      fontSize: 20
    },
    verticleLine: {
      width: 1,
      backgroundColor: '#909090',
    },
    horizontalLine: {
      height: 1,
      backgroundColor: '#909090',
    },
    section:{
      height: 50,
      justifyContent: 'center',
      paddingHorizontal:20,
      backgroundColor: 'rgb(245, 209, 66)',
      borderColor: bgColor,
      marginTop: 5,
      marginLeft: 5,
      
    },
    sectionText:{
      fontWeight: 'bold',
      fontSize:26,

    },
    map: {
      flex:1
    },
  }

  export default Profile