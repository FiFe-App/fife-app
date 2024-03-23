import ExpoFastImage from 'expo-fast-image';
import { router } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TouchableRipple } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { MyText, NewButton, ProfileImage, Row, getUri } from '../../components/Components';
import { categories as cats } from '../../lib/categories';
import { elapsedTime } from '../../lib/textService/textService';
import { SaleContext } from './SaleContext';
import Icon from '@expo/vector-icons/Ionicons';

const categories = cats.sale

export function SaleListItem({data,editable}) {
    const navigation = router;
    const { selected,setSelected,deleteItem,interestItem,setInterestModal } = useContext(SaleContext);
    const {title,author,created_at,imagesDesc,interestedBy,category} = data
    const id = data.id || data._id;
    const [loadedImage, setLoadedImage] = useState(null);
    const [elapsed, setElapsed] = useState('');
    const [hover, setHover] = useState(false);

    useEffect(() => {
        setElapsed(elapsedTime(created_at))
    }, []);
    const getImages = async () => {
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

    const onPress = (e) => {
        if (setSelected) {
            setSelected(data.id)
        }
        
        navigation.push({pathname:'/cserebere',params:{id:id}})
    }
    const handleDelete = (e) => {
        console.log('del');
        deleteItem(id)
    }
    const handleMessage = (uid) => {
        setSelected({uid:interestedBy})
        setInterestModal(id,interestedBy)
    }
    return (
        <View style={[localStyles.list, { backgroundColor: selected==id ? '#fff8ce' : '#ffffff'}]}>
            <TouchableRipple 
            onPress={onPress} 
            style={{flex:1,width:'100%',aspectRatio:1/1}}
            //onHoverIn={()=>setHover(true)}
            //onHoverOut={()=>setHover(false)}
            >
                <>
                    {loadedImage ?
                        <ExpoFastImage source={loadedImage[0].uri} onError={(e)=>{console.log('err',e)}} style={{width:'100%',flex:1,borderRadius:8}}/>
                        : <ProfileImage uid={author} style={{width:'100%',margin:5,flex:1,borderRadius:8}}/>}

                    {!hover&&<><MyText style={{marginRight:5,borderTopLeftRadius:8,borderBottomRightRadius:8,position:'absolute',backgroundColor:categories[category].color,padding:5}}>{categories[category].name}</MyText>
                    <View style={{position:'absolute',bottom:0,backgroundColor:selected==id ? '#fff8ce' : '#ffffff',padding:4,width:'100%',borderRadius:0}}>
                        <MyText style={{ fontWeight: 'bold',fontSize:14 }}>{title}</MyText>
                    </View></>}
                </>
                            
            </TouchableRipple>
            {editable && <Row style={{justifyContent:'space-evenly',width:'100%',padding:8}}>
                <NewButton color='#fdcf9955' title={<Icon name="construct" size={30} />} onPress={()=>router.push({pathname:'uj-cserebere',params:{toEdit:id}})}/>
                <NewButton color='#fd9999' title={<Icon name="trash" size={30} />} onPress={()=>router.push({pathname:'uj-cserebere',params:{toEdit:id}})}/>
            </Row>}
        </View>
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

  const OpenableText = ({text,open,style}) => {
    const short = '' || text.substring(0,200).replace(/(\r\n|\n|\r)/gm, "");
    if (text.length > 200) {
        return (
                <MyText style={style}>{!!open ? text : short+'...'}</MyText>
        )
    } else return <MyText style={style}>{text}</MyText>
  }