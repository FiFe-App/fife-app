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

    useEffect(() => {
        setList(data?.buziness || [])
      }, [data]);
    
    const addNew = () => {
        setList([...list,{name: '', description: ''}])
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
        setData({...data,buziness:list.filter((item,ei) => ei !== i)})
    }

        return(<Section title="Bizniszeim" flex={1}>
                
                <ScrollView style={{marginLeft:small?5:20}}>
                    {list.map((prof,i) =>               
                         
                    <View style={{flexDirection:'row'}}>
                        <View style={{width:50,justifyContent:'space-evenly',alignItems:'center'}}>
                            <MyText style={{fontSize:20}}>{i+1}</MyText>
                            <Pressable onPress={()=>remove(i)}>
                                <Icon name="trash" color={'black'} size={25}/>
                            </Pressable>
                        </View>
                        <View style={{flex:1,justifyContent:'center'}}>
                            <TextInput placeholder="kategória" onChangeText={(val)=>set(val,i,'name')} value={prof.name}/>
                            <TextInput placeholder="leírás" onChangeText={(val)=>set(val,i,'description')} value={prof.description} multiline numberOfLines={2}/>
                        </View>
                    </View>
                    )}            

                    <View>
                        <Pressable style={[]} onPress={addNew}>
                        <MyText>
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