import { Modal, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native"
import { MyText, NewButton, Row } from "../Components"
import CustomInput from "../CustomInput";
import { useEffect, useState } from "react";

const HelpModal = ({title,text,successText,actions,inputs=[],open,setOpen}) => {
    const [submitted, setSubmitted] = useState(null);     
    const small = useWindowDimensions().width <= 900;

    useEffect(() => {
      setSubmitted(null)
    }, [open]);

    if (open)
    return (
        <Modal
        animationType='fade'
        transparent={true}
        visible={open}
        onRequestClose={() => {
          setOpen(false);
        }}>
        <View style={styles.centeredView}>
            <View style={[styles.modalView,{maxWidth:small?'95%':'70%'}]}>
                    {!submitted ? <><MyText title>{title}</MyText>
                    <MyText size={20}>{text}</MyText>
                        <ScrollView>
                          {inputs.map(input=>{
                              return (
                                <View style={{padding:5}}>
                                  <CustomInput {...input} style={[{padding:10},input.style]}/>
                                </View>
                              )
                          })}
                        </ScrollView>
                    <Row>
                        {actions.map(action=>{
                            return (
                                <NewButton {...action} onPress={async ()=>{
                                  const res = await action.onPress()
                                  if (action.submit)
                                    setSubmitted(res)
                                }} style={[{padding:10},action.style]}/>
                            )
                        })}
                    </Row></>
                    : <><MyText title>{submitted.title}</MyText>
                    <MyText size={20}>{submitted.text}</MyText>
                    <Row>
                        {submitted.action}
                    </Row></>}
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
      fontSize:20,
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