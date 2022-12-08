import { child, get, getDatabase, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { B, Col, ProfileImage, Row } from "./Components";

export const CloseModal = ({modalVisible,setModalVisible,handleOK}) => {
  return (
    <Modal
    animationType='fade'
    transparent={true}
    visible={modalVisible}
    >
    <View style={styles.centeredView}>
        <View style={styles.modalView}>
        <Text style={styles.modalText}>Biztos törlöd a posztod?</Text>

        <Row style={{padding:20,margin:10,alignItems:'space-around'}}>
            <TouchableOpacity
                style={{ ...styles.openButton, backgroundColor: "none" }}
                onPress={() => {
                setModalVisible(!modalVisible);
                }}
            >
                <Text style={[styles.textStyle,{color:'black'}]}>Mégse</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={{ ...styles.openButton, backgroundColor: "#ff3b69" }}
                onPress={() => {
                  handleOK()
                }}
            >
                <Text style={styles.textStyle}>Törlés</Text>
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
              <Text style={styles.modalText}><B>{name}</B> lefoglalta ezt a posztot</Text>
              <Text style={styles.modalText}>Mit szeretnél tenni?</Text>
            </Col>
          </Row>

        <Row style={{padding:5,margin:10,alignItems:'space-around'}}>
            <TouchableOpacity
                style={{ ...styles.openButton, backgroundColor: "none" }}
                onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={[styles.textStyle,{color:'black'}]}>Semmit</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={{ ...styles.openButton, backgroundColor: "#663bff" }}
                onPress={() => handleOK()}
            >
                <Text style={styles.textStyle}>Foglalás törlése</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={{ ...styles.openButton, backgroundColor: "#3bffc9" }}
                onPress={() => {handleOK(); setModalVisible(false)}}
            >
                <Text style={[styles.textStyle,{color:'black'}]}>Üzenet {name}nek</Text>
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
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  }
});

export default CloseModal;
