import { useState, useEffect, useContext } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useSelector } from 'react-redux';
import { getDatabase, set, ref as databaseRef } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
//import profile from '../../assets/profile'

import { FirebaseContext } from '../../firebase/firebase';

export class MyImagePicker {
    constructor(Dpath, Spath, autoUpload) {
        this.Dpath = Dpath;
        this.Spath = Spath;
        this.autoUpload = autoUpload;
        this.image = require("../../assets/profile.jpeg");
        this.changed = false;

        this.init = async () => {
            const storage = getStorage();
            await getDownloadURL(storageRef(storage, this.Spath + ''))
                .then((url) => {
                    this.image = { uri: url };
                    console.log(this.image);
                }).catch(error => {
                    this.image = require("../../assets/profile.jpeg");
                    console.log(this.image);
                }).finally(() => {
                });

            return this.image;
        };

        this.pickImage = async () => {
            // No permissions request is necessary for launching the image library
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.cancelled) {
                this.image = result.uri;
                console.log(this.changed);
                this.changed = true;
                console.log(this.changed);
                if (this.autoUpload)
                    uploadImage();
            }
        };

        this.uploadImage = async () => {
            console.log('changed', this.changed);
            const db = getDatabase();
            let localUri = this.image;
            console.log('localUri', localUri);
            let filename = localUri.split('/').pop();

            let match = /\.(\w+)$/.exec(filename);
            let type = match ? `image/${match[1]}` : `image`;

            let formData = new FormData();
            formData.append('photo', { uri: localUri, name: filename, type });

            const storage = getStorage();
            const ref = storageRef(storage, this.Spath);

            await uploadBytes(ref, formData).then((snapshot) => {
                console.log('Uploaded a blob or file!');
                console.log(snapshot);
                set(databaseRef(db, this.Dpath), filename);
            }).catch(error => console.error(error));

            return true;
        };

    }
}
