import React, {useState} from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
const First = () => {
    const [page, setPage] = useState(1);
  return (
    
    <View style={{ flex: 1, alignItems:'center', justifyContent:'center ' }}>
        {page == 1 &&
        <View style={{width:"50%", alignItems:'center', justifyContent:'center ' }}>
            <Text style={styles.text}>Üdvözöllek a FiFe alkalmazásban.</Text>
            <Text style={styles.text}>Az alkalmazás célja a FiFe szellemiség megvalósítása az online térben.
            Vagyis a korrektséget és segítőkészséget becsomagolni egy biztonságot nyújtó környezetbe.
            Ezt egy közösségi háló, ahol a tagok különböző módokon kereshetnek és nyújthatnak segítséget egymásnak.</Text>
            <Text style={styles.text}>Ez egy hasznos eszköz lehet minden budapestinek!</Text>
        </View>
        }
        {page == 2 &&
        <View style={{width:"50%", alignItems:'left', justifyContent:'center ' }}>
            <Text style={styles.text}>A profilodban megadhatsz magadról olyan információkat mint:</Text>
            <Text style={styles.text}>- Mihez értesz? Bármilyen végzettség, szaktudás, hobbi</Text>
            <Text style={styles.text}>- Elérhetőségeid. instagramod, saját webhelyed, olyan linkeket, ahol mások is elérhetik, hogy mivel foglalkozol</Text>
            <Text style={styles.text}></Text>
        </View>
        }
        <Button title='Tovább' color='rgba(255,196,0,1)' onPress={()=>setPage(page+1)}/>
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
  },
  text: {
    fontSize:30,
    textAlign:'justify',
    marginBottom: 30
  }
});

export default First;