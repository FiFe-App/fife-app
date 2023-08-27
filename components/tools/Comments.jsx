import { Pressable, View } from "react-native";
import { B, Loading, MyText, NewButton, Row, TextInput } from "../Components";
import { useEffect, useState } from "react";
import { getDatabase, off, onChildAdded, push, ref, set } from "firebase/database";
import { randomColor, shadeColor } from "../../lib/functions";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";

const Comments = ({style,path,placeholder}) => {
    const [list, setList] = useState([]);
    const navigation = useNavigation();
    
    const uid = useSelector((state) => state.user.uid)
    const name = useSelector((state) => state.user.name);
    const [author, setAuthor] = useState(name);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(true);
    const db = getDatabase()

    const handleSend = async () => {
        if (author && text) {
            setLoading(true)
            const newPostRef = push(ref(db,path))
            set(newPostRef ,{
                author,text,uid
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
        
        onChildAdded(ref(db,path), (data) => {
            setList(old => [data.val(),...old])
            setDownloading(false)
        });
        setTimeout(() => {
            setDownloading(false)    
        }, 3000);
        return (()=>{
            off(ref(db,path),'child_added')
        })
    }, []);

    return (
        <View style={[{flex:1},style]}>
            <Row style={{flex:1}}>
                {loading && <Loading />}
                <View style={{flexGrow:1}}>
                    {!name && <TextInput style={{margin:5,padding:10,backgroundColor:'white'}} value={author} onChangeText={setAuthor} placeholder="Név"/>}
                    <TextInput style={{flex:1,margin:5,marginBottom:0,padding:10,backgroundColor:'white'}} multiline numberOfLines={5} value={text} onChangeText={setText} 
                    placeholder={(placeholder && name) ? placeholder : "Komment írása mint "+name}/>
                </View>
                <NewButton title="Küldés" onPress={handleSend} disabled={!author || !text} style={{height:'100%',margin:5,minWidth:100}}/>
            </Row>
            <MyText size={20} style={{marginLeft:10,marginTop:10}}>Kommentek:</MyText>
            <View style={{flexWrap:'wrap',flexDirection:'row',margin:10,marginRight:15}}>
                {list.map((comment,ind)=>{

                    return (
                        <View key={"comment"+ind} style={{background:'white',padding:5,margin:5,maxWidth:'100%'}}>
                            <Pressable onPress={()=>{
                                if (comment?.uid)
                                    navigation.push('profil',{uid:comment.uid})
                                }}>
                                <MyText><B>{comment.author}</B></MyText>
                            </Pressable>
                            <MyText style={{}}>{comment.text}</MyText>
                        </View>
                    )
                })}
            </View>
            {downloading ? <Loading /> :
            !list?.length && <MyText style={{padding:20}}>Még nem érkezett komment</MyText>}
        </View>)
}

export default Comments;