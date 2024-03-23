import { useState, useEffect, useContext, useRef, useImperativeHandle, forwardRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useSelector } from 'react-redux';
import { getDatabase, set, ref as databaseRef } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
//import profile from '../../assets/profile'

import { FirebaseContext } from '../../firebase/firebase';
import { Image, View } from 'react-native';
import { MyText, NewButton } from '../Components';
import axios from 'axios';
import { config } from '../../firebase/authConfig';
import Loading from '../Loading';

const MyImagePicker = forwardRef(({storagePath=null,title,setData,data,render=true},ref) => {
    const [image, setImage] = useState(data);
    const [status, setStatus] = useState(null);
    
    useEffect(() => {
        if (!storagePath) return;

        const storage = getStorage();
        (async ()=>{await getDownloadURL(storageRef(storage, storagePath + ''))
            .then((url) => {
                setImage({ uri: url });
                console.log(image);
            }).catch(error => {
                console.log('err',image);
            }).finally(() => {
            })
        })()
    }, []);

    useEffect(() => {
        if (setData && image) {
            setData(image)
        }
    }, [image]);


    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1
        });

        if (!result?.canceled) {
            setImage(result.assets[0].uri);
            console.log('loaded img',result);
        } else console.log('cancelled');
    };

    const uploadImage = async (databasePath,storagePath) => {
        let localUri = image;
        let filename = localUri.split('/').pop();

        console.log(localUri,filename);

        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : 'image';

        let formData = new FormData();
        formData.append('photo', { uri: localUri, name: filename, type });

        const storage = getStorage();
        const ref = storageRef(storage, storagePath+'/'+filename);

        const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
              resolve(xhr.response);
            };
            xhr.onerror = function (e) {
              console.log(e);
            reject(new TypeError('Network request failed'));
            };
            xhr.responseType = 'blob';
            xhr.open('GET', localUri, true);
            xhr.send(null);
        });

        await uploadBytes(ref, blob).then(async (snapshot) => {
            console.log('Uploaded a blob or file!');
            console.log(snapshot);
            setStatus('loading');

            const storage = getStorage();
            await getDownloadURL(storageRef(storage, storagePath+'/'+filename))
                .then((url) => {
                    axios.patch(databasePath,{path:url},config()).then(res=>{
                        setStatus('done');
                    })
                    console.log(image);
                }).catch(error => {
                    console.log('err',image);
                }).finally(() => {
            })

        }).catch(error => console.error(error));

        return true;
    };

    const publicRef = {
        upload: uploadImage
    }
    useImperativeHandle(ref, () => publicRef);


    return (<View>
        <NewButton title={title||'Válassz képet'} onPress={pickImage} disabled={status!=null} />
        {render &&<>
            <MyText>Választott kép:</MyText>{image ? <Image source={{uri:image}} style={{width:100,height:100}}/> : <MyText>Nincs kép választva</MyText>}
            {status=='loading'&& <Loading /> }
            {status=='done'&& <MyText>Sikeres feltöltés!</MyText>}
        </>}
    </View>)
})
MyImagePicker.displayName = 'MyImagePicker'

export default MyImagePicker
