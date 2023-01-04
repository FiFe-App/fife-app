import { useNavigation } from '@react-navigation/native';
import ExpoFastImage from 'expo-fast-image';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useWindowSize } from '../../hooks/window';
import { elapsedTime } from '../../textService/textService';
import { getUri, NewButton, ProfileImage, Row } from '../Components';
import Icon from 'react-native-vector-icons/Ionicons'
import { styles } from "../styles";
import ImageModal from 'react-native-image-modal';


export function SaleListItem({title,text,uid,name,date,imageNames,index,booked,bookedBy,setSelected,deleteItem,bookItem,openUserModal}) {
    const navigation = useNavigation();
    const width = useWindowSize().width;
    const myUid = useSelector((state) => state.user.uid)
    const [open, setOpen] = useState(false);
    const [images, setImages] = useState(null);
    const elapsed = elapsedTime(date.toDate())

    const getImages = async () => {

        if (imageNames?.length) {
            setImages([])
            setImages(
                await Promise.all(imageNames.map( async (e,i)=>{
                    const fname = e?.filename || e;
                    try {
                        return {uri: await getUri('sale/'+index+'/'+fname),text: e.description}
                    } catch (error) {
                        return {uri: require('../../assets/profile.jpeg'), text: e.description}
                    }
                }))
            )
        }
    }
    useEffect(() => {
        getImages()
    }, [imageNames]);

    const book = (id,isBook) => {
        console.log('booking '+id);
        bookItem(id,isBook)
    }

    const onPress = () => {
        setOpen(!open)
    }

    const handleDelete = () => {
        console.log('del');
        setSelected(index)
        deleteItem(index)
    }
    const handleMessage = (uid) => {
        setSelected({uid:bookedBy})
        openUserModal(index,bookedBy)
    }
    return (
        <>
        <View style={[styles.list, { backgroundColor: '#fdfdfd'}]}>
        <TouchableOpacity onPress={onPress} style={{flexDirection:'row',width:'100%',alignSelf:'flex-start'}}>
                {images?.length ?
                    <ExpoFastImage source={images[0]} style={{width:100,height:100,margin:5}}/>
                    : <ProfileImage style={{}} size={100} uid={uid}/>}
                <View style={{margin: 5, flexGrow:1, alignItems:'stretch'}}>
                    <Text style={{ fontWeight: 'bold',fontSize:20 }}>{title}</Text>
                    <Row style={{alignItems:'center'}}>
                        <Text style={{ fontWeight: 'bold',fontSize:20 }}>{name}</Text>
                        <Text> {elapsed}</Text>
                    </Row>
                    <OpenableText style={{ margin:5, }} open={open} text={text}/>
                </View>
                { uid == myUid ?
                booked ?
                    // A sajátom és lefoglalta valaki
                    <TouchableOpacity style={{backgroundColor:'#669d51',width:100,justifyContent:'center',alignItems:'center'}} onPress={()=>handleMessage(uid)}>
                        <Icon name='happy-outline' color='white' size={25}/>
                        <Text style={{color:'white',fontSize:11,fontWeight:'bold'}}>Lefoglalva</Text>
                    </TouchableOpacity>
                :
                    // A sajátom és nincs még lefoglalva
                    <TouchableOpacity style={{backgroundColor:'#df5264',width:100,justifyContent:'center',alignItems:'center'}} onPress={()=>handleDelete()}>
                        <Icon name='trash' color='white' size={25}/>
                        <Text style={{color:'white',fontSize:11,fontWeight:'bold'}}>Törlés</Text>
                    </TouchableOpacity>
                :
                booked ?
                    bookedBy == myUid ?
                        // Valakié és lefoglaltam
                        <TouchableOpacity style={{backgroundColor:'#ff7ad4',width:100,justifyContent:'center',alignItems:'center'}} onPress={()=>book(index,booked)}>
                            <Icon name={'checkmark'} color='white' size={25}/>
                            <Text style={{color:'white',fontSize:11,fontWeight:'bold'}}>{'Lefoglaltad!'}</Text>
                        </TouchableOpacity>
                    :
                        // Valakié és lefoglalta valaki
                        <TouchableOpacity style={{backgroundColor:'#111111',width:100,justifyContent:'center',alignItems:'center'}} onPress={()=>book(index,booked)}>
                            <Icon name={'lock-closed'} color='white' size={25}/>
                            <Text style={{color:'white',fontSize:11,fontWeight:'bold'}}>{'Valaki lefoglalta'}</Text>
                        </TouchableOpacity>
                :
                    // Valakié és szabad
                    <TouchableOpacity style={{backgroundColor:'#ddd',width:100,justifyContent:'center',alignItems:'center'}} onPress={()=>book(index,booked)}>
                        <Icon name={'lock-open'} color='white' size={25}/>
                        <Text style={{color:'white',fontSize:11,fontWeight:'bold'}}>{'Foglalás'}</Text>
                    </TouchableOpacity>
                
                }
        </TouchableOpacity>
            {open &&
                <View style={{width:'100%'}}>
                    {!!images && <ScrollView horizontal style={{height:200,width:'100%',marginTop:20}}>
                        {images.map((image,i)=>
                        <ImageModal
                        key={'image'+i} 
                        swipeToDismiss={false}
                        resizeMode="center"
                        modalImageResizeMode="contain"
                        imageBackgroundColor="none"
                        renderFooter={()=><View style={{padding:20,backgroundColor:'rgba(0,0,0,0.7)'}}>
                            <Text style={{color:'white'}}>{image.text}</Text>
                        </View>}
                        style={{
                            width: 200,
                            height: 200,
                            padding:10
                        }}
                        source={image.uri}
                        />
                        )}
                    </ScrollView>}
                    <View style={{padding:10}}>
                        { uid != myUid ?
                        <Row style={{width:'100%'}}>
                            <NewButton style={{width:'50%'}} title={"Írj "+name+"nak"} onPress={()=>navigation.navigate('uzenetek',{selected:uid})}/>
                            <NewButton style={{width:'50%'}} title="Jelentés"/>
                        </Row>:
                        <NewButton title="Töröld ki" onPress={handleDelete}/>
                        }
                    </View>
                </View>}
        </View>
        </>
    );
    
  }

  const OpenableText = ({text,open,style}) => {
    const short = '' || text.substring(0,50).replace(/(\r\n|\n|\r)/gm, "");
    if (text.length > 50) {
        return (
            <Text style={style}>{!!open ? text : short+'...'}</Text>
        )
    } else return <Text style={style}>{text}</Text>
  }