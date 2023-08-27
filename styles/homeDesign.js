import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    moduleContainer: {
        paddingBottom:30,
        paddingTop:5,
        justifyContent:'center',
    },
    module: {
        alignSelf:'stretch',
        backgroundColor:'white',
        flexGrow:1,
        flex:1,
        width: 200,
        margin:2,
        marginBottom:10,
        borderTopLeftRadius:8,
        borderTopRightRadius:8,
        borderRadius:8,
        shadowOffset: {width: 4, height: 6},
        shadowOpacity: 0.15,
        shadowRadius: 2,
    },
    moduleText: {
        backgroundColor:'white',
        padding:2,
    },
    moduleScrollView: {
        height:170,
        paddingHorizontal:20
    },
    bubble: {
        backgroundColor:'white',
        borderWidth:2,
        borderLeftWidth:0,
        marginLeft:5,
        marginTop:14,
        width:30,
        height:30,
        position:'absolute',
        borderTopRightRadius:100,
    }
})

export default styles;