import React, {useEffect, useState} from 'react';
import { StyleSheet, View, Pressable, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { Pages } from "./pages";
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons'
import { useWindowDimensions } from 'react-native'
import { MyText, NewButton } from '../../components/Components';


const First = ({scrollView}) => {
    const navigation = useNavigation()
    const route = useRoute()
    const { width } = useWindowDimensions();
    const [page, setPage] = useState(route.params?.p || 0);
    const [percent, setPercent] = useState(0);
    const [newData, setNewData] = React.useState({
      name: '',
      username: '',
      bio: '',
      profession: [],
      links: [],
    });
    const [scrollView2, setScrollView2] = useState(null);
    const [pageData, setPageData] = useState(null);
    const backDisabled = page == 0;
    const [nextDisabled, setNextDisabled] = useState(false);
    const [pages, setPages] = useState([]);
    const allPages = Pages({newData, setNewData,pageData, setPageData});
    
    const goTo = (page) => {
      if (page < allPages.length && page >= 0)
        setPage(page)
      if (page == allPages.length)
        navigation.push('fooldal');
    }

    const handleToHome = () => {
        navigation.push('bejelentkezes')
    }

    useEffect(() => {
      if (scrollView2)
        scrollView2.scrollTo({x:page*width,y:0,animated:false})
    }, [scrollView2]);

    useEffect(() => {
      if (page != null) {
        navigation.setParams({
          p: page,
        });
      }
      //scrollView2.scrollTo({x:(page)*width,y:0,animated:true})
    }, [page]);

  return (
    <View style={{height:Dimensions.get('window').height,backgroundColor:'#fcf3d4'}}>
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{flex:1}}
        horizontal
        ref={ref=>{setScrollView2(ref)}}
        pagingEnabled={true}
        scrollEventThrottle={50}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        onScroll={(e)=>{
          
          if (e.nativeEvent.contentOffset.x >= percent*width){
            setPage(Math.floor(e.nativeEvent.contentOffset.x/(width-5)))
          }else{
            setPage(Math.ceil((e.nativeEvent.contentOffset.x-5)/(width)))
            }
          setPercent(e.nativeEvent.contentOffset.x/width)
        }}>
          {
        allPages.map((p,i)=>{
          if (i >= page-1 && i <= page+1) return p;
          return <View style={{width:width,flex:1}} key={'page'+i}/>
        })}
      </ScrollView>
      <View style={{flexDirection:'row',height:10,position:'absolute',left:0,bottom:0,width:'100%'}}>
        <View style={{backgroundColor:'rgba(255,255,255,0.5)',width:percent/(allPages.length-1)*100+'%'}}/>
        <View style={{backgroundColor:'none',width:100-percent/(allPages.length-1)*100+'%'}}/>
      </View>
      {page < allPages.length-1 &&<NewButton floating
      color='#ffffff'
        style={[styles.button,{right:10},width>=450&&{padding:40}]} 
        onPress={()=>scrollView2.scrollTo({x:(page+1)*width,y:0,animated:true})} 
          title={page > pages.lenght-1 ? 'Befejezés' : 'Tovább'}
          textStyle={[styles.buttonText,width<450&&{fontSize:20}]}
        />}
      {<NewButton floating
      color='#ffffff'
      style={[styles.button,{left:10},width>=450&&{padding:40},]} onPress={()=>backDisabled ? handleToHome() : scrollView2.scrollTo({x:(page-1)*width,y:0,animated:true})} 
        title={backDisabled ? "Bejelentkezés" : "Vissza"}
        textStyle={[styles.buttonText,width<450&&{fontSize:20}]}
      />
      }

    </View>
  );
};

const styles = StyleSheet.create({
  viewPager: {
    flex: 1,
  },
  page: {
    justifyContent: 'center',
    alignItems: 'center',
    width:'100%'
  },
  text: {
    fontSize:25,
    textAlign:'left',
    marginBottom: 30
  },
  title: {
    fontSize: 30,
    width:'100%',
    borderBottomWidth:2,
    paddingBottom:20,
    paddingHorizontal:50
  },
  button: {
    position:'absolute',
    justifyContent:'center',
    alignItems:'center',
    padding:20,
    bottom:30
    
  },
  buttonText: {
    fontSize:30
  },
  progressBar: {
    height: 12,
    borderRadius: 5
  }
});

export default First;