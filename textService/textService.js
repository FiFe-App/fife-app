import { useEffect, useState } from "react"
import { Text } from "react-native"
import { useSelector } from "react-redux"

  
export const TextFor = ({style,text}) => {
    
    const texts = require('./texts.json');
    const arr = texts?.[text]
    const on = true//useSelector((state) => state.user?.fancyText)
    const [r, setR] = useState(0);
    useEffect(() => {
        setR(Math.floor(Math.random() * (arr?.length)))
    }, []);
    if (arr)
        if (on)
            return <Text style={style}>{arr[r]}</Text>
        else
            return <Text style={style}>{arr[0]}</Text>
    else
        return <Text style={style}>{text}</Text>
}
  
