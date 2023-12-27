import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { get, getDatabase, ref } from "firebase/database";
import { useCallback, useContext, useEffect, useState } from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import { BottomNavigation } from "react-native-paper";
import BasePage from "../../components/BasePage";
import { Loading, MyText } from "../../components/Components";
import GoBack from "../../components/Goback";
import { config } from "../../firebase/authConfig";
import { FirebaseContext } from "../../firebase/firebase";
import List from "./List";

const Admin = ({navigation,route}) => {
    const [index, setIndex] = useState(0);
    const {database,api} = useContext(FirebaseContext)
    const [routes] = useState([
      { key: 'reports', title: 'Jelentések', focusedIcon: 'alert-circle', unfocusedIcon: 'alert-circle-outline'},
      { key: 'users', title: 'Felhasználók', focusedIcon: 'account' },
      { key: 'bugs', title: 'Hibajelentések', focusedIcon: 'bug' },
      { key: 'docs', title: 'Cikkek', focusedIcon: 'file', unfocusedIcon: 'file-outline' },
    ]);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const { width } = useWindowDimensions();
    const renderScene = ({ route, jumpTo }) => {
        return (
            <ScrollView style={{flex:1,height:400,backgroundColor:'#FDEEA2'}}>
            {loading ?
                <Loading color="#fff"/>
                : 
                data?.length ? data : <MyText>{JSON.stringify(data)}</MyText>
            }
            </ScrollView>
        )
      }

      useEffect(() => {
        setData(null)
        setLoading(true)
        console.log('index',index);
        (async ()=>{
          switch (index) {
            case 0:
              setData(
                (await fn2('report')).map((el)=>{
                  
                  return <List data={el} />
                }
              ))
                break;
            case 1:
              setData(
                (await fn('admin/users')).map((u)=>{
                    return u.data.map(el=><List key={'admin-'+u.author} data={el} author={u.author}/>)
                }
              ))
                break;
            case 2:
                setData(
                  (await fn2('bugReport')).map((el)=>{
                    return <List data={el} />
                  }
                ))
                break;
            case 3:
                setData(
                  (await fn('admin/docs')).map((u)=>{
                    return u.data.map(el=><List key={'admin-'+u.author} data={el} author={u.author}/>)
                  }
                ))
                break;
            default:
                break;
        }
        })()
      }, [index]);

      const fn = async (serverPath) => {
        let resList
        try {
          resList = (await axios.get(serverPath,config())).data
          console.log('list',resList);
          return resList;
          setLoading(false)
            
        } catch (error) {
          if (error?.response?.data == 'Token expired') {
            console.log('Token expired');
            api.logout();
            return []
          }
          console.log('server not reachable',error);
        }
      }
      const fn2 = async (firebasePath) => {
            
        try {
            const db = getDatabase()
            return get(ref(db,firebasePath)).then((res)=>{
                const all = res.val()
                console.log(all);
                const list = Object.keys(all).map(key=>{
                  return Object.values(all[key]).map(){
                    author: key,
                    data:Object.values(all[key])
                }
                  
                }).flat(1)
                console.log('fn2',list);
                return list
            }).catch(err=>{ 
                setData(JSON.stringify(err))
                return []
                console.log(err);


            }).finally(()=>{
                setLoading(false)
            })
            
        } catch (err) {
            console.error(err);
            setData(JSON.stringify(err))
            return []
            setLoading(false)
        }
  
      }

    useFocusEffect(
        useCallback(() => {
          return () => {
          };
        }, [])
      );

      useEffect(() => {
        console.log(data);
      }, [data]);

    return (<BasePage style={{backgroundColor:data?.color || '#FDEEA2'}}>
        <GoBack text="Vissza" previous="fooldal" breakPoint={10000}/>
        <BottomNavigation
        navigationState={{ index, routes }}
        onIndexChange={setIndex}
        renderScene={renderScene}
        activeColor="#000"
        inactiveColor="#000"
        renderLabel={(props)=>{
            return <MyText {...props} style={{textAlign:'center'}}>{props.route.title}</MyText>
        }}
        theme={{colors: {secondaryContainer: 'white'}}}
        barStyle={{backgroundColor:'transparent',color:'black'}}
    />
    </BasePage>
    )
}

export default Admin;