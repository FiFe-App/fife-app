import React, { useRef, useEffect } from 'react';
import { Text, Animated, StyleSheet, View, Image, Easing, Pressable, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { ref as sRef, getStorage, getDownloadURL } from "firebase/storage";
import Icon from 'react-native-vector-icons/Ionicons'
import { LinearGradient } from "expo-linear-gradient";
import { useForm, Controller } from "react-hook-form";
import { useNavigation } from '@react-navigation/native';
import { global } from './global';
import { styles as newStyles } from './styles';

const Loading = (props) => {
  const sweepAnim = useRef(new Animated.Value(0)).current  // Initial value for opacity: 0
  const fadeAnim = useRef(new Animated.Value(1)).current  // Initial value for opacity: 0

  useEffect(() => {
    Animated.loop(
      Animated.timing(sweepAnim, {
        toValue: 100,
        easing: Easing.sin,
        duration: 2000,
        useNativeDriver: false
      })
    ).start();
  }, [sweepAnim])

  useEffect(() => {
    Animated.loop(
      Animated.timing(fadeAnim, {
        toValue: 0.1,
        duration: 2000,
        useNativeDriver: false
      })
    ).start();
  }, [sweepAnim])

  return (
    <View style={{ flexDirection: "row" }}>
      <Animated.View style={[{ flex: (1) }]} />
      <Animated.View style={[{ flex: sweepAnim, opacity: (fadeAnim), backgroundColor: props.color, height: 5 }]} />
      <Animated.View style={[{ flex: (1) }]} />
    </View>
  );
}

const LoadImage = (props) => {
  const defaultUrl = require('../assets/profile.jpeg');
  const [url, setUrl] = React.useState(null);
  const [loaded, setLoaded] = React.useState(false);
  const storage = getStorage();
  const imgRef = sRef(storage, `profiles/${props.uid}/profile.jpg`);

  useEffect(() => {
    if (imgRef)
      getDownloadURL(imgRef)
      .then((url) => {
        setUrl(url);
      })
      .catch((error) => {
        setUrl(defaultUrl)
      });
  }, [props.url]);

  var size = 40;
  if (props.size) size = props.size;

  return <View style={[{ margin: 5 }, props.style]}>
    { !loaded &&
    <ActivityIndicator style={{position:'absolute', width: size, height: size, borderRadius: size}} color='rgba(255,175,0,0.7)' />}
    <Image style={{width: size, height: size, borderRadius: size}}
      source={{ uri: url }}  onLoad={() => setLoaded(true)}/>
    
    </View>;
    
}


function Row(props) {
  return (
    <View style={[props.style, { flexDirection: "row" }]}>
      {props.children}
    </View>
  );
}

function Col(props) {
  return (
    <View style={[props.style, { flexDirection: "column" }]}>
      {props.children}
    </View>
  );
}

function FAB(props){
  const {onPress, color='blue', color2='white', icon, size=50} = props
  
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.touchableOpacityStyle}>
      <LinearGradient colors={[color, color2]} start={{ x: 0, y: 0 }} end={{ x: 0.5, y: 1 }} 
        style={[styles.floatingButtonStyle,{width: size, height: size, borderRadius: size}]}>
        <View >
          <Icon name={icon} size={size} color="#fff" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  )
}


function NewEventModal(params) {
  const [modalVisible, setModalVisible] = useState(false)

  const modalStyles = {
      centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
      },
      modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 4,
        padding: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
      },
      button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
      },
      buttonOpen: {
        backgroundColor: '#F194FF',
      },
      buttonClose: {
        backgroundColor: '#2196F3',
      },
      textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
      },
      modalText: {
        marginBottom: 15,
        textAlign: 'center',
      },
    }
  useEffect(()=>{
      setModalVisible(params.modalVisible)
  },[params])

  return (
  <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
          setModalVisible(!modalVisible);
      }}>
      <View style={modalStyles.centeredView}>
          <View style={modalStyles.modalView}>
              <Text style={modalStyles.modalText}>Hello World!</Text>
              <Pressable
              style={[modalStyles.button, modalStyles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}>
              <Text style={modalStyles.textStyle}>Hide Modal</Text>
              </Pressable>
          </View>
      </View>
  </Modal>)

}


const SearchBar = (props) => {
  const allMethods = useForm();
  const { setFocus } = allMethods;
  const navigation = useNavigation();
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      text: props?.search || ''
    }
  });
  const onSubmit = data => {
    if (global.searchList.includes(data.text))
      global.searchList.splice(global.searchList.indexOf(data.text), 1);
    global.searchList.push(data.text);
    setShowHistory(false);
    navigation.push("search", { key: data.text });
  };
  const onBlur = () => {
    console.log('blur');
  } 
  const [showHistory,setShowHistory] = React.useState(false);
  const listItems = global.searchList.reverse().map((element) =>
    <Pressable key={element.toString()} onPress={() => navigation.push("search", { key: element })} >
      <Row style={newStyles.searchList}>
        <Icon name="time-outline" size={25} color="black" style={{ marginHorizontal: 5 }} />
        <Text>{element}</Text>
      </Row>
    </Pressable>
  );
  return (
    <View>
      <View style={{flexDirection: 'row',alignItems: 'center', justifyContent:'center'}}>
        <Controller control={control} rules={{ required: true, }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[newStyles.searchInput,{flex:4}]}
              onBlur={onBlur}
              autoCapitalize='none'
              onChangeText={onChange}
              placeholder="Keress valamire..."
              placeholderTextColor="gray"
              onSubmitEditing={handleSubmit}
              value={value}
              onClick={()=>setShowHistory(true)}
            />
          )}
          name="text"
        />

        <Pressable onPress={handleSubmit(onSubmit)}style={{flex:1,}} >
          <Icon name="search-outline" size={25} color="black" />
        </Pressable>
      </View>
      <ScrollView>
        {(showHistory && global.searchList.length > 0) && listItems}
      </ScrollView>
    </View>
  );

}

export {
  LoadImage,
  Loading,
  Row,
  Col,
  FAB,
  SearchBar
}

const styles = StyleSheet.create({
  titleStyle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
  },
  textStyle: {
    fontSize: 16,
    textAlign: 'center',
    padding: 10,
  },
  touchableOpacityStyle: {
    position: 'absolute',
    alignItems: 'center',
    width: 50,
    height: 50,
    justifyContent: 'center',
    right: 30,
    bottom: 30,
  },
  floatingButtonStyle: {
    resizeMode: 'contain',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:'crimson'
  },
});