
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { getNameOf, getUri, Loading, MyText, NewButton, Row } from "../../components/Components";
import { config } from "../../firebase/authConfig";
import { elapsedTime } from "../../lib/textService/textService";
import ImageView from "react-native-image-viewing";
import ExpoFastImage from "expo-fast-image";


export const Item = ({route,navigation,data,toLoadId,deleteItem}) => {
    const uid = useSelector((state) => state.user.uid)
    const [loadData, setLoadData] = useState(data);
    const [images, setImages] = useState([]);
    const { title, description, author, created_at, booked, bookedBy, id, imagesDesc, imagesBookable, authorName } = loadData || {};
    const [loading, setLoading] = useState(true);
    const [elapsed, setElapsed] = useState();
    const [openedImage, setOpenedImage] = useState(null);

    useEffect(() => {
      setLoadData(null);
      setImages([])
      setLoading(true)
      axios.get('/sale/'+toLoadId,config()).then(async res=>{
        res.data.authorName = await getNameOf(res.data.author)
        setLoadData(res.data)
        setElapsed(elapsedTime(res.data.created_at))
        console.log(res.data);
        setLoading(false)
        const loadImgs = async () => {
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
      })
    }, [toLoadId]);

    return (
      <>
        {!loading ?
      <ScrollView style={{flex:1,padding:0}}>
        <MyText style={styles.author}>{'Ezt '+authorName+' töltötte fel, '+elapsed}</MyText>
        <Row>
          <MyText style={{marginBottom:20,fontSize:25,flexGrow:1}}>{title}</MyText>
          {author == uid && <Row>
            <NewButton style={{marginBottom:20,fontSize:25,padding:10}} title='szerkesztés' />
            <NewButton style={{marginBottom:20,fontSize:25,padding:10}} title='törlés' color='#aa2786' onPress={deleteItem}/>
          </Row>}
        </Row>
        <MyText style={{marginBottom:20,fontSize:20}}>{description}</MyText>
        <ScrollView horizontal>
          {images.map((img,ind)=>
            <View key={"img"+ind} style={styles.image}>
              {imagesBookable[ind] ? <NewButton title='Foglalható' /> : <NewButton style={{backgroundColor:'#fff'}} disabled />}

              <Pressable onPress={()=>setOpenedImage(ind)}>
                <ExpoFastImage source={img} modalImageResizeMode="contain" resizeMode="cover" style={{height:200,width:200}}/>
              </Pressable>
              <MyText>{imagesDesc[ind]}</MyText>
            </View>
          )}
        </ScrollView>
        
      </ScrollView>
      :<Loading color="#FFC372" height={10}/>}
      </>
    )
}


const styles = StyleSheet.create({
  author: {
    marginBottom:20,
    fontSize:20,
    padding:10,
    backgroundColor:'#1279d5',
    color:'white',
    textAlign:'center'
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
    width:200
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