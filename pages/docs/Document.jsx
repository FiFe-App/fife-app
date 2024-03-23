import { Image, ImageBackground, ScrollView, View, useWindowDimensions } from 'react-native';
import { Auto, B, MyText, ProfileName } from '../../components/Components';
import Loading from "../../components/Loading";
import { useCallback, useState } from 'react';
import Icon from '@expo/vector-icons/Ionicons';
import CustomInput from '../../components/custom/CustomInput';
import { get, getDatabase, query, ref } from 'firebase/database';
import GoBack from '../../components/Goback';
import BasePage from '../../components/BasePage';
import AddDoc from './AddDoc';
import { getDownloadURL, getStorage, ref as storageRef } from 'firebase/storage';
import Docs from './Docs';
import axios from 'axios';
import { config } from '../../firebase/authConfig';
import { Link, useFocusEffect, useLocalSearchParams } from 'expo-router';
import Comments from '../../components/tools/Comments';
import { elapsedTime } from '../../lib/textService/textService';

const Document = ({navigation,route}) => {
    const params = useLocalSearchParams();
    const { id } = params || {};

    const small = useWindowDimensions().width <= 900;
    
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [url, setUrl] = useState(null);
    const [input, setInput] = useState({});
    const { width } = useWindowDimensions();
    const [latest, setLatest] = useState([]);

    const submit = () => {
        console.log('submit');
    }

    const getLatest = async () => {
        try {
            const res = (await axios.get('docs/latest',config())).data
            setLatest(res)
        } catch (err) {
            console.error(err);
            setLoading(false)
        }
    }

    useFocusEffect(
        useCallback(() => {
            Promise.all([
                getLatest(),
                (async ()=> {
                try {
                    if (!id) return;
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
                    setLoading(false)
                }
    
                })()]).then(results => {
            // do stuff with results
          });
          return () => {
          };
        }, [])
      );

      if (!id) return <Docs/>

    return (
    <BasePage full style={{paddingTop:0,paddingBottom:20}}>
        <Auto>
            <View style={{padding:20,marginBottom:16,alignSelf:'flex-start',flex:small?undefined:4}}>
                {loading ? <Loading /> : <>

                <MyText><Link href='cikkek'>Cikkek</Link> <Icon name="chevron-forward"/> <B>{data?.category}</B></MyText>

                <MyText selectable size={24} bold>{data?.title}</MyText>
                <MyText>létrehozta: <ProfileName uid={data.author.uid}/>, {elapsedTime(data.created_at)} </MyText>
                <Image source={{uri:url}} resizeMode={'cover'}  style={[
                    {height:300,width:'100%',backgroundPosition:'bottom',backgroundColor:'#ffffd6',marginVertical:24},
                ]} />
                <MyText selectable size={17} >{data?.text}</MyText>
                <View style={{marginTop:width <= 900 ? 5 : 30}}>
                    {data?.forms.map((f,i)=> <CustomInput key={'form'+i} {...f} setData={setInput} data={input} />)}
                </View></>}
                <Comments path={`docs/${id}`} style={{padding:8}} placeholder="Mit gondolsz erről a cikkről?" />
            </View>
            <View style={{padding:20,flex:small?undefined:1}}>
                <MyText title style={{marginBottom:16}}>Legutóbbi cikkek</MyText>
                <Auto reverse >
                    {latest.map((e,i)=>{
                        if (e.title != data?.title)
                        return (
                            <Link key={'latest'+i} href={'cikk?id='+e.id}><View style={{backgroundColor:'white',padding:8,margin:8}}>
                                <MyText>{e.title}</MyText>
                            </View></Link>
                        )
                    })}
                </Auto>
            </View>
        </Auto>
    </BasePage>)
}

export default Document;