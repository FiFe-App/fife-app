import { get, getDatabase, ref, set } from "firebase/database";
import { useEffect, useState } from "react";
import { Image, Modal, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { TouchableRipple } from "react-native-paper";
import { MyText, NewButton, Row } from "../Components";
import { useDispatch, useSelector } from "react-redux";
import { seenMessage } from "../../lib/userReducer";

const MessageModal = ({}) => {
    const small = useWindowDimensions().width <= 900;
    const dispatch = useDispatch();
    const myuid = useSelector((state) => state.user.uid)
    const userSettings = useSelector((state) => state.user.settings.messages)
    const s = useSelector((state) => state.user.settings)
    const [text, setText] = useState(``);
    const [key, setKey] = useState(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
      get(ref(getDatabase(),'globalMessages')).then(e=>{
        const list = e.val();
        console.log('msg',userSettings);
        console.log('msg',s);
        console.log('msg',list);

        Object.keys(list).map(k=>{
          console.log(k,userSettings?.[k]);
          if (!userSettings?.[k]){
            setText(list[k]);
            setKey(k);
            setOpen(true)
          }
        })
      })
    }, []);

    const close = () => {
      set(ref(getDatabase(),'users/'+myuid+'/settings/messages/'+key),true);
      dispatch(seenMessage(key))
      setOpen(null);
    }

    if (open)
    return (<>
        <Modal
        animationType='fade'
        transparent={true}
        visible={true}
        onRequestClose={() => {
          setOpen(false);
        }}>
        <View style={styles.centeredView}>
            <ScrollView style={[styles.modalView,{maxWidth:small?'90%':'70%',flexGrow:0}]}>
              <Row style={{alignItems:'center'}}>
                    <Image source={require('../../assets/en.jpeg')} style={styles.profileImage}/>
                    <MyText style={{flexGrow:1}} title>Kristóf Ákos</MyText>
                    <TouchableRipple onPress={close}><MyText size={30}>x</MyText></TouchableRipple>
              </Row>
                    <MyText size={20}>{text}</MyText>{
                    <NewButton title="Oksi!" style={{alignSelf:'flex-end'}} onPress={close}/>}
            </ScrollView>
        </View>
        </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      flexDirection:'row',
      backgroundColor:'rgba(0,0,0,0.5)'
    },
    profileImage: {
      backgroundColor:'white',
      borderRadius:100,
      marginRight:30,
      zIndex:100,
      height:70,
      width:70
    },
    modalView: {
      margin: 0,
      backgroundColor: "white",
      borderRadius:8,
      padding: 15,
      paddingHorizontal:25,
      maxWidth:'70%',
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5
    },
    openButton: {
      backgroundColor: "#F194FF",
      padding: 10,
      margin:5,
      elevation: 2
    },
    textStyle: {
      fontSize:17,
      color: "white",
      fontWeight: "bold",
      textAlign: "center"
    },
    modalText: {
      fontSize: 24,
      marginBottom: 15,
      textAlign: "left"
    }
  });
  

export default MessageModal