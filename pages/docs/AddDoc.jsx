import { View, useWindowDimensions } from 'react-native';
import { MyText, NewButton, TextInput } from '../../components/Components';
import GoBack from '../../components/Goback';
import BasePage from '../../components/BasePage';
import CustomInput from '../../components/custom/CustomInput';
import { useRef, useState } from 'react';
import axios from 'axios';
import { config } from '../../firebase/authConfig';

const AddDoc = () => {
    const { width } = useWindowDimensions();
    const [data, setData] = useState({

    });
    const ref = useRef(null)

    const upload = () => {
        axios.post('/docs',data,config()).then(res=>{
            ref.current.upload(`docs/${res.data}`,`docs/${res.data}`
            ).then(res=>{
                console.log('uploadedImage!!');
            })
        })
    }
    
    return ((
    <BasePage style={{flex:undefined}}>
        <GoBack text="Vissza" previous="/" breakPoint={1000}/>
        <MyText title>Van valami amit megosztanál minden felhasználóval?</MyText>
        <MyText size={18}>Írd le az üzeneted, hogy eljuthasson mindenkihez</MyText>
        <CustomInput attribute='title' type="text-input" label='cím' setData={setData} data={data} />
        <CustomInput attribute='image' ref={ref}  type="image" label='cím' setData={setData} data={data} />
        <CustomInput attribute='text' type="text-input" label='cikk törzse' lines={10} setData={setData} data={data} />
        <MyText size={18}>Ha elküldöd, mi megnézzük, hogy valóban az oldalra illik-e a posztod, és ha igen, mindenki elérheti majd</MyText>
        <NewButton onPress={upload} title="Küldés"/>
    </BasePage>)
    )
}

export default AddDoc;
