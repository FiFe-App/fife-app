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
    modules: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'stretch', // if you want to fill rows left to right
        justifyContent: 'space-around'
    },
    title: {
        fontFamily: "AmaticSC_700Bold",
        fontSize: 50,
        fontWeight: "bold",
        padding: 10
    },
    subTitle: {
        fontSize: 40,
        fontWeight: "bold",
        margin: 10,
        textAlign: 'left'
    },
    label: {
        margin: 5,
        marginLeft: 50
    },
    button: {
        width: 40,
        borderColor: "black",
        borderWidth: 2,
        borderRadius: 10,
        backgroundColor: "yellow",
        color: "black"
    },
    searchInput: {
        margin: 5,
        borderColor: "black",
        borderWidth: 1,
        backgroundColor: "white",
        padding: 10,
        fontWeight: "400",
        width: 200
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
        marginTop: 0,
        marginBottom: 5
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
        borderColor: "rgb(240,240,240)",
        backgroundColor: 'white',
        borderBottomWidth: 2,
        borderTopWidth: 1,
        padding: 12,
        marginTop: -1,
    },
    searchList: {
        padding: 16,
        backgroundColor: 1,
        borderBottomWidth: 1,
        borderBottomColor: 0,
        alignItems: "center",
    },
    menuLink: {
        justifyContent:'center',
        padding:10,
        paddingRight:15,
        marginLeft:15,
    },
    menuLinkHover: {
        backgroundColor:'white',
        borderWidth: 2,
        borderTopWidth:0,
        borderRadius: 0,
        marginLeft:11,
    },
    number: {
        textAlignVertical: 'center',
        marginHorizontal: 12,
        fontSize:15,
        backgroundColor:'white',
        borderRadius:20,
        textAlign:'center',
        width:20,
        height:20,
    }
});