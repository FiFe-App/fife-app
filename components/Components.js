import React, { useRef, useEffect, useState } from 'react';
import { Animated, Text, StyleSheet, View, Image, Easing, Pressable, ScrollView, TextInput as RNTextInput, TouchableOpacity, ActivityIndicator, Platform, Modal } from 'react-native';
import { ref as sRef, getStorage, getDownloadURL } from "firebase/storage";
import Icon from 'react-native-vector-icons/Ionicons'
import { useForm, Controller } from "react-hook-form";
import { useNavigation, useRoute } from '@react-navigation/native';
import { global } from '../lib/global';
import { styles as newStyles } from '../styles/styles';
import {useWindowDimensions} from 'react-native';

import ImageModal from 'react-native-image-modal';
import { TextFor } from '../lib/textService/textService';
import { useHover } from 'react-native-web-hooks';
import { child, get, getDatabase, ref } from 'firebase/database';
import { isBright } from '../pages/home/HomeScreen';


//Dimensions.get('window');

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
      <Animated.View style={[{ flex: sweepAnim, opacity: (fadeAnim), backgroundColor: props.color, height: props?.height || 5 }]} />
      <Animated.View style={[{ flex: (1) }]} />
    </View>
  );
}

const getUri = async (path) => {
  const storage = getStorage();
  const imgRef = sRef(storage, path);
  //console.log('path',path);
  let returnValue = null 
  await getDownloadURL(imgRef).then(
    uri=>{
      returnValue = uri
    }
  )
  //console.log(returnValue);
  return returnValue
} 

const getNameOf = async (uid) => {
  const db = getDatabase();
  const dbRef = ref(db);
  const snapshot = await get(child(dbRef, `users/${uid}/data/name`))

  if (snapshot.exists()) {
    return snapshot.val()
  }
}


const ProfileImage = (props) => {
  // eslint-disable-next-line no-undef
  const defaultUrl = require('../assets/profile.jpeg');
  const [url, setUrl] = React.useState(null);
  const [loaded, setLoaded] = React.useState(false);
  const storage = getStorage();

  useEffect(() => {
    setLoaded(false)
    if (props.uid){
      getDownloadURL(sRef(storage, props?.uid ? `profiles/${props.uid}/profile.jpg` : props.uid))
      .then((url) => {
        setUrl(url);
        setLoaded(true)
      })
      .catch((error) => {
        console.log('e');
        setUrl(defaultUrl)
        setLoaded(true)
      });

    }
  }, [props.uid]);

  var size = 40;
  if (props.size) size = props.size;

  return <View style={[props.style,{width: size, height: size}]}>
    { !loaded ?
    <ActivityIndicator style={{position:'absolute', width: size, height: size}} color='rgba(255,175,0,0.7)' />:
    <ImageModal style={{width: size, height: size}}
      resizeMode="cover"
      modalImageResizeMode="center"
      source={{ uri: url }} onLoad={() => setLoaded(true)} onError={()=>{setUrl(defaultUrl)}}/>}
    
    </View>;
    
}

function NewButton({color = "#ffde7e",title,onPress,disabled,style}) {
  return (
    <TouchableOpacity style={[styles.newButton, { backgroundColor: disabled ? '#d6b17f' : color, height:50 },style]} onPress={onPress} disabled={disabled}>
          <MyText style={{ fontWeight: 'bold', color: isBright(color) , fontSize:18 }}>{title}</MyText>
    </TouchableOpacity>
  );
}


class Slideshow extends React.Component {
  width = 500

  constructor(props) {
    super(props);
    this.scrollView = React.createRef();
    this.scrollX = new Animated.Value(0) // this will be the scroll location of our ScrollView

  }

  render() {
    // position will be a value between 0 and photos.length - 1 assuming you don't scroll pass the ends of the ScrollView
    let position = Animated.divide(this.scrollX, this.width);
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center'}}>
        <View style={{ width: this.width, height: this.width/2, flexDirection:'row' }}>
          <View style={{justifyContent:'center',padding:20}}>
            <Pressable onPress={()=>{
              this.scrollX.setValue(this.scrollX._value-this.width)
              this.scrollView.current.scrollTo({ x: -this.scrollX._value, y: 0, animated: true })
            }}>
              <Icon name="arrow-back" size={30}/>
            </Pressable>
          </View>
          <ScrollView
            ref={this.scrollView}
            horizontal={true}
            pagingEnabled={true} // animates ScrollView to nearest multiple of it's own this.width
            showsHorizontalScrollIndicator={false}
            // the onScroll prop will pass a nativeEvent object to a function
            onScroll={Animated.event( // Animated.event returns a function that takes an array where the first element...
              [{ nativeEvent: { contentOffset: { x: this.scrollX } } }] // ... is an object that maps any nativeEvent prop to a variable
            )} // in this case we are mapping the value of nativeEvent.contentOffset.x to this.scrollX
            scrollEventThrottle={16} // this will ensure that this ScrollView's onScroll prop is called no faster than 16ms between each function call
            >
            {this.props.photos.map((source, i) => { // for every object in the photos array...
              return ( // ... we will return a square Image with the corresponding object as the source
                <Image
                  key={'image'+i} // we will use i for the key because no two (or more) elements in an array will have the same index
                  style={{ width: this.width, height: this.width/2 }}
                  source={source}
                />
              );
            })}
          </ScrollView>
          <View style={{justifyContent:'center',padding:20}}>
            <Pressable onPress={()=>{
              this.scrollX.setValue(this.scrollX._value+this.width)
              this.scrollView.current.scrollTo({ x: this.scrollX._value, y: 0, animated: true })
            }}>
              <Icon name="arrow-forward" size={30}/>
            </Pressable>
          </View>
        </View>
        <View
          style={{ flexDirection: 'row' }} // this will layout our dots horizontally (row) instead of vertically (column)
          >
          {this.props.photos.map((_, i) => { // the _ just means we won't use that parameter
            let opacity = position.interpolate({
              inputRange: [i - 1, i, i + 1], // each dot will need to have an opacity of 1 when position is equal to their index (i)
              outputRange: [0.3, 1, 0.3], // when position is not i, the opacity of the dot will animate to 0.3
              // inputRange: [i - 0.50000000001, i - 0.5, i, i + 0.5, i + 0.50000000001], // only when position is ever so slightly more than +/- 0.5 of a dot's index
              // outputRange: [0.3, 1, 1, 1, 0.3], // is when the opacity changes from 1 to 0.3
              extrapolate: 'clamp' // this will prevent the opacity of the dots from going outside of the outputRange (i.e. opacity will not be less than 0.3)
            });
            return (
              <Animated.View // we will animate the opacity of the dots so use Animated.View instead of View here
                key={i} // we will use i for the key because no two (or more) elements in an array will have the same index
                style={{ opacity, height: 10, width: 10, backgroundColor: '#595959', margin: 8, borderRadius: 5 }}
              />
            );
          })}
        </View>
      </View>
    );
  }
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

function Auto({children,style,breakPoint=900}) {
  
  const width = useWindowDimensions().width;
  return (
    <View style={[{flexDirection: width <= breakPoint ? 'column' : 'row',width:'100%',height:'100%',flex: width <= breakPoint ? 'none' : 1},style]}>
      {children}
    </View>
  )
}

function FAB(props){
  const {onPress, color='blue', icon, size=50} = props
  
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}
     style={[styles.touchableOpacityStyle,styles.floatingButtonStyle,{backgroundColor:color, width: size, height: size}]}>
      <Icon name={icon} size={size} color="#fff" />
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
              <MyText style={modalStyles.modalText}>Hello World!</MyText>
              <Pressable
              style={[modalStyles.button, modalStyles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}>
              <MyText style={modalStyles.textStyle}>Hide Modal</MyText>
              </Pressable>
          </View>
      </View>
  </Modal>)

}

const SearchBar = (props) => {
  const allMethods = useForm();
  const { setFocus } = allMethods;
  const navigation = useNavigation();
  const route = useRoute();
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      text: route?.params?.key || global.search || ''
    }
  });
  const onSubmit = data => {
    if (global.searchList.includes(data.text))
      global.searchList.splice(global.searchList.indexOf(data.text), 1);
    global.searchList.push(data.text);
    global.search = data.text;
    setShowHistory(false);
    console.log('push');
    navigation.push("kereses", { key: data.text });
  };
  const onBlur = () => {
    setShowHistory(false)
  } 
  const [showHistory,setShowHistory] = React.useState(false);
  const listItems = global.searchList.reverse().map((element) =>
    <Pressable key={element.toString()} onPress={() => onSubmit()} >
      <Row style={[newStyles.searchList,{backgroundColor:'white'}]}>
        <Icon name="time-outline" size={25} color="black" style={{ marginHorizontal: 5 }} />
        <MyText>{element}</MyText>
      </Row>
    </Pressable>
  );
  return (
    <View style={{alignSelf:'center',flexWrap:'wrap',flexGrow:1}}>
      <View style={{flexDirection: 'row',alignItems: 'center', justifyContent:'center'}}>
        <Controller control={control} rules={{ required: true, }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[newStyles.searchInput,{flex:1,fontSize:16,padding:10}]}
              onBlur={onBlur}
              autoCapitalize='none'
              onChangeText={onChange}
              placeholder={TextFor({pureText:true,text:'search_text'})}
              placeholderTextColor="gray"
              onSubmitEditing={handleSubmit(onSubmit)}
              value={value}
              onClick={()=>setShowHistory(true)}
            />
          )}
          name="text"
        />

        <Pressable onPress={handleSubmit(onSubmit)}style={{width:30}} >
          <Icon name="search-outline" size={25} color="black" />
        </Pressable>
      </View>
      <ScrollView style={{position:"absolute",top:45,width:200}}>
        {(showHistory && global.searchList.length > 0) && listItems}
      </ScrollView>
    </View>
  );

}

const OpenNav = ({open,children,style}) => {

  const size = useRef(new Animated.Value(-390)).current 

  useEffect(() => {
    if (open)
    Animated.timing(
      size,
      {
        toValue: 62,
        duration: 500,
      }
    ).start();
    else
    Animated.timing(
      size,
      {
        toValue: -390,
        duration: 500,
      }
    ).start();

  }, [open]);

  return (
    <>
      <View style={{height:60,width:'100%',backgroundColor:'#FDEEA2',position:'absolute'}}></View>
      <Animated.View style={style && {position:'absolute',top:size,width:'100%',zIndex:-30}}>
        {children}
      </Animated.View>
    </>
  )
}

export const MyText = (props) => {
  return <Text style={[{fontFamily:'SpaceMono_400Regular',letterSpacing:-1},props?.style]}>{props?.children}</Text>
}

const TextInput = React.forwardRef((props,ref) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <RNTextInput
      {...props}
      ref={ref}
      placeholderTextColor="grey"
      style={[props.style,{fontFamily:'SpaceMono_400Regular'}, isFocused && 
        {backgroundColor:'#fbf7f0'},Platform.OS === "web" && {outline: "none" }]}
      onBlur={() => {
        setIsFocused(false)
        if (props.onBlur)
          props?.onBlur();
      }}
      onFocus={() => {
        setIsFocused(true)
        if (props.onFocus)
          props?.onFocus();
        //onFocus()
      }}
    />
  );
});
TextInput.displayName = 'TextInput'

const B = ({children}) => {
  return <MyText style={{fontWeight:'bold'}}>{children}</MyText>
}

export const Popup = ({children,style,popup,popupStyle}) => {
  const [opened, setOpened] = useState(false);
  const ref = useRef(null);
  const isHovered = useHover(ref);

  return (
    <View ref={ref} style={style}>
      {children}
      {!!isHovered && <View style={[{position:"absolute"},popupStyle]}>
        {popup}
      </View>}
    </View>
  )
}


export {
  ProfileImage,
  getUri,
  getNameOf,
  Slideshow,
  Loading,
  Row,
  Col,
  Auto,
  FAB,
  SearchBar,
  OpenNav,
  NewButton,
  TextInput,
  B
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:'crimson'
  },
  newButton:{
    alignItems: 'center',
    justifyContent: "center",

    margin:5,
  },
});