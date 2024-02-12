import { Platform, View } from "react-native"
import DatePicker from "react-datepicker"
import { createElement, useEffect, useState } from "react";

export default ({style,value,setValue,max,min}) => {
    useEffect(() => {
        //if (!value)
          //  setValue(new Date().toISOString().substring(0, 10));
    }, [value]);
    if (Platform.OS == 'web')
    return (
        <input 
        style={style}
        type='date' 
        value={value} 
        onInput={(e)=>setValue(e.target.value)} 
        max={max=='now' && new Date().toISOString().substring(0, 10)}
        min={min=='now' && new Date().toISOString().substring(0, 10)}
        />
      )
}