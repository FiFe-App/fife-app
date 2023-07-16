import { Image, ScrollView, View, useWindowDimensions } from "react-native";
import { Loading, MyText } from "../../components/Components";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import CustomInput from "../../components/CustomInput";
import { get, getDatabase, query, ref } from "firebase/database";
import GoBack from "../../components/Goback";
import BasePage from "../../components/BasePage";
import AddDoc from "./AddDoc";
import { getDownloadURL, getStorage, ref as storageRef } from "firebase/storage";

const Document = ({navigation,route}) => {
    const { id } = route.params || {};
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [url, setUrl] = useState(null);
    const [input, setInput] = useState({});
    const { width } = useWindowDimensions();

    const submit = () => {
        console.log('submit');
    }

    useFocusEffect(
        useCallback(async () => {
            const db = getDatabase()
            try {
                const res = await get(ref(db,'docs/'+id))
                setData(res.val())
                const storage = getStorage();
                const pathReference = storageRef(storage, 'docs/'+id+'.png');
                getDownloadURL(pathReference)
                .then((url) => {
                    setUrl(url)
                })
                .catch((error) => {
                    // Handle any errors
                });
            } catch (err) {
                console.error(err);
            }
            setLoading(false)
          return () => {
          };
        }, [])
      );

      if (!id) return <AddDoc/>

    if (loading) return <View style={{flex:1,backgroundColor:'#FDEEA2'}}><Loading color="#fff"/></View>
    return (<BasePage style={{backgroundColor:data?.color || '#FDEEA2'}}>
        <GoBack text="Vissza a főoldalra" previous="fooldal" breakPoint={10000}/>
        <Image source={{uri:url}} resizeMode="contain"  style={{height:300,width:'100%',backgroundPosition:'bottom'}} />
        <MyText title>{data?.title}</MyText>
        <MyText size={20} >{data?.text}</MyText>
        <View style={{margin:width <= 900 ? 5 : 30}}>
            {data?.forms.map((f)=> <CustomInput {...f} setData={setInput} data={input} />)}
        </View>
    </BasePage>)
}

export default Document;