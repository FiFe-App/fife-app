import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { useEffect, useState } from "react";
import { FlatList, ImageBackground, Pressable, View, useWindowDimensions } from "react-native";
import { TouchableRipple } from "react-native-paper";
import Icon from 'react-native-vector-icons/Ionicons';
import BasePage from "../../components/BasePage";
import { Auto, Loading, MyText, NewButton, ProfileImage, ProfileName, Row, TextInput, getNameOf } from "../../components/Components";
import { config } from "../../firebase/authConfig";
import homeDesign from '../../styles/homeDesign';
import Comments from "../../components/tools/Comments";
import { elapsedTime } from "../../lib/textService/textService";
import Tags from "../../components/tools/Tags";
import Posting from '../../components/homeComponents/Posting';

const Blog = () => {

    const navigation = useNavigation()
    const [searchText, setSearchText] = useState('');
    const [recommended, setRecommended] = useState(true);
    const [myBuziness, setMyBuziness] = useState(null);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const small = useWindowDimensions().width <= 900;
    const [newData, setNewData] = useState({
        text: '',
        title: ''
    });
    const [openComment, setOpenComment] = useState(null);

    const searchDirectory = async (buziness) => {

        setLoading(true)
        setData(null)
        const result = await axios.patch('blog',
            {
                q: searchText,
                recommended,
                buziness
            },config()
        ).catch(err=>{
            setLoading(false)
        })
        setData(result?.data)
        setLoading(false)
        
    }

    useEffect(() => {
        firstSearch();
    }, []);

    const firstSearch = () => {
        axios.get('users/mybuziness',config()).then(res=>{
            console.log(res.data);
            setMyBuziness(res.data.map(b=>b.name))
            searchDirectory(res.data.map(b=>b.name));
        })
    }


    const createPost = () => {
        if (newData.text && newData.title)
        axios.post('/blog',newData,config()).then(res=>{
            searchDirectory();
            setNewData({
                text: '',
                title: ''
            })
        })
    }

    const renderItem = ({item,ind}) => {
        //console.log(Number(item.created_at.$timestamp).getHighBits());
        //console.log(Date.now());
        return <View key={ind+'one'} style={[homeDesign.module,{width:'100%'}]} onPress={()=>navigation.push('cikkek',{id:item._id})}>
                <View style={{padding:10}}>
                    <Row style={{alignItems:'center'}}>
                        <ProfileImage uid={item.author} size={30}/>
                        <ProfileName uid={item.author} style={{marginLeft:12,fontWeight:'bold'}}/>
                    </Row>
                    <MyText>{elapsedTime(Number(item.created_at.$timestamp))}</MyText>
                    <View style={{flex:4}}>
                        {!!item.title && <View style={{flexWrap:'wrap',flexDirection:'row',margin:0,marginRight:15}}>
                            {item.title.split(' ').map((cat,ind)=>
                                    <View key={"category"+ind} style={{background:'#555555',padding:5,margin:5,maxWidth:'100%'}}>
                                        <MyText style={{color:'white'}}>{cat}</MyText>
                                    </View>
                            )}
                        </View>}
                        <MyText style={[homeDesign.moduleText,{height:50,overflow:'hidden',flex:1,borderBottomLeftRadius:8,borderBottomRightRadius:8}]}>
                        {item.text}</MyText>
                    </View>
                    {openComment==item._id ? 
                    <View>

                    <Comments path={'blog/'+item._id+'/'} />
                    </View>
                    :<Pressable onPress={()=>{setOpenComment(item._id)}}>
                        <MyText bold>Kommentek</MyText>
                    </Pressable>
                    }
                </View>
            </View>
    };

    const header = <>
    <Posting />
    <Row>
        <NewButton title="A bizniszednek megfelelő" color={recommended?'#ffffff':undefined} />
        <NewButton title="Minden" color={!recommended?'#ffffff':undefined} />
    </Row>
    <MyText style={{height:50,marginTop:40}}>Keresés: {myBuziness?.map(b=>{
        return <MyText contained style={{marginRight:20}}>{b}</MyText>
    })}</MyText>
    </>

    return (
        <BasePage left={
            <View style={{backgroundColor:'white',flex:1,minHeight:50}}><MyText size={30}>Írj te is posztot!</MyText></View>
        }>
            
            <FlatList
                renderItem={renderItem}
                data={data}
                style={{padding:8}}
                enableEmptySections={true}
                ListHeaderComponent={header}
                ListFooterComponent={
            <View style={{width:'100%',alignItems:'center'}}>
            {!data?.length&&!loading&&<MyText>Nincs találat</MyText>}
            </View>}
            />
            {loading && <Loading color="#fff" />}
        </BasePage>
    )
}

export default Blog;