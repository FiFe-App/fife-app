
import Icon from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import ImageModal from 'react-native-image-modal';
import { useSelector } from 'react-redux';
import { Auto, MyText, NewButton, ProfileImage, Row, Slideshow, getNameOf, getUri } from '../../components/Components';
import Loading from "../../components/Loading";
import Comments from '../../components/tools/Comments';
import { config } from '../../firebase/authConfig';
import { FirebaseContext } from '../../firebase/firebase';
import { categories } from '../../lib/categories';
import { elapsedTime } from '../../lib/textService/textService';
import { SaleContext } from './SaleContext';
import { router, useFocusEffect } from 'expo-router';



export const Item = ({data,toLoadId}) => {
    const { selected,setSelected,setDeleteModal,setToEdit,interestModal,setInterestModal, IList, setIList,shareModal,setShareModal } = useContext(SaleContext);
    const uid = useSelector((state) => state.user.uid)
    const {api} = useContext(FirebaseContext);
    const navigation = router;
    const width = useWindowDimensions().width
    const [loadData, setLoadData] = useState(data);
    const [images, setImages] = useState([]);
    const { title, description, author, category, created_at, interested, id, imagesDesc, imagesInterestable, saleInterest, authorName, interestedByName } = loadData || {};
    const [loading, setLoading] = useState(true);
    const [elapsed, setElapsed] = useState();
    const [openedImage, setOpenedImage] = useState(null);
    const [haveInterested, setHaveInterested] = useState(false);

    useFocusEffect(
      useCallback(() => {
        setLoadData(null);
        setImages([])
        setLoading(true)
        console.log('send query',toLoadId,data);
        
        axios.get('/sale/'+toLoadId,config()).then(async res=>{
          console.log('res',res);
          res.data.authorName = res.authorName || await getNameOf(res.data.author)
          setLoadData(res.data)
          setElapsed(elapsedTime(res.data.created_at))
          console.log(res.data);
          setLoading(false)
          const loadImgs = async () => {
            console.log(res.data.imagesDesc);
            if (res.data.imagesDesc?.length)
            setImages(
              await Promise.all(res.data.imagesDesc?.map( async (e,i)=>{
                  try {
                      return {uri: await getUri('sale/'+res.data.id+'/'+i),text: e.description}
                  } catch (error) {
                      return {uri: require('../../assets/profile.jpeg'), text: e.description}
                  }
              }))
            )
          }
          loadImgs()
        }).catch(err=>{
          console.log('err',err);
          if (err?.response?.data == 'Token expired') {
            console.log('Token expired');
            api.logout();
            return
          }          setLoading(false)
        })
      }, [toLoadId])
    );

    const edit = () => {
        navigation.push({pathname:'uj-cserebere',params:{toEdit:id}});
    }

    const del = () => {
      setSelected(id);
      setDeleteModal(true)
    }


    const handleInterest = async (toInterest) => {
      const newInterested = setInterestModal({id})
      console.log(newInterested);
      setLoadData({...loadData,interested:newInterested,interestedBy:uid})
    }

    useEffect(() => {
      if (interestModal=='submitted')
        setHaveInterested(true)
    }, [interestModal]);

    const goBack = () => {
      if (width <= 900)
      navigation.push('cserebere')
      else
      setSelected(null)
    }

    return (
      <>
      {!loading ?
      <ScrollView style={{flex:1,padding:0,backgroundColor:'rgb(253, 245, 203)',paddingHorizontal:width>400?20:5}}>
        { loadData ? <>
          <View style={{minHeight:100}}>
            {images.length?<Slideshow
              photos={images.length ? images : []}
              style={{backgroundColor:'rgb(253, 245, 203)',maxHeight:400,zIndex:0}}
            />:<ProfileImage uid={author} style={{width:'100%'}}/>}

            <View style={{position:'absolute',bottom:5,left:0,alignSelf: 'flex-start',marginTop:5,zIndex:1}}>
              <MyText size={24} style={{marginHorizontal:10,backgroundColor:categories.sale[category].color,padding:5}}>{categories.sale[category].name}</MyText>
            </View>
          </View>
          
          <MyText size={30} style={{marginTop:0}} selectable>{title}</MyText>
          {uid!=author && 
            <MyText style={[styles.author,{}]}>{'Ezt '}
            <NewButton title={
              <Row style={{backgroundColor:'#fff',borderRadius:8,alignItems:'center',justifyContent:'center'}}>
                <ProfileImage uid={author} size={30} style={{marginRight:5}}/>
                <MyText bold>{authorName}</MyText>
              </Row>}
              color={'#ffffff'}
              onPress={()=>navigation.push({pathname:'profil',params:{uid:author}})}
              info={'Nyisd meg '+authorName+' profilját'}
              />
            {' töltötte fel '}<MyText bold>{elapsed}</MyText></MyText>
          }
          {author == uid &&
          <Row style={{}}>
              <NewButton style={{marginBottom:5,fontSize:25,padding:10,flex:1}} title='szerkesztés'  color='#27aa38' onPress={edit}/>
              <NewButton style={{marginBottom:5,fontSize:25,padding:10,flex:1}} title='törlés' color='#aa2786' onPress={del}/>
            </Row>}
            
          <Row>
            <NewButton title={<Icon name="share-social-outline" size={24}/>} icon onPress={()=>setShareModal(id)}/>
            {uid!=author && uid!=null &&
              <NewButton
                style={{marginHorizontal:0,flexGrow:1}}
                title={haveInterested||saleInterest?.find(e=>e.author==uid)?'Már érdeklődtél':'Érdekel'}
                onPress={haveInterested||saleInterest?.find(e=>e.author==uid)?()=>navigation.push({pathname:'uzenetek',params:{uid:author}}):()=>handleInterest(!saleInterest?.find(e=>e.author==uid))}
              />}
              {uid==author && <NewButton
                style={{marginHorizontal:0,flexGrow:1}}
                title={saleInterest?.length?'Érdeklődők megtekintése':'Még senki sem érdeklődik.'}
                onPress={saleInterest?.length?()=>{
                  setIList(saleInterest)
                }:undefined}
              />}
              {uid==null&&<NewButton
                style={{marginHorizontal:0,flexGrow:1}}
                title={'Jelentkezz be a érdeklődéshez!'}
                onPress={()=>{
                  navigation.push('bejelentkezes')
                }}
              />}
          </Row>
          <MyText style={{marginBottom:20,fontSize:17,padding:10,backgroundColor:'#fff',borderRadius:8}} selectable>{description}</MyText>
          {!!images.length && <ScrollView horizontal style={{backgroundColor:'rgb(253, 245, 203)',flex:1,marginBottom:20}}>
            {images.map((img,ind)=>
              <View key={'img'+ind} style={styles.image}>

                <Pressable onPress={()=>setOpenedImage(ind)}>
                  <ImageModal renderFooter={()=>
                    <View style={{backgroundColor:'#00000066',width:'100%'}}>
                      <MyText style={{color:'white',fontSize:24}}>{imagesDesc[ind]}</MyText>
                    </View>
                  } source={img} modalImageResizeMode="contain" resizeMode="cover" style={{height:200,width:200}}/>
                </Pressable>
                {!!imagesDesc?.[ind] && <MyText style={{margin:5}}>{imagesDesc[ind]}</MyText>}
                {!!imagesInterestable?.[ind] && <NewButton title='Foglalható' />}
              </View>
            )}
          </ScrollView>}
          <Comments path={'sale/'+id+'/comments'}/>
        </> : <View style={{backgroundColor:'rgb(253, 245, 203)',alignSelf:'center',alignItems:'center',marginTop:100,maxWidth:'80%'}}>
        <Icon name="alert-circle" size={100}/>
        <MyText size={30}>Bakfitty!</MyText>
        <MyText>Hiba történt! Lehet törölték a hirdetést, vagy valami hiba történt.</MyText>
        <NewButton title="Próbáld újra" onPress={()=>location.reload()} style={{padding:10}}/>
      </View>}
        
      </ScrollView>
      :<View style={{flex:1,backgroundColor:'rgb(253, 245, 203)'}}>
        <Loading color="#FFC372" height={10}/>
      </View>}
      </>
    )
}


const styles = StyleSheet.create({
  interested: {
    marginBottom:0,
    marginHorizontal:10,
    fontSize:17,
    padding:10,
    backgroundColor:'#1279d5aa',
    color:'white',
    textAlign:'center',
    borderRadius:8
  },  
  author: {
    marginBottom:0,
    fontSize:17,
  },
  square: {
    width:150,
    height:150,
    borderWidth:2,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'#f7f7f7'
  },
  image: {
    width:200,
    flex:1
  },
  close:{
    position: 'absolute', 
    top: 0, 
    left: 130, 
    right: 0, 
    bottom: 130, 
    width:20,
    height:20,
    justifyContent: 'center', 
    alignItems: 'center',
    zIndex:10,
    elevation:10,
    borderRadius:50,
    backgroundColor:'black'
  }
})