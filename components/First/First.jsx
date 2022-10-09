import React, {useState} from 'react';
import { StyleSheet, View, Text, Button, Pressable, TouchableOpacity } from 'react-native';
import { Pages } from "./pages";
import * as Progress from 'react-native-progress';
import { useNavigation } from '@react-navigation/native';


const First = () => {
    const navigation = useNavigation()
    const [page, setPage] = useState(0);
    const [newData, setNewData] = React.useState({
      name: '',
      username: '',
      bio: '',
      profession: [],
      links: [],
    });
    const pages = Pages({newData, setNewData})
    const goTo = (page) => {
      if (page < pages.length && page >= 0)
        setPage(page)
      if (page == pages.length)
        navigation.navigate('home')
    }
  return (
    <View style={{flex:1}}>
      <View style={{ flex: 5, alignItems:'center', justifyContent:'flex-start',padding:100 }}>
          {pages[page]}
      </View>
      <View style={{flexDirection:'row',height:10}}>
        <View style={{backgroundColor:'rgba(255,196,0,1)',width:page/(pages.length-1)*100+'%'}}/>
        <View style={{backgroundColor:'none',width:100-page/(pages.length-1)*100+'%'}}/>
      </View>
      <View style={{ flex: 2, flexDirection:'row' }}>
        <TouchableOpacity style={styles.button} onPress={()=>goTo(page-1)}>
          <Text style={styles.buttonText}>Vissza</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={()=>goTo(page+1)}>
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