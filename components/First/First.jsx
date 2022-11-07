import React, {useEffect, useState} from 'react';
import { StyleSheet, View, Text, Button, Pressable, TouchableOpacity, Dimensions } from 'react-native';
import { Pages } from "./pages";
import * as Progress from 'react-native-progress';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ScrollView } from 'react-native-web';


const First = ({scrollView}) => {
    const navigation = useNavigation()
    const route = useRoute()
    const width = Dimensions.get('window').width
    const [page, setPage] = useState(route.params?.p || 0);
    const [newData, setNewData] = React.useState({
      name: '',
      username: '',
      bio: '',
      profession: [],
      links: [],
    });
    const [pageData, setPageData] = useState(null);
    const [backDisabled, setBackDisabled] = useState(true);
    const [nextDisabled, setNextDisabled] = useState(false);
    const pages = Pages({newData, setNewData,pageData, setPageData})
    const goTo = (page) => {
      if (page < pages.length && page >= 0)
        setPage(page)
      if (page == pages.length)
        navigation.navigate('home');
    }

    useEffect(() => {
      console.log('pageData',pageData);

      //setNextDisabled(!pageData || Object.values(pageData[page]).some(p=>p==false))
      setBackDisabled(page == 0)
    }, [pageData,page]);

    useEffect(() => {
      if (page != null) {
        navigation.setParams({
          p: page,
        });
        
      }
    }, [page]);
  return (
    <View style={{height:Dimensions.get('window').height}}>
      <ScrollView style={{ flex: 5, padding:  width > 900 ? 100 : 2, paddingTop: 20 }} contentContainerStyle={{alignItems:'center', justifyContent:'flex-start'}}>
          {pages[page]}
      </ScrollView>
      <View style={{flexDirection:'row',height:10}}>
        <View style={{backgroundColor:'rgba(255,196,0,0.7)',width:page/(pages.length-1)*100+'%'}}/>
        <View style={{backgroundColor:'none',width:100-page/(pages.length-1)*100+'%'}}/>
      </View>
      <View style={{ flex: 2, flexDirection:'row' }}>
        <TouchableOpacity style={[styles.button]} onPress={()=>backDisabled ? scrollView.scrollTo({ x: 0, y: 0, animated: true }) : goTo(page-1)}>
          <Text style={styles.buttonText}>{backDisabled ? "Bejelentkezés" : "Vissza"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button,nextDisabled && {backgroundColor:'#ffe385'}]} onPress={()=>goTo(page+1)} disabled={nextDisabled}>
          <Text style={styles.buttonText}>{page == pages.length-1 ? 'Befejezés' : 'Tovább'}</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'rgba(255,196,0,1)',
    
    width:'50%'
  },
  buttonText: {
    fontSize:30,
    color:'white'
  },
  progressBar: {
    height: 12,
    borderRadius: 5
  }
});

export default First;