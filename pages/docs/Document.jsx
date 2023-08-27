import { Image, ImageBackground, ScrollView, View, useWindowDimensions } from "react-native";
import { Loading, MyText } from "../../components/Components";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import CustomInput from "../../components/custom/CustomInput";
import { get, getDatabase, query, ref } from "firebase/database";
import GoBack from "../../components/Goback";
import BasePage from "../../components/BasePage";
import AddDoc from "./AddDoc";
import { getDownloadURL, getStorage, ref as storageRef } from "firebase/storage";
import Docs from "./Docs";
import axios from "axios";
import { config } from "../../firebase/authConfig";

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
        useCallback(() => {
            if (id)
            (async ()=> {
            try {
                const db = getDatabase()
                const res = (await axios.get('docs/'+id,config())).data
                setData(res)
                if (res.image) {
                    setUrl(res.image)
                } else {
                    const storage = getStorage();
                    const pathReference = storageRef(storage, 'docs/'+id+'.png');
                    getDownloadURL(pathReference)
                    .then((url) => {
                        setUrl(url)
                    })
                    .catch((error) => {
                        // Handle any errors
                    });

                }
                setLoading(false)
            } catch (err) {
                console.error(err);
            }

            })()
          return () => {
          };
        }, [])
      );

      if (!id) return <Docs/>

    if (loading) return <View style={{flex:1,backgroundColor:'#FDEEA2'}}><Loading color="#fff"/></View>
    return (<ScrollView style={{backgroundColor:'#FDEEA2'}}>
        <ImageBackground source={{uri:url}} resizeMode="cover"  style={{height:300,width:'100%',backgroundPosition:'bottom'}} >
            <GoBack text="Vissza" previous="fooldal" breakPoint={10000} 
            style={{backgroundColor:'transparent',padding:20,paddingVertical:40}}/>
        </ImageBackground>
        <View style={{padding:20}}>
            <MyText title>{data?.title}</MyText>
            <MyText size={20} >{data?.text}</MyText>
            <View style={{margin:width <= 900 ? 5 : 30}}>
                {data?.forms.map((f)=> <CustomInput {...f} setData={setInput} data={input} />)}
            </View>
        </View>
    </ScrollView>)
}

export default Document;