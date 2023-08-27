import { ScrollView, useWindowDimensions } from "react-native";

const BasePage = ({children,style,full}) => {
    const { width } = useWindowDimensions();
    return(
        <ScrollView 
        contentContainerStyle={{flex:1,maxWidth:full?'none':800,width:'100%',alignSelf:'center'}} 
        style={[{backgroundColor:'#FDEEA2',padding:width <= 900 ? 5 : 50},
                style]}>
            {children}
        </ScrollView>
    )
}

export default BasePage;