import { useNavigation, useRoute } from '@react-navigation/native';
import ExpoFastImage from 'expo-fast-image';
import { useContext, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useWindowDimensions } from 'react-native'
import { elapsedTime } from '../../lib/textService/textService';
import { getUri, NewButton, ProfileImage, Row, MyText, Auto } from '../../components/Components';
import Icon from 'react-native-vector-icons/Ionicons'
import { styles } from "../../styles/styles";
import ImageModal from 'react-native-image-modal';
import { categories as cats } from '../../lib/categories';
import { SaleContext } from './SaleContext';
import { useHover } from 'react-native-web-hooks';
import { TouchableRipple } from 'react-native-paper';

const categories = cats.sale

export function SaleListItem({data,readOnly}) {
    const navigation = useNavigation();
    const { selected,setSelected,deleteItem,interestItem,openUserModal } = useContext(SaleContext);
    const {title,description,author,name,created_at,imagesDesc,interestedBy,category} = data
    const id = data.id || data._id;
    const myUid = useSelector((state) => state.user.uid)
    const [loadedImage, setLoadedImage] = useState(null);
    const [elapsed, setElapsed] = useState('');
    const [hover, setHover] = useState(false);

    useEffect(() => {
        setElapsed(elapsedTime(created_at))
    }, []);
    const getImages = async () => {
        if (imagesDesc?.length) {
            setLoadedImage(
                await Promise.all([imagesDesc[0]].map( async (e,i)=>{
                    try {
                        return {uri: await getUri('sale/'+id+'/'+i),text: e.description}
                    } catch (error) {
                        return {uri: require('../../assets/profile.jpeg'), text: e.description}
                    }
                }))
            )
        }
    }
    useEffect(() => {
        getImages()
    }, [imagesDesc]);

    const interest = (id,isInterest) => {
        console.log('interesting '+id,interestItem);
        interestItem({id,message:'',isInterest})
    }
    const onPress = (e) => {
        if (setSelected) {
            setSelected(data.id)
        }
        
        navigation.push('cserebere',{id:id})
    }
    const handleDelete = (e) => {
        console.log('del');
        deleteItem(id)
    }
    const handleMessage = (uid) => {
        setSelected({uid:interestedBy})
        setInterestModal(id,interestedBy)
    }
    return (
        <TouchableRipple 
        onPress={onPress} 
        //onHoverIn={()=>setHover(true)}
        //onHoverOut={()=>setHover(false)}
        style={[localStyles.list, { aspectRatio:1/1,backgroundColor: selected==id ? '#fff8ce' : '#ffffff'}]}>
            <>
                <View  style={{width:'100%'}}>
                        {loadedImage ?
                            <ExpoFastImage source={loadedImage[0]} onError={(e)=>{console.log('err',e)}} style={{flex:1,aspectRatio: 1/1,margin:5,borderRadius:8}}/>
                            : <ProfileImage uid={author} style={{flex:1,aspectRatio: 1/1,margin:5,borderRadius:8}}/>}
                </View>
                {!hover&&<><MyText style={{marginRight:5,position:'absolute',backgroundColor:categories[category].color,padding:5}}>{categories[category].name}</MyText>
                <View style={{position:'absolute',bottom:0,backgroundColor:selected==id ? '#fff8ce' : '#ffffff',padding:4,width:'100%',borderRadius:8}}>
                    <MyText style={{ fontWeight: 'bold',fontSize:14 }}>{title}</MyText>
                </View></>}
            </>
                        
        </TouchableRipple>
    );
    
  }

  const localStyles = StyleSheet.create({
        square: {
            width:100,
            marginLeft:5,
            flexDirection:'row',
            justifyContent:'center',
            alignItems:'center',
            height:20,
            padding:20,
            borderRadius: 8
        },
        list: {
            alignItems: "center",
            flex:1,
            borderBottomWidth: 0,
            borderTopWidth: 0,
            marginTop: -1,
            margin: 6,
            borderRadius: 8
        }
  })

  const OpenableText = ({text,open,style}) => {
    const short = '' || text.substring(0,200).replace(/(\r\n|\n|\r)/gm, "");
    if (text.length > 200) {
        return (
                <MyText style={style}>{!!open ? text : short+'...'}</MyText>
        )
    } else return <MyText style={style}>{text}</MyText>
  }