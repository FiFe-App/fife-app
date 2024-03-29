import axios from "axios";
import { router, useFocusEffect, useLocalSearchParams, usePathname } from "expo-router";
import { get, getDatabase, ref } from "firebase/database";
import { useCallback, useContext, useEffect, useState } from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import { BottomNavigation } from "react-native-paper";
import BasePage from "../../components/BasePage";
import { MyText } from "../../components/Components";
import Loading from "../../components/Loading";
import GoBack from "../../components/Goback";
import { config } from "../../firebase/authConfig";
import { FirebaseContext } from "../../firebase/firebase";
import List from "./List";

const Admin = ({}) => {
    const navigation = router;
    const route = usePathname();
    const params = useLocalSearchParams();
    const [index, setIndex] = useState(Number(params?.index||0));
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
        if (params?.index && Number(params?.index) != index)
          navigation?.setParams({index});
        (async ()=>{
          switch (index) {
            case 0:
              setData(
                (await fn2('report')).map((el)=>{
                  
                  return <List data={el} author={el.author} message={'reportolta: '+el.uid}/>
                }
              ))
                break;
            case 1:
              setData(
                (await fn('admin/users')).sort((a, b) => a.metadata.creationTime - b.metadata.creationTime).map((u)=>{
                  console.log(u);
                    return <List key={'admin-'+u.uid} data={u} author={u.uid}/>
                }
              ))
                break;
            case 2:
                setData(
                  (await fn2('bugReport')).map((el)=>{
                    return <List data={el} author={el.author}/>
                  }
                ))
                break;
            case 3:
                setData(
                  (await fn('admin/docs')).map((u)=>{
                    console.log(u);
                    return <List key={'admin-'+u.author.uid} data={{message:u.title+''}} title={u.category} author={u.author.uid}/>
                  }
                ))
                break;
            default:
                break;
        }
        })()
      }, [index]);

      const fn = async (serverPath) => {
        let resList
        try {
          resList = (await axios.get(serverPath,config())).data
          console.log('list',resList);
          setLoading(false)
          return resList;
            
        } catch (error) {
          if (error?.response?.data == 'Token expired') {
            console.log('Token expired');
            api.logout();
            return []
          }
          console.log('server not reachable',error);
        }
      }
      const fn2 = async (firebasePath) => {
            
        try {
            const db = getDatabase()
            return get(ref(db,firebasePath)).then((res)=>{
                const all = res.val()
                console.log(all);
                const list = Object.keys(all).map(key=>{

                  return Object.values(all[key]).map(e=>{
                    return {...e,author:key}
                  })
                  
                }).flat(1).reverse();
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
        <GoBack text="Vissza" previous="/" breakPoint={10000}/>
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