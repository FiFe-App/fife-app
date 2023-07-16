import { StyleSheet } from "react-native";


const styles = StyleSheet.create({
    viewPager: {
      flex: 1,
    },
    text: {
      fontSize:22,
      textAlign:'left',
      padding:20,
      marginBottom: 10,
      backgroundColor:'white',
      opacity: 0.8
    },
    list: {
      fontSize:20,
      flexDirection:'column'
    },
    listItem: {
      fontSize:20,
      margin:5
    },
    link: {
      fontSize:25,
      textAlign:'left',
      marginBottom: 30,
      color:'rgb(181, 139, 0)'
    },
    title: {
      //fontSize: width > 900 ? 50 : 40,
      width:'100%',
      fontWeight:'bold',
      paddingVertical:20,
      //paddingHorizontal: width <= 900 ? 5 : 50,
      marginBottom: 20
    },
    titleW: {
      color:'white',
      //fontSize: width > 900 ? 50 : 40,
      width:'100%',
      fontWeight:'bold',
      paddingVertical:20,
      paddingHorizontal:50,
      marginBottom: 20
    },
    subTitle: {
      fontSize: 22,
      paddingBottom:20,
      paddingHorizontal:10,
      marginBottom: 20
    },
    button: {
      margin:10
    },
    progressBar: {
      height: 12,
      borderRadius: 5
    },
    inputView:{
      backgroundColor:'white',
      padding:10,
      borderWidth:2,
      whiteSpace: 'break-space'
    },
    input:{
      backgroundColor:'white',
      padding:10,
      fontSize:22,
      letterSpacing:-1,
      color:'black',
      whiteSpace: 'break-space'
    },
    absolute:{
      padding:10,
      fontSize:22,
      position:'absolute',
      userSelect: "none",
      backgroundColor:'transparent',
      color:'gray',
      cursor:'text',
      whiteSpace: 'break-space'
    }
  });
  export default styles;