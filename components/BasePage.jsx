import { Helmet } from 'react-helmet';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import Footer from './Footer';
import { useState } from 'react';

const BasePage = ({children,style,full,title,noScroll=false,noFooter=false}) => {
    const { width, height } = useWindowDimensions();
    const [innerHeight, setInnerHeight] = useState(height);
    const [outerHeight, setOuterHeight] = useState(height);

    return(<>
        <Helmet>
            <title>{title||'FiFe App'}</title>
        </Helmet>
        <ScrollView scrollEnabled={!noScroll} onLayout={(e)=>setOuterHeight(e.nativeEvent.layout.height)}
        contentContainerStyle={{flex:1,width:'100%',alignItems:full?'stretch':'center'}} 
        style={[{backgroundColor:'#FCF3D4',zIndex:-1}]}>
            <View style={[{paddingHorizontal:width <= 900 ? 5 : 50,paddingTop:width <= 900 ? 5 : 50,maxWidth:full?'none':800},style]} 
            onLayout={(e)=>setInnerHeight(e.nativeEvent.layout.height)}>
                {children}
            </View>
            {!noFooter&&<Footer inner={innerHeight} outer={outerHeight}/>}
        </ScrollView></>
    )
}

export default BasePage;