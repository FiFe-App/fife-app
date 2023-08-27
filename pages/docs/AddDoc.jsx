import { View, useWindowDimensions } from "react-native";
import { MyText, NewButton, TextInput } from "../../components/Components";
import GoBack from "../../components/Goback";
import BasePage from "../../components/BasePage";

const AddDoc = () => {
    const { width } = useWindowDimensions();
    const defStyle = {
        padding:10,
        fontSize:20,
        margin:width <= 900 ? 0 : 10,
        marginTop:5,
        borderRadius: 8,
        backgroundColor: '#ffffff88',
        textAlignVertical: "top"
    }
    const [forms, setForms] = useState([]);
    return ((
    <BasePage style={{backgroundColor:'#FDEEA2'}}>
        <GoBack text="Vissza" previous="fooldal" breakPoint={1000}/>
        <MyText title>Van valami amit megosztanál minden felhasználóval?</MyText>
        <MyText size={18}>Írd le az üzeneted, hogy eljuthasson mindenkihez</MyText>
        <TextInput multiline numberOfLines={15} style={defStyle}/>

        <View style={{padding:20}}>
            <MyText title>{data?.title}</MyText>
            <MyText size={20} >{data?.text}</MyText>
            <View style={{margin:width <= 900 ? 5 : 30}}>
                {data?.forms.map((f)=> <CustomInput {...f} setData={setInput} data={input} />)}
            </View>
        </View>

        <MyText size={18}>Ha elküldöd, mi megnézzük, hogy valóban az oldalra illik-e a posztod, és ha igen, mindenki elérheti majd</MyText>
        <NewButton  title="Küldés"/>
    </BasePage>)
    )
}

export default AddDoc;
