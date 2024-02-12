import { useEffect, useState } from "react";
import { View } from "react-native";
import { TouchableRipple } from "react-native-paper";
import { Col, MyText, ProfileImage, Row, getNameOf } from "../../components/Components";
import { router } from "expo-router";

const List = ({data,author,message,title}) => {
        const [name,setName] = useState(null)
        const [authorName, setAuthorName] = useState(title);
        const navigation = router;
        const [open, setOpen] = useState(false);
        useEffect(() => {
            console.log(data);
            (async ()=>{
                setAuthorName(await getNameOf(author))
                setName(await getNameOf(data.uid))
            })()
        }, []);

        //fdf5cf
        return <TouchableRipple style={{backgroundColor:'#fff',padding:5,margin:5,borderRadius:8}}
        onPress={()=>setOpen(!open)}>
            <Col>
                <Row style={{alignItems:'center'}}>
                    <ProfileImage uid={author} style={{borderRadius:8}} size={50}/>
                    <Col style={{padding:5,width:'100%'}}>
                        <MyText>{authorName}</MyText>
                        <MyText>{data.message}</MyText>
                    </Col>
                </Row>
                {open&&<View style={{backgroundColor:'#fff8d0'}}>
                    <MyText>{JSON.stringify(data,null, 3)}</MyText>
                </View>}
            </Col>
        </TouchableRipple>

}

export default List