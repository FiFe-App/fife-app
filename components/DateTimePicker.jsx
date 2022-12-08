import { Platform, View } from "react-native"
import DatePicker from "react-datepicker"
import { createElement, useState } from "react";

export default () => {
    const [startDate, setStartDate] = useState(new Date());
    if (Platform.OS == 'web')
    return (
        createElement('input', {
            type: 'date',
            value: startDate,
            onInput: setStartDate,
        }),
        createElement('input', {
            type: 'date',
            value: startDate,
            onInput: setStartDate,
        })
      )
}