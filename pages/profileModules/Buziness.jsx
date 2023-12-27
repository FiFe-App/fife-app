import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, View, useWindowDimensions } from "react-native";
import { useHover } from "react-native-web-hooks";
import { useSelector } from "react-redux";
import { Auto, MyText, Popup, Row, TextInput } from "../../components/Components";
import styles from "../../styles/profileDesign";
import Section from "../profile/Section";
import axios from "axios";
import Icon from 'react-native-vector-icons/Ionicons';



const Buziness = ({data,setData}) => {
    const { width } = useWindowDimensions();
    const small = width <= 900;
    const [list, setList] = useState(data?.profiession || []);
    const help = [
        {name: 'Programozó, Python, C++', description: 'Egyetemen tanultam programozni, Python, C és C++ nyelveken több projektem is volt.'},
        {name: 'Varrás, ruhák', description: 'Nagyitól tanultam varrni, hozz bármilyen szakadt ruhát, én megjavítom!'},
    ]

    useEffect(() => {
        if (data?.buziness)
        setList(data?.buziness.filter(e=>!e?.removed) || [])
      }, [data]);
    
    const addNew = () => {
        setList([...list,{name: '', description: ''}])
    }
    const addHelp = () => {
        console.log(list);
        if (!list?.length || list[0]?.name=='' ){
            setList([help[0]])
            setData({...data,buziness:[help[0]]})
        }
        else{
            setList([...list,help[list.length]])
            setData({...data,buziness:[...list,help[list.length]]})}
    }
    const set = (val,index,key) => {
        const newState = [...list]
        newState[index] = {...newState[index], [key]:val}
        setList(newState)
        if (newState?.length)
            setData({...data,buziness:newState})
    } 
    const remove = (i) => {
        setList(list.filter((item,ei) => ei !== i));
        setData({...data,buziness:list.map((item,ei) =>{
            return {...item, removed:ei == i?true:item?.removed} 
        })})
    }
        return(<Section title={<Auto style={{width:'100%'}}>
                        <MyText style={{flexGrow:1}}>Bizniszeim</MyText>
                        <Pressable style={{alignItems:'center',justifyContent:'center'}} onPress={addHelp}>
                            <MyText size={17} style={{}}>
                                <Icon name="bulb" color={0} size={20}/>
                                Adjak egy példát?
                            </MyText>
                        </Pressable>
        </Auto>} flex={1}>
                
                <ScrollView style={{marginLeft:small?5:20}}>
                    {list.map((prof,i) =>  
                    {
                        if (prof?.removed != true && prof != undefined)
                        return (
                        <View style={{flexDirection:'row',marginBottom:20}} key={'buzinesslist'+i}>
                            <View style={{width:50,justifyContent:'space-evenly',alignItems:'center'}}>
                                <MyText style={{fontSize:20}}>{i+1}</MyText>
                                <Pressable onPress={()=>remove(i)}>
                                    <Icon name="trash" color={'black'} size={25}/>
                                </Pressable>
                            </View>
                            <View style={{flex:1,justifyContent:'center'}}>
                                <TextInput placeholder="kulcsszavak" onChangeText={(val)=>set(val,i,'name')} 
                                value={prof.name} style={{fontSize:17}}/>
                                <TextInput placeholder="leírás" onChangeText={(val)=>set(val,i,'description')} 
                                style={{fontSize:17}} value={prof.description} multiline numberOfLines={2}/>
                            </View>
                        </View>)}
                    )}            

                    <View>
                        <Pressable style={{alignItems:'center',justifyContent:'center'}} onPress={addNew}>
                        <MyText size={24} style={{}}>
                            <Icon name="md-add" color={0} size={40}/>
                            Adj hozzá bizniszt
                        </MyText>
                        </Pressable>
                    </View>

                </ScrollView>
            </Section>
        )
}

const BuzinessItem = ({prof,uid,index}) => {
    const { width } = useWindowDimensions();
    const small = width < 500;
    const Href = useRef(null);
    const myuid = useSelector((state) => state.user.uid)
    const rate = prof?.rate ? Object.keys(prof?.rate) : []
    const [iRated, setIRated] = useState(rate.includes(myuid));
    const allRates = (rate.filter(r=>r!=myuid)?.length+iRated ? 1 : 0);

    const ref = useRef()
    const isHovered = useHover(ref);
    
    return (
      <><Auto
      breakPoint={500}
      style={[
        styles.buziness,
        {backgroundColor:`hsl(52, 100%, ${100-(allRates*10)}%)`,
        },
        isHovered && {backgroundColor:'#faffcc'}
      ]} ref={Href}>
        <View style={{flex:small?'none':3,order:small?1:0}}>
          <MyText title>{prof.name}</MyText>
          <MyText>{prof.description}</MyText>
        </View>
        <Row style={{justifyContent:'center'}}
        breakPoint={500}>
          <Popup style={{alignItems:'center',justifyContent:"center",margin:10}} 
            popup={<View style={[styles.popup,{marginTop:0,marginRight:small?5:50}]}><MyText>{allRates} ember ajánlja</MyText></View>}>
            <MyText title>{allRates}</MyText>
          </Popup>
        </Row>
    </Auto>
        <View style={{width:'100%',height:2,backgroundColor:'#dddddd'}} /></>
    )
  }


export default Buziness;