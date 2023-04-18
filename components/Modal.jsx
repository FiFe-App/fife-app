import { child, get, getDatabase, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { B, Col, ProfileImage, Row, MyText } from "./Components";
import Icon from 'react-native-vector-icons/Ionicons'

export const CloseModal = ({modalVisible,setModalVisible,handleOK}) => {
  return (
    <Modal
    animationType='fade'
    transparent={true}
    onRequestClose={()=>setModalVisible(false)}
    visible={modalVisible}
    >
    <View style={styles.centeredView}>
        <View style={styles.modalView}>
        <MyText style={styles.modalText}>Biztos törlöd a posztod?</MyText>

        <Row style={{padding:0,margin:0,alignItems:'space-around'}}>
            <TouchableOpacity
                style={{ ...styles.openButton, backgroundColor: "none" }}
                onPress={() => {
                setModalVisible(!modalVisible);
                }}
            >
                <MyText style={[styles.textStyle,{color:'black'}]}>Mégse</MyText>
            </TouchableOpacity>
            <TouchableOpacity
                style={{ ...styles.openButton, backgroundColor: "#ff3b69" }}
                onPress={() => {
                  handleOK()
                  setModalVisible(!modalVisible);
                }}
            >
                <MyText style={styles.textStyle}>Törlés</MyText>
            </TouchableOpacity>
        </Row>
        </View>
    </View>
    </Modal>
  );
};

export const UserModal = ({modalVisible,setModalVisible,handleOK,uid}) => {
  const [name, setName] = useState(null);
  const database = getDatabase()

  useEffect(() => {
    const dbRef = ref(database);
    get(child(dbRef, `users/${uid}/data/name`))
    .then((snapshot) => {
      setName(snapshot.val())
    })
  }, [uid]);
  return (
    <Modal
    animationType='fade'
    transparent={true}
    visible={modalVisible}
    >
    <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Row style={{justifyContent:'center',alignItems:'center'}}>
            <ProfileImage uid={uid} size={70}/>
            <Col style={{alignItems:'flex-start',margin:10}}>
              <MyText style={styles.modalText}><B>{name}</B> lefoglalta ezt a posztot</MyText>
              <MyText style={styles.modalText}>Mit szeretnél csinálni?</MyText>
            </Col>
          </Row>

        <Row style={{padding:5,margin:10,alignItems:'space-around'}}>
            <TouchableOpacity
                style={{ ...styles.openButton, backgroundColor: "none" }}
                onPress={() => setModalVisible(!modalVisible)}
            >
              <MyText style={[styles.textStyle,{color:'black'}]}>Semmit</MyText>
            </TouchableOpacity>
            <TouchableOpacity
                style={{ ...styles.openButton, backgroundColor: "#663bff" }}
                onPress={() => handleOK()}
            >
                <MyText style={styles.textStyle}>Foglalás törlése</MyText>
            </TouchableOpacity>
            <TouchableOpacity
                style={{ ...styles.openButton, backgroundColor: "#3bffc9" }}
                onPress={() => {handleOK(); setModalVisible(false)}}
            >
                <MyText style={[styles.textStyle,{color:'black'}]}>Üzenet {name}nek</MyText>
            </TouchableOpacity>
        </Row>
        </View>
    </View>
    </Modal>
  );
};

export const AloneModal = ({modalVisible,setModalVisible,handleOK,locationName}) => {

  return (
    <Modal
    animationType='fade'
    transparent={true}
    visible={modalVisible}
    >
    <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Row style={{justifyContent:'center',alignItems:'center'}}>
            <Col style={{alignItems:'flex-start',margin:10}}>
              <MyText style={styles.modalText}><B>Szeretnéd megismerni a {locationName}t?</B></MyText>
              <MyText style={styles.modalText}>
                Ha nem ismered a helyet, de szimpatikus, kereshetsz valakit aki{'\n'}
                már járt itt, és nyomott egy <Icon name="heart" size={18} color="red"/>-et a helyre.
                Ő segít majd hogy eligazodj itt.
              </MyText>
            </Col>
          </Row>

        <Row style={{padding:5,margin:10,alignItems:'space-around'}}>
            <TouchableOpacity
                style={{ ...styles.openButton, backgroundColor: "none" }}
                onPress={() => setModalVisible(false)}
            >
              <MyText style={[styles.textStyle,{color:'black'}]}>Mégse!</MyText>
            </TouchableOpacity>
            <TouchableOpacity
                style={{ ...styles.openButton, backgroundColor: "#3bffc9" }}
                onPress={() => {handleOK(); setModalVisible(false)}}
            >
                <MyText style={[styles.textStyle,{color:'black'}]}>Keressenek meg!</MyText>
            </TouchableOpacity>
        </Row>
        </View>
    </View>
    </Modal>
  );
};

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
    padding: 35,
    alignItems: "center",
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

export default CloseModal;
