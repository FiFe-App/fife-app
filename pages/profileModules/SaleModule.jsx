import { useContext, useEffect, useState } from "react";
import { saleCategories } from "../../lib/categories";
import { useSelector } from "react-redux";
import Section from "../profile/Section";
import Select from "../../components/Select";
import { ScrollView, useWindowDimensions } from "react-native";
import { SaleListItem } from "../sale/SaleListItem";
import styles from "../../styles/profileDesign";
import axios from "axios";
import { config } from "../../firebase/authConfig";
import { FirebaseContext } from "../../firebase/firebase";

const categories = saleCategories.map(c=>{return c.name});

const SaleModule = () => {

    const { api} = useContext(FirebaseContext);
    const { width } = useWindowDimensions();
    const small = width <= 900;
    const uid = useSelector((state) => state.user.uid)
    const [list, setList] = useState([]);
    const [saleCategory, setSaleCategory] = useState(-1);

    useEffect(() => {
        axios.get('/sale',{...config(),
        params: {
          author: uid,
          category: saleCategory
        }})
        .then(res=>{
          setList(res.data)
        }).catch(err=>{
          if (err?.response?.data == 'Token expired') {
            console.log('Token expired');
            api.logout();
          return
        }
        })
    }, [saleCategory]);

    return (<Section title="Cserebere" flex={width <= 900 ? 'none' : 2} >
                <Select
                list={categories}
                style={{fontSize:20, padding:5,marginTop:5,borderWidth:0,
                        backgroundColor: false ? 'gray' : '#fbf7f0',
                        cursor: false ? 'not-allowed' : 'pointer'
                        }} 
                placeholder="Válassz kategóriát"
                onSelect={(selectedItem, index) => {
                    setSaleCategory(index)
                }} />
            <ScrollView style={[styles.label,{marginLeft:5,maxHeight:500}]}>
                {list.map(el=>{
                  return <SaleListItem key={el.id} data={el}/>
                })}
            </ScrollView>
          </Section>)
}

export default SaleModule;