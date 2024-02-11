import { getAuth, onAuthStateChanged, sendEmailVerification, sendSignInLinkToEmail, updateEmail } from "firebase/auth";
import { Platform, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { MyText, NewButton, TextInput } from "../components/Components";
import { useEffect, useState } from "react";
import GoBack from "../components/Goback";
import { logout, setUserData } from "../lib/userReducer";
import HelpModal from "../components/help/Modal";

const actionCodeSettings = {
    // URL you want to redirect back to. The domain (www.example.com) for this
    // URL must be in the authorized domains list in the Firebase Console.
    url: process.env.NODE_ENV=='development' && Platform.OS == 'web' 
    ? 'http://localhost:19006/kijelentkezes' : 'https://fifeapp.hu/kijelentkezes',
    // This must be true.
    handleCodeInApp: true,
  };
  

const EmailVerification = ({navigation}) => {
    const user = useSelector((state) => state.user.userData);
    const dispatch = useDispatch();
    const [loading,setLoading] = useState(true)
    const [edit, setEdit] = useState(false);
    const [res, setRes] = useState(null);
    const auth = getAuth()
    const [email, setEmail] = useState(user?.email);

    useEffect(() => {
        onAuthStateChanged(auth,(user)=>{
            if (user?.emailVerified) {
                user.reload();
                dispatch(setUserData({ ...user }))
                navigation.push('/')
            } else send();

        })
    }, [auth.currentUser]);

    const send = () => {
        console.log('sending');
        update().then(()=>{
            sendEmailVerification(auth.currentUser, actionCodeSettings).then(res=>{
                setRes('Email elküldve! Nézd meg a spam mappában is!')
            }).catch(err=>{
                console.error(err);
                setRes('A túróba. Valami hiba történt, próbáld meg újra!')
            })
        }).catch(err=>{
            console.log(err);
            if (err.code == 'auth/email-already-in-use')
                setRes('Ez az email már a rendszerben van.')
            else if (err.code == 'auth/invalid-email')
                setRes('Nem megfelelő az email-cím')
            else if (err.code == 'auth/requires-recent-login')
                setRes('Jelentkezz be újra')
            else
            
            setRes(err.code)
        }).finally(()=>{
            setLoading(false)
        })
    }

    const update = async () => {
        if (edit) {
            return updateEmail(auth.currentUser,email)
        }
        return null
    }

    useEffect(() => {
        if (edit)
        setEmail('')
    }, [edit]);

    return (
    <View style={{flex:1,backgroundColor:'#fff8ce',padding:15}}>
        <GoBack previous='bejelentkezes' text={null} style={{margin:20}}
            breakPoint={10000}
            onPress={()=>{
                dispatch(logout())
            }}/>
        <View style={{alignItems:'center',justifyContent:'flex-start',flex:1}}>
        
            <View>
                <MyText>Kérlek igazold az email-címedet</MyText>
                <MyText>Küldtünk egy email-t erre a címre:</MyText>
                {!edit ? <MyText title style={{textAlign:'center'}}>{email}</MyText>
                :<>
                    <TextInput 
                    style={{textAlign:'center',backgroundColor:'#ffffff',
                        padding:20,borderRadius:8,margin:5,fontSize:16}}
                        placeholder='Az új email-címed'
                    value={email} onChangeText={setEmail}/>
                </>}
                <NewButton onPress={send} title="Email újra-küldése" loading={loading} disabled={!email} />
                {res && <MyText size={16} 
                style={{textAlign:'center',backgroundColor:'#ffc795',
                        padding:20,borderRadius:8,margin:5}}>
                        {res}
                </MyText>}
                <NewButton onPress={()=>setEdit(true)} 
                title="Elírtad az email-címed?" color='#fff8ce'/>
                

            </View>
        </View>
    </View>)
}

export default EmailVerification;