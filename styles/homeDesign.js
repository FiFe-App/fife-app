import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    moduleContainer: {
        paddingBottom:20,
        paddingTop:5,
        backgroundColor:'#c4df98',
        height:280,
        justifyContent:'center'
    },
    module: {
        alignSelf:'stretch',
        backgroundColor:'white',
        flexGrow:1,
        width: 200,
        margin:2,
    },
    moduleText: {
        backgroundColor:'white',
        padding:2,
    },
    moduleScrollView: {
        height:170,
        paddingHorizontal:20
    }
})

export default styles;