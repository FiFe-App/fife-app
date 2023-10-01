import { Modal, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native"
import { MyText, NewButton, Row } from "../Components"
import CustomInput from "../custom/CustomInput";
import { useEffect, useState } from "react";

const HelpModal = ({title,text,success,actions,inputs=[],open,setOpen}) => {
    const small = useWindowDimensions().width <= 900;

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
            <View style={[styles.modalView,{maxWidth:small?'95%':'70%'}]}>
                    {open!='submitted' ? <><MyText title>{title}</MyText>
                    <MyText size={20}>{text}</MyText>
                    <ScrollView style={{flex:1}}>
                      {inputs.map((input,ind)=>{
                          return (
                            <View style={{padding:0}} key={'helpModal-'+ind}>
                              <CustomInput {...input} style={[{padding:10},input.style]}/>
                            </View>
                          )
                      })}
                    </ScrollView>
                    <Row>
                        {actions.map((action,ind)=>{
                            return (
                                <NewButton {...action} key={'helpModalButton-'+ind}
                                onPress={async ()=>{
                                  const res = await action.onPress()
                                }} style={[{padding:10},action.style]}/>
                            )
                        })}
                    </Row></>
                    : <><MyText title>{success?.title}</MyText>
                    <MyText size={20}>{success?.text}</MyText>
                    <Row>
                      <NewButton title="Bezárom" onPress={()=>setOpen(null)}/>
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