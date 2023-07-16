import { useEffect } from "react";
import { MyText } from "../Components"
import { useState } from "react";
import { Linking, Pressable } from "react-native";

const UrlText = ({text="asd asd www.fifeapp.hu adsas d",style}) => {
    const regex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig
    const arr = text.match(regex);
    
    const [result, setResult ] = useState(null);
    const makeText = () => {
        let list = [];
        let pre = 0;

        if (arr?.length)
        arr.map((link,ind)=>{
            const start = text.indexOf(link)
            const end = start+link.length;
            list.push(<MyText key={ind+'s'}>{text.slice(pre,start)}</MyText>)
            list.push(
                <MyText key={ind+'k'}><Pressable onPress={()=>{Linking.openURL(text.slice(start,end))}}>
                <MyText style={{color:'blue'}}>{text.slice(start,end)}</MyText>
            </Pressable></MyText>)
            pre+=end;
        })
        list.push(<MyText key={'e'}>{text.slice(pre,text.length)}</MyText>)
        setResult(list);
        console.log(list);
    
    }
    useEffect(() => {
        makeText();
    }, [text]);
    
    return (<MyText style={style} >{result}</MyText>)  
}

export default UrlText