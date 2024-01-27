import { useState } from "react";
import HelpModal from "../help/Modal";
import { getDatabase, ref, set } from "firebase/database";
import { useSelector } from "react-redux";
import axios from "axios";

const StressModal = () => {
    const [open, setOpen] = useState(false);
    const uid = useSelector((state) => state.user.uid)

    const send = () => {
        console.log(open);
        setOpen(false);
        axios.post('stress/'+open.rate)
    }

    return (
        <HelpModal 
        title="Mennyire voltál stresszes az elmúlt pár napban?"
        actions={[
          {title:'most nem szeretném megadni',color:'#ffffff',onPress:()=>setOpen(false)},
          {title:'ennyire',color:'#000000',onPress:send}
        ]}
        open={open}
        setOpen={setOpen}
        inputs={
            [{type:'rate',attribute:'rate',label:'Add meg ezen a skálán!',text:'stressz',data:open,setData:setOpen}]
        }
      />
    )
}

export default StressModal;