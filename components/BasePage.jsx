import { Helmet } from "react-helmet";
import { ScrollView, useWindowDimensions } from "react-native";

const BasePage = ({children,style,full,title,noScroll=false}) => {
    const { width } = useWindowDimensions();
    return(<>
        <Helmet>
            <title>{title||'FiFe App'}</title>
        </Helmet>
        <ScrollView scrollEnabled={!noScroll}
        contentContainerStyle={{flex:1,maxWidth:full?'none':800,width:'100%',alignSelf:'center'}} 
        style={[{backgroundColor:'#fcf3d4',paddingHorizontal:width <= 900 ? 5 : 50,paddingTop:width <= 900 ? 5 : 50,zIndex:-1},
                style]}>
            {children}
        </ScrollView></>
    )
}

export default BasePage;