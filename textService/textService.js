import { useEffect, useState } from "react"
import { Text } from "react-native"
  
export const TextFor = ({style,text}) => {
    
    const texts = require('./texts.json');
    const arr = texts?.[text]
    const on = true//useSelector((state) => state.user?.fancyText)
    const [r, setR] = useState(0);
    useEffect(() => {
        setR(Math.floor(Math.random() * (arr?.length)))
    }, []);
    if (arr)
        if (on)
            return <Text style={style}>{arr[r]}</Text>
        else
            return <Text style={style}>{arr[0]}</Text>
    else
        return <Text style={style}>{text}</Text>
}
  
export const AutoPrefix = (text) => {
    return embedWord(text)
}

function urlify(text) {
    var urlRegex = /(([a-z]+:\/\/)?(([a-z0-9\-]+\.)+([a-z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|hu|net|org|pro|travel|local|internal))(:[0-9]{1,5})?(\/[a-z0-9_\-\.~]+)*(\/([a-z0-9_\-\.]*)(\?[a-z0-9+_\-\.%=&amp;]*)?)?(#[a-zA-Z0-9!$&'()*+.=-_~:@/?]*)?)(\s+|$)/gi;
    return text.replace(urlRegex, function(url) {
      return <Link href="//' + url + '">{text}</Link>;
    })
    // or alternatively
    // return text.replace(urlRegex, '<a href="$1">$1</a>')
  }
  
  function profToArray(prof){
    prof = prof.split('$$');
  
    i=0;
    end=[];
    prof.forEach(element => {
      newprof = element.split('$');
      if (newprof[0].trim() != ''){
        end.push([newprof[0],newprof[1]]);
        i++;
      }
    });
  
    return end;
  }
  
  String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
  }
  
  String.prototype.lastVowel = function() {
    last = '';
    for (let i = 0; i < this.length; i++) {
      if (isVowel(this[i])) {
        last = this[i];
      }
    }
    return last;
  }
  
  function isVowel(char){
    char = char.toLowerCase();
    if ("aáeéiíoóöőuúüú".indexOf(char) >= 0) return true;
    return false;
  }
  
  function isCharHigh(char){
    char = char.toLowerCase();
    if ("eéiíöőüű".indexOf(char) >= 0) return true;
    return false;
  }
  
  function ToHigh(vowel){
    vowel = vowel.toLowerCase();
    low = "aóo";
    high =  "eőe";
    i = low.indexOf(vowel);
    if (i >= 0)
      return high.slice(i,i+1)
    else return vowel;
  }
  
  function toLong(vowel){
    vowel = vowel.toLowerCase();
    short = "aeoöuü";
    long =  "áéóőúű";
    i = short.indexOf(vowel);
    if (i >= 0)
      return long.slice(i,i+1)
    else return vowel;
  }
  
  function wordToHigh(word){
    for (let i = 0; i < word.length; i++) {
      if (isVowel(word[i])) {
        word = word.replaceAt(i,ToHigh(word[i]));
      }
    }
    return word;
  }
  
  function getPitch(word){
    high = 0;
    low = 0;
    for (let i = 0; i < word.length; i++) {
      if (isVowel(word[i])) {
        if (isCharHigh(word[i])) high++;
        else low++;
      }
    }
    if (low == 0 && high > 0) return "high";
    if (high == 0 && low > 0) return "low";
    if (low > 0 && high > 0) return "mixed";
    return "none";
  }
  
  function toldalek(str,toldalek){
    if (str == '' || toldalek == '' || str.length < 3) return "...";
    str = str.trim();
  
    pitch = getPitch(str);
    if (pitch != "low" && !(pitch == 'mixed' && !isCharHigh(str.lastVowel()))) {
      toldalek = wordToHigh(toldalek);
    }
  
    // ha a toldalék magánhangzóval kezdődik
    if(isVowel(toldalek.slice(0,1))) {
      //        szótő utolsó betűje     tő a vége nélkül  szótő utolsó betűje   toldalek első b nélkül
      if (isVowel(str.slice(-1))) {
        //if (str.slice(-1) == toldalek.slice(0,1)) return 
        return str.slice(0,-1)+toLong(str.slice(-1))+toldalek.slice(1);
      }
      return str+toldalek;
  
    } else {
      if (isVowel(str.slice(-1))) return str.slice(0,-1)+toLong(str.slice(-1))+toldalek;
      else if (str.slice(-1) == str.slice(-2,-1) && str.slice(-2,-1) == toldalek.slice(0,1)) return str+toldalek.slice(1);
      return str+str.slice(-1)+toldalek.slice(1);
    }
  }
  
  function embedWord(str) {
    if (isVowel(str.substring(0,1))) {
      return "az "+str;
    }
    if (str.length == 0) return "...";
    return "a "+str;
  }

export function elapsedTime(date) {
    
  let str = 'másodperce'
  let elapsed = Date.now()-date
  elapsed /= 1000
  if (elapsed >= 60) {
      elapsed /= 60
      str = 'perce'
      if (elapsed >= 60) {
          elapsed /= 60
          str = 'órája'
          if (elapsed >= 24) {
              elapsed /= 24
              str = 'napja'
              if (elapsed >= 7) {
                  elapsed /= 7
                  str = 'hete'
                  if (elapsed >= 4) {
                      elapsed /= 4
                      str = 'hónapja'
                      if (elapsed >= 12) {
                          elapsed /= 12
                          str = 'éve kb.'
                      }
                  }
              }
          }
      }
  }

  return Math.floor(elapsed) +' '+ str
}

function getSynonims(key){
  const request = new Request('https://cors-anywhere.herokuapp.com/https://api.poet.hu/szinonima.php?f=akoskristof&j=e7a5cefcde99071ab9001c91f3d892e0&s='+key);
  return fetch(request).then(async (response) => {
    if (response.status === 200) {

      let converted = await response.text()
      converted = converted.toString().split('<szinonima>')
      converted = converted.map(e=>{
        return e.slice(0,e.indexOf('<'))
      })
      converted.shift()
      return converted
    } else {
      throw new Error('Something went wrong on API server!');
    }
  })
}

async function getSynonims2(key,callback) {

  console.log('getSynonims');
  const Http = new XMLHttpRequest();
  const url='https://cors-anywhere.herokuapp.com/https://api.poet.hu/szinonima.php?f=akoskristof&j=e7a5cefcde99071ab9001c91f3d892e0&s='+key;
  Http.open("GET", url);
  Http.send();

  Http.onreadystatechange = (e) => {
    let converted = Http.responseText.toString().split('<szinonima>')
    converted = converted.map(e=>{
     return e.slice(0,e.indexOf('<'))
    })
    callback(converted.shift())
  }
}

export async function search(key,array,withSynonims) {
  let found = null;
  key = key.toLowerCase()

  let synonims = []
  if (withSynonims)
  synonims = await getSynonims(key)
  
  synonims.push(key)

  array.forEach(element => {
    synonims.forEach(synonim => {
      if (element.toLowerCase().includes(synonim)) {
        found = true
        return
      }
    })
  });
  return ({found,keys:synonims})
}