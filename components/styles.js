
import { StyleSheet} from 'react-native';
import { borderBottomColor } from 'react-native/Libraries/Components/View/ReactNativeStyleAttributes';

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      fontFamily: "Poppins_200ExtraLight",
      backgroundColor: '#fff',
      justifyContent: 'center',
      paddingHorizontal: 16,
      alignItems: "center"
    },
    modules: {
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'flex-start', // if you want to fill rows left to right
      justifyContent: 'space-around'
    },
    title: {
      fontFamily: "AmaticSC_700Bold",
      fontSize: 60,
      fontWeight: "bold",
      padding: 10
    },
    subTitle: {
      fontSize: 40,
      fontWeight: "bold",
      margin: 10
    },
    label:{
      margin: 5,
      marginLeft: 50
    },
    button:{
      width: 40,
      borderColor: "black",
      borderWidth: 2,
      borderRadius: 10,
      backgroundColor: "yellow",
      color: "black"
    },
    searchInput:{
      margin: 5,
      borderColor: "black",
      borderWidth: 2,
      borderRadius: 10,
      backgroundColor: "white",
      padding: 10,
      fontWeight: "bold",
      maxWidth: 500,
    },
    fixToText: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    navbar: {
      height: 50,
      direction: "rtl",
      flexDirection: "row",
    },
    body: {
      backgroundColor: "#f5d142"
    },
    headline: {
      textAlign: 'center', // <-- the magic
      fontWeight: 'bold',
      fontSize: 18,
      marginTop: 0
    },
    error: {
      textAlign: 'center', // <-- the magic
      fontWeight: 'bold',
      fontSize: 12,
      color: "red",
      margin: 5
    },
    list: {
      alignItems: "center",
      borderColor: "grey",
      borderBottomWidth: 1,
      borderTopWidth: 1,
      padding: 8,
      marginTop: -1,
    },
    searchList: {
      padding: 16,
      backgroundColor: 1,
      borderBottomWidth: 1,
      borderBottomColor: 0,
    }
  });