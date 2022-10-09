
import { Professions, Links } from '../Edit';
import { StyleSheet, View, Text, Button, Platform } from 'react-native';

export const Pages = ({newData,setNewData}) => {
    return [
        <View style={styles.page} key="1">
            <Text style={styles.title}>Üdvözöllek a FiFe alkalmazásban.</Text>
            <Text style={styles.text}>Az alkalmazás célja a FiFe szellemiség megvalósítása az online térben.
            Vagyis a korrektséget és segítőkészséget becsomagolni egy biztonságot nyújtó környezetbe.
            Ez egy közösségi háló, ahol a tagok különböző módokon kereshetnek és nyújthatnak segítséget egymásnak.</Text>
            <Text style={styles.text}>Ez egy hasznos eszköz lehet minden budapestinek!</Text>
            <Text>Ahhoz, hogy elkezdhesd használni, először regisztrálnod kell.</Text>
        </View>,
        <View style={styles.page} key="2">
            <Text style={styles.title}>Biztonság</Text>
            <Text style={styles.text}>
                Ahhoz, hogy ez az alkalmazás működhessen, arra van szükség, hogy a tagok
                valóban megbízhatóak legyenek, nem csupán önnön érdekük miatt használják az appot, 
                és ne mások bántása legyen a céljuk.
                Éppen ezért minden felhasználónak lesz egy megbízhatósági skálája, ami megmutatja
                hányan tartják róla azt, hogy bizalommal lehet hozzá fordulni.
            </Text>
            <Text style={styles.text}>Csak az jelölhet megbízhatónak valakit, akit már annak jelölt valaki más.</Text>
        </View>,
        <View style={styles.page} key="3">
            <Text style={styles.title}>Profil</Text>
            <Text style={styles.text}>A profilodban megadhatsz magadról olyan információkat mint:</Text>
            <Text style={styles.text}>- Mihez értesz? Bármilyen végzettség, szaktudás, hobbi</Text>
            <Text style={styles.text}>- Elérhetőségeid. instagramod, saját webhelyed, olyan linkeket, ahol mások is elérhetik, hogy mivel foglalkozol</Text>
            <Text style={styles.text}></Text>
        </View>,
        <View style={styles.page} key="4">
            <Text style={styles.title}>Profil</Text>
            <Text>Adj meg olyan adatokat, amik</Text>
            <Professions data={newData} setData={setNewData} centered/>
        </View>,
        <View style={styles.page} key="5">
            <Text style={styles.title}>Profil</Text>
            <Text>Adj meg olyan adatokat, amik</Text>
            <Links data={newData} setData={setNewData} centered/>
        </View>,
        <View style={styles.page} key="6">
          <Text style={styles.title}>Szép munka! </Text>
          { Platform.OS == 'web' && <>
          <iframe src="https://giphy.com/embed/BBNYBoYa5VwtO" width="480" height="360" frameBorder="0" className="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/cat-shocked-cats-BBNYBoYa5VwtO">via GIPHY</a></p>
          </>}
        </View>
]}


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
      paddingHorizontal:50,
      marginBottom: 20
    },
    button: {
      margin:10
    },
    progressBar: {
      height: 12,
      borderRadius: 5
    }
  });