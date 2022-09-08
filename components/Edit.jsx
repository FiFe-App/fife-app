
import React, { useEffect, useContext, useState } from 'react';
import { Text, View, Button, TextInput, Image, Pressable, StyleSheet, ScrollView } from 'react-native';
import { styles } from './styles'
import { useSelector } from 'react-redux'
import { FirebaseContext } from '../firebase/firebase';
import { getAuth } from "firebase/auth";

import Icon from 'react-native-vector-icons/Ionicons'

import * as ImagePicker from 'expo-image-picker';
import { getDatabase, set, get, ref as databaseRef, onChildAdded, remove, query, equalTo } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Loading } from './Components';
import { ActivityIndicator, TouchableOpacity } from 'react-native';

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
          console.log(snapshot.val());
          let newData = snapshot.val()
          setData(newData)
          setNewData(newData)
        } else {
          const object = {
            name: '',
            username: '',
            bio: '',
            links: [],
            profession: []
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

  useEffect(() => {
    if (navigation && newData) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity onPress={save} style={{margin:20}}>
            <Text><Icon name="save" color="black" size={25}/></Text>
          </TouchableOpacity>
        ),
      });
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
  <View style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'white'}}>
    <ActivityIndicator size='large' color='rgba(255,196,0,1)'/>
  </View>)
  else 
  return (
    <ScrollView>
      <View style={localStyle.imageContainer}>
        <Pressable onPress={pickImage} style={{flex:1,alignItems:'center'}}>
          {!image ? <ActivityIndicator size='large' color='rgba(255,196,0,1)'/> :
          <Image source={image} style={localStyle.image} />}
        </Pressable>
      </View>
      <View style={localStyle.container}>
        <Header title="Felhasználónév" icon="ios-finger-print"/>
        <View style={{flexDirection:'row',alignItems:'center',marginLeft:5}}>
          {usernameValid && <Icon name="checkmark-circle" size={25} color="green"/>}
          {!usernameValid && <Icon name="close-circle" size={25} color="red"/>}
          <TextInput
            style={[localStyle.input,{flex:1,borderColor: data.username == newData.username ? 'green' : 'orange'}]}
            onChangeText={(e)=>{setNewData({...newData, username: e})}}
            editable
            placeholder="Add meg a felhasználóneved"
            defaultValue={data.username}
          />
        </View>
          {!usernameValid && !!newData.username && <Text style={[localStyle.label,{color:'red'}]}>Nem lehet ez a felhasználóneved!</Text>}

        <Header title="Név" icon="person"/>
        <TextInput
          style={localStyle.input}
          onChangeText={(e)=>setNewData({...newData, name: e})}
          editable
          placeholder="Név"
          defaultValue={data.name}
        />
        <Header title="Bio" icon="ellipsis-horizontal"/>
        <TextInput
          style={localStyle.input}
          onChangeText={(e)=>setNewData({...newData, bio: e})}
          editable
          multiline
          numberOfLines={5}
          placeholder="Rólam"
          defaultValue={data.bio}
        />
        <Header title="Helyzet" icon="location-sharp"/>
        <Text>{newData?.location?.name}</Text>
        <Professions data={newData} setData={setNewData}/>
        <Links data={newData} setData={setNewData}/>
      </View>
    </ScrollView>
  )

}

const Professions = (props) => {
  const {data,setData} = props
  const [list, setList] = useState(data.profession || []);

  useEffect(() => {
    console.log('proffession list',list);
    if (list?.length)
    setData({...data,profession:list})
  }, [list]);
  
  useEffect(() => {
    setList(props.data.profession)
  }, [props]);

  const addNew = () => {
    setList([...list,{name: '', description: ''}])
  }
  const set = (val,index,key) => {
    const newState = [...list]
    newState[index] = {...newState[index], [key]:val}
    setList(newState)
  } 
  const remove = (i) => {
    setList(list.filter((item,ei) => ei !== i));
  }
  return (
    <View>
      <Header title="Ehhez értek" icon="thumbs-up"/>
      {list && !!list.length && list.map((e,i)=>
        <View key={i}  style={localStyle.profession}>
          <View style={{flexDirection:'row'}}>
            <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
              <Pressable onPress={()=>remove(i)}>
                <Text><Icon name="trash" color="#61a8c2" size={25}/></Text>
              </Pressable>
            </View>
            <View style={{flex:4}}>
              <TextInput style={localStyle.input} onChangeText={(val)=>set(val,i,'name')} value={list[i].name}/>
              <TextInput style={localStyle.input} onChangeText={(val)=>set(val,i,'description')} value={list[i].description} multiline numberOfLines={3}/>
            </View>
            <View style={{flex:5,justifyContent:'center'}}>
              <Pressable style={{width:100,height:100,margin:5,backgroundColor:'lightblue',alignItems:'center',justifyContent:'center'}}>
                <Text>Új kép</Text>
              </Pressable>
            </View>
          </View>
          {(list.length > i+1) && <View style={localStyle.divider}></View>}
        </View>
      )}
      {!list?.length && <Text style={localStyle.label}>Van valami amiben jó vagy? </Text>}
      <View>
        <Pressable style={[localStyle.adder]} onPress={addNew}>
          <Text style={localStyle.text}>
            <Icon name="md-add" color='white'/>
          </Text>
        </Pressable>
      </View>
    </View>)
}

const Links = (props) => {
  const {data,setData} = props
  const [list, setList] = useState(data.links || []);

  useEffect(() => {
    console.log(list);
    if (list)
    setData({...data,links:list})
  }, [list]);
  
  useEffect(() => {
    setList(props.data.links)
  }, [props]);

  const addNew = () => {
    setList([...list,{name: '', description: ''}])
  }
  const set = (val,index,key) => {
    const newState = [...list]
    newState[index] = {...newState[index], [key]:val}
    setList(newState)
  } 
  const remove = (i) => {
    setList(list.filter((item,ei) => ei !== i));
  }
  return (
    <View>
      <Header title="Elérhetőségeim" icon="at-sharp"/>
      {list && !!list.length && list.map((e,i)=>
        <View key={i}  style={localStyle.profession}>
          <View style={{flexDirection:'row'}}>
            <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
              <Pressable onPress={()=>remove(i)}>
                <Text><Icon name="trash" color="#61a8c2" size={25}/></Text>
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
      {!list?.length && <Text style={localStyle.label}>Van valami amiben jó vagy? </Text>}
      <View>
        <Pressable style={[localStyle.adder]} onPress={addNew}>
          <Text style={localStyle.text}>+</Text>
        </Pressable>
      </View>
    </View>)
}

const Header = (props) => {
  const {icon,title} = props
  const color = "#61a8c2"
  return (
    <View style={[localStyle.adder,{flexDirection:'row',backgroundColor:color}]}>
      <View style={[localStyle.plusContainer,{color: color}]}>
        <Text style={localStyle.plusText}><Icon name={icon} size={25} color={color}/></Text>
      </View>
      <View style={localStyle.textContainer}>
        <Text style={localStyle.text}>{title}</Text>
      </View>
    </View>
  )
}

const localStyle = StyleSheet.create ({
  container: { 
    textAlign:'left',
    backgroundColor: 'white',
    paddingLeft:20
  },
  image: {
    resizeMode: 'contain',
    aspectRatio: 1,
    height:200,
    borderRadius: 200,
    backgroundColor:'white'
  },
  imageContainer: {
    backgroundColor: "#61a8c2",
    flexDirection: 'row'
  },
  imagePadding: {
    flex:1,
    backgroundColor: "white"
  },
  color: "#61a8c2",
  input: {
    margin: 5,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: "white",
    padding: 10,
  },
  adder: {
    backgroundColor: '#61a8c2',
    borderRadius: 0,
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    marginVertical: 10,
    alignItems: 'center'
  },
  plusContainer: {
    backgroundColor: 'white',
    borderRadius: 25,
    justifyContent: "center",
    textAlign: 'center',
    alignItems:'center',
    margin: 2,
    width: 40,
    height: 40,
  },
  textContainer: {
    justifyContent: 'center'
  },
  text: {
    textAlign:'center',
    color: 'white',
    margin: 10
  },
  profession: {
    paddingLeft: 30,
  },
  divider: {
    height:2,
    backgroundColor:'gray'
  },
  label: {
    marginLeft: 20,
    marginVertical: 10,
    fontSize: 16,
    
  }
})