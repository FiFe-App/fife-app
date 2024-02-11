import Hotjar from "@hotjar/browser";

const siteId = 3704200;
const hotjarVersion = 6;

const HotjarInit = () => {

    return (
        Hotjar.init(siteId, hotjarVersion))
}


export default HotjarInit;