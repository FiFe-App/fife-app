import { getDatabase, push, ref, set } from "firebase/database";
import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FirebaseContext } from "../firebase/firebase";
import { setBugData } from "../lib/userReducer";
import HelpModal from "./help/Modal";
import { useRoute } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import { MyText, NewButton } from "./Components";
import Icon from 'react-native-vector-icons/Ionicons';
import { getApp } from "firebase/app";

const BugModal = () => {

  //const route = useRoute()
  const app = getApp()
  const database = getDatabase(app)
  const uid = useSelector((state) => state.user.uid)
  const data = useSelector((state) => state.user.bugData)
  const dispatch = useDispatch()
  const report = async () => {

    if (!data.message) return
    let res = null
    console.log({
      uid,
      //route: {path:route.name,params:route?.params||null},
      time: Date.now(),
      message: data.message
  });
    const reportListRef = ref(database,`bugReport/${uid}`)
    const newReportRef = push(reportListRef);

    await set(newReportRef ,{
        uid,
        route: {path:route.name,params:route?.params||null},
        time: Date.now(),
        message: data.message
    }).then(()=>{
        res = {
                title: <MyText><Icon name='checkmark-circle' size={30}/> Sikeresen feltöltötted az észrevételed!</MyText>,
                text: "Köszönjük a fifetársadalom nevében a munkádat!",
                action: <NewButton title="Bezárom" onPress={()=>dispatch(setBugData(null))}/>
        }
    }).catch(err=>{
      res = {
        title: <MyText>Hajaj valami elromlott, bocsi :(</MyText>,
        text: "Milyen kínos, nem? "+JSON.stringify(err),
        action: <NewButton title="Bezárom" onPress={()=>dispatch(setBugData(null))}/>
      }
    })

    return res;
  }

  const setData = (data) => {
    dispatch(setBugData(data))
  }
    return (<HelpModal
        title="Hibát találtál?"
        text='Írd le ide kérlek, hogy pontosan mi következtében történt a hiba (mire kattintottál pl.), és hogy mi történt vagy nem történt ezután.'
        actions={[
          {title:'mégse',onPress:()=>dispatch(setBugData(null))},
          {title:'jelent',onPress:report,color:'#ff462b',submit:true}]}
        open={!!data}
        setOpen={setData}
        inputs={[
          {type:'text-input',attribute:'message',label:null,data:data,setData:setData,style:{backgroundColor:'#fbf1e0'}}
        ]}
      />)
}

export default BugModal