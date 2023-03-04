import { StyleSheet, View } from "react-native"
import { MyText } from "../Components"

const HelpModal = ({children}) => {
    return (
        <View style={{flex:1}}>
            <View style={styles.modalContainer}>
                <View style={styles.modal}>
                    <MyText>Szia!</MyText>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
        flex:1,
        width:'100%',
        height:'100%',
        position:'absolute',
        backgroundColor:'#22222280'
    },
    modal: {
        backgroundColor: '#fff',
        position:'absolute',
        width:'60%',
        height:'200',
        top:'50%',
        left:'20%'
    }
})

export default HelpModal