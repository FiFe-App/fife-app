import React, { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import BasePage from '../../components/BasePage';
import { MyText, NewButton, Row, TextInput } from '../../components/Components';
import Select from '../../components/Select';
import { categories } from '../../lib/categories';
import CalendarPicker from "react-native-calendar-picker";


const Events = () => {

    console.log('events',categories.events.length);
    const [filter,setFilter] = useState("today")
    const [list,setList] = useState([]);
    const [date,setDate] = useState(Date.now());

    const [options, setOptions] = useState({
        search: '',
        date: '',
        category: null,
        subCategory: -1,
        maxCost: 0,
    });
    useEffect(() => {
        console.log(options?.category);
        console.log(options?.category ? categories.subEvents?.[options.category] : []);
    }, [options]);


    useEffect(() => {
        setList([])
        for (let i = 0; i < 20; i++) {
            //setList(old => [...old, <Event title={"event "+i} text={filter} key={i}/>])
        }
    }, [filter])
    

    return (
        <BasePage>
            <TextInput placeholder='Programok keresése' style={{padding:10,marginTop:5,fontSize:17,backgroundColor:'#fbf7f0'}} />
            <Row>
                <NewButton title='Ma' />
                <NewButton title='Dátum' style={{flexGrow:1}} />
            </Row>
            <Select
            list={categories.events}
            style={{fontSize:17, padding:5,marginTop:5,borderWidth:0,backgroundColor:'#fbf7f0',cursor: 'pointer'}} 
            displayAttribute='name'
            placeholder="Válassz kategóriát"
            onSelect={(selectedItem, index) => {
                const i = index == 0 ? 0 : index
                setOptions({...options,category:selectedItem.key})
            }}  />
            {<Select
            list={options?.category ? categories.subEvents?.[options.category] : []}
            style={{fontSize:17, padding:5,marginTop:5,borderWidth:0,backgroundColor:'#fbf7f0',cursor: 'pointer'}} 
            displayAttribute='name'
            disabled={!options?.category}
            placeholder="Válassz alkategóriát"
            onSelect={(selectedItem, index) => {
                const i = index == 0 ? 0 : index
                setOptions({...options,subCategory:i})
            }}  />}
            <MyText>Maximum ár</MyText>
            <View style={{backgroundColor:'#fbf7f0'}}>
                <CalendarPicker
                startFromMonday={true}
                style={{backgroundColor:'white'}}
                customDatesStyles=  
                allowRangeSelection={false}
                selectedDayColor='#FFC27B'
                previousTitle='előző'
                nextTitle='kövi'
                textStyle={{fontFamily:'SpaceMono_400Regular'}}
                weekdays={['Hét','Ked','Sze','Csüt','Pén','Szo','Vas']}
                months={['Január','Február','Március','Április','Május','Június','Július','Augusztus','Szeptember','Október','November','December']}
                 />
            </View>

        </BasePage>
    )
}

const Event = () => {
    return (
        <Row>
            <Image source={require('../../assets/img-main.jpg')} style={{width:50,height:50,margin:4}} />
            <View>
                <MyText></MyText>
                <Row></Row>
                <MyText></MyText>
            </View>
        </Row>
    )
}

export default Events