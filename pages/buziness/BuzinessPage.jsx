
import Icon from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import ImageModal from 'react-native-image-modal';
import { useSelector } from 'react-redux';
import { Auto, B, MyText, NewButton, ProfileImage, Row, Slideshow, getNameOf, getUri } from '../../components/Components';
import Loading from '../../components/Loading';
import Comments from '../../components/tools/Comments';
import { config } from '../../firebase/authConfig';
import { FirebaseContext } from '../../firebase/firebase';
import { categories } from '../../lib/categories';
import { elapsedTime } from '../../lib/textService/textService';
import { BuzinessContext } from './BuzinessContext';
import { Link, router, useFocusEffect } from 'expo-router';

export const BuzinessPage = ({data,toLoadId}) => {
    const { selected,setSelected,setDeleteModal,setToEdit,interestModal,setInterestModal, IList, setIList,shareModal,setShareModal } = useContext(BuzinessContext);
    const myuid = useSelector((state) => state.user.uid)
    const {api} = useContext(FirebaseContext);
    const navigation = router;
    const width = useWindowDimensions().width
    const [loadData, setLoadData] = useState(data);
    const [images, setImages] = useState([]);
    const { name, description, created_at, uid, interested, id, imagesDesc, imagesInterestable, saleInterest, authorName, interestedByName } = loadData || {};
    const category = 0
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
        
        axios.get('/buziness/'+toLoadId,config()).then(async res=>{
          console.log('res',res);
          res.data.authorName = res.authorName || await getNameOf(res.data.uid)
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
                      return {uri: await getUri('buziness/'+res.data.id+'/'+i),text: e.description}
                  } catch (error) {
                      return null
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
        navigation.push({pathname:'uj-biznisz',params:{toEdit:id}});
    }

    const del = () => {
      setSelected(id);
      setDeleteModal(true)
    }

    const handleInterest = async (toInterest) => {
      const newInterested = setInterestModal({id})
      console.log(newInterested);
      setLoadData({...loadData,interested:newInterested,interestedBy:myuid})
    }

    useEffect(() => {
      if (interestModal=='submitted')
        setHaveInterested(true)
    }, [interestModal]);

    return (
      <>
      {!loading ?
      <ScrollView style={{flex:1,padding:0,paddingHorizontal:width>400?20:5}}>
        { loadData ? <>

          <MyText><Link href='biznisz'>Bizniszek</Link> <Icon name="chevron-forward"/> <B>{name}</B></MyText>

          
          <MyText size={30} style={{marginTop:0}} selectable>{name}</MyText>
          {myuid!=uid && 
            <Pressable
              onPress={()=>navigation.push({pathname:'profil',params:{uid:uid}})}
              info={'Nyisd meg '+authorName+' profilját'}
              style={{alignSelf:'flex-start',margin:8,padding:8,backgroundColor:'#fff',borderRadius:8}}>
              <Row style={{alignItems:'center',justifyContent:'center'}}>
                <ProfileImage uid={uid} size={20} style={{marginRight:5}}/>
                <MyText bold>{authorName}</MyText>
              </Row>
            </Pressable>}

            
          <Row style={{gap:8}}>
            <NewButton title={<Icon name="share-social-outline" size={24}/>} icon onPress={()=>setShareModal(id)}/>
            {myuid!=uid && myuid!=null &&
              <NewButton
                style={{marginHorizontal:0,flexGrow:1}}
                title={'Kölcsönös Biznisz'}
                onPress={haveInterested||saleInterest?.find(e=>e.uid==myuid)?()=>navigation.push({pathname:'uzenetek',params:{uid:uid}}):()=>handleInterest(!saleInterest?.find(e=>e.uid==uid))}
              />}
              {myuid!=uid && myuid!=null &&
              <NewButton
                style={{marginHorizontal:0,flexGrow:1}}
                title={'Ajánlom'}
                onPress={haveInterested||saleInterest?.find(e=>e.uid==myuid)?()=>navigation.push({pathname:'uzenetek',params:{uid:uid}}):()=>handleInterest(!saleInterest?.find(e=>e.uid==uid))}
              />}
              {myuid==uid && <NewButton
                style={{marginHorizontal:0,flexGrow:1}}
                title={saleInterest?.length?'Érdeklődők megtekintése':'Még senki sem érdeklődik.'}
                onPress={saleInterest?.length?()=>{
                  setIList(saleInterest)
                }:undefined}
              />}
              {myuid==null&&<NewButton
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
                  } source={img} resizeMode="cover" style={{height:200,width:200}}/>
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