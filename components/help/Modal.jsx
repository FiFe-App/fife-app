import { Modal, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native"
import { MyText, NewButton, Row } from "../Components"
import CustomInput from "../custom/CustomInput";
import { useEffect, useState } from "react";
import { TouchableRipple } from "react-native-paper";

const HelpModal = ({title,text,success,actions,inputs=[],open,setOpen,children}) => {
    const small = useWindowDimensions().width <= 900;
    const height = useWindowDimensions().height

    useEffect(() => {
      console.log('open',open,open!='submitted');
    }, [open]);

    if (open)
    return (
        <Modal
        animationType='fade'
        transparent={true}
        visible={true}
        onRequestClose={() => {
          setOpen(false);
        }}>
        <View style={styles.centeredView}>
            <ScrollView style={[styles.modalView,{width:small?'95%':'70%',maxHeight:height*0.8,flexGrow:0}]}>
                    {open!='submitted' ? <>
                    <Row>
                      <MyText title style={{flexGrow:1}}>{title}</MyText>
                      <TouchableRipple style={{margin:10}} onPress={()=>setOpen(false)}><MyText size={30}>x</MyText></TouchableRipple>
                    </Row>
                    <MyText size={20}>{text}</MyText>
                    {children}
                    {!!inputs&&<ScrollView style={{}}>
                      {inputs.map((input,ind)=>{
                          return (
                            <View style={{padding:0}} key={'helpModal-'+ind}>
                              <CustomInput {...input} style={[{padding:10},input.style]}/>
                            </View>
                          )
                      })}
                    </ScrollView>}
                    {!!actions&&<Row>
                        {actions.map((action,ind)=>{
                            return (
                                <NewButton {...action} key={'helpModalButton-'+ind}
                                onPress={async ()=>{
                                  const res = await action.onPress()
                                }} style={[{padding:10},action.style]}/>
                            )
                        })}
                    </Row>}</>
                    : <><MyText title>{success?.title}</MyText>
                    <MyText size={20}>{success?.text}</MyText>
                    <Row>
                      <NewButton title="Bezárom" onPress={()=>setOpen(null)}/>
                    </Row></>}
            </ScrollView>
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
      margin: 0,
      backgroundColor: "white",
      borderRadius:8,
      padding: 15,
      paddingHorizontal:25,
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
  

export default HelpModal