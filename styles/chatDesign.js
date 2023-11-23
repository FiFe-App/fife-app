import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    header: {
        flexDirection:'row',
        alignItems:'center',
        padding:10,
        backgroundColor: '#FDEEA2',
        //backgroundColor: '#f1f1f1',
        borderTopWidth:0,
        margin:0,
        shadowColor: '#000',
        shadowOffset: {
          width: 10,
          height: 0,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    }
})

export default styles;