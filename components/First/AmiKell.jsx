import { useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { useWindowSize } from "../../hooks/window";
import { Auto, MyText } from "../Components";

const modules = [
    [
        "Önismeret",
        "Programok keresése"
    ],
    [
        "Barátkozás",
        "Sportolás"
    ]
]

const AmiKell = () => {
    const { width } = useWindowSize()
    const titleStyleW = {
        color:'white',
        fontSize: width > 900 ? 50 : 40,
        width:'100%',
        fontWeight:'bold',
        paddingVertical:20,
        paddingHorizontal:50,
        marginBottom: 20
      }
    return (<>
        <MyText style={titleStyleW} adjustsFontSizeToFit>Mi az amiben fejlődni szeretnél?</MyText>
        <Auto>
            <View style={{flex:width<=900?'none':3}}>
                {modules[0].map(s=><Module title={s}/>)}
            </View>
            <View style={{flex:width<=900?'none':3}}>
                {modules[1].map(s=><Module title={s}/>)}
            </View>
        </Auto>
    </>)
}

const Module = ({title,description}) => {
    const [selected, setSelected] = useState(false);
    return (
        <Pressable style={[styles.module,{backgroundColor:selected?'#6ee9ff':'#c3b7ff'}]} onPress={()=>setSelected(!selected)}>
            <MyText style={[styles.moduleText]}>
                {title}
            </MyText>
        </Pressable>
    )
}


const styles = StyleSheet.create({
    module: {
        flex:1,
        alignItems:'center',
        justifyContent:'center',
        padding:20,
        margin: 30,
        borderRadius:5
    },
    moduleText: {
        color: 'white',
        fontWeight: 600,
        fontSize:24
    }    
});

export default AmiKell