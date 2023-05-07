import { ScrollView, useWindowDimensions } from "react-native";

const BasePage = ({children,style}) => {
    const { width } = useWindowDimensions();
    return(
        <ScrollView style={[{flex:1,backgroundColor:'#FDEEA2',padding:width <= 900 ? 5 : 50},style]}>
            {children}
        </ScrollView>
    )
}

export default BasePage;