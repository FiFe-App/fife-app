
import React, { useEffect, useContext, useState } from 'react';
import { Text, View, Button, Image, Pressable, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { styles } from './styles'
import { useSelector } from 'react-redux'
import { FirebaseContext } from '../firebase/firebase';
import { getAuth } from "firebase/auth";

import Icon from 'react-native-vector-icons/Ionicons'

import * as ImagePicker from 'expo-image-picker';
import { getDatabase, set, get, ref as databaseRef, onChildAdded, remove, query, equalTo } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Auto, Loading, NewButton, TextInput } from './Components';
import { ActivityIndicator, TouchableOpacity } from 'react-native';
import ImageModal from 'react-native-image-modal';

const themeColor = '#000';//#ba9007
const color2 = '#fcf3d4'//'#FFC372'
//const themeColor = '#fcf3d4';FFC372
const bgColor = '#F2EFE6'
const width = Dimensions.get('window').width;

export const Edit = ({ navigation, route }) => {
  const uid = useSelector((state) => state.user.uid)
  const Dpath = 'users/'+uid+'/pro_file'
  const Spath = 'profiles/'+uid+"/profile.jpg"
  const [image, setImage] = useState(null);
  const [changed, setChanged] = useState(false);
  const [loading, setLoading] = useState(true);
  const {database, app, auth} = useContext(FirebaseContext);
  const [data, setData] = React.useState({});
  const [newData, setNewData] = React.useState(null);
  const [usernameValid, setUsernameValid] = React.useState(true);

  //#region imagePicker
  const init = async () => {
    const storage = getStorage();
    getDownloadURL(storageRef(storage, Spath+''))
    .then((url) => {
        setImage({uri: url})
    }).catch(error => {
        setImage(require("../assets/profile.jpeg"))
    })
  }


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
    setImage(require('./../assets/profile.jpeg'))
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
    if (database) {
      get(databaseRef(database,'users/'+uid+'/data')).then(snapshot=>{
        if (snapshot.exists()) {
          let newData = snapshot.val()
          setData(newData)
          setNewData(newData)
        } else {
          const object = {
            name: '',
            username: '',
            bio: '',
            profession: [],
            links: [],
          }
          setData(object)
          setNewData(object)
        }
      })
      init()
    }
  }, [database]);

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


  function deepEqual(x, y) {
    return (x && y && typeof x === 'object' && typeof y === 'object') ?
      (Object.keys(x).length === Object.keys(y).length) &&
        Object.keys(x).reduce(function(isEqual, key) {
          return isEqual && deepEqual(x[key], y[key]);
        }, true) : (x === y);
  }

  useEffect(() => {
    if (navigation && newData) {
      if (deepEqual(newData,data))
      //console.log('newData',newData);
      setLoading(false)
    } 
  }, [newData]);

  async function save() {
    if (changed)
      uploadImage().then(e=>console.log('uploadSuccess'))
    if (database)
    if (uid) {
        if (newData.username != data.username) {
          await set(databaseRef(database, 'usernames/' + newData.username), {owner:uid})
        }
        newData.unread = null
        console.log("newdata to upload:", newData);
        console.log("data to upload:", data);
        set(databaseRef(database, 'users/' + uid + '/data'), newData)
        .then((e) => {
          console.log(e);
        }).catch(error => {
          console.error(error);
          console.log(newData);
        });
    } else
    navigation.navigate('login')
  }

  if (loading)
  return (
  <View style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:bgColor}}>
    <ActivityIndicator size='large' color='rgba(255,196,0,1)'/>
  </View>)
  else 
  return (
    <View style={{flex:1}}>
    <ScrollView>
      <Auto style={localStyle.container}>
        <View style={{flex:1,marginHorizontal: width > 900 ? 20 : 0}}>
          <View style={localStyle.imageContainer}>
            <View style={{alignItems:'center',borderWidth:2,marginRight:-2}}>
              {!image ? <ActivityIndicator size='large' color='rgba(255,196,0,1)'/> :
              <ImageModal source={image} style={localStyle.image} 
              renderFooter={()=><Text style={{color:'white'}}>abc</Text>}
              resizeMode="contain"/>}
            </View>
            <View >
              <TouchableOpacity onPress={pickImage} style={[localStyle.smallButton,{marginBottom:-2}]}>
                <Icon name='cloud-upload-outline' size={25}></Icon>
              </TouchableOpacity>
              <TouchableOpacity onPress={deleteImage} style={localStyle.smallButton}>
                <Icon name='close-outline' size={40}></Icon>
              </TouchableOpacity>
            </View>
            <View style={{flex:1,paddingHorizontal: 5}}>
              <NewButton title="Mentsd el a profilod" onPress={save} />
            </View>
          </View>
          <Header title="Felhasználónév" icon="ios-finger-print" helpText="Ez az egyedi azonosítód a felhasználók közt"/>
          <View style={[{flexDirection:'row',alignItems:'center'}]}>
            <Icon style={{position:"absolute",alignSelf:'center',top:3,left:7}} name={usernameValid ? "checkmark-circle" : "close-circle"} size={30} color={usernameValid ? "green" : "red"}/>
            <TextInput
              style={[localStyle.input,{paddingLeft:50,flex:1,borderColor: data.username == newData.username ? 'green' : 'orange'}]}
              onChangeText={(e)=>{setNewData({...newData, username: e})}}
              editable
              placeholder="Add meg a felhasználóneved"
              defaultValue={data.username}
            />
          </View>
            {!usernameValid && !!newData.username && <Text style={[localStyle.label,{color:'red'}]}>Nem lehet ez a felhasználóneved!</Text>}

          <Header title="Név" icon="person" helpText="A teljes neved, vagy ahogy szeretnéd hogy szólítsanak"/>
          <TextInput
            style={localStyle.input}
            onChangeText={(e)=>setNewData({...newData, name: e})}
            editable
            placeholder="Név"
            defaultValue={data.name}
          />
          <Header title="Rólad" icon="ellipsis-horizontal" helpText="Bármilyen infó, amit fontosnak tartasz, hogy tudjanak rólad"/>
          <TextInput
            style={localStyle.input}
            onChangeText={(e)=>setNewData({...newData, bio: e})}
            editable
            numberOfLines={5}
            multiline
            placeholder="Rólam"
            defaultValue={data.bio}
          />
        </View>
        <View style={{marginHorizontal: width > 900 ? 20 : 0,flex:1}}>
          <Header title="Helyzet" icon="location-sharp" helpText="Olyan helyet vagy környéket adj meg, ahol általában szoktál lenni"/>
          <Map/>
          <Text>{newData?.location?.name}</Text>
          <Professions data={newData} setData={setNewData}/>
          <Links data={newData} setData={setNewData}/>
        </View>
      </Auto>

    </ScrollView>
    </View>
  )

}

export const Professions = (props) => {
  const {data,setData} = props
  const centered = props.centered || false
  const [list, setList] = useState(data.profession || []);

  useEffect(() => {
    setList(props.data.profession || [])
  }, [props]);

  const addNew = () => {
    setList([...list,{name: '', description: ''}])
  }
  const set = (val,index,key) => {
    const newState = [...list]
    newState[index] = {...newState[index], [key]:val}
    setList(newState)
    if (newState?.length)
      setData({...data,profession:newState})
  } 
  const remove = (i) => {
    setList(list.filter((item,ei) => ei !== i));
    setData({...data,profession:null})
  }
  return (
    <View style={{width:'100%',marginBottom:5}}>
      <Header title="Ehhez értek" icon="thumbs-up" centered={centered} helpText=""/>
      <ScrollView style={{flex:3}}>
      {list && !!list.length && list.map((e,i)=>
        <View key={i}  style={localStyle.profession}>
          <View style={{flexDirection:'row'}}>
            <View style={{width:50,justifyContent:'center',alignItems:'center'}}>
              <Pressable onPress={()=>remove(i)}>
                <Text><Icon name="trash" color={themeColor} size={25}/></Text>
              </Pressable>
            </View>
            <View style={{flex:1,justifyContent:'center'}}>
              <TextInput style={localStyle.input} placeholder="kategória" onChangeText={(val)=>set(val,i,'name')} value={list[i].name}/>
              <TextInput style={localStyle.input} placeholder="leírás" onChangeText={(val)=>set(val,i,'description')} value={list[i].description} multiline numberOfLines={2}/>
            </View>
            <View style={{width:100,justifyContent:'flex-end'}}>
              <Pressable style={{width:100,height:100,margin:5,backgroundColor:'lightblue',alignItems:'center',justifyContent:'center'}}>
                <Text>Új kép</Text>
              </Pressable>
            </View>
          </View>
          {(list.length > i+1) && <View style={localStyle.divider}></View>}
        </View>
      )}
      {!list?.length && <Text style={localStyle.label}>Van valami amiben jó vagy? </Text>}
      </ScrollView>
      <View>
        <Pressable style={[localStyle.adder,centered ? {borderRadius:0} : {}]} onPress={addNew}>
          <Text style={localStyle.text}>
            <Icon name="md-add" color={0} size={40}/>
          </Text>
        </Pressable>
      </View>
    </View>)
}

export const Links = (props) => {
  const {data,setData} = props
  const centered = props.centered || false
  const [list, setList] = useState(data.links || []);
  
  useEffect(() => {
    setList(props.data.links || [])
  }, [props]);

  const addNew = () => {
    setList([...list,{name: '', description: ''}])
  }
  const set = (val,index,key) => {
    const newState = [...list]
    newState[index] = {...newState[index], [key]:val}
    if (newState)
      setData({...data,links:newState})
  } 
  const remove = (i) => {
    setList(list.filter((item,ei) => ei !== i));
    setData({...data,links:null})
  }
  return (
    <View style={{width:'100%'}}>
      <Header title="Elérhetőségeim" icon="at-sharp" centered={centered}/>
      <ScrollView style={{flex:3}}>
      {list && !!list.length && list.map((e,i)=>
        <View key={i}  style={localStyle.profession}>
          <View style={{flexDirection:'row'}}>
            <View style={{width:50,justifyContent:'center',alignItems:'center'}}>
              <Pressable onPress={()=>remove(i)}>
                <Text><Icon name="trash" color={themeColor} size={25}/></Text>
              </Pressable>
            </View>
            <View style={{flex:4}}>
              <TextInput style={localStyle.input} onChangeText={(val)=>set(val,i,'name')} value={list[i].name}/>
              <TextInput style={localStyle.input} onChangeText={(val)=>set(val,i,'description')} value={list[i].description}/>
            </View>
          </View>
          {(list.length > i+1) && <View style={localStyle.divider}></View>}
        </View>
      )}
      {!list?.length && <Text style={localStyle.label}>Milyen elérhetőségeid vannak?</Text>}
      </ScrollView>
      <View>
        <Pressable style={[localStyle.adder,centered ? {borderRadius:0} : {}]} onPress={addNew}>
          <Text style={localStyle.text}>
            <Icon name="md-add" color={0} size={40}/>
          </Text>
        </Pressable>
      </View>
    </View>)
}

const Map = () => {
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (map) {
      L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);
    }
  }, [map]);

  useEffect( () => { 
    return
    let link = document.getElementById("link")
    let script = document.getElementById("script")
    if (!document.getElementById("link") && !document.getElementById("script")) {
      link = document.createElement("link");
      link.id = "link"
      link.rel = "stylesheet";
      link.href="https://unpkg.com/leaflet@1.9.1/dist/leaflet.css"
      link.integrity="sha256-sA+zWATbFveLLNqWO2gtiw3HL/lh1giY/Inf1BJ0z14="
      link.crossOrigin=""

      script = document.createElement("script");
      script.id = "script"
      script.src="https://unpkg.com/leaflet@1.9.1/dist/leaflet.js"
      script.integrity="sha256-NDI0K41gVbWqfkkaHj15IzU7PtMoelkzyKp8TOaFQ3s="
      script.crossOrigin=""

      document.head.appendChild(link);
      document.body.appendChild(script);
    } else {

    }

    script.onload = () => {
      setMap(L.map('map').setView([47.4983, 19.0408], 13));
    }
  })
  return null;
  return (<div id="map" style={{height:200,borderWidth:2,borderStyle:'solid',marginTop:-2,marginBottom:5}}></div>)
}

const Header = (props) => {
  const {icon,title,centered,helpText} = props
  const color = color2
  const [help, setHelp] = useState(false);
  return (
    <>
    <View style={[localStyle.adder,{flexDirection:'row',borderWidth:2},centered ? {borderRadius:30} : {}]}>
      <View style={[localStyle.plusContainer,{color: color}]}>
        <Text style={localStyle.plusText}><Icon name={icon} size={25} color={0}/></Text>
      </View>
      {(width > 900 || !help) && 
      <View style={localStyle.textContainer}>
        <View style={{flex:1}}>
          <Text style={[localStyle.text]}>{title}</Text>
        </View>
        { helpText &&
        <TouchableOpacity onPress={()=>setHelp(!help)}>
          <Icon name={ help ? "help-circle" : "help-circle-outline"} size={25}/>
        </TouchableOpacity>}
      </View>}

    </View>
    {(help && helpText) && 
    <View style={[localStyle.adder,{flexDirection:'row',borderWidth:2},centered ? {borderRadius:30} : {}]}>
      <View style={localStyle.textContainer}>
        <Text style={localStyle.text}>{helpText}</Text>
      </View>

    </View>}
    </>
  )
}

const localStyle = StyleSheet.create ({
  container: { 
    textAlign:'left',
    backgroundColor: bgColor,
    padding: width > 900 ? 50 : 5
  },
  image: {
    resizeMode: 'cover',
    aspectRatio: 1,
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
    paddingVertical: 5,
    borderColor: themeColor,
    borderWidth: 2,
    borderRadius: 0,
    marginBottom:5,
    color:themeColor,
    backgroundColor:'white',
    fontWeight: "600",
    padding: 10,
    paddingVertical:10
  },
  adder: {
    backgroundColor: 'white',
    borderWidth:2,
    //marginTop: 10,
    marginBottom:-2,
    alignItems: 'center'
  },
  plusContainer: {
    backgroundColor: 'white',
    justifyContent: "center",
    textAlign: 'center',
    alignItems:'center',
    borderWidth:2,
    margin:-2,
    width: 43,
    height: 43,
  },
  textContainer: {
    alignItems:'center',
    flexDirection:'row',
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
  },
  smallButton: {
    paddingVertical:10,
    paddingHorizontal:20,
    alignItems: 'center',
    justifyContent: "center",
    borderWidth:2,
    flex:1,
    width:150/2,
    backgroundColor:'white'

  }
})