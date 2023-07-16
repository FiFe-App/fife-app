import { useState } from "react";
import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { Auto, MyText } from "../../components/Components";
import CustomInput from "../../components/CustomInput";

const modules = [
    [
        "Cuccok, ruhák eladása",
        "Albérlet keresése",
        "Programok keresése országszerte",
    ],
    [
        "Cuccok, ruhák vásárlása",
        "Munka keresése",
        "Új helyek megismerése"
    ],
]

const AmiKell = ({data,setData}) => {
    const { width } = useWindowDimensions()
    const inputs = [
        {type:'checkbox',attribute:'sale',label:'Eladó tárgyak',data:data,setData:setData,style:{backgroundColor:'#fbf1e0'}},
        {type:'checkbox',attribute:'work',label:'Elérhető munkák',data:data,setData:setData,style:{backgroundColor:'#fbf1e0'}},
        {type:'checkbox',attribute:'places',label:'Kiadó lakások',data:data,setData:setData,style:{backgroundColor:'#fbf1e0'}}
      ]
    const titleStyleW = {
        color:'white',
        fontSize: width > 900 ? 50 : 30,
        width:'100%',
        fontWeight:'bold',
        paddingVertical:20,
        paddingHorizontal:50,
        marginBottom: 20
      }
    return (<>
        <MyText style={titleStyleW} adjustsFontSizeToFit>Mi az ami érdekel?</MyText>
        <MyText style={styles.text} adjustsFontSizeToFit>
            Válaszd ki azokat a témákat, amikkel kapcsolatban szeretnél hasznos linkeket,{'\n'}
            funkciókat, frissítéseket kapni! Ezeken a beállításokon bármikor változtathatsz a főoldalon majd.
        </MyText>
        <Auto>
            <View style={{flex:width<=900?'none':3}}>
                {inputs.map((input,ind)=><CustomInput {...input} key={'inp'+ind} style={[{padding:10,margin:5},input.style]}/>)}
            </View>
            <View style={{flex:width<=900?'none':3}}>
                {[].map((input,ind)=><CustomInput {...input} key={'inp2'+ind}  style={[{padding:10,margin:5},input.style]}/>)}
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
    },
    text: {
      fontSize:22,
      color: 'white',
      textAlign:'left',
      paddingLeft:60,
      marginBottom: 10
    },
});

export default AmiKell