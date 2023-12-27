import { Modal, StyleSheet, View } from "react-native";
import { MyText, NewButton, ProfileImage, Row, TextInput, getNameOf } from "./Components";
import UserElement from "./tools/UserElement";
import Icon from 'react-native-vector-icons/Ionicons';
import axios from "axios";
import { config } from "../firebase/authConfig";
import { useEffect, useState } from "react";
import CustomInput from "./custom/CustomInput";
import { TouchableRipple } from "react-native-paper";
import { AutoPrefix, embedWord } from "../lib/textService/textService";

const BuzinessModal = ({open,setOpen,user1,user2,b1,b2}) => {
    console.log(open);
    const [myB, setMyB] = useState(null);
    const selected = open?.index;


    useEffect(() => {
        (async ()=>{
            axios.get('users/mybuziness',config()).then(res=>{
                setMyB(res.data)
            })
        })()
    }, []);

    const send = () => {
        axios.post('trade',{
            index:open.index,
            message:open.message,
            user2
        },config()).then(res=>{

        })
    }

    if (open)
    return (
        <Modal
        animationType='fade'
        transparent={true}
        onRequestClose={()=>setOpen(false)}
        visible={open}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Row>
                        <MyText size={20}>Válassz <UserElement uid={user2} style={{fontWeight:'bold'}} onlyText/> bizniszei közül!</MyText>
                    </Row>
                    <View style={{flexDirection:'row'}}>
                        <View style={{flex:1,flexGrow:1}}>
                            <ProfileImage uid={user1} size={50} style={{margin:8,borderRadius:8}}/>
                        </View>
                        <View style={{flex:1,flexGrow:1,alignItems:'flex-end'}}>
                            <ProfileImage uid={user2} size={50} style={{margin:8,borderRadius:8}} />
                        </View>
                    </View>
                    <View style={styles.table}>
                        <View style={styles.cell}>
                            {myB?.map(b=>{
                                return <TouchableRipple style={[{padding:8,borderRadius:8,boxSizing:'border-box',width:'100%'}]}>
                                    <MyText>{b.name}</MyText>
                                </TouchableRipple>
                            })}
                        </View>
                        <View style={{alignItems:'center',justifyContent:'center'}}><Icon name="swap-horizontal-outline" size={30}/></View>
                        <View style={styles.cell}>
                            {b2?.map((b,i)=>{
                                return <TouchableRipple style={[{padding:8,borderRadius:8,boxSizing:'border-box',width:'100%'},
                                selected==i?{backgroundColor:'#99999955'}:{}]} onPress={()=>{
                                    setOpen({...open,index:i})
                                }}>
                                    <MyText>{b.name}</MyText>
                                </TouchableRipple>
                            })}</View>

                    </View>
                    <CustomInput type="text-input" data={open} setData={setOpen} attribute="message" label={"Miért szeretnél vele bizniszelni?"} 
                    placeholder={"Azért érdekel "+embedWord(b2?.[selected].name)+" mert.."} lines={3}/>
                    <NewButton title="Mehet!" onPress={send}/>
                </View>
            </View>
        </Modal>
    )
}
const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor:'rgba(0,0,0,0.5)'
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius:8,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  table: {
    flexDirection:'row'
  },
  cell: {
    padding:4,
    flex:1,
    flexGrow:1,
    borderColor:'gray',
    borderRadius:8,
    borderWidth:1,
    alignItems:'center',
    justifyContent:"center"
  }
});

export default BuzinessModal;