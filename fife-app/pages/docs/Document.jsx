import { Image, ImageBackground, ScrollView, View, useWindowDimensions } from 'react-native';
import { MyText } from '../../components/Components';
import Loading from "../../components/Loading";
import { useCallback, useState } from 'react';
import CustomInput from '../../components/custom/CustomInput';
import { get, getDatabase, query, ref } from 'firebase/database';
import GoBack from '../../components/Goback';
import BasePage from '../../components/BasePage';
import AddDoc from './AddDoc';
import { getDownloadURL, getStorage, ref as storageRef } from 'firebase/storage';
import Docs from './Docs';
import axios from 'axios';
import { config } from '../../firebase/authConfig';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';

const Document = ({navigation,route}) => {
    const params = useLocalSearchParams();
    const { id } = params || {};
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [url, setUrl] = useState(null);
    const [input, setInput] = useState({});
    const { width } = useWindowDimensions();

    const submit = () => {
        console.log('submit');
    }

    useFocusEffect(
        useCallback(() => {
            if (id)
            (async ()=> {
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

    if (loading) return <View style={{flex:1,backgroundColor:'#ffffd6'}}><Loading color="#fff"/></View>
    return (
    <BasePage style={{paddingTop:0,paddingBottom:20}}>
        <Image source={{uri:url}} resizeMode={'cover'}  style={[
            {height:300,width:'100%',backgroundPosition:'bottom',backgroundColor:'#ffffd6',alignSelf:'center'},
            width>900&&{maxWidth:900}
            ]} />
        <View style={{padding:20,maxWidth:900,alignSelf:'center',flex:1}}>
            <MyText size={24} bold>{data?.title}</MyText>
            <MyText size={20} >{data?.text}</MyText>
            <View style={{marginTop:width <= 900 ? 5 : 30}}>
                {data?.forms.map((f)=> <CustomInput {...f} setData={setInput} data={input} />)}
            </View>
        </View>
    </BasePage>)
}

export default Document;