import React, { createRef } from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import PagerView from 'react-native-pager-view';
import { Pages } from "./pages";
import { Professions, Links } from '../Edit';
import * as Progress from 'react-native-progress';

const First = ({route,navigation}) => {
  const [newData, setNewData] = React.useState({
    name: '',
    username: '',
    bio: '',
    profession: [],
    links: [],
  });
  const [page,setPage] = React.useState(0)
  const pages = Pages({newData, setNewData})
  return (
    <View style={{ flex: 1 }}>
      <PagerView style={styles.viewPager} initialPage={0}
        onPageSelected={e => {setPage(e.nativeEvent.position)}}>
          {pages}
      </PagerView>
      <View style={{flex:1, alignItems:'center', justifyContent:'center',padding:10 }}>
        {page == pages.length-1 && <Button title="Kezdés" color='rgba(255,196,0,1)'/>}
        <Progress.Bar progress={page/(pages.length-1)} width={300} height={10} color='rgba(255,196,0,1)' animationType="timing"/>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  viewPager: {
    flex: 20,
    marginTop:50
  },
  page: {
    flex:1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    textAlign:'left',
    padding: 20
  },
  text: {
    fontSize:15,
    textAlign:'left',
    width:'100%',
    marginBottom: 30
  },
  title: {
    fontSize: 20,
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