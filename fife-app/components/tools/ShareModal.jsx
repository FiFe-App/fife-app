import Icon from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import { child, getDatabase, off, onChildAdded, orderByChild, push, query, ref, set } from 'firebase/database';
import { useContext, useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Checkbox } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { config } from '../../firebase/authConfig';
import { FirebaseContext } from '../../firebase/firebase';
import { elapsedTime } from '../../lib/textService/textService';
import { styles } from '../../styles/styles';
import { MyText, NewButton, ProfileImage, Row, TextInput, getNameOf } from '../Components';
import HelpModal from '../help/Modal';

const ShareModal = ({open,setOpen}) => {
    
    const [list, setList] = useState([]);
    const width = useWindowDimensions().width

    const [extraList, setExtraList] = useState([]);
    const finalExtraList = (extraList.filter(x => !list.find(e=>e.uid==x.uid)));
    const [filteredList, setFilteredList] = useState([]);
    const [search, setSearch] = useState('');
    const { app, auth} = useContext(FirebaseContext);
    const database = getDatabase()
    const uid = useSelector((state) => state.user.uid)
    const myName = useSelector((state) => state.user.name)
    const msgQuery = query(ref(database,`users/${uid}/messages`),orderByChild('last/date'))
    const unreadMessages = useSelector((state) => state.user.unreadMessage)
    const [selected, setSelected] = useState(null);
    const [selectedUids, setSelectedUids] = useState([]);
    const [message, setMessage] = useState('');
    
    useEffect(() => {
        if (list.length)
        setFilteredList(list
            .filter(el=>{
                console.log(el);
                return search=='' || el.name?.toLowerCase().includes(search.toLowerCase())
            })
            .sort((a, b) => {
            const nameA = a.last.date // ignore upper and lowercase
            const nameB = b.last.date; // ignore upper and lowercase
            if (nameA < nameB) {
              return 1;
            }
            if (nameA > nameB) {
              return -1;
            }
          
            // names must be equal
            return 0;
          }));
    }, [list,search]);

    useEffect(() => {
        console.log(search);
        if (search?.length >= 3)
        axios.post('users/search',{search},config()).then(res=>{
            setExtraList(res.data);
            console.log('extra',res.data);
            console.log('normal',list);
        })
        else setExtraList([])
    }, [search]);

    const send = () => {
        selectedUids.map(e=>{
            const uid2 = e.uid;
            if (database) {
                const messageListRef = ref(database, `users/${uid}/messages/${uid2}`);
                const messageListRef2 = ref(database, `users/${uid2}/messages/${uid}`);
                const newMessageRef = push(messageListRef);
                const newMessageRef2 = push(messageListRef2);
                set(newMessageRef, {
                    text: message,
                    uid: uid,
                    time: Date.now(),
                    saleId: open
                })
                set(child(messageListRef,'read'),null).then(e=>{
                    console.log('set!!!!');
                })
                set(child(messageListRef,'last'),{message:message,from:uid,fromName:myName,date:Date.now()})
                set(newMessageRef2, {
                    text: message,
                    uid: uid,
                    time: Date.now(),
                    saleId: open
                })
                set(child(messageListRef2,'read'),null).then(e=>{
                    console.log('set!!!!');
                })
                set(child(messageListRef2,'last'),{message:message,from:uid,fromName:myName,date:Date.now()})
                
                setOpen('submitted');
            }
        })
    }

    useEffect(() => {
        if (!open) return;
        if (database) {    

            setList([])
            onChildAdded(msgQuery,async (childSnapshot) => {
                const last = childSnapshot.child('last').val() || null
                const childKey = childSnapshot.key;
                const name = await getNameOf(childKey);
                if (last)
                    setList(old=>[{
                        uid:childKey,
                        name,
                        last
                    },...old])
            });
        }

      return () => {
        console.log('off');
        off(msgQuery,'child_added')
      };
    }, [open]);
    
    return (<HelpModal
    open={open}
    setOpen={setOpen}
    actions={[]}
    success={{
        title: 'Elküldted az üzenetedet!'
    }}
    title={'Oszd meg ezt a posztot valakivel!'}>
        <View style={{minHeight:300}}>
            <Row style={{padding:0}}>
                <TextInput 
                placeholder="Keresés a fifék közt"
                style={{flexGrow:1,height:50,padding:15,margin:5,backgroundColor:'#ffffff',borderRadius:8}} 
                onChangeText={setSearch} value={search} />
                <NewButton title={<Icon name="close" size={20}  style={{left:0,color:'#555555'}} />} 
                style={{position:'absolute',right:0}} icon color="#fdf7d800"
                onPress={()=>{setSearch('')}}/>
            </Row>
            <ScrollView style={{height:300}} contentContainerStyle={{}}>

            {selectedUids.map(e=>{
                if (!filteredList.find(f=>f.uid==e.uid) && !finalExtraList.find(f=>f.uid==e.uid))
                return (                            
                    <Item title={e?.name} selected={selected == e?.uid} last={e.last} text={e?.last} uid={e?.uid} key={e?.uid} setSelected={setSelected} selectedUids={selectedUids} setSelectedUids={setSelectedUids}/>
                )
            })}

            {!!filteredList.length && <MyText style={{padding:8}}>korábbi beszélgetések</MyText>}
                {!!filteredList.length && filteredList.map((e,i)=>{
                    return (
                            <Item title={e?.name} selected={selected == e?.uid} last={e.last} newMessageProp={!e.read} text={e?.last} uid={e?.uid} key={e?.uid} setSelected={setSelected} selectedUids={selectedUids} setSelectedUids={setSelectedUids}/>
                    )
                })}

                {!!finalExtraList?.length && <><MyText style={{padding:8}}>egyéb találatok</MyText>
                    {finalExtraList.map(e=>{
                        return <Item title={e?.name} selected={selected == e?.uid} last={e.last} newMessageProp={!e.read} text={e?.last} uid={e?.uid} key={e?.uid} setSelected={setSelected} selectedUids={selectedUids} setSelectedUids={setSelectedUids}/>
                    }
                    )}</>
                }
                {!filteredList.length && !finalExtraList?.length && 
                <MyText style={{padding:8}}>Nincs találat</MyText>}
                
            </ScrollView>
            {<View>
                <TextInput placeholder="Üzeneted" value={message} onChangeText={setMessage} style={{margin:4,padding:4,fontSize:17,borderRadius:8}}/>
                <NewButton title="Küldés" onPress={send} disabled={!selectedUids.length}/>
            </View>}
        </View>
    </HelpModal>)
}

function Item({title,text,last,uid,selected,setSelected,newMessageProp,selectedUids,setSelectedUids}) {
    const elapsed = elapsedTime(last?.date)
    
    const onPress = () => {
        if (selectedUids.find(e=>e.uid==uid))
        setSelectedUids(selectedUids.filter(e=>e.uid!=uid))
        else
        setSelectedUids([...selectedUids,{uid,name:title,last}])
    }

    return (
        <TouchableOpacity onPress={onPress} style={[styles.list, {flexDirection: 'row', backgroundColor: selected ? '#ffde7e' : '#fff'},
            {shadowOffset: {width: 2, height: 4},shadowOpacity: 0.2,shadowRadius: 1,}]}>
            <ProfileImage style={styles.listIcon} size={50} uid={uid}/>
            <View style={{marginLeft: 5,flexGrow:1}}>
              <MyText style={{ fontWeight: 'bold',flex: 1, }}>{title}</MyText>
              <MyText style={{ flex:2, }}>{last?.message}<MyText style={{color:'grey'}}> - {elapsed}</MyText></MyText>
            </View><Checkbox.Item
        color="#000" style={[]} 
        labelStyle={{fontFamily:'SpaceMono_400Regular', letterSpacing:-1}}
        status={selectedUids.find(e=>e.uid==uid)?'checked':'unchecked'} onPress={onPress} />
        </TouchableOpacity>
    );
    
  }


export default ShareModal