import React from 'react';
import { StyleSheet, View, Button } from 'react-native';
import PagerView from 'react-native-pager-view';
import { Pages } from "./pages";
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


const a = 
<ScrollView style={[pageStyle,{backgroundColor:'#945adb'}]} contentContainerStyle={{paddingBottom:160}} key="3">
<MyText style={titleStyle}>A saját bizniszed {"\n"}<MyText style={{fontWeight:"normal"}}>Ez alapján fognak mások megtalálni</MyText></MyText>
  <Auto>
    <View style={{flex:width<=900?'none':1}}>
      <MyText style={[styles.text]}>
      • Szoktál sapkákat kötni? Ha beírod, és valaki rákeres a 'sapka', vagy 'kötés' szóra megtalálhat téged!{"\n"}
      • Programozói állásod van, de szívesen segítenél másoknak, írd ide, és megtalálnak téged!{"\n"}
      • Bármilyen hobbid, munkád van, ha szerinted hasznos lehet ha megtalálják mások, vedd bele
      </MyText>
      <MyText style={[styles.text]}>
        Amiket beírhatsz:{"\n"}
          Kategória: 
          Írd a leírásba, a kategórián belül pontosan mihez értesz, miben tudsz segíteni másoknak, hol tanultad.
          És képeket is hozzáfűzhetsz.
      </MyText>
    </View>
    <View style={{margin:5,marginTop:-1,flex:width<=900?'none':1}}>
      <Professions data={data} setData={setData}/>
    </View>
  </Auto>
</ScrollView>