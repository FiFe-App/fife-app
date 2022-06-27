import React, { useEffect } from 'react';
import { ActivityIndicator, Text, View, Pressable, Image } from 'react-native';
import { global } from './global'
import { styles } from './styles'
import { useNavigation, StackActions } from '@react-navigation/native';
import { getDatabase, ref as dRef, child, onValue, get } from "firebase/database";
import { Loading, LoadImage } from './Components'

export const Events = ({ navigation, route }) => {
    const { key } = route.params;

    console.log(key);
    const [array, setArray] = React.useState([]);

    useEffect(() => {
        getData(route.params.key, setArray)
        //setArray(getData(route.params.key))
    }, [route.params.key])

    return (<View>{
        array
            ? (array.length == 0
                ? <Text>Nem volt találat!</Text>
                : <View>{array}</View>)
            : <Loading color="#f5d142" />

    }</View>
    )
}

function getData(key, setArray) {
    const newArray = [];
    const dbRef = dRef(global.database, '/users');
    onValue(dbRef, (snapshot) => {
        if (snapshot.exists())
            snapshot.forEach((childSnapshot) => {
                const childKey = childSnapshot.key;
                const childData = childSnapshot.val();

                if (childData.name && childData.name.toLowerCase().includes(key.toLowerCase()) ||
                    childData.username && childData.username.toLowerCase().includes(key.toLowerCase())) {
                    newArray.push(<Item key={childKey} title={childData.name} text={childData.username} uid={childKey} />);

                }
            });
        setArray(newArray)
    });
    //return newArray
}

function Item({ title, text, uid }) {
    const navigation = useNavigation();
    const onPress = () => {
        navigation.navigate("Profilom", { uid });
    }

    return (
        <Pressable onPress={onPress} style={[styles.list, { flexDirection: "row" }]}>
            <LoadImage style={styles.listIcon} uid={uid} />
            <View style={{ marginLeft: 5 }}>
                <Text style={{ fontWeight: 'bold', flex: 1, }}>{title}</Text>
                <Text style={{ flex: 2, }}>{text}</Text>
            </View>

        </Pressable>
    );

}

/*

<h3 class="display-6" id="title"></h3>
<div id="searchList" class="list-group">
    <div id="filter">
        <h1>Filterek:</h1>
        <div class="btn-group" role="group" aria-label="Basic checkbox toggle button group">
            <input type="checkbox" class="btn-check" filter="ActiveContainer" id="checkActive" autocomplete="off" checked>
            <label id="filterActive" class="btn btn-outline-primary" for="checkActive">Megválaszolatlan kérdések</label>
          
            <input type="checkbox" class="btn-check" filter="SolvedContainer" id="checkSolved" autocomplete="off" checked>
            <label id="filterSolved" class="btn btn-outline-primary" for="checkSolved">Megoldások</label>
          
            <input type="checkbox" class="btn-check" filter="ProfContainer" id="checkProf" autocomplete="off" checked>
            <label id="filterProf" class="btn btn-outline-primary" for="checkProf">Hozzáértők</label>

            <input type="checkbox" class="btn-check" filter="UserContainer" id="checkUser" autocomplete="off" checked>
            <label id="filterUser" class="btn btn-outline-primary" for="checkUser">FiFék</label>

            <input type="checkbox" class="btn-check" filter="LinkContainer" id="checkLink" autocomplete="off" checked>
            <label id="filterLink" class="btn btn-outline-primary" for="checkLink">Hasznos linkek</label>
        </div>
    </div>
    <h1>Találatok:</h1>
    <div id="results" class="">

    </div>
</div>


<script>
    
    // emberek, kérések, linkek, megválaszolások
    // Active Solved Prof User Link
    // (person.val().profession.includes($('#profession_type').val()))

    $('#results').empty();
    $('#results').append(`
        <div class="inner" size="0" id="ActiveContainer"><h3>Aktív, megválaszolatlan kérdések</h3></div>
        <div class="inner" size="0" id="SolvedContainer"><h3>Megoldások</h3></div>
        <div class="inner" size="0" id="ProfContainer"><h3>Hozzáértők</h3></div>
        <div class="inner" size="0" id="UserContainer"><h3>FiFék</h3></div>
        <div class="" size="0" id="LinkContainer"><h3>Hasznos linkek</h3></div>
    `);

    $(".btn-group").delegate("input", "change", function() {
      $('#'+$(this).attr("filter")).toggleClass('d-none');
      return false;
    });
  
    $('#title').html("Ők felelnek meg "+embedWord(getUrlParameter('val'))+" keresésnek:");
    load("users","User","name","","key",(item,search) =>{
        return (item.name.includes(search));
    });
    load("posts","Active","title","about","key",(item,search) =>{
        return ((item.title.includes(search) || item.about.includes(search)) && item.solution == "");
    });
    load("solutions","Solved","category","title","link",(item,search) =>{
        return (item.category.includes(search) || item.text.includes(search) || item.title.includes(search));
    });
    loadProf();
    loadLinks();

    function toOrder(div,i){
        console.log(div +" "+i);
        $('#filter'+div).append(' '+i);
        if (i == 0) $('#'+div+'Container').append('<p class="text-center">A keresés nem hozott eredményt <i class="far fa-sad-tear"></i></p>');
        if (i >= $('#results').children()[0].getAttribute('size')) {
            $('#results').prepend($('#'+div+'Container'));
            $('#'+div+'Container').attr('size',i);
        } else if (i == 0) $('#filter'+div).trigger('click');
    }



    function loadProf() {
        let i = 0;
        sum=0;
        
        var myPeopleRef = firebase.database().ref('users');
            myPeopleRef.once('value', (snapshot) => {
                snapshot.forEach(function(person){
                    if (person.val().profession.includes(getUrlParameter('val'))) { 
                        sum++;
                                about = "";
                                newProf = profToArray(person.val().profession);
                                newProf.forEach(element => {
                                    if (element[0].includes(getUrlParameter('val'))) 
                                    about += element[0] + ' ';
                                });
                                var newPerson = 
                                `<a href="profile.html?val=${person['key']}" class="list-group-item list-group-item-action flex-column align-items-start">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h5 class="mb-1">${person.val().name}</h5>
                                        <small></small>
                                    </div>
                                    <p class="mb-1">${about}</p>
                                    <small></small>
                                </a>`;
                                $('#ProfContainer').append(newPerson);
                                i++;
                    }
                }
                )}
            ).then(e=>{toOrder("Prof",i)});
}

    function loadLinks() { 
        let i = 0;
        var myLinksRef = firebase.database().ref('links');
            myLinksRef.once('value', (snapshot) => {
                snapshot.forEach(function(link){
                    if (link.val().about.includes(getUrlParameter('val'))) {
                                i++;
                                var newLink = 
                                `<a href="https://www.facebook.com/groups/${link.val().link}" outer class="list-group-item list-group-item-action flex-column align-items-start">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h5 class="mb-1">${link.val().about}</h5>
                                        <small>Feltöltötte: ${link.key}</small>
                                    </div>
                                </a>`;
                                $('#LinkContainer').append(newLink);
                    }
                });
            }).then(e=>{toOrder("Link",i)});
  }

    $(".inner").delegate("a", "click", function() {
        window.location.hash = $(this).attr("href");
        console.log(window.location.hash);
        return false;
  });
</script>
*/