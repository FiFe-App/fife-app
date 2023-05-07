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
    return ((
    <BasePage style={{backgroundColor:'#9efd7b'}}>
        <GoBack text="Vissza a főoldalra" previous="fooldal" breakPoint={1000}/>
        <MyText title>Van valami amit megosztanál minden felhasználóval?</MyText>
        <MyText size={18}>Írd le az üzeneted, hogy eljuthasson mindenkihez</MyText>
        <TextInput multiline numberOfLines={15} style={defStyle}/>
        
        <MyText size={18}>Ha elküldöd, mi megnézzük, hogy valóban az oldalra illik-e a posztod, és ha igen, mindenki elérheti majd</MyText>
        <NewButton color="#7ac35f" title="Küldés"/>
    </BasePage>)
    )
}

export default AddDoc;
