import SelectDropdown from "react-native-select-dropdown"
import Icon from 'react-native-vector-icons/Ionicons';

const Select = ({list,placeholder,onSelect,style}) => {
    return (
        <SelectDropdown
                data={list}
                buttonStyle={[{backgroundColor:'#fbf7f0',padding:10,borderWidth:2,marginTop:-2,borderColor:'black',width:'100%'},style]}
                buttonTextStyle={{fontFamily:'SpaceMono_400Regular',fontSize:20,}}
                rowTextStyle={{fontFamily:'SpaceMono_400Regular',fontSize:20}}
                selectedRowStyle={{backgroundColor:'#fbdaa1'}}
                defaultButtonText={placeholder}
                dropdownStyle={{height:list.length*30.5}}
                renderDropdownIcon={()=><Icon name="caret-down-outline" size={30} />}

                buttonTextAfterSelection={(selectedItem, index) => {
                    // text represented after item is selected
                    // if data array is an array of objects then return selectedItem.property to render after item is selected
                    return selectedItem
                }}
                onSelect={onSelect}
                rowTextForSelection={(item, index) => {
                    // text represented for each item in dropdown
                    // if data array is an array of objects then return item.property to represent item in dropdown
                    return item
                }}
            />)
}

export default Select