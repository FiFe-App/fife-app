import { Pressable, View } from "react-native";
import { B, Loading, MyText, NewButton, Row, TextInput } from "../Components";
import { useEffect, useState } from "react";
import { getDatabase, off, onChildAdded, push, ref, set } from "firebase/database";
import { randomColor, shadeColor } from "../../lib/functions";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";

const PostForm = ({style,path,placeholder}) => {
    const [list, setList] = useState([]);
    const navigation = useNavigation();
    
    const uid = useSelector((state) => state.user.uid)
    const name = useSelector((state) => state.user.name);
    const [author, setAuthor] = useState(name);
    const [category, setCategory] = useState('');
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
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
        });
        return (()=>{
            off(ref(db,path),'child_added')
        })
    }, []);

    return (
        <View style={[{flex:1},style]}>
            <Row style={{flex:1}}>
                {loading && <Loading />}
                <View style={{flexGrow:1}}>
                    <MyText>{(placeholder && name) ? placeholder : "Poszt írása mint "+name}</MyText>
                    {!name && <TextInput style={{margin:5,padding:10,backgroundColor:'#ffffff'}} value={author} onChangeText={setAuthor} placeholder="Név"/>}
                    <TextInput style={{flex:1,margin:5,marginBottom:0,padding:10,backgroundColor:'#ffffff'}} multiline numberOfLines={1} value={category} onChangeText={setCategory} 
                    placeholder={"Kategória: Cipő"}/>
                    <TextInput style={{flex:4,margin:5,marginBottom:0,padding:10,backgroundColor:'#ffffff'}} multiline numberOfLines={5} value={text} onChangeText={setText} 
                    placeholder={'Keresek valakit aki megjavítja a cipőmet!'}/>
                </View>
                <NewButton title="Posztolás" onPress={handleSend} disabled={!author || !text} style={{height:'100%',margin:5,minWidth:100}}/>
            </Row>

        </View>)
}

export default PostForm;