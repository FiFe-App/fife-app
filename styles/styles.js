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
    title: {
        fontFamily: "AmaticSC_700Bold",
        fontSize: 50,
        fontWeight: "bold",
        padding: 10,
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
        margin: 5,
        borderColor: "black",
        borderRadius: 8,
        backgroundColor: "white",
        padding: 10,
        fontSize:20,
        fontWeight: "500",
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
        marginBottom: 5
    },
    error: {
        textAlign: 'center', // <-- the magic
        fontWeight: 'bold',
        fontSize: 25,
        color: "red",
        borderColor:'red',
        alignSelf:'center',
        width:'100%',
        margin: 5
    },
    listIcon: {
        borderRadius: 8,
        marginRight: 8
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
        right:20,
        top:30,
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
        borderBottomWidth: 0,
        borderTopWidth: 0,
        padding: 12,
        marginTop: -1,
        margin: 6,
        borderRadius: 8
    },
});