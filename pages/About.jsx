import { View } from "react-native"
import { MyText, NewButton } from "../components/Components"
import { useNavigation } from "@react-navigation/native"
import styles from "../styles/aboutDesign"

const About = () => {
    const navigation = useNavigation()
    return (<View style={styles.container}>
        <View style={styles.header}>
            <MyText>FiFe App</MyText>
        </View>
        <View>
            <MyText></MyText>
        </View>
        <NewButton title="Tovább az appra" onPress={()=>navigation.navigate('bejelentkezes')}/>
    </View>)
}

export default About