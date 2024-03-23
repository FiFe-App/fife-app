import Icon from '@expo/vector-icons/Ionicons';
import { getDatabase, limitToLast, off, onChildAdded, push, query, ref, set } from 'firebase/database';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSelector } from 'react-redux';
import { B, MyText, NewButton, Row, TextInput } from '../Components';
import Loading from '../Loading';
import UrlText from './UrlText';
import { router } from 'expo-router';

const Comments = ({style,path,placeholder,limit,justComments,commentStyle}) => {
    const [list, setList] = useState([]);
    const navigation = router;
    const [width, setWidth] = useState(0);
    
    const uid = useSelector((state) => state.user.uid)
    const name = useSelector((state) => state.user.name);
    const [author, setAuthor] = useState(name);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(true);
    const db = getDatabase()

    const handleSend = async () => {
        if (author && text) {
            setLoading(true)
            const newPostRef = push(ref(db,path))
            set(newPostRef ,{
                author,text,uid
            })
            .then(res=>{
                console.log(res);
                setLoading(false)
                setText('')
            }).catch(err=>{
                console.log(err);
            })
        }
    }

    useEffect(() => {
        setList([])

        const q = limit ? query(ref(db,path),limitToLast(limit)) : ref(db,path)
        
        onChildAdded(q, (data) => {
            setList(old => [data.val(),...old])
            setDownloading(false)
        });
        setTimeout(() => {
            setDownloading(false)    
        }, 3000);
        return (()=>{
            off(ref(db,path),'child_added')
        })
    }, [path]);

    return (
        <View style={[{flex:1},style]} onLayout={(e)=>setWidth(e.nativeEvent.layout.width)}>
            {!justComments && <><Row style={{flex:1}}>
                <View style={{flexGrow:1}}>
                    {!name && <TextInput style={{marginRight:5,marginBottom:5,padding:10,backgroundColor:'#ffffff'}} value={author} onChangeText={setAuthor} placeholder="Név"/>}
                    <TextInput style={{flex:1,marginRight:5,marginBottom:0,padding:10,backgroundColor:'#ffffff'}} multiline rows={2} value={text} 
                    onChangeText={setText} 
                    placeholder={(placeholder) ? placeholder : 'Kommented'}/>
                </View>
                <NewButton title={width > 300 ? 'Küldés' : <Icon name="arrow-redo-outline" size={30} color='black'/>} 
                onPress={handleSend} disabled={!author || !text} style={{height:'100%',margin:0}}
                    loading={loading}
                />
            </Row>
            <MyText size={20} style={{marginLeft:10,marginTop:10}}>Kommentek:</MyText></>}
            {!!list?.length &&<View style={{flexWrap:'wrap',flexDirection:'row',margin:10,marginRight:15}}>
                {list.map((comment,ind)=>{

                    return (
                        <View key={'comment'+ind} style={[{background:'white',padding:5,margin:5,maxWidth:'100%'},commentStyle]}>
                            <Pressable onPress={()=>{
                                if (comment?.uid)
                                    navigation.push({pathname:'profil',params:{uid:comment.uid}})
                                }}>
                                <MyText><B>{comment.author}</B></MyText>
                            </Pressable>

                            <UrlText text={comment.text} />
                        </View>
                    )
                })}
            </View>}
            {downloading ? <Loading /> :
            !list?.length && <MyText style={{padding:20}}>Még nem érkezett komment</MyText>}
        </View>)
}

export default Comments;