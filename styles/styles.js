import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        fontFamily: "Poppins_200ExtraLight",
        backgroundColor: '#fff',
        justifyContent: 'center',
        paddingHorizontal: 16,
        alignItems: "center"
    },
    bigButton: {
        backgroundColor:'white',
        justifyContent:'center',
        alignItems:'center'
    },
    bigButtonText: {
        fontSize:40
    },
    modules: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: 'white'
    },
    text: {
      fontSize:20,
      textAlign:'left',
    },
    title: {
        fontFamily: "AmaticSC_700Bold",
        fontSize: 50,
        fontWeight: "bold"
    },
    subTitle: {
        fontSize: 40,
        fontWeight: "bold",
        margin: 10,
        textAlign: 'left'
    },
    label: {
        margin: 5,
        marginLeft: 50,
        fontSize: 20
    },
    button: {
        width: 40,
        borderColor: "black",
        borderRadius: 10,
        backgroundColor: "yellow",
        color: "black"
    },
    searchInput: {
        textAlign:'center',
        width:'100%',
        margin: 5,
        borderColor: "black",
        borderRadius: 8,
        backgroundColor: "#ffffff",
        padding: 10,
        fontSize:17,
        fontWeight: "500",
        borderRadius:8,
    },
    searchList: {
        flexDirection:'row',
        alignItems:'center',
        zIndex:10
    },
    fixToText: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    navbar: {
        height: 50,
        flexDirection: "row",
    },
    body: {
        alignItems: 'center',
        flex: 1
    },
    headline: {
        textAlign: 'center', // <-- the magic
        fontWeight: 'bold',
        fontSize: 18,
        marginTop: 10,
        marginBottom: 5,
        width:'100%'
    },
    error: {
        textAlign: 'center', // <-- the magic
        backgroundColor:'#fdf4c8',
        bottom:0,
        padding:8,
        fontWeight: 'bold',
        fontSize: 25,
        borderRadius:8,
        backgroundColor:'#ffc795',
        alignSelf:'center',
        margin: 5
    },
    listIcon: {
        borderRadius: 8,
        marginRight: 8,
    },
    menuLink: {
        justifyContent:'center',
        padding:10,
        paddingRight:15,
        marginLeft:15,
    },
    menuLinkHover: {
        backgroundColor:'white',
        borderTopWidth:0,
        borderRadius: 0,
        marginLeft:11,
    },
    number: {
        position:'absolute',
        right:0,
        top:0,
        textAlignVertical: 'center',
        marginHorizontal: 12,
        fontSize:15,
        backgroundColor:'white',
        borderRadius:20,
        textAlign:'center',
        width:20,
        height:20,
    },
    list: {
        alignItems: "center",
        padding:10,
        flex:1,
        borderBottomWidth: 0,
        borderTopWidth: 0,
        marginTop: -1,
        margin: 6,
        borderRadius: 8
    },
});