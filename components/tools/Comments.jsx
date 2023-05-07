import { View } from "react-native";
import { B, Loading, MyText, NewButton, Row, TextInput } from "../Components";
import { useEffect, useState } from "react";
import { getDatabase, off, onChildAdded, push, ref, set } from "firebase/database";
import { randomColor, shadeColor } from "../../lib/functions";

const Comments = ({style}) => {
    const [list, setList] = useState([]);
    const [author, setAuthor] = useState('');
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const db = getDatabase()

    const handleSend = async () => {
        if (author && text) {
            setLoading(true)
            const newPostRef = push(ref(db,'aboutComments'))
            set(newPostRef ,{
                author,text
            })
            .then(res=>{
                console.log(res);
                setLoading(false)
                setAuthor('')
                setText('')
            }).catch(err=>{
                console.log(err);
            })
        }
    }

    useEffect(() => {
        setList([])
        
        onChildAdded(ref(db,'aboutComments'), (data) => {
            setList(old => [data.val(),...old])
        });
        return (()=>{
            off(ref(db,'aboutComments'),'child_added')
        })
    }, []);

    return (
        <View style={[{flex:1},style]}>
            <Row style={{flex:1}}>
                {loading && <Loading />}
                <View style={{flexGrow:1}}>
                    <TextInput style={{margin:5,padding:10,backgroundColor:'white'}} value={author} onChangeText={setAuthor} placeholder="Név"/>
                    <TextInput style={{flex:1,margin:5,marginBottom:0,padding:10,backgroundColor:'white'}} multiline numberOfLines={5} value={text} onChangeText={setText} placeholder="Üzenet"/>
                </View>
                <NewButton title="Küldés" onPress={handleSend} disabled={!author || !text} style={{height:'100%',margin:5,minWidth:100}}/>
            </Row>
            <MyText size={20} style={{marginLeft:10,marginTop:10}}>Kommentek:</MyText>
            <View style={{flexWrap:'wrap',flexDirection:'row',margin:10,marginRight:15}}>
                {list.map(comment=>{

                    return (
                        <View style={{background:'white',padding:5,margin:5,maxWidth:'100%'}}>
                            <MyText><B>{comment.author}</B></MyText>
                            <MyText style={{}}>{comment.text}</MyText>
                        </View>
                    )
                })}
            </View>
            {!list?.length && <MyText>Még nem érkezett komment</MyText>}
        </View>)
}

export default Comments;