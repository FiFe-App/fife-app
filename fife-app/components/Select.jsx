import SelectDropdown from 'react-native-select-dropdown'
import Icon from '@expo/vector-icons/Ionicons';

const Select = ({list,defaultValue,placeholder,onSelect,style,displayAttribute,disabled}) => {
    return (
        <SelectDropdown
                data={list}
                disabled={disabled}
                defaultValueByIndex={defaultValue}
                buttonStyle={[{backgroundColor:'#fbf7f0',padding:10,borderWidth:2,borderColor:'black',width:'100%'},disabled&&{backgroundColor:'#d1cec8'},style]}
                buttonTextStyle={[{fontFamily:'SpaceMono_400Regular',fontSize:17,},disabled&&{color:'gray'}]}
                rowTextStyle={{fontFamily:'SpaceMono_400Regular',fontSize:17}}
                selectedRowStyle={{backgroundColor:'#fbdaa1'}}
                defaultButtonText={placeholder}
                dropdownStyle={{height:(list?.length||0)*30.5}}
                renderDropdownIcon={()=><Icon name="caret-down-outline" size={30} />}

                buttonTextAfterSelection={(selectedItem, index) => {
                    // text represented after item is selected
                    // if data array is an array of objects then return selectedItem.property to render after item is selected
                    return displayAttribute ? selectedItem[displayAttribute] : selectedItem
                }}
                onSelect={onSelect}
                rowTextForSelection={(item, index) => {
                    // text represented for each item in dropdown
                    // if data array is an array of objects then return item.property to represent item in dropdown
                    //console.log('index',index,displayAttribute ? item[displayAttribute] : item)
                    return displayAttribute ? item[displayAttribute] : item
                }}
            />)
}

export default Select