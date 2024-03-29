import Icon from '@expo/vector-icons/Ionicons';
import Image from 'expo-fast-image';
import { router } from 'expo-router';
import { getDownloadURL, getStorage, ref as sRef } from "firebase/storage";
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Modal, Platform, Pressable, TextInput as RNTextInput, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { styles as newStyles } from '../styles/styles';


import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';
import { get, getDatabase, ref } from 'firebase/database';
import ImageModal from 'react-native-image-modal';
import { TouchableRipple } from 'react-native-paper';
import { useHover } from 'react-native-web-hooks';
import { useDispatch, useSelector } from 'react-redux';
import { shadeColor } from '../lib/functions';
import { push } from '../lib/searchReducer';
import { TextFor } from '../lib/textService/textService';
import { isBright } from '../pages/home/HomeScreen';


//Dimensions.get('window');


const getUri = async (path) => {
  const storage = getStorage();
  const imgRef = sRef(storage, path);
  const url = await getDownloadURL(imgRef)
  console.log(path,url);
  return url
} 

const getNameOf = async (uid) => {
  const name = await AsyncStorage.getItem('name-'+uid)

  if (name != null && name != 'NINCS NÉV') {
    return name;}
  else {
    const res = (await get(ref(getDatabase(),`users/${uid}/data/name`))).val()
  
    if (res) {
      const name = res;
      await AsyncStorage.setItem('name-'+uid,name)
      return name;
    }
    await AsyncStorage.setItem('name-'+uid,'NINCS NÉV')
    return 'NINCS NÉV'

  }
}


const ProfileImage = ({uid,size='100%',style,path,modal}) => {
  // eslint-disable-next-line no-undef
  const defaultUrl = require('../assets/profile.jpeg');
  const [url, setUrl] = React.useState(null);
  const storage = getStorage();

  useEffect(() => {
    if (uid || path){

      getDownloadURL(sRef(storage, path || `profiles/${uid}/profile.jpg`))
      .then((url) => {
        setUrl(url);
      })
      .catch((error) => {
        console.log('e',error);
        setUrl(defaultUrl)
      });

    }
  }, [uid,path]);

  const loading = <View style={{alignItems:'center',justifyContent:'center'}}>
    <ActivityIndicator style={{width: size, height: size}} color='rgba(255,175,0,1)' />
  </View>

  if (!url) return loading
  return modal ? <ImageModal style={[{width: size, height: size},style]}
      cachePolicy='memory-disk'
      modalImageResizeMode='contain'
      cacheKey={`${uid || path}-uid`}

      placeholderContent={( 
        loading
      )} 
      source={url}  />:
      <Image style={[{width: size, height: size},style]}
      cachePolicy='memory-disk'
      onError={()=>{
        console.log('eerr')
        setUrl(defaultUrl)
        }
      }
      modalImageResizeMode='contain'
      cacheKey={`${uid || path}-uid`}
      placeholderContent={( 
        loading
      )} 
      source={url}/>
    
    
}
const ProfileName = ({uid,style}) => {
  // eslint-disable-next-line no-undef
  const [name, setName] = useState(null);

  useEffect(() => {
    (async ()=>{
      setName(await getNameOf(uid));
    })()
  }, [uid]);

  if (!name) return null
  return <MyText style={style}>{name}</MyText>   
}

function NewButton({title,onPress,disabled,style,textStyle,floating,icon,color = "#ffde7e",info,loading=false}) {
  const ref = useRef();
  const isHovered = useHover(ref);
  const [rect, setRect] = useState(null);
  const width = useWindowDimensions().width;

  const [bgColor, setBgColor] = useState(icon ? 'transparent' : color);

  useEffect(() => {
    setBgColor(color)
  }, [color]);

  const handleFocus = () => {
    setBgColor(shadeColor(color,-10))
  }
  useEffect(() => {
    if (rect)
    console.log('rect',rect.x,width);
  }, [rect]);
  return (<>
    <View  ref={ref} 
    onLayout={(event) => {
      //setRect(event.nativeEvent.layout.)
  }}
    style={[style,{margin:0,padding:0,width:'unset',height:'unset',alignItems:'unset',boxShadow:'unset',border:'none'}]}>
      <TouchableRipple onPressOut={()=>setBgColor(color)} onPressIn={()=>{setBgColor(color);handleFocus()}} 
            style={[styles.newButton,
            floating && {shadowColor: "#000",shadowOffset: {width: 4, height: 4 },shadowOpacity: 0.5,shadowRadius: 3,},
            { backgroundColor: bgColor, opacity: disabled ? 0.2 : 1, height:50 },
            icon && { width:50, borderRadius: 100 },
            ,style,{}]} 
            onPress={onPress} disabled={disabled}>
            {!loading ? 
              <MyText style={[{ fontWeight: 'bold', color: isBright(bgColor) , fontSize:16},textStyle]}>{title}</MyText>
            : <ActivityIndicator color={isBright(bgColor)}/> }
      </TouchableRipple>
    </View>
    {info && rect && isHovered && <MyText 
    style={{position:'absolute',backgroundColor:'white',borderWidth:1,borderRadius:8,
      marginTop:rect.height+10,
      left: (width/2 > rect.x ? rect.x : undefined),
      right:(width/2 <=rect.x ? width-rect.x : undefined),
      zIndex:100,padding:10}}>
      {info}
    </MyText>}
    </>
  );
}

class Slideshow extends React.Component {
  width = Dimensions.get('window').width > 900 ? Dimensions.get('window').width/2 : Dimensions.get('window').width 

  constructor(props) {
    super(props);
    this.scrollView = React.createRef();
    this.scrollX = new Animated.Value(0) // this will be the scroll location of our ScrollView

  }

  render() {
    // position will be a value between 0 and photos.length - 1 assuming you don't scroll pass the ends of the ScrollView
    let position = Animated.divide(this.scrollX, this.width);
    return (
      <View style={[{ justifyContent: 'center', alignItems: 'center'},this.props.style]}>
        <View style={{ width:this.width, height: this.width/2, flexDirection:'row' }}>
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
                  resizeMode='cover'
                  source={source}
                />
              );
            })}
          </ScrollView>          
          {this.props.photos.length > 1 && <View style={{justifyContent:'center',padding:20,position:'absolute',left:10,top:this.width/4-30}}>
            <TouchableRipple 
            style={{borderRadius:30}}
            onPress={()=>{
              if (this.scrollX._value < this.width) return 
              this.scrollX.setValue(this.scrollX._value-this.width)
              this.scrollView.current.scrollTo({ x: -this.scrollX._value, y: 0, animated: true })
            }}>
              <Icon name="arrow-back" size={30} color='white'/>
            </TouchableRipple>
          </View>}
          {this.props.photos.length > 1 &&<View style={{justifyContent:'center',padding:20,position:'absolute',right:10,top:this.width/4-30}}>
            <TouchableRipple 
            style={{borderRadius:30}}
            onPress={()=>{
              if (this.scrollX._value > this.props.photos.length*this.width) return 
              this.scrollX.setValue(this.scrollX._value+this.width)
              this.scrollView.current.scrollTo({ x: this.scrollX._value, y: 0, animated: true })
            }}>
              <Icon name="arrow-forward" size={30} color='white'/>
            </TouchableRipple>
          </View>}
        </View>
        <View
          style={{ flexDirection: 'row',position:'absolute', bottom:10 }} // this will layout our dots horizontally (row) instead of vertically (column)
          >
          {this.props.photos.length >1 && this.props.photos.map((_, i) => { // the _ just means we won't use that parameter
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
                style={{ opacity, height: 10, width: 10, backgroundColor: '#fff', margin: 8, borderRadius: 5 }}
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
    <View {...props} style={[props.style, { flexDirection: "row" }]}>
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

function Auto({children,style,breakPoint=900,reverse}) {
  
  const width = useWindowDimensions().width;
  return (
    <View style={[{
      flexDirection: reverse ? 
      width > breakPoint ? 'column' : 'row':
      width <= breakPoint ? 'column' : 'row'
      ,width:'100%',flex: width <= breakPoint ? undefined : 1},style]}>
      {children}
    </View>
  )
}

function FAB(props){
  const {onPress, color='blue', icon, size=50} = props
  
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}
     style={[styles.touchableOpacityStyle,styles.floatingButtonStyle,{backgroundColor:color, width: size, height: size}]}>
      <Icon name={icon} size={size} color="#000" />
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
  const {style} = props

  const dispatch = useDispatch();
  const history = [...useSelector((state) => state.search.history)]

  const navigation = router;
  const params = useLocalSearchParams();
  const [text, setText] = useState(params?.key || '');

  const onSubmit = (newText=text) => {
    dispatch(push(newText))
    setShowHistory(false);
    console.log('search submit');
    console.log('search',newText);
    navigation.push("kereses?key="+newText);
  };
  const onBlur = () => {
    setShowHistory(false)
  } 
  const [showHistory,setShowHistory] = React.useState(false);
  const [rect, setRect] = useState(null);
  console.log('history',history);
  const listItems = history.reverse().map((element) =>
    {
      if (element.includes(text))
      return <Pressable key={'search'+element} onPress={()=>onSubmit(element)} 
                style={[newStyles.searchList,{width:rect?.width}]}>
                  <Icon name="time-outline" size={25} color="black" style={{ margin: 5 }} />
                  <MyText>{element}</MyText>
              </Pressable>}
  );
  return (
    <View style={[{alignSelf:'center',flexWrap:'wrap',flexGrow:1,marginHorizontal:20,marginVertical:17},style]}>
      <View style={{flexDirection: 'row',alignItems: 'center', justifyContent:'center'}}>
        <TextInput
          onLayout={e=>setRect(e.nativeEvent.layout)}
          style={[newStyles.searchInput,{flex:1,fontSize:16,padding:10,marginLeft:20,backgroundColor:'white'}]}

          returnKeyType="search"
          autoCapitalize='none'
          onChangeText={setText}
          placeholder={TextFor({pureText:true,text:'search_text'})}
          placeholderTextColor="gray"
          onSubmitEditing={()=>onSubmit()}

          value={text}

          onMouseDown={(e) => {
            console.log('onMouseDown')
            //e.preventDefault()
          }}
          onBlur={()=>{
            console.log('onBlur')  
            onBlur()
          }}
          onClick={()=>{
            console.log('onClick')
            setShowHistory(true)
          }}
        />
        <Pressable onPress={()=>onSubmit()} style={{width:30,marginLeft:-40}} >
          <Icon name="search-outline" size={25} color="black" />
        </Pressable>
      </View>
        <ScrollView contentContainerStyle={{justifyContent:'flex-start',zIndex:10}} 
        style={{position:"absolute",width:rect?.width,top:rect?.y+40,maxHeight:200,zIndex:10,left:rect?.x,backgroundColor:'#fbf7f0',borderBottomLeftRadius:8,borderBottomRightRadius:8,zIndex:20}}>
          {(showHistory && history.length > 0) && listItems}
        </ScrollView>
    </View>
  );

}

const OpenNav = ({open=false,children,style,height=0}) => {

  const width = useWindowDimensions().width;
  const size = useRef(new Animated.Value(-390)).current 
  const [myHeight, setMyHeight] = useState(0);

  useEffect(() => {
    console.log('navbar open:',height);
  }, [height]);


  useEffect(() => {
    if (open)
    Animated.timing(
      size,
      {
        toValue: height,
        duration: 500,
        useNativeDriver: false
      }
    ).start();
    else
    Animated.timing(
      size,
      {
        toValue: -myHeight+60,
        duration: 500,
        useNativeDriver: false
      }
    ).start();

  }, [open,height]);

  useEffect(() => {
    
  console.log(size._value);
  }, [size._value]);

  if (width > 900) return null
  return (
    <View style={{zIndex:0,elevation: 0}}>
      <View style={{height:height,top:-520,width:'100%',backgroundColor:'#FDEEA2',position:'absolute',zIndex:10,elevation: 10}}></View>
      <Animated.View
      onLayout={e=>setMyHeight(e.nativeEvent.layout.height)}
       style={[{position:'absolute',top:size,width:'100%',zIndex:5,elevation:5,shadowOffset: {width: 0, height: 6 },shadowOpacity: open?0.1:0,shadowRadius: 2},
      ]}>
        {children}
      </Animated.View>
    </View>
  )
}

export const MyText = (props) => {
  const {title, size, contained, bold, light, selectable} = props;
  return <Text  {...props} style={[{
    fontFamily:'SpaceMono_400Regular',
    letterSpacing:-1
    },title && {fontSize:22,marginTop:14},
    contained && {padding:8,borderRadius:8,backgroundColor:'white',fontSize:17,marginTop:14},
    bold && {fontWeight:'bold'},
    light && {fontWeight:'200',color:'gray'},
    size && {fontSize:size},
    !selectable && {userSelect: 'none'}
    ,props?.style]}>
    {props?.children}</Text>
}

const TextInput = React.forwardRef((props,ref) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <RNTextInput
      {...props}
      onLayout={props.onLayout}
      ref={ref}
      placeholderTextColor="#555"
      style={[props.style,{fontFamily:'SpaceMono_400Regular'}, 
      isFocused && {backgroundColor:'#fffbeb'},
      Platform.OS === "web" && {outline: "none" }]}
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


export const Openable = ({open,children,style}) => {

  const WHeight = useWindowDimensions().height;
  const [height, setHeight] = useState(1000);
  const size = useRef(new Animated.Value(-390)).current 

  useEffect(() => {
    if (open)
    Animated.timing(
      size,
      {
        toValue: WHeight/2-50,
        duration: 100,
        useNativeDriver: false
      }
    ).start();
    else
    Animated.timing(
      size,
      {
        toValue: 0,
        duration: 100,
        useNativeDriver: false
      }
    ).start();

  }, [open]);


  
  return (
    <>
      <Animated.View style={style && {height:size,maxHeight:WHeight/2-50,width:'100%',zIndex:30,elevation: 30}}>
        {React.cloneElement(children, { onLayout: (e)=>{
        } })}
      </Animated.View>
    </>
  )
}

export {
  Auto, B, Col, FAB, NewButton, OpenNav, ProfileImage, ProfileName, Row, SearchBar, Slideshow, TextInput, getNameOf, getUri
};

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
    borderRadius: 8,
    right: 30,
    bottom: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 10,
      height: 12,
    },
    shadowOpacity: 0.1,
    shadowRadius: 0.00,

    elevation: 24,
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
    borderRadius: 8,
    paddingHorizontal:20,
    margin:5,
  },
});