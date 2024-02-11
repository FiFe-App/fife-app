import axios from "axios";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { config } from "../firebase/authConfig";
import { MyText } from "../components/Components";

const Server = () => {
    const [list, setList] = useState([]);
    useEffect(() => {
        axios.get('/places',config()).then(res=>{
            console.log('users',res);
            setList(res.data)
        }).catch(err=>{
            console.error(err);
        })
        
    }, []);
    return(
        <View style={{flex:1}}>
        {list.map((el,ind)=>{
            return (<MyText key={ind}>{ind}. {el}</MyText>)
        })
        }</View>
    )
}

export default Server;