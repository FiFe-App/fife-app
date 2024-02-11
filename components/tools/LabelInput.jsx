import { Pressable, View } from 'react-native';
import { MyText, Row, TextInput } from '../Components';
import { useEffect, useState } from 'react';

const LabelInput = (props) => {
    const {onChange,defaultValue} = props 
    const [text, setText] = useState('');
    const l = text?.includes(' ') ? text.split(' ') : []
    const [list, setList] = useState(defaultValue?.split(' ')||[]);

    useEffect(() => {
        if (text && text != ' ') {
            setList([...list,text])
            setText('')
        }
    }, [l.length]);

    useEffect(() => {
        console.log('list.defVal',list);
        if (!list.length||list[0]=='')
            setList(defaultValue?.split(' '))
    }, [defaultValue]);

    useEffect(() => {
        console.log('list.uef',defaultValue);
        console.log('list.uef',list);
        onChange(list.reduce((partialSum, a) => partialSum +  a, ''))
    }, [list]);

    const edit = (e) => {
        if (e.code == 'Backspace' && text == '') {
            console.log(list.slice(0, -1));
            setList(list.slice(0, -1))
        }
    }

    return (<Row style={[{backgroundColor:'white',flexWrap:'wrap',margin:4,marginLeft:0,marginRight:8,borderRadius:8},props.style]}>
        {list.map((e,i)=>{
            if (e.length)
            return <Row style={{backgroundColor:'#edeeda',margin:4,padding:4,paddingLeft:8,alignItems:'center',borderRadius:8}}>
                <MyText>{e}</MyText>
                <Pressable onPress={()=>{
                    setList(list.filter((el,ind)=>ind!=i))
                }}><MyText style={{fontSize:17}}>x</MyText></Pressable>
            </Row>
        })}
        <TextInput
        placeholder={props.placeholder}
        style={{height: 40,padding:8,flexGrow:1}}
        onChangeText={setText}
        onKeyPress={edit}
        value={text}
      />
    </Row>)
}

export default LabelInput;