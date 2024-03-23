import Icon from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { FlatList, ImageBackground, Pressable, View, useWindowDimensions } from 'react-native';
import { TouchableRipple } from 'react-native-paper';
import BasePage from '../../components/BasePage';
import { Auto, MyText, Row, TextInput } from '../../components/Components';
import { config } from '../../firebase/authConfig';
import homeDesign from '../../styles/homeDesign';
import { router } from 'expo-router';
import Loading from '../../components/Loading';
import GoBack from '../../components/Goback';
import { shorten } from '../../lib/textService/textService';

const Docs = () => {

    const navigation = router
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const small = useWindowDimensions().width <= 900;

    const searchDirectory = async () => {

        setLoading(true)
        setData(null)
        const result = await axios.get('docs',{...config(),
            params: {
                q: searchText
            }
        }).catch(err=>{
            setLoading(false)
        })
        setData(result.data)
        setLoading(false)
        
    }

    useEffect(() => {
        firstSearch();
    }, []);

    const firstSearch = () => {
        searchDirectory();
    }

    const renderItem = ({item,ind}) => (
            <TouchableRipple key={ind+'one'} style={[homeDesign.module,{width:'100%'}]} onPress={()=>navigation.push({pathname:'cikk',params:{id:item._id}})}>
                <Auto >
                    <ImageBackground 
                    imageStyle={{borderTopLeftRadius:8,borderTopRightRadius:small?8:0,borderBottomLeftRadius:small?0:8}}
                    source={{uri:item?.image}} 
                    resizeMode="cover" 
                    resizeMethod="resize"
                    style={{height:100, width:'100%',borderRadius:8,flex:small?undefined:1}}>
                        <View style={{alignSelf: 'flex-start'}}>
                            <MyText style={{margin:10,backgroundColor:(item?.color||'#fff'),padding:5,borderRadius:8}}>{item.category}</MyText>
                        </View>
                    </ImageBackground>
                    <View style={{flex:4}}>
                        <MyText style={[homeDesign.moduleText,{fontWeight:'bold',borderRadius:small?0:8}]}>{item.title}</MyText>
                        <MyText style={[homeDesign.moduleText,{height:50,overflow:'hidden',flex:1,borderBottomLeftRadius:8,borderBottomRightRadius:8}]}>
                        {shorten(item.text)}</MyText>
                    </View>
                </Auto>
            </TouchableRipple>
    );

    return (
        <BasePage style={{width:'100%'}}>
            <Row style={{alignItems:'center'}}>
                <TextInput
                style={[{fontSize:16,padding:10,backgroundColor:'#ffffff',borderRadius:8,margin:4,flexGrow:1}]}
                returnKeyType="search"
                autoCapitalize='none'
                onChangeText={setSearchText}
                placeholder={'Keress a cikkek közt'}
                placeholderTextColor="gray"
                onSubmitEditing={() => firstSearch()}
                />
                <Pressable 
                onPress={firstSearch}
                style={{padding:10}}><Icon name='search' size={30}/></Pressable>
            </Row>
            <FlatList
                renderItem={renderItem}
                data={data}
                style={{padding:8}}
                enableEmptySections={true}
                ListFooterComponent={
            <View style={{width:'100%',alignItems:'center'}}>
            {!data?.length&&!loading&&<MyText>Nincs találat</MyText>}
                <TouchableRipple onPress={()=>navigation.push({pathname:'uj-cikk'})}>
                    <MyText bold>Írj te is egy cikket!</MyText>
                </TouchableRipple>
            </View>}
            />
            {loading && <Loading color="#fff" />}
        </BasePage>
    )
}

export default Docs;