import React, {useState} from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import { Pages } from "./pages";
import * as Progress from 'react-native-progress';


const First = () => {
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
    }
  return (
    <View style={{flex:1}}>
      <View style={{ flex: 8, alignItems:'center', justifyContent:'flex-start',padding:100 }}>
          {pages[page]}
      </View>
      <View style={{ flex: 1, alignItems:'center', justifyContent:'flex-end', marginBottom: 30 }}>
        <Progress.Bar progress={page/(pages.length-1)} width={200} height={10} color='rgba(255,196,0,1)' animationType="timing"/>
      
        <View style={{flexDirection:'row'}}>
          <View style={styles.button}>
            <Button title='Vissza' color='rgba(255,196,0,1)' onPress={()=>goTo(page-1)}/>
          </View>
          <View style={styles.button}>
            <Button title='Tovább' color='rgba(255,196,0,1)' onPress={()=>goTo(page+1)}/>
          </View>
        </View>
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
    margin:10
  },
  progressBar: {
    height: 12,
    borderRadius: 5
  }
});

export default First;