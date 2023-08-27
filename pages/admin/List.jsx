import { View } from "react-native";
import { Col, MyText, ProfileImage, Row, getNameOf } from "../../components/Components";
import { useEffect, useState } from "react";
import { TouchableRipple } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

const List = ({data,author}) => {
        const [name,setName] = useState(null)
        const [authorName, setAuthorName] = useState(null);
        const navigation = useNavigation()
        useEffect(() => {
            console.log(data);
            (async ()=>{
                setAuthorName(await getNameOf(author))
                setName(await getNameOf(data.uid))
                //setName(await getNameOf(data.uid))
            })()
        }, []);

        //fdf5cf
        return <TouchableRipple style={{backgroundColor:'#fff',padding:5,margin:5,borderRadius:8}}
        onPress={()=>{navigation.push('profil',{uid:data.uid})}}>
            <Row style={{alignItems:'center'}}>
                <ProfileImage uid={author} style={{borderRadius:8}}/>
                <Col style={{padding:5}}>
                    <MyText>{authorName}</MyText>
                    <MyText>{name + ': ' + data.message}</MyText>
                </Col>
            </Row>
        </TouchableRipple>

}

export default List