import { useContext, useEffect } from "react";
import { useDispatch } from "react-redux";
import { MyText } from "../components/Components";
import { logout } from "../lib/userReducer";  
import { FirebaseContext } from "../firebase/firebase";
import { View } from "react-native";
import Loading from "../components/Loading";

const Logout = ({navigation}) => {
    const dispatch = useDispatch();
    const {api,app,auth} = useContext(FirebaseContext);
    useEffect(() => {
        setTimeout(() => {
            api.logout();
        }, 2000);
    }, []);
    return (<View style={{backgroundColor:'#FDEEA2',flex:1,alignItems:'center',justifyContent:'center'}}>
        <Loading color="white" />
    </View>)
}

export default Logout;