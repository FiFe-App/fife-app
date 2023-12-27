import { useContext, useEffect, useState } from "react";
import { categories as cats } from "../../lib/categories";
import { useSelector } from "react-redux";
import Section from "../profile/Section";
import Select from "../../components/Select";
import { ScrollView, View, useWindowDimensions } from "react-native";
import { SaleListItem } from "../sale/SaleListItem";
import styles from "../../styles/profileDesign";
import axios from "axios";
import { config } from "../../firebase/authConfig";
import { FirebaseContext } from "../../firebase/firebase";
import { Row } from "../../components/Components";
import { listToMatrix } from "../../lib/functions";

const categories = ['Kategória: Minden',...cats.sale.map(c=>{return c.name})];

const SaleModule = () => {

    const { api} = useContext(FirebaseContext);
    const { width } = useWindowDimensions();
    const small = width <= 900;
    const maxSaleWidth = width > 1200 ? 2 : (width < 700 ?2:4)
    const uid = useSelector((state) => state.user.uid)
    const [list, setList] = useState([]);
    const [saleCategory, setSaleCategory] = useState(0);

    useEffect(() => {
        axios.get('/sale',{...config(),
        params: {
          author: uid,
          category: saleCategory-1
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
                style={{fontSize:17, padding:5,marginTop:5,borderWidth:0,
                        backgroundColor: false ? 'gray' : '#fbf7f0',
                        cursor: false ? 'not-allowed' : 'pointer'
                        }} 
                        defaultValue={0}
                placeholder="Válassz kategóriát"
                onSelect={(selectedItem, index) => {
                                    const i = index == 0 ? 0 : index
                                    setSaleCategory(i)
                }} />
            <ScrollView style={[styles.label,{marginLeft:5,maxHeight:500}]}>
                {listToMatrix(list,maxSaleWidth).map((row,i)=>{
                            return (
                                <Row>
                                {row.map((el,ind,rowL)=>
                                  <SaleListItem key={el._id} data={el}/>
                                )}
                                <View style={{flex:maxSaleWidth-row.length}}/>
                                </Row>
                            )
                })}
            </ScrollView>
          </Section>)
}

export default SaleModule;