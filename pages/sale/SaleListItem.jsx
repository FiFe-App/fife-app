import { useNavigation } from '@react-navigation/native';
import ExpoFastImage from 'expo-fast-image';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useWindowDimensions } from 'react-native'
import { elapsedTime } from '../../lib/textService/textService';
import { getUri, NewButton, ProfileImage, Row, MyText, Auto } from '../../components/Components';
import Icon from 'react-native-vector-icons/Ionicons'
import { styles } from "../../styles/styles";
import ImageModal from 'react-native-image-modal';
import { saleCategories } from '../../lib/categories';

const categories = saleCategories

export function SaleListItem({data,selected,setSelected,deleteItem,bookItem,openUserModal}) {
    const navigation = useNavigation();
    const {title,description,author,name,created_at,imagesDesc,imageBookable,_id,booked,bookedBy,category} = data
    const myUid = useSelector((state) => state.user.uid)
    const [loadedImage, setLoadedImage] = useState(null);
    const [elapsed, setElapsed] = useState('');

    useEffect(() => {
        setElapsed(elapsedTime(created_at))
    }, []);
    const getImages = async () => {
        if (imagesDesc?.length) {
            setLoadedImage(
                await Promise.all([imagesDesc[0]].map( async (e,i)=>{
                    try {
                        return {uri: await getUri('sale/'+_id+'/'+i),text: e.description}
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
    const book = (id,isBook) => {
        console.log('booking '+id);
        bookItem(id,isBook)
    }
    const onPress = (e) => {
        if (setSelected) {
            setSelected(data._id)
            navigation.setParams({id:data._id})
        }
        else navigation.push('cserebere',{id:data._id})
            //if (width <)
            console.log('select',data);
    }
    const handleDelete = (e) => {
        console.log('del');
        deleteItem(_id)
    }
    const handleMessage = (uid) => {
        setSelected({uid:bookedBy})
        openUserModal(_id,bookedBy)
    }
    return (
        <>
        <View style={[styles.list, { backgroundColor: selected ? '#fff8ce' : '#fdfdfd'}]}>
        <TouchableOpacity onPressOut={onPress} style={{flexDirection:'row',width:'100%',alignSelf:'flex-start'}}>
                <View
                >{loadedImage ?
                    <ExpoFastImage source={loadedImage[0]} style={{width:100,height:100,margin:5,borderRadius:8}}/>
                    : <ProfileImage size={100} uid={author} style={{width:100,height:100,margin:5,borderRadius:8}}/>}
                    
                    <View 
                        onStartShouldSetResponder={(event) => true}
                        onTouchEnd={(e) => {
                            e.stopPropagation();
                        }}>
                        { author == myUid ?
                        booked ?
                            // A sajátom és lefoglalta valaki
                            <TouchableOpacity style={[{backgroundColor:'#669d51'},localStyles.square]} onPress={()=>handleMessage(author)}>
                                <Icon name='happy-outline' color='white' size={25}/>
                                <MyText style={{color:'white',fontSize:11,fontWeight:'bold'}}>Lefoglalva</MyText>
                            </TouchableOpacity>
                        :
                            // A sajátom és nincs még lefoglalva
                            <TouchableOpacity style={[{backgroundColor:'#df5264'},localStyles.square]} onPress={handleDelete}>
                                <Icon name='trash' color='white' size={25}/>
                                <MyText style={{color:'white',fontSize:11,fontWeight:'bold'}}>Törlés</MyText>
                            </TouchableOpacity>
                        :
                        booked ?
                            bookedBy == myUid ?
                                // Valakié és lefoglaltam ff7ad4
                                <TouchableOpacity style={[{backgroundColor:'#ff7ad4'},localStyles.square]} onPress={()=>book(_id,booked)}>
                                    <Icon name={'checkmark'} color='white' size={25}/>
                                    <MyText style={{color:'white',fontSize:11,fontWeight:'bold'}}>{'Lefoglaltad!'}</MyText>
                                </TouchableOpacity>
                            :
                                // Valakié és lefoglalta valaki 111111
                                <TouchableOpacity style={[{backgroundColor:'#111111'},localStyles.square]} onPress={()=>book(_id,booked)}>
                                    <Icon name={'lock-closed'} color='white' size={25}/>
                                    <MyText style={{color:'white',fontSize:11,fontWeight:'bold'}}>{'Valaki lefoglalta'}</MyText>
                                </TouchableOpacity>
                        :
                            // Valakié és szabad ddd
                            <TouchableOpacity style={[{backgroundColor:'#ddd'},localStyles.square]} onPress={()=>book(_id,booked)}>
                                <Icon name={'lock-open'} color='black' size={25}/>
                                <MyText style={{color:'black',fontSize:11,fontWeight:'bold'}}>{'Foglalás'}</MyText>
                            </TouchableOpacity>
                    
                        }
                    </View>
                </View>
                <Auto breakPoint={600}>
                    <View style={{marginLeft: 5,flex:'none',}}>
                            <Row>
                                <MyText style={{marginRight:5,backgroundColor:categories[category].color,padding:5}}>{categories[category].name}</MyText>
                                <MyText style={{ fontWeight: 'bold',fontSize:20 }}>{title}</MyText>
                            </Row>
                        <Row style={{alignItems:'center'}}>
                            <MyText style={{ fontWeight: 'bold',fontSize:20 }}>{name}</MyText>
                            <MyText> {elapsed}</MyText>
                        </Row>
                        <OpenableText style={{ margin:5, }} open={false} text={description}/>
                    </View>
                </Auto>
                
        </TouchableOpacity>
        </View>
        </>
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
        }
  })

  const OpenableText = ({text,open,style}) => {
    const short = '' || text.substring(0,50).replace(/(\r\n|\n|\r)/gm, "");
    if (text.length > 50) {
        return (
            <MyText style={style}>{!!open ? text : short+'...'}</MyText>
        )
    } else return <MyText style={style}>{text}</MyText>
  }